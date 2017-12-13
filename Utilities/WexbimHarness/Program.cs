using AimViewModels.Shared.Helpers;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Configuration;
using System.Data.Entity;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Xbim.Aim.DataProvider;
using Xbim.Aim.Edm;

namespace WexbimHarness
{
    class Program
    {
        static void Main(string[] args)
        {
            if (args.Length < 1)
                throw new Exception("No input defined");

            var files = new List<string>();
            if (Directory.Exists(args[0]))
            {
                files = Directory.EnumerateFiles(args[0], "*.ifc", SearchOption.TopDirectoryOnly).ToList();
            }
            else
            {
                if (!File.Exists(args[0]))
                    throw new FileNotFoundException("IFC file not found", args[0]);
                files.Add(args[0]);
            }

            try
            {
                
                ////always create a fresh DB
                //using (var createContext = new AimDbContext("SqlContext"))
                //{
                //    createContext.Database.Delete();
                //    createContext.Database.Create();
                //    createContext.Database.Initialize(true);
                //}
            }
            catch (Exception ex)
            {
                Console.Write($"Failed to delete and reinitialize database: {ex.Message}");
                return;
            }



            //convert to AIM DB
            for (int i = 0; i < files.Count; i++)
            {
                var file = files[i];
                var name = Path.GetFileNameWithoutExtension(file);
                ImportIfc(file, null, name, i);
            }

            //export geometry into WexBIM file(s)
            const string outDir = "..\\..\\..\\Xbim.WeXplorer\\tests\\wexbim3";
            if (!Directory.Exists(outDir))
                Directory.CreateDirectory(outDir);

            using (var ctx = new AimDbContext("SqlContext"))
            {
                foreach (var model in ctx.AssetModels)
                {
                    var name = model.Name;
                    var wexbimFile = Path.Combine(outDir, name + ".wexbim");
                    using (var bw = new BinaryWriter(File.Create(wexbimFile)))
                    {
                        WexbimSerializer.GetBuildingEnvelope(ctx, model, bw);
                        bw.Close();
                    }

                    using (var br = new BinaryReader(File.OpenRead(wexbimFile)))
                    {
                        var wexbim = WexBimStream.ReadFromStream(br);
                        var tc = wexbim.Header.TriangleCount;
                        var tc2 = wexbim.Regions.Sum(r => r.GeometryModels.Sum(g => g.Geometry.TriangleCount));
                        var tc3 = wexbim.Regions.Sum(r => r.GeometryModels.Sum(g => g.Geometry.TriangleCount * g.ShapeCount()));
                        Debug.Assert(tc == tc3);
                    }
                }
            }

            Console.WriteLine("Processing finished, press ENTER...");
            Console.ReadLine();
        }

