using SharpDX;
using System;
using System.Collections.Generic;
using System.IO;
using Xbim.Aim.Edm;
using Xbim.Common.Geometry;
using Xbim.Ifc4;
using XbimDbScan;

namespace AimViewModels.Shared.Helpers
{
    public static class XbimGeometryHelpers
    {
        public static XbimRect3D GetBoundingBoxXbim(this BoundingBoxRepresentationItem bbRep)
        {
            return Xbim.Common.Geometry.XbimRect3D.FromArray(bbRep.BoundingBox);
        }
        public static XbimMatrix3D GetTransformationXbim(this BoundingBoxRepresentationItem bbRep)
        {
            return Xbim.Common.Geometry.XbimMatrix3D.FromArray(bbRep.Transformation);
        }

       
        /// <summary>
        /// Gets the axis aligned bounding box of the bounds after they have been transformed by the transformation
        /// </summary>
        /// <param name="bbRep"></param>
        /// <returns></returns>
        public static XbimRect3D GetAxisAlignBoundingBoxXbim(this BoundingBoxRepresentationItem bbRep)
        {
            return XbimRect3D.TransformBy(bbRep.GetBoundingBoxXbim(), bbRep.GetTransformationXbim());
        }

        public static XbimDbScanBox<BoundingBoxRepresentationItem> MostPopulated(this IEnumerable<XbimDbScanBox<BoundingBoxRepresentationItem>> clusters)
        {
            int maxPop = -1;
            XbimDbScanBox<BoundingBoxRepresentationItem> mostPopulated = null;
            foreach (var cluster in clusters)
            {
                if(cluster.Items.Count>maxPop)
                {
                    mostPopulated = cluster;
                    maxPop = cluster.Items.Count;
                }
            }
            return mostPopulated;
        }

        public static long Key(this BoundingBoxRepresentationItem bbItem)
        {
            long key = bbItem.EntityVariantId;
            key <<= 32;
            return key + bbItem.ShapeGeometryId;
        }
        public static long Key(this ShapeGeometry geomItem)
        {
            long key = geomItem.EntityVariantId;
            key <<= 32;
            return key + geomItem.ShapeGeometryId;
        }

        public static RgbaColour ToGrayScale(this RgbaColour rgba)
        {
            var gray = (0.21 * rgba.Red) + (0.72 * rgba.Green) + 0.07 * (rgba.Blue);
            return new RgbaColour(gray, gray, gray, rgba.Alpha);
        }
        public static RgbaColour DiffuseRGBA(this AimShapeMaterial material)
        {
            float r = BitConverter.ToSingle(material.DiffuseColor, 0);
            float g = BitConverter.ToSingle(material.DiffuseColor, sizeof(float));
            float b = BitConverter.ToSingle(material.DiffuseColor, 2 * sizeof(float));
            float a = BitConverter.ToSingle(material.DiffuseColor, 3 * sizeof(float));
            return new RgbaColour(r, g, b, a);
        }
        //public static Color4 DiffuseToColor(this AimShapeMaterial material)
        //{
        //    float r = BitConverter.ToSingle(material.DiffuseColor, 0);
        //    float g = BitConverter.ToSingle(material.DiffuseColor, sizeof(float));
        //    float b = BitConverter.ToSingle(material.DiffuseColor, 2 * sizeof(float));
        //    float a = BitConverter.ToSingle(material.DiffuseColor, 3 * sizeof(float));
        //    return new Color4(r, g, b, a);
        //}
        //public static Color4 AmbientToColor(this AimShapeMaterial material)
        //{
        //    float r = BitConverter.ToSingle(material.AmbientColor, 0);
        //    float g = BitConverter.ToSingle(material.AmbientColor, sizeof(float));
        //    float b = BitConverter.ToSingle(material.AmbientColor, 2 * sizeof(float));
        //    float a = BitConverter.ToSingle(material.AmbientColor, 3 * sizeof(float));
        //    return new Color4(r, g, b, a);
        //}
        //public static Color4 EmissiveToColor(this AimShapeMaterial material)
        //{
        //    float r = BitConverter.ToSingle(material.EmissiveColor, 0);
        //    float g = BitConverter.ToSingle(material.EmissiveColor, sizeof(float));
        //    float b = BitConverter.ToSingle(material.EmissiveColor, 2 * sizeof(float));
        //    float a = BitConverter.ToSingle(material.EmissiveColor, 3 * sizeof(float));
        //    return new Color4(r, g, b, a);
        //}
        //public static Color4 SpecularToColor(this AimShapeMaterial material)
        //{
        //    float r = BitConverter.ToSingle(material.SpecularColor, 0);
        //    float g = BitConverter.ToSingle(material.SpecularColor, sizeof(float));
        //    float b = BitConverter.ToSingle(material.SpecularColor, 2 * sizeof(float));
        //    float a = BitConverter.ToSingle(material.SpecularColor, 3 * sizeof(float));
        //    return new Color4(r, g, b, a);
        //}
        //public static Color4 ToGrayScale(this Color4 rgba)
        //{
        //    var gray = 1.5f *((0.21f * rgba.Red) + (0.72f * rgba.Green) + 0.07f * (rgba.Blue));
        //    return new Color4(gray, gray, gray, rgba.Alpha);
        //}

