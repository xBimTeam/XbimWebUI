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
            var mainType = ComponentType.BuildingElement;
            var excludedTypes = new ComponentType[] {
                ComponentType.BuildingElementProxy
            };

            var reps = dbContext.RepresentationItemsForTypes(assetModel, excludedTypes, mainType).ToList();
            var geoms = dbContext.MeshGeometriesForTypes( assetModel, excludedTypes, mainType).ToList();
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
            wexBimStream.Header.OneMeter = (float)oneMeter; //we are going to turn all data into meters
            foreach (var bbGeom in reps.Where(bb => bb.BoundingBox != null))
            {
                //if we are going to transform this box we need to do it as a geometry object and then get its axis aligned box              
                var rect3D = bbGeom.GetAxisAlignBoundingBoxXbim();
                var aabb = new XbimRect3D(rect3D.X, rect3D.Y, rect3D.Z, rect3D.SizeX, rect3D.SizeY, rect3D.SizeZ);
                scanBoxes.Add(new XbimDbScanBox<BoundingBoxRepresentationItem>(bbGeom, aabb.X, aabb.Y, aabb.Z, aabb.SizeX, aabb.SizeY, aabb.SizeZ));

                //remember any used materials
                var requiredMaterialId = bbGeom.ShapeMaterialId ?? bbGeom.MaterialId ?? 0;
                if (requiredMaterialId > 0) requiredMaterials.Add(requiredMaterialId);
                //get the products
                //get the product part bounding box and adjust with the transform

                var product = new WexBimProduct
                {
                    ProductLabel = bbGeom.ShapeRepresentationEntityId,
                    ProductType = Int16.Parse(bbGeom.ExternalObjectType),
                    BoundingBox = aabb
                };
                wexBimStream.AddProduct(product);
            }
            var dbScanner = new XbimDbScanner<BoundingBoxRepresentationItem>();
            var clusters = dbScanner.ComputeCluster(scanBoxes, 50 * oneMeter).OrderByDescending(b => b.Items.Count).ToList(); //cluster around 50m, most populated first 
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
                var region = wexBimStream.Regions[i];
                foreach (var repGroup in repDicts[i])
                {
                    ShapeGeometry mesh;
                    if (meshesLookup.TryGetValue(repGroup.Key, out mesh))//this should never fail
                    {
                        if (repGroup.Value.Count > 1) //we have a repeated use of geometry
                        {
                            region.AddGeometryModel(mesh.Triangulation, repGroup.Value.Select(v =>
                            {
                                if (v.ShapeRepresentationEntityId == 33698)
                                {
                                    
                                }
                                
                                return new WexBimShapeMultiInstance
                                {
                                    InstanceTypeId = short.Parse(v.ExternalObjectType),
                                    ProductLabel = v.ShapeRepresentationEntityId,
                                    StyleId = v.ShapeMaterialId ?? v.MaterialId ?? 0,
                                    Transformation = v.Transformation
                                };
                            }
                            ));
                        }
                        else //single repetition
                        {
                            //transform the geometry
                            var rep = repGroup.Value.FirstOrDefault(); //there should only be one
                            if (rep != null)
                            {
                                var triangulation = mesh.Transform(rep.Transformation);
                                region.AddGeometryModel(triangulation, new WexBimShapeSingleInstance
                                {
                                    InstanceTypeId = short.Parse(rep.ExternalObjectType),
                                    ProductLabel = rep.ShapeRepresentationEntityId,
                                    StyleId = rep.ShapeMaterialId ?? rep.MaterialId ?? 0
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
