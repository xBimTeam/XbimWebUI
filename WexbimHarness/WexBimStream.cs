using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;
using Xbim.Common.Geometry;
using Xbim.Ifc;

namespace AimViewModels.Shared.Helpers
{

    public class WexBimHeader
    {
        public WexBimHeader()
        {
            MagicNumber = IfcStore.WexBimId;
            Version = 3; //modified to support regions correctly
            
        }
        public Int32 MagicNumber { get; private set; }
        public byte Version { get; private set; }
        public Int32 ShapeCount { get; set; }
        public Int32 VertexCount { get; set; }
        public Int32 TriangleCount { get; set; }
        public Int32 MatrixCount { get; set; }
        public Int32 ProductCount { get; set; }
        public Int32 StyleCount { get; set; }
        public Single OneMeter { get; set; }
        public Int16 RegionCount { get; set; }
        public void WriteToStream(BinaryWriter writer)
        {
            writer.Write(MagicNumber);
            writer.Write(Version);
            writer.Write(ShapeCount);
            writer.Write(VertexCount);
            writer.Write(TriangleCount);
            writer.Write(MatrixCount);
            writer.Write(ProductCount);
            writer.Write(StyleCount);
            writer.Write(OneMeter);
            writer.Write(RegionCount);
        }

        public static WexBimHeader ReadFromStream(BinaryReader reader)
        {
            var header = new WexBimHeader();
            header.MagicNumber = reader.ReadInt32();
            header.Version = reader.ReadByte();
            header.ShapeCount = reader.ReadInt32();
            header.VertexCount = reader.ReadInt32();
            header.TriangleCount = reader.ReadInt32();
            header.MatrixCount = reader.ReadInt32();
            header.ProductCount = reader.ReadInt32();
            header.StyleCount = reader.ReadInt32();
            header.OneMeter = reader.ReadSingle();
            header.RegionCount = reader.ReadInt16();
            return header;
        }

    }
    public class WexBimRegion
    {
        public WexBimRegion()
        {
            _geometryModels = new List<WexBimGeometryModel>();
        }
        public Int32 Population { get; set; }
        public Single CentreX { get; set; }
        public Single CentreY { get; set; }
        public Single CentreZ { get; set; }
        public XbimRect3D BoundingBox;
        private List<WexBimGeometryModel> _geometryModels;
        public IList<WexBimGeometryModel> GeometryModels => _geometryModels;

        public int MatrixCount()
        {
            return _geometryModels.Sum(gm=>gm.MatrixCount());
        }

        public int ShapeCount()
        {
            return _geometryModels.Sum(gm => gm.ShapeCount());
        }
        public int TriangleCount()
        {
            return _geometryModels.Sum(gm => gm.TriangleCount());
        }
        public int VertexCount()
        {
            return _geometryModels.Sum(gm => gm.VertexCount());
        }
        public void AddGeometryModel(byte[] triangulation, IEnumerable<WexBimShapeMultiInstance> instances)
        {
            var gm = new WexBimGeometryModel { Geometry = new WexBimMesh(triangulation) };
            gm.AddInstances(instances);
            _geometryModels.Add(gm);
        }
        public void AddGeometryModel(byte[] triangulation, WexBimShapeSingleInstance singleInstance)
        {
            var gm = new WexBimGeometryModel { Geometry = new WexBimMesh(triangulation) };
            gm.AddInstance(singleInstance);
            _geometryModels.Add(gm);
        }

        public void AddGeometryModel(WexBimGeometryModel gm)
        {
            _geometryModels.Add(gm);
        }
        public void WriteToStream(BinaryWriter writer)
        {
           
            writer.Write(Population);
            writer.Write(CentreX);
            writer.Write(CentreY);
            writer.Write(CentreZ);
            writer.Write(BoundingBox.ToFloatArray());
        }
        public static WexBimRegion ReadFromStream(BinaryReader reader)
        {
            var region = new WexBimRegion();
            region.Population = reader.ReadInt32();
            region.CentreX = reader.ReadSingle();
            region.CentreY = reader.ReadSingle();
            region.CentreZ = reader.ReadSingle();
            region.BoundingBox = XbimRect3D.FromArray(reader.ReadBytes(6*sizeof(float)));        
            return region;
        }

        
    }
    public class WexBimStyle
    {
        public Int32 StyleId { get; set; }
        public Single Red { get; set; }
        public Single Green { get; set; }
        public Single Blue { get; set; }
        public Single Alpha { get; set; }
        public void WriteToStream(BinaryWriter writer)
        {
            writer.Write(StyleId);
            writer.Write(Red);
            writer.Write(Green);
            writer.Write(Blue);
            writer.Write(Alpha);
        }

