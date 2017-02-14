namespace Xbim.Viewer {
    export class WexBimHeader {
        constructor() {
            this.MagicNumber = 94132117;
            this.Version = 3; //modified to support regions correctly

        }
        public MagicNumber: number;
        public Version: number;
        public ShapeCount: number;
        public VertexCount: number;
        public TriangleCount: number;
        public MatrixCount: number;
        public ProductCount: number;
        public StyleCount: number;
        public OneMeter: number;
        public RegionCount: number;


        public static ReadFromStream(reader: Xbim.Viewer.BinaryReader): WexBimHeader {
            var header = new WexBimHeader();
            header.MagicNumber = reader.readInt32();
            header.Version = reader.readByte();
            header.ShapeCount = reader.readInt32();
            header.VertexCount = reader.readInt32();
            header.TriangleCount = reader.readInt32();
            header.MatrixCount = reader.readInt32();
            header.ProductCount = reader.readInt32();
            header.StyleCount = reader.readInt32();
            header.OneMeter = reader.readFloat32();
            header.RegionCount = reader.readInt16();
            return header;
        }

    }

    export class WexBimRegion {

        public Population: number;
        public Centre: Float32Array;
        public BoundingBox: Float32Array;
        public GeometryModels: Array<WexBimGeometryModel> = new Array<WexBimGeometryModel>();

        public MatrixCount(): number {
            var count = 0;
            this.GeometryModels.forEach(gm => count += gm.MatrixCount());
            return count;
        }

        public ShapeCount(): number {
            var count = 0;
            this.GeometryModels.forEach(gm => count += gm.ShapeCount());
            return count;
        }
        public TriangleCount(): number {
            var count = 0;
            this.GeometryModels.forEach(gm => count += gm.TriangleCount());
            return count;
        }

        public VertexCount(): number {
            var count = 0;
            this.GeometryModels.forEach(gm => count += gm.VertexCount());
            return count;
        }

        public AddGeometryModelInstances(triangulation: Uint8Array, instances: WexBimShapeMultiInstance[]): void {
            var gm = new WexBimGeometryModel();
            gm.Geometry = new Xbim.Viewer.WexBimMesh(triangulation);
            gm.AddInstances(instances);
            this.GeometryModels.push(gm);
        }

        public AddGeometryModelInstance(triangulation: Uint8Array, singleInstance: WexBimShapeSingleInstance): void {
            var gm = new WexBimGeometryModel();
            gm.Geometry = new WexBimMesh(triangulation)
            gm.AddInstance(singleInstance);
            this.GeometryModels.push(gm);
        }

        public AddGeometryModel(gm: WexBimGeometryModel): void {
            this.GeometryModels.push(gm);
        }

        public static ReadFromStream(reader: Xbim.Viewer.BinaryReader): WexBimRegion {
            var region = new WexBimRegion();
            region.Population = reader.readInt32();
            region.Centre = reader.readFloat32(6);
            region.BoundingBox = reader.readFloat32(6);
            return region;
        }
    }

    export class WexBimStyle {
        public StyleId: number;
        public RGB: Float32Array;

        public static ReadFromStream(reader: Xbim.Viewer.BinaryReader): WexBimStyle {
            var style = new WexBimStyle();
            style.StyleId = reader.readInt32();
            style.RGB = reader.readFloat32(3);
            return style;
        }
    }
    export class WexBimProduct {
        public ProductLabel: number;
        public ProductType: Xbim.Viewer.ProductType;
        public BoundingBox: Float32Array;

        public static ReadFromStream(reader: Xbim.Viewer.BinaryReader): WexBimProduct {
            var product = new WexBimProduct();
            product.ProductLabel = reader.readInt32();
            product.ProductType = reader.readInt16();
            product.BoundingBox = reader.readFloat32(6);
            return product;
        }
    }

    export interface IWexBimShape {
        IsSingleInstance: boolean;
        ProductLabel: number;
        InstanceTypeId: number;
        InstanceLabel: number;
        StyleId: number;
        Transformation: Float64Array;
    }
    export class WexBimShapeSingleInstance implements IWexBimShape {
        IsSingleInstance: boolean = true;
        ProductLabel: number;
        InstanceTypeId: number;
        InstanceLabel: number;
        StyleId: number;
        Transformation: Float64Array = null;

        public static ReadFromStream(reader: Xbim.Viewer.BinaryReader): WexBimShapeSingleInstance {
            var shape = new WexBimShapeSingleInstance();
            shape.ProductLabel = reader.readInt32();
            shape.InstanceTypeId = reader.readInt16();
            shape.InstanceLabel = reader.readInt32();
            shape.StyleId = reader.readInt32();
            return shape;
        }
    }

    /// <summary>
    /// Special kind of shape header for multiple instance shapes which has a transform
    /// </summary>
    export class WexBimShapeMultiInstance implements IWexBimShape {
        IsSingleInstance: boolean = false;
        ProductLabel: number;
        InstanceTypeId: number;
        InstanceLabel: number;
        StyleId: number;
        Transformation: Float64Array = null;

        public static ReadFromStream(reader: Xbim.Viewer.BinaryReader): WexBimShapeMultiInstance {
            var shape = new WexBimShapeMultiInstance();
            shape.ProductLabel = reader.readInt32();
            shape.InstanceTypeId = reader.readInt16();
            shape.InstanceLabel = reader.readInt32();
            shape.StyleId = reader.readInt32();
            shape.Transformation = reader.readFloat64(16);
            return shape;
        }
    }

    export class WexBimGeometryModel {
        private Shapes: IWexBimShape[] = new Array<IWexBimShape>();

        public Geometry: Xbim.Viewer.WexBimMesh;

        public get MatrixCount(): number {
            return this.Shapes.filter(s => s instanceof WexBimShapeMultiInstance).length;
        }

        public get ShapeCount(): number {
            return this.Shapes.length;
        }

        public get TriangleCount(): number {
            return this.Geometry.TriangleCount;
        }
        public get VertexCount(): number {
            return this.Geometry.VertexCount;
        }

        public AddInstances(instances: WexBimShapeMultiInstance[]): void {
            instances.forEach(i => this.Shapes.push(i));
        }

        public AddInstance(singleInstance: WexBimShapeSingleInstance): void {
            this.Shapes.push(singleInstance);
        }

        public static ReadFromStream(reader: Xbim.Viewer.BinaryReader): WexBimGeometryModel {
            var geometry = new WexBimGeometryModel();
            var numShapes = reader.readInt32();
            if (numShapes > 1) //we have a multi used geometry
            {
                for (let i = 0; i < numShapes; i++) {
                    geometry.Shapes.push(WexBimShapeMultiInstance.ReadFromStream(reader));
                }
            }
            else //just the one
            {
                geometry.Shapes.push(WexBimShapeSingleInstance.ReadFromStream(reader));
            }
            //read the geometry
            var numBytes = reader.readInt32();
            geometry.Geometry = new WexBimMesh(reader.readUint8(numBytes));
            return geometry;
        }


    }
    export class WexBimStream {
        public WexBimStream() {
            Header = new WexBimHeader();
            _regions = new List<WexBimRegion>();
            _styles = new List<WexBimStyle>();
            _products = new Dictionary<int, WexBimProduct>();
        }
        public WexBimHeader Header { get; private set; }
        private List < WexBimRegion > _regions;
        private List < WexBimStyle > _styles;
        private Dictionary < int, WexBimProduct > _products;
       

        public IList < WexBimRegion > Regions => _regions;
        public IList < WexBimStyle > Styles => _styles;
        public IEnumerable < WexBimProduct > Products => _products.Values;
       
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
        if (_products.TryGetValue(product.ProductLabel, out existingProduct)) {
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
        foreach(var region in Regions) region.WriteToStream(writer);
        foreach(var style in Styles) style.WriteToStream(writer);
        foreach(var product in Products) product.WriteToStream(writer);
        foreach(var region in Regions)
        {
            writer.Write(region.GeometryModels.Count);
            foreach(var geometry in region.GeometryModels) geometry.WriteToStream(writer);
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
        foreach(var region in wexBimStream.Regions)
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
        Header.TriangleCount = Regions.Sum(r => r.TriangleCount());
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