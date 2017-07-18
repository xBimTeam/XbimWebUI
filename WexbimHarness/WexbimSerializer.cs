using AimViewModels.Shared.Helpers;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using Xbim.Aim.Edm;
using Xbim.Common.Geometry;
using XbimDbScan;

namespace WexbimHarness
{
    static public class WexbimSerializer
    {

        static public void GetBuildingEnvelope(AimDbContext dbContext, AssetModel assetModel, BinaryWriter outStream)
        {
            var reps = dbContext.RepresentationItemsForTypes(assetModel, new ComponentType[] { ComponentType.BuildingElementProxy }, ComponentType.BuildingElement);
            var geoms = dbContext.MeshGeometriesForTypes(assetModel, new ComponentType[] { ComponentType.BuildingElementProxy }, ComponentType.BuildingElement);
            var materials = dbContext.ShapeMaterials;
            var wexBimStream = BuildWexBimStream(reps, geoms, materials, assetModel.OneMeter);
            wexBimStream.WriteToStream(outStream);
        }
        static private WexBimStream BuildWexBimStream(IEnumerable<BoundingBoxRepresentationItem> reps, IEnumerable<ShapeGeometry> meshes, IEnumerable<AimShapeMaterial> materials, double oneMeter)
        {

            var meshesLookup = meshes.ToDictionary(m => m.Key(), m => m);
            var repDicts = new List<MultiValueDictionary<long, BoundingBoxRepresentationItem>>();
            var scanBoxes = new List<XbimDbScanBox<BoundingBoxRepresentationItem>>(512);
            var requiredMaterials = new HashSet<int>();
            var wexBimStream = new WexBimStream();
            wexBimStream.Header.OneMeter = 1; //we are going to turn all data into meters
            foreach (var bbGeom in reps.Where(bb => bb.BoundingBox != null))
            {
                //if we are going to transform this box we need to do it as a geometry object and then get its axis aligned box              
                var rect3D = bbGeom.GetAxisAlignBoundingBoxXbim();
                var aabb = new XbimRect3D(rect3D.X / oneMeter, rect3D.Y / oneMeter, rect3D.Z / oneMeter, rect3D.SizeX / oneMeter, rect3D.SizeY / oneMeter, rect3D.SizeZ / oneMeter);
                scanBoxes.Add(new XbimDbScanBox<BoundingBoxRepresentationItem>(bbGeom, aabb.X, aabb.Y, aabb.Z, aabb.SizeX, aabb.SizeY, aabb.SizeZ));

                //remember any used materials
                var requiredMaterialId = bbGeom.ShapeMaterialId ?? bbGeom.GeometryMaterialId ?? 0;
                if (requiredMaterialId > 0) requiredMaterials.Add(requiredMaterialId);
                //get the products
                //get the product part bounding box and adjust with the transform

                var product = new WexBimProduct
                {
                    ProductLabel = bbGeom.EntityId,
                    ProductType = Int16.Parse(bbGeom.ExternalObjectType),
                    BoundingBox = aabb
                };
                wexBimStream.AddProduct(product);
            }
            var dbScanner = new XbimDbScanner<BoundingBoxRepresentationItem>();
            var clusters = dbScanner.ComputeCluster(scanBoxes, 50).OrderByDescending(b => b.Items.Count).ToList(); //cluster around 50m, most populated first    
            foreach (var cluster in clusters)
            {
                var bBox = new XbimRect3D(cluster.X, cluster.Y, cluster.Z, cluster.SizeX, cluster.SizeY, cluster.SizeZ); //bounds in meters                
                var centroid = bBox.Centroid();
                wexBimStream.AddRegion(new WexBimRegion
                {
                    CentreX = (float)centroid.X,
                    CentreY = (float)centroid.Y,
                    CentreZ = (float)centroid.Z,
                    BoundingBox = bBox,
                    Population = cluster.Items.Count
                }
                );
                var repDict = new MultiValueDictionary<long, BoundingBoxRepresentationItem>(cluster.Items.Count);
                foreach (var item in cluster.Items)
                {
                    repDict.Add(item.Key(), item);
                }
                repDicts.Add(repDict);
            }
            //write the material styles
            foreach (var material in materials)
            {
                if (requiredMaterials.Contains(material.MaterialId))
                {
                    wexBimStream.AddStyle(new WexBimStyle
                    {
                        StyleId = material.MaterialId,
                        Red = material.DiffuseRed(),
                        Green = material.DiffuseGreen(),
                        Blue = material.DiffuseBlue(),
                        Alpha = material.DiffuseAlpha()
                    }
                    );
                }
            }

            //shapes and their triangulations by the cluster order, most populated first
            for (int i = 0; i < repDicts.Count; i++)
            {
                var cluster = clusters[i];
                var region = wexBimStream.Regions[i];
                foreach (var repGroup in repDicts[i])
                {
                    ShapeGeometry mesh;
                    if (meshesLookup.TryGetValue(repGroup.Key, out mesh))//this should never fail
                    {
                        if (repGroup.Value.Count > 1) //we have a repeated use of geometry
                        {
                            region.AddGeometryModel(mesh.Triangulation, repGroup.Value.Select(v =>
                            new WexBimShapeMultiInstance
                            {
                                InstanceTypeId = Int16.Parse(v.ExternalObjectType),
                                ProductLabel = v.EntityId,
                                StyleId = v.ShapeMaterialId ?? v.GeometryMaterialId ?? 0,
                                Transformation = v.Transformation
                            }));
                        }
                        else //single repetition
                        {
                            //transform the geometry
                            var rep = repGroup.Value.FirstOrDefault(); //there should only be one
                            if (rep != null)
                            {
                                var triangulation = mesh.TransformCentreAndScale(rep.Transformation, cluster.X, cluster.Y, cluster.Z, oneMeter);
                                region.AddGeometryModel(triangulation, new WexBimShapeSingleInstance
                                {
                                    InstanceTypeId = Int16.Parse(rep.ExternalObjectType),
                                    ProductLabel = rep.EntityId,
                                    StyleId = rep.ShapeMaterialId ?? rep.GeometryMaterialId ?? 0
                                });
                            }

                        }
                    }
                    else
                        Debug.Assert(false, "A mesh has not been found");
                }
            }
            wexBimStream.UpdateHeader();
            return wexBimStream;
        }

        public static WexBimStream ReadWexBimStream(BinaryReader br)
        {
            return WexBimStream.ReadFromStream(br);
        }
    }
}