        public static WexBimStyle ReadFromStream(BinaryReader reader)
        {
            var style = new WexBimStyle();
            style.StyleId = reader.ReadInt32();
            style.Red = reader.ReadSingle();
            style.Green = reader.ReadSingle();
            style.Blue = reader.ReadSingle();
            style.Alpha = reader.ReadSingle();
            return style;
        }
    }
    public class WexBimProduct
    {
        public Int32 ProductLabel { get; set; }
        public Int16 ProductType { get; set; }
        public XbimRect3D BoundingBox{ get; set; }
        public void WriteToStream(BinaryWriter writer)
        {
            
            writer.Write(ProductLabel);
            writer.Write(ProductType);
            writer.Write(BoundingBox.ToFloatArray());
        }

        public static WexBimProduct ReadFromStream(BinaryReader reader)
        {
            var product = new WexBimProduct();
            product.ProductLabel = reader.ReadInt32();
            product.ProductType = reader.ReadInt16();
            product.BoundingBox = XbimRect3D.FromArray(reader.ReadBytes(6 * sizeof(float)));
            return product;
        }
    }
    public interface IWexBimShape
    {
        bool IsSingleInstance { get; }
        Int32 ProductLabel { get; set; }
        Int16 InstanceTypeId { get; set; }
        Int32 InstanceLabel { get; set; }
        Int32 StyleId { get; set; }
        byte[] Transformation { get; set; }
        void WriteToStream(BinaryWriter writer);
    }
    public class WexBimShapeSingleInstance : IWexBimShape
    {
        public Int32 ProductLabel { get; set; }
        public Int16 InstanceTypeId { get; set; }
        public Int32 InstanceLabel { get; set; }
        public Int32 StyleId { get; set; }

        public bool IsSingleInstance
        {
            get
            {
                return true;
            }
        }

        public byte[] Transformation
        {
            get
            {
                return null;
            }

            set
            {
                throw new NotImplementedException();
            }
        }

        public virtual void WriteToStream(BinaryWriter writer)
        {
            writer.Write(ProductLabel);
            writer.Write(InstanceTypeId);
            writer.Write(InstanceLabel);
            writer.Write(StyleId);
        }

        public static WexBimShapeSingleInstance ReadFromStream(BinaryReader reader)
        {
            var shape = new WexBimShapeSingleInstance();
            shape.ProductLabel = reader.ReadInt32();
            shape.InstanceTypeId = reader.ReadInt16();
            shape.InstanceLabel = reader.ReadInt32();
            shape.StyleId = reader.ReadInt32();
            return shape;
        }
    }

    /// <summary>
    /// Special kind of shape header for multiple instance shapes which has a transform
    /// </summary>
    public class WexBimShapeMultiInstance :  IWexBimShape
    {
        public Int32 ProductLabel { get; set; }
        public Int16 InstanceTypeId { get; set; }
        public Int32 InstanceLabel { get; set; }
        public Int32 StyleId { get; set; }
        public byte[] Transformation { get; set; }

        public bool IsSingleInstance
        {
            get
            {
               return false;
            }
        }

        public void WriteToStream(BinaryWriter writer)
        {
            writer.Write(ProductLabel);
            writer.Write(InstanceTypeId);
            writer.Write(InstanceLabel);
            writer.Write(StyleId);
            Debug.Assert(Transformation.Length == 16 * sizeof(double));
            writer.Write(Transformation);          
        }

        public static WexBimShapeMultiInstance ReadFromStream(BinaryReader reader)
        {
            var shape = new WexBimShapeMultiInstance();
            shape.ProductLabel = reader.ReadInt32();
            shape.InstanceTypeId = reader.ReadInt16();
            shape.InstanceLabel = reader.ReadInt32();
            shape.StyleId = reader.ReadInt32();
            shape.Transformation=reader.ReadBytes(16 * sizeof(double));
            return shape;
        }
    }

    public class WexBimGeometryModel
    {
        private List<IWexBimShape> _shapes;

        public WexBimGeometryModel()
        {
            _shapes = new List<IWexBimShape>();
        }
        public IEnumerable<IWexBimShape> Shapes => _shapes;
        public WexBimMesh Geometry { get; set; }

        public int MatrixCount()
        {
            return _shapes.OfType<WexBimShapeMultiInstance>().Count();
        }

        public int ShapeCount()
        {
            return _shapes.Count;
        }

        public int TriangleCount()
        {
            return Geometry.TriangleCount * _shapes.Count;
        }
        public int VertexCount()
        {
            return Geometry.VertexCount;
        }
        public void AddInstances(IEnumerable<WexBimShapeMultiInstance> instances)
        {
            _shapes.AddRange(instances);
        }