        private static bool ImportIfc(string ifcFileName, string tenantId, string assetName, int assetId)
        {
            AssetModel assetModel;
            try
            {
                using (var sqlContext = new AimDbContext("SqlContext"))
                {

                    Guid tenantGuid;
                    if (!string.IsNullOrWhiteSpace(tenantId))
                        tenantGuid = new Guid(tenantId);
                    else
                        tenantGuid = Guid.NewGuid();
                    var assets = sqlContext.Assets.Where(a => a.TenantGuid == tenantGuid).ToList();
                    Asset asset;
                    asset = assets.Where(a => a.AssetId == assetId).FirstOrDefault();
                    if (asset == null) asset = assets.Where(a => a.Name == assetName).FirstOrDefault();
                    if (asset == null)
                    {
                        asset = sqlContext.Assets.Create();
                        asset.TenantGuid = tenantGuid;
                        asset.Name = assetName;
                        sqlContext.Assets.Add(asset);
                    }
                    assetModel = sqlContext.AssetModels.Create();
                    asset.AssetModels.Add(assetModel);
                    assetModel.Name = Path.GetFileNameWithoutExtension(ifcFileName);
                    sqlContext.SaveChanges();

                }

            }
            catch (Exception e)
            {
                Console.Error.WriteLine($"Db Creation error {e.Message}");
                return false;
            }
            try
            {
                var w = Stopwatch.StartNew();

                //set the aim id for the ifc model so that imported content goes to the right place in the database of all models
                var ifcConnectionString = new AimConnectionStringBuilder() { DataSource = ifcFileName, StorageFormat = AimStorageFormat.Ifc, AssetModelId = assetModel.AssetModelId };

                var stageTimings = new ConcurrentDictionary<string, Stopwatch>();
                Progress<AimProgressReport> progressReporter = TimedProgressReporter(stageTimings);

                using (var ifcConnection = new AimConnection(ifcConnectionString.ConnectionString))
                {
                    using (var cancellationSource = new CancellationTokenSource())
                    {
                        Console.Write($"{Path.GetFileName(ifcFileName)}");
                        ifcConnection.Open();

                        string sqlConnectionString = ConfigurationManager.ConnectionStrings["SqlContext"].ConnectionString;

                        ifcConnection.CopyTo(sqlConnectionString, assetModel, cancellationSource.Token, progressReporter);
                       
                        cancellationSource.Dispose();
                        ifcConnection.Close();

                    }
                }
                w.Stop();

                var duration = stageTimings.Values
                    .Aggregate(new TimeSpan(0), (p, v) => p.Add(v.Elapsed));

                Console.WriteLine($" Cumulative CPU Time:           {duration.TotalSeconds:0.##} secs.");
                Console.WriteLine($" Wall Time:                     {(w.ElapsedMilliseconds / 1000m):0.##} secs.");
                Console.WriteLine();
                return true;
            }
            catch (Exception e)
            {
                if (assetModel != null)
                    Console.WriteLine($"Stack Trace.\n{e.StackTrace}");
                // sqlContext.AssetModels.Remove(assetModel);
                var aggException = e as AggregateException;
                if (aggException != null)
                {
                    aggException.Handle((x) =>
                    {
                        var txt = x.Message;
                        while (e.InnerException != null)
                        {
                            e = e.InnerException;
                            txt += ("\n" + e.Message);
                        }
                        Console.WriteLine($"Exception handled.\n{txt}");
                        return true;
                    });
                    var msg = e.Message;
                }
                else
                {
                    var msg = e.Message;
                    while (e.InnerException != null)
                    {
                        e = e.InnerException;
                        msg += ("\n" + e.Message);
                    }
                    Console.WriteLine($"Import failed.\n{msg}");
                }
                return false;
            }

        }

        private static Progress<AimProgressReport> TimedProgressReporter(ConcurrentDictionary<string, Stopwatch> stageTimings)
        {
            var waitingChars = @"|/-\";
            var currentWait = 0;
            return new Progress<AimProgressReport>((a) =>
            {
                if (a.Status == ProgressReportStatus.StageStarted)
                {
                    var timer = new Stopwatch();
                    timer = stageTimings.GetOrAdd(a.Message, timer);
                    timer.Start();
                }
                if (a.Status == ProgressReportStatus.Running)
                {
                    int idx = currentWait++ % 4;
                    Console.BackgroundColor = ConsoleColor.Red;
                    Console.SetCursorPosition(0, Console.CursorTop);
                    Console.Write(waitingChars[idx]);
                };
                if (a.Status == ProgressReportStatus.StageComplete)
                {
                    Stopwatch timer;
                    if (stageTimings.TryGetValue(a.Message, out timer))
                    {
                        timer.Stop();
                        Console.SetCursorPosition(0, Console.CursorTop);
                        Console.ResetColor();
                        Console.WriteLine($" {a.Message,-30} {timer.ElapsedMilliseconds,5} ms");
                    }
                    else
                    {
                        Console.WriteLine($" No timer set for {a.Message}");
                    }
                }
                if (a.Status == ProgressReportStatus.Completed)
                {
                    Console.ResetColor();
                    Console.WriteLine($"\nComplete {a.Message}");
                }
                if (a.Status == ProgressReportStatus.PercentageChanged)
                {
                    Console.SetCursorPosition(0, Console.CursorTop);
                    Console.BackgroundColor = ConsoleColor.DarkGreen;
                    Console.Write($"{a.Percent,3}% {a.Message}");
                    if (a.Percent >= 100)
                    {
                        Console.ResetColor();
                        Console.WriteLine();
                    }
                }
            });
        }

        private static bool CreateSqlDb()
        {
            try
            {
                using (var createContext = new AimDbContext("SqlContext"))
                {
                    createContext.Database.Delete();
                    createContext.Database.Create();
                    createContext.Database.Initialize(true);

                    return true;
                }
            }
            catch (Exception)
            {
                return false;
            }

        }
    }
}
