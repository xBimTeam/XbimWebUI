import { BinaryReader } from "../binary-reader";
import { ProductType } from "../product-type";
import { WexBimMesh } from "./wexbim-mesh";
export declare class WexBimHeader {
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
export declare class WexBimRegion {
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
export declare class WexBimStyle {
    StyleId: number;
    RGBA: Float32Array;
    static ReadFromStream(reader: BinaryReader): WexBimStyle;
}
export declare class WexBimProduct {
    ProductLabel: number;
    ProductType: ProductType;
    BoundingBox: Float32Array;
    Shapes: IWexBimShape[];
    static ReadFromStream(reader: BinaryReader): WexBimProduct;
}
export interface IWexBimShape {
    IsSingleInstance: boolean;
    ProductLabel: number;
    InstanceTypeId: number;
    InstanceLabel: number;
    StyleId: number;
    Transformation: Float64Array;
    GeometryModel: WexBimGeometryModel;
}
export declare class WexBimShapeSingleInstance implements IWexBimShape {
    IsSingleInstance: boolean;
    ProductLabel: number;
    InstanceTypeId: number;
    InstanceLabel: number;
    StyleId: number;
    Transformation: Float64Array;
    GeometryModel: WexBimGeometryModel;
    static ReadFromStream(reader: BinaryReader, model: WexBimGeometryModel): WexBimShapeSingleInstance;
}
export declare class WexBimShapeMultiInstance implements IWexBimShape {
    IsSingleInstance: boolean;
    ProductLabel: number;
    InstanceTypeId: number;
    InstanceLabel: number;
    StyleId: number;
    Transformation: Float64Array;
    GeometryModel: WexBimGeometryModel;
    static ReadFromStream(reader: BinaryReader, model: WexBimGeometryModel): WexBimShapeMultiInstance;
}
export declare class WexBimGeometryModel {
    Shapes: IWexBimShape[];
    Geometry: WexBimMesh;
    readonly MatrixCount: number;
    readonly ShapeCount: number;
    readonly TriangleCount: number;
    readonly VertexCount: number;
    static ReadFromStream(reader: BinaryReader): WexBimGeometryModel;
}
export declare class WexBimStream {
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