        public void AddInstance(WexBimShapeSingleInstance singleInstance)
        {
            _shapes.Add(singleInstance);
        }
        public void WriteToStream(BinaryWriter writer)
        {
            writer.Write(_shapes.Count);
            foreach (var shape in _shapes) //does matter which one it should be fine
            {
                shape.WriteToStream(writer);
            }
            writer.Write(Geometry.Length);
            writer.Write(Geometry.ToByteArray());
        }

        public static WexBimGeometryModel ReadFromStream(BinaryReader reader)
        {
            var geometry = new WexBimGeometryModel();
            var numShapes = reader.ReadInt32();
            if(numShapes>1) //we have a multi used geometry
            {
                for (int i = 0; i < numShapes; i++)
                {
                    geometry._shapes.Add(WexBimShapeMultiInstance.ReadFromStream(reader));
                }
            }
            else //just the one
            {
                geometry._shapes.Add( WexBimShapeSingleInstance.ReadFromStream(reader));
            }
            //read the geometry
            var numBytes = reader.ReadInt32();
            geometry.Geometry = new WexBimMesh(reader.ReadBytes(numBytes));
            return geometry;
        }

      
    }
    public class WexBimStream
    {
        public WexBimStream()
        {
            Header = new WexBimHeader();
            _regions = new List<WexBimRegion>();
            _styles = new List<WexBimStyle>();
            _products = new Dictionary<int, WexBimProduct>();          
        }
        public WexBimHeader Header { get; private set; }
        private List<WexBimRegion> _regions;
        private List<WexBimStyle> _styles;
        private Dictionary<int, WexBimProduct> _products;
       

        public IList<WexBimRegion> Regions => _regions;
        public IList<WexBimStyle> Styles => _styles;
        public IEnumerable<WexBimProduct> Products => _products.Values;
       
        public void AddRegion(WexBimRegion region)
        {
            _regions.Add(region);
        }
        public void AddStyle(WexBimStyle style)
        {
            _styles.Add(style);
        }
       
        /// <summary>
        /// Adds a product part representation to the view, if parts of the product are already added the bounding box is expanded, the first product type is retained
        /// </summary>
        /// <param name="product"></param>
        public void AddProduct(WexBimProduct product)
        {
            WexBimProduct existingProduct;
            if (_products.TryGetValue(product.ProductLabel, out existingProduct))
            {
                var bb = existingProduct.BoundingBox;
                bb.Union(product.BoundingBox);
                existingProduct.BoundingBox = bb;
            }
            else
                _products.Add(product.ProductLabel, product);
        }

        public void WriteToStream(BinaryWriter writer)
        {
            //first write the header but rememeber the pont on the stram as we have to overrite when all the data is known
            var startPosition = writer.Seek(0, SeekOrigin.Current);
            //set up the header
            UpdateHeader();
            Header.WriteToStream(writer);
            foreach (var region in Regions) region.WriteToStream(writer);
            foreach (var style in Styles) style.WriteToStream(writer);
            foreach (var product in Products) product.WriteToStream(writer);
            foreach (var region in Regions)
            {
                writer.Write(region.GeometryModels.Count);
                foreach (var geometry in region.GeometryModels) geometry.WriteToStream(writer);
            }
        }

        static public WexBimStream ReadFromStream(BinaryReader reader)
        {
            var wexBimStream = new WexBimStream();
            wexBimStream.Header = WexBimHeader.ReadFromStream(reader);
            for (int i = 0; i < wexBimStream.Header.RegionCount; i++)
                wexBimStream.AddRegion(WexBimRegion.ReadFromStream(reader));
            for (int i = 0; i < wexBimStream.Header.StyleCount; i++)
                wexBimStream.AddStyle(WexBimStyle.ReadFromStream(reader));
            for (int i = 0; i < wexBimStream.Header.ProductCount; i++)
                wexBimStream.AddProduct(WexBimProduct.ReadFromStream(reader));
            foreach (var region in wexBimStream.Regions)
            {
                var geometryCount = reader.ReadInt32();
                for (int i = 0; i < geometryCount; i++)
                    region.AddGeometryModel(WexBimGeometryModel.ReadFromStream(reader));
            }
            return wexBimStream;
        }
        public void UpdateHeader()
        {
            Header.MatrixCount = Regions.Sum(r => r.MatrixCount());
            Header.ProductCount = _products.Count;
            Header.RegionCount = (short)_regions.Count;
            Header.ShapeCount = Regions.Sum(r => r.ShapeCount());
            Header.StyleCount = _styles.Count;
            Header.TriangleCount= Regions.Sum(r => r.TriangleCount());
            Header.VertexCount = Regions.Sum(r => r.VertexCount());
        }
        /// <summary>
        /// Reads an entire WexBim stream
        /// </summary>
        /// <param name="reader"></param>
        /// <returns></returns>
        //public static WexBimHelper ReadFromStream(BinaryReader reader)
        //{

        //}



    }
}
