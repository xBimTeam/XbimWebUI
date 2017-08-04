using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;

namespace TypingsBundler
{
    class Program
    {
        static void Main(string[] args)
        {
            var dir = args.Length == 0 ? @"..\Build" : args[0];
            if (!Directory.Exists(dir))
            {
                Console.WriteLine($"Directory {dir} doesn't exist.");
                return;
            }

            //map files for non minified files
            var mapFiles = Directory.EnumerateFiles(dir, "*.map", SearchOption.TopDirectoryOnly).Where(f => !f.Contains(".min.js"));

            foreach (var mapFile in mapFiles)
            {
                var data = File.ReadAllText(mapFile);
                if (string.IsNullOrWhiteSpace(data))
                {
                    continue;
                }
                dynamic map = JsonConvert.DeserializeObject(data);
                var sources = (map.sources as IEnumerable).Cast<JValue>().Select(v => v.ToString());

                var typings = sources.Select(s =>
                {
                    s = s.Replace("webpack:///", "");
                    s = Path.ChangeExtension(s, ".d.ts");
                    return s;
                })
                .Where(t => !t.StartsWith("webpack"))
                .Select(t => Path.GetFullPath(Path.Combine(dir, "." + t)))
                .ToList();

                var notFound = typings.Where(t => !File.Exists(t)).ToList();
                if (notFound.Any())
                {
                    throw new Exception($"\nTypings {string.Join(", \n", notFound)} \nwere not found.");
                }

                var tFile = mapFile.Replace(".js.map", ".d.ts");
                using (var bundle = File.CreateText(tFile))
                {
                    foreach (var typing in typings)
                    {
                        var tData = File.ReadAllText(typing);

                        //remove eventual imports
                        var importExpression = new Regex("(import|export)\\s+(\\{(\\s|\\w|,)+\\}|\\*)\\s+from\\s+(\\w|\\.|-|_|\\\\|/|'|\")+?;");
                        tData = importExpression.Replace(tData, "");

                        //remove private members, only show public members in .d.ts
                        var privateMemberExpression = new Regex("\\s*private.*;");
                        tData = privateMemberExpression.Replace(tData, "");

                        bundle.WriteLine(tData);
                    }

                    bundle.Close();
                }

            }

        }
    }
}