        public static float DiffuseRed(this AimShapeMaterial material)
        {
            return BitConverter.ToSingle(material.DiffuseColor,0);
        }
        public static float DiffuseGreen(this AimShapeMaterial material)
        {
            return BitConverter.ToSingle(material.DiffuseColor,sizeof(float));
        }
        public static float DiffuseBlue(this AimShapeMaterial material)
        {
            return BitConverter.ToSingle(material.DiffuseColor, 2 * sizeof(float));
        }
        public static float DiffuseAlpha(this AimShapeMaterial material)
        {
            return BitConverter.ToSingle(material.DiffuseColor, 3 * sizeof(float));
        }

        delegate int ReadIndex(BinaryReader br);
        delegate void WriteIndex(BinaryWriter bw, int index);
       
        /// <summary>
        /// Applies the translation to the matrix and any scaling to the triangulated mesh and returns a new byte array of the transformed mesh
        /// </summary>
        /// <param name="translation">this should be in meters The translation is added to all points</param>
        /// <param name="meter">number of units in the model that are equal to one meter, a value of 1000 scales a model in millimeters to meters</param>
        /// <returns></returns>
        static public byte[] TranslateAndScale(this ShapeGeometry geom,  XbimVector3D translation, double meter)
        {
            bool hasTranslation = (Math.Abs(translation.Length) > 1e-5);
            bool hasScale = (meter != 1);
            if (!hasScale && !hasTranslation) return geom.Triangulation; //nothing to do
            using (var msOut = new MemoryStream())
            {
                using (var bw = new BinaryWriter(msOut))
                {
                    using (var ms = new MemoryStream(geom.Triangulation))
                    {
                        using (var br = new BinaryReader(ms))
                        {
                            // ReSharper disable once UnusedVariable
                            var version = br.ReadByte(); //stream format version
                            bw.Write(version);
                            var numVertices = br.ReadInt32();
                            bw.Write(numVertices);
                            ReadIndex readIndex;
                            WriteIndex writeIndex;
                            int sizeofIndex;
                            //set the function to read vertices and to write them
                            if (numVertices <= 0xFF)
                            {
                                readIndex = (reader) => reader.ReadByte();
                                writeIndex = (writer, idx) => writer.Write((byte)idx);
                                sizeofIndex = sizeof(byte);
                            }
                            else if (numVertices <= 0xFFFF)
                            {
                                readIndex = (reader) => reader.ReadUInt16();
                                writeIndex = (writer, idx) => writer.Write((ushort)idx);
                                sizeofIndex = sizeof(ushort);
                            }
                            else
                            {
                                readIndex = (reader) => reader.ReadInt32();
                                writeIndex = (writer, idx) => writer.Write(idx);
                                sizeofIndex = sizeof(int);
                            }
                            var numTriangles = br.ReadInt32();
                            bw.Write(numTriangles);

                            for (var i = 0; i < numVertices; i++)
                            {
                                //use doubles to avoid precision errors
                                double x = br.ReadSingle();
                                double y = br.ReadSingle();
                                double z = br.ReadSingle();
                                var pt = new XbimPoint3D(x, y, z);
                                if (hasScale) pt = new XbimPoint3D(pt.X / meter, pt.Y / meter, pt.Z / meter);
                                if (hasTranslation) pt += translation; //do this after as transaltion is in meters
                                bw.Write((float)pt.X);
                                bw.Write((float)pt.Y);
                                bw.Write((float)pt.Z);
                            }
                            var numFaces = br.ReadInt32();
                            bw.Write(numFaces);
                            for (var i = 0; i < numFaces; i++)
                            {
                                var numTrianglesInFace = br.ReadInt32();
                                bw.Write(numTrianglesInFace);
                                if (numTrianglesInFace == 0) continue;
                                var isPlanar = numTrianglesInFace > 0;
                                numTrianglesInFace = Math.Abs(numTrianglesInFace);                                
                                if (isPlanar)
                                {
                                    var indices = br.ReadBytes((numTrianglesInFace * 3 * sizeofIndex)+2);
                                    bw.Write(indices);
                                }
                                else
                                {
                                    var indices = br.ReadBytes((numTrianglesInFace * 3 * (sizeofIndex + 2)));
                                    bw.Write(indices);
                                }
                            }
                        }
                    }
                }
                return msOut.ToArray();
            }
        }

        public static byte[] TransformCentreAndScale(this ShapeGeometry geom, byte[] transformBytes, double cX, double cY, double cZ, double meter)
        {
            var transform = SharpDxHelper.CreateMatrix(transformBytes);
            var translate = new Vector3((float)cX, (float)cY, (float)cZ);
            return TransformCentreAndScale(geom.Triangulation, ref transform, ref translate, (float)meter);
        }
        public static byte[] TransformCentreAndScale(this AimShapeGeometry geom, byte[] transformBytes, double cX, double cY, double cZ, double meter)
        {
            var transform = SharpDxHelper.CreateMatrix(transformBytes);
            var translate = new Vector3((float)cX, (float)cY, (float)cZ);
            return TransformCentreAndScale(geom.Triangulation, ref transform, ref translate, (float)meter);
        }
        /// <summary>
        /// Applies the ShapeGeometries transformation to the matrix, transaltion and any scaling to the triangulated mesh and returns a new byte array of the transformed mesh
        /// </summary>
        /// <param name="centroid">this should be in meters The centroid is subtracted from all points</param>
        /// <param name="meter">number of units in the model that are equal to one meter, a value of 1000 scales a model in millimeters to meters</param>
        /// <returns></returns>
        public static byte[] TransformCentreAndScale(this byte[] mesh, ref Matrix sdxMatrix, ref Vector3 centroid, float meter)
        {      
            //adjust the matrix to hold the translation                        
            
            
            sdxMatrix.TranslationVector /= meter;
            sdxMatrix.ScaleVector = new Vector3(1f/meter); //adjust to meters
            sdxMatrix.TranslationVector -= centroid; //reposition to centre
            bool hasMatrix = !sdxMatrix.IsIdentity;      
            
            if (!hasMatrix) return mesh; //nothing is being changed
          
            using (var msOut = new MemoryStream())
            {
                using (var bw = new BinaryWriter(msOut))
                {
                    using (var ms = new MemoryStream(mesh))
                    {
                        using (var br = new BinaryReader(ms))
                        {
                            // ReSharper disable once UnusedVariable
                            var version = br.ReadByte(); //stream format version
                            bw.Write(version);
                            var numVertices = br.ReadInt32();
                            bw.Write(numVertices);
                            ReadIndex readIndex;
                            WriteIndex writeIndex;
                            int sizeofIndex;
                            //set the function to read vertices and to write them
                            if (numVertices <= 0xFF)
                            {
                                readIndex = (reader) => reader.ReadByte();
                                writeIndex = (writer, idx) => writer.Write((byte)idx);
                                sizeofIndex = sizeof(byte);
                            }
                            else if (numVertices <= 0xFFFF)
                            {
                                readIndex = (reader) => reader.ReadUInt16();
                                writeIndex = (writer, idx) => writer.Write((ushort)idx);
                                sizeofIndex = sizeof(ushort);
                            }
                            else
                            {
                                readIndex = (reader) => reader.ReadInt32();
                                writeIndex = (writer, idx) => writer.Write(idx);
                                sizeofIndex = sizeof(int);
                            }
                            var numTriangles = br.ReadInt32();
                            bw.Write(numTriangles);

                            for (var i = 0; i < numVertices; i++)
                            {
                                float x = br.ReadSingle();
                                float y = br.ReadSingle();
                                float z = br.ReadSingle();
                                var pt = new Vector3(x, y, z);
                                if (hasMatrix) Vector3.TransformCoordinate(ref pt, ref sdxMatrix, out pt);                              
                                bw.Write(pt.X);
                                bw.Write(pt.Y);
                                bw.Write(pt.Z);
                            }
                            var numFaces = br.ReadInt32();
                            bw.Write(numFaces);
                            for (var i = 0; i < numFaces; i++)
                            {
                                var numTrianglesInFace = br.ReadInt32();
                                bw.Write(numTrianglesInFace);
                                if (numTrianglesInFace == 0) continue;
                                var isPlanar = numTrianglesInFace > 0;
                                numTrianglesInFace = Math.Abs(numTrianglesInFace);
                                Vector3 normVec;
                                if (isPlanar)
                                {
                                    var u = br.ReadByte();
                                    var v = br.ReadByte();
                                    SharpDxHelper.Vector3(u, v, out normVec);
                                    if (hasMatrix) Vector3.TransformNormal(ref normVec, ref sdxMatrix, out normVec);
                                    bw.Write(normVec.ToPackedNormal());
                                    var indices = br.ReadBytes(numTrianglesInFace * 3 * sizeofIndex);
                                    bw.Write(indices);
                                }
                                else
                                {
                                    for (var j = 0; j < numTrianglesInFace; j++)
                                    {
                                        for (var k = 0; k < 3; k++)
                                        {
                                            writeIndex(bw, readIndex(br));
                                            var u = br.ReadByte();
                                            var v = br.ReadByte();
                                            SharpDxHelper.Vector3(u, v, out normVec);
                                            if (hasMatrix) Vector3.TransformNormal(ref normVec, ref sdxMatrix, out normVec);
                                            bw.Write(normVec.ToPackedNormal());
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                return msOut.ToArray();
            }
        }


        public static byte[] Transform(this ShapeGeometry geom, byte[] transformation)
        {
            return Transform(geom.Triangulation, transformation);
        }

        public static byte[] Transform(byte[] triangulation, byte[] transformation)
        {
            var matrix = XbimMatrix3D.FromArray(transformation);
            bool hasMatrix = !matrix.IsIdentity;
            if (!hasMatrix ) return triangulation; //nothing is being changed
                                                                                  //  XbimMatrix3D scaleMatrix = new XbimMatrix3D(1/meter);
            Matrix rotationMatrix = matrix.ToMatrix();
            using (var msOut = new MemoryStream())
            {
                using (var bw = new BinaryWriter(msOut))
                {
                    using (var ms = new MemoryStream(triangulation))
                    {
                        using (var br = new BinaryReader(ms))
                        {
                            // ReSharper disable once UnusedVariable
                            var version = br.ReadByte(); //stream format version
                            bw.Write(version);
                            var numVertices = br.ReadInt32();
                            bw.Write(numVertices);
                            ReadIndex readIndex;
                            WriteIndex writeIndex;
                            int sizeofIndex;
                            //set the function to read vertices and to write them
                            if (numVertices <= 0xFF)
                            {
                                readIndex = (reader) => reader.ReadByte();
                                writeIndex = (writer, idx) => writer.Write((byte)idx);
                                sizeofIndex = sizeof(byte);
                            }
                            else if (numVertices <= 0xFFFF)
                            {
                                readIndex = (reader) => reader.ReadUInt16();
                                writeIndex = (writer, idx) => writer.Write((ushort)idx);
                                sizeofIndex = sizeof(ushort);
                            }
                            else
                            {
                                readIndex = (reader) => reader.ReadInt32();
                                writeIndex = (writer, idx) => writer.Write(idx);
                                sizeofIndex = sizeof(int);
                            }
                            var numTriangles = br.ReadInt32();
                            bw.Write(numTriangles);

                            for (var i = 0; i < numVertices; i++)
                            {
                                //use doubles to avoid precision errors
                                double x = br.ReadSingle();
                                double y = br.ReadSingle();
                                double z = br.ReadSingle();
                                var pt = new XbimPoint3D(x, y, z);
                                if (hasMatrix) pt = matrix.Transform(pt);
                                bw.Write((float)pt.X);
                                bw.Write((float)pt.Y);
                                bw.Write((float)pt.Z);
                            }
                            var numFaces = br.ReadInt32();
                            bw.Write(numFaces);
                            for (var i = 0; i < numFaces; i++)
                            {
                                var numTrianglesInFace = br.ReadInt32();
                                bw.Write(numTrianglesInFace);
                                if (numTrianglesInFace == 0) continue;
                                var isPlanar = numTrianglesInFace > 0;
                                numTrianglesInFace = Math.Abs(numTrianglesInFace);
                                Vector3 normVec;
                                if (isPlanar)
                                {
                                    var u = br.ReadByte();
                                    var v = br.ReadByte();
                                    SharpDxHelper.Vector3(u, v, out normVec);
                                    if (hasMatrix) Vector3.TransformNormal(ref normVec, ref rotationMatrix, out normVec);
                                    bw.Write(normVec.ToPackedNormal());
                                    var indices = br.ReadBytes(numTrianglesInFace * 3 * sizeofIndex);
                                    bw.Write(indices);
                                }
                                else
                                {
                                    for (var j = 0; j < numTrianglesInFace; j++)
                                    {
                                        for (var k = 0; k < 3; k++)
                                        {
                                            writeIndex(bw, readIndex(br));
                                            var u = br.ReadByte();
                                            var v = br.ReadByte();
                                            SharpDxHelper.Vector3(u, v, out normVec);
                                            if (hasMatrix) Vector3.TransformNormal(ref normVec, ref rotationMatrix, out normVec);
                                            bw.Write(normVec.ToPackedNormal());
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                return msOut.ToArray();
            }
        }
    }
}

