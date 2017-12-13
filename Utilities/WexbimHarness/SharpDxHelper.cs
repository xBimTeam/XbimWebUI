using SharpDX;
using System;
using Xbim.Common.Geometry;

namespace AimViewModels.Shared.Helpers
{
    public static class SharpDxHelper
    {
        const double PackSize = 252;
        const double PackTolerance = 1e-4;
        static readonly byte[] SingularityNegativeY = { (byte)PackSize, (byte)PackSize };
        static readonly byte[] SingularityPositiveY = { 0, 0 };
        static double HalfPI = Math.PI / 2;
        static double PIPplusHalfPI = Math.PI + HalfPI;
        static double TwoPI = Math.PI *2;
        public static Matrix ToMatrix(this XbimMatrix3D xm)
        {
            return new Matrix((float)xm.M11, (float)xm.M12, (float)xm.M13, (float)xm.M14,
                                 (float)xm.M21, (float)xm.M22, (float)xm.M23, (float)xm.M24,
                                 (float)xm.M31, (float)xm.M32, (float)xm.M33, (float)xm.M34,
                                 (float)xm.OffsetX, (float)xm.OffsetY, (float)xm.OffsetZ, (float)xm.M44
                  );
        }

        public static byte[] ToPackedNormal(this Vector3 vec)
        {
                     
            //the most basic case when normal points in Y direction (singular point)
            if (Math.Abs(1 -  vec.Y) < PackTolerance)
                return SingularityPositiveY;             
            //the most basic case when normal points in -Y direction (second singular point)
            if (Math.Abs(vec.Y + 1) < PackTolerance)
                return SingularityNegativeY;               

            double lat;
            double lon;
            //special cases when vector is aligned to one of the axis
            if (Math.Abs(vec.Z - 1) < PackTolerance)
            {
                lon = 0;
                lat = Math.PI / 2;
            }
            else if (Math.Abs(vec.Z + 1) < PackTolerance)
            {
                lon = Math.PI;
                lat = HalfPI;
            }
            else if (Math.Abs(vec.X - 1) < PackTolerance)
            {
                lon = HalfPI;
                lat = HalfPI;
            }
            else if (Math.Abs(vec.X + 1) < PackTolerance)
            {
                lon = PIPplusHalfPI;
                lat = HalfPI;
            }
            else
            {
                //Atan2 takes care for quadrants (goes from positive Z to positive X and around)
                lon = Math.Atan2(vec.X, vec.Z);
                //latitude from 0 to PI starting at positive Y ending at negative Y
                lat = Math.Acos(vec.Y);
            }

            //normalize values
            lon = lon / TwoPI;
            lat = lat / Math.PI;

            //stretch to pack size so that round directions are aligned to axes.
            var u = (byte)(lon * PackSize);
            var v = (byte)(lat * PackSize);
            return new byte[] { u, v };
           
        }

        public static void Vector3(byte u, byte v, out Vector3 normal)
        {
            
            var lon = u / PackSize * Math.PI * 2;
            var lat = v / PackSize * Math.PI;

            var y = (float)Math.Cos(lat);
            var x = (float)((Math.Sin(lon) * Math.Sin(lat)));
            var z = (float)((Math.Cos(lon) * Math.Sin(lat)));           
            normal = new Vector3(x, y, z);          
        }

        public static Matrix CreateMatrix(byte[] array)
        {
            if (array.Length == 0) return Matrix.Identity;
            bool isDouble = array.Length > 16 * sizeof(Single);
            if (isDouble)
                return new Matrix(
              (float)BitConverter.ToDouble(array, 0),
              (float)BitConverter.ToDouble(array, 1 * sizeof(double)),
              (float)BitConverter.ToDouble(array, 2 * sizeof(double)),
              (float)BitConverter.ToDouble(array, 3 * sizeof(double)),
              (float)BitConverter.ToDouble(array, 4 * sizeof(double)),
              (float)BitConverter.ToDouble(array, 5 * sizeof(double)),
              (float)BitConverter.ToDouble(array, 6 * sizeof(double)),
              (float)BitConverter.ToDouble(array, 7 * sizeof(double)),
              (float)BitConverter.ToDouble(array, 8 * sizeof(double)),
              (float)BitConverter.ToDouble(array, 9 * sizeof(double)),
              (float)BitConverter.ToDouble(array, 10 * sizeof(double)),
              (float)BitConverter.ToDouble(array, 11 * sizeof(double)),
              (float)BitConverter.ToDouble(array, 12 * sizeof(double)),
              (float)BitConverter.ToDouble(array, 13 * sizeof(double)),
              (float)BitConverter.ToDouble(array, 14 * sizeof(double)),
              (float)BitConverter.ToDouble(array, 15 * sizeof(double))
                );
            else
                return new Matrix(
             BitConverter.ToSingle(array, 0),
             BitConverter.ToSingle(array, 1 * sizeof(float)),
             BitConverter.ToSingle(array, 2 * sizeof(float)),
             BitConverter.ToSingle(array, 3 * sizeof(float)),
             BitConverter.ToSingle(array, 4 * sizeof(float)),
             BitConverter.ToSingle(array, 5 * sizeof(float)),
             BitConverter.ToSingle(array, 6 * sizeof(float)),
             BitConverter.ToSingle(array, 7 * sizeof(float)),
             BitConverter.ToSingle(array, 8 * sizeof(float)),
             BitConverter.ToSingle(array, 9 * sizeof(float)),
             BitConverter.ToSingle(array, 10 * sizeof(float)),
             BitConverter.ToSingle(array, 11 * sizeof(float)),
             BitConverter.ToSingle(array, 12 * sizeof(float)),
             BitConverter.ToSingle(array, 13 * sizeof(float)),
             BitConverter.ToSingle(array, 14 * sizeof(float)),
             BitConverter.ToSingle(array, 15 * sizeof(float))
               );
        }
    }
}
