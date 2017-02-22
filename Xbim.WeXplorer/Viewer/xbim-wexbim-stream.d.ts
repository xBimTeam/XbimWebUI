declare namespace Xbim.Viewer {
    class WexBimHeader {
        constructor();
        MagicNumber: number;
        Version: number;
        ShapeCount: number;
        VertexCount: number;
        TriangleCount: number;
        MatrixCount: number;
        ProductCount: number;
        StyleCount: number;
        OneMeter: number;
        RegionCount: number;
        static ReadFromStream(reader: BinaryReader): WexBimHeader;
    }
    class WexBimRegion {
        Population: number;
        Centre: Float32Array;
        BoundingBox: Float32Array;
        GeometryModels: Array<WexBimGeometryModel>;
        MatrixCount(): number;
        ShapeCount(): number;
        TriangleCount(): number;
        VertexCount(): number;
        AddGeometryModel(model: WexBimGeometryModel): void;
        static ReadFromStream(reader: BinaryReader): WexBimRegion;
    }
    class WexBimStyle {
        StyleId: number;
        RGBA: Float32Array;
        static ReadFromStream(reader: BinaryReader): WexBimStyle;
    }
    class WexBimProduct {
        ProductLabel: number;
        ProductType: Xbim.Viewer.ProductType;
        BoundingBox: Float32Array;
        Shapes: IWexBimShape[];
        static ReadFromStream(reader: BinaryReader): WexBimProduct;
    }
    interface IWexBimShape {
        IsSingleInstance: boolean;
        ProductLabel: number;
        InstanceTypeId: number;
        InstanceLabel: number;
        StyleId: number;
        Transformation: Float64Array;
        GeometryModel: WexBimGeometryModel;
    }
    class WexBimShapeSingleInstance implements IWexBimShape {
        IsSingleInstance: boolean;
        ProductLabel: number;
        InstanceTypeId: number;
        InstanceLabel: number;
        StyleId: number;
        Transformation: Float64Array;
        GeometryModel: WexBimGeometryModel;
        static ReadFromStream(reader: BinaryReader, model: WexBimGeometryModel): WexBimShapeSingleInstance;
    }
    class WexBimShapeMultiInstance implements IWexBimShape {
        IsSingleInstance: boolean;
        ProductLabel: number;
        InstanceTypeId: number;
        InstanceLabel: number;
        StyleId: number;
        Transformation: Float64Array;
        GeometryModel: WexBimGeometryModel;
        static ReadFromStream(reader: BinaryReader, model: WexBimGeometryModel): WexBimShapeMultiInstance;
    }
    class WexBimGeometryModel {
        Shapes: IWexBimShape[];
        Geometry: WexBimMesh;
        readonly MatrixCount: number;
        readonly ShapeCount: number;
        readonly TriangleCount: number;
        readonly VertexCount: number;
        static ReadFromStream(reader: BinaryReader): WexBimGeometryModel;
    }
    class WexBimStream {
        Header: WexBimHeader;
        Regions: WexBimRegion[];
        Styles: WexBimStyle[];
        Products: {
            [id: number]: WexBimProduct;
        };
        AddRegion(region: WexBimRegion): void;
        AddStyle(style: WexBimStyle): void;
        private Union(boxA, boxB);
        AddProduct(product: WexBimProduct): void;
        static Load(source: string | Blob | File | ArrayBuffer, callback: (wexbim: WexBimStream) => void): void;
        static ReadFromStream(reader: BinaryReader): WexBimStream;
    }
}
