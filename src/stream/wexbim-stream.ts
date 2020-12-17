import { BinaryReader } from "../reader/binary-reader";
import { ProductType } from "../product-type";
import { WexBimMesh } from "./wexbim-mesh";

export class WexBimHeader {
    constructor() {
        this.Version = 3; //modified to support regions correctly

    }
    public static MagicNumber: number = 94132117;
    public Version: number;
    public ShapeCount: number;
    public VertexCount: number;
    public TriangleCount: number;
    public MatrixCount: number;
    public ProductCount: number;
    public StyleCount: number;
    public OneMeter: number;
    public RegionCount: number;


    public static ReadFromStream(reader: BinaryReader): WexBimHeader {
        var header = new WexBimHeader();
        let magicNumber = reader.readInt32();
        if (magicNumber !== WexBimHeader.MagicNumber) {
            throw new Error("This is not a valid wexbim file. Magic number mismatch.");
        }

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

// tslint:disable: max-classes-per-file
export class WexBimRegion {

    public Population: number;
    public Centre: Float32Array;
    public BoundingBox: Float32Array;
    public GeometryModels: WexBimGeometryModel[] = new Array<WexBimGeometryModel>();

    public MatrixCount(): number {
        var count = 0;
        this.GeometryModels.forEach((gm) => count += gm.MatrixCount);
        return count;
    }

    public ShapeCount(): number {
        var count = 0;
        this.GeometryModels.forEach((gm) => count += gm.ShapeCount);
        return count;
    }
    public TriangleCount(): number {
        var count = 0;
        this.GeometryModels.forEach((gm) => count += gm.TriangleCount);
        return count;
    }

    public VertexCount(): number {
        var count = 0;
        this.GeometryModels.forEach((gm) => count += gm.VertexCount);
        return count;
    }

    public AddGeometryModel(model: WexBimGeometryModel): void {
        this.GeometryModels.push(model);
    }

    public static ReadFromStream(reader: BinaryReader): WexBimRegion {
        var region = new WexBimRegion();
        region.Population = reader.readInt32();
        region.Centre = reader.readFloat32Array(3);
        region.BoundingBox = reader.readFloat32Array(6);
        return region;
    }
}

export class WexBimStyle {
    public StyleId: number;
    public RGBA: Float32Array;

    public static ReadFromStream(reader: BinaryReader): WexBimStyle {
        var style = new WexBimStyle();
        style.StyleId = reader.readInt32();
        style.RGBA = reader.readFloat32Array(4);
        return style;
    }
}

export class WexBimProduct {
    public ProductLabel: number;
    public ProductType: ProductType;
    public BoundingBox: Float32Array;

    //inverse, filled in at the end of parsing
    public Shapes: IWexBimShape[];

    public static ReadFromStream(reader: BinaryReader): WexBimProduct {
        var product = new WexBimProduct();
        product.ProductLabel = reader.readInt32();
        product.ProductType = reader.readInt16();
        product.BoundingBox = reader.readFloat32Array(6);
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

    //inverse relation
    GeometryModel: WexBimGeometryModel;
}

export class WexBimShapeSingleInstance implements IWexBimShape {
    public IsSingleInstance: boolean = true;
    public ProductLabel: number;
    public InstanceTypeId: number;
    public InstanceLabel: number;
    public StyleId: number;
    public Transformation: Float64Array = null;

    //inverse relation
    public GeometryModel: WexBimGeometryModel;

    public static ReadFromStream(reader: BinaryReader, model: WexBimGeometryModel): WexBimShapeSingleInstance {
        var shape = new WexBimShapeSingleInstance();
        shape.ProductLabel = reader.readInt32();
        shape.InstanceTypeId = reader.readInt16();
        shape.InstanceLabel = reader.readInt32();
        shape.StyleId = reader.readInt32();

        shape.GeometryModel = model;
        return shape;
    }
}

/// <summary>
/// Special kind of shape header for multiple instance shapes which has a transform
/// </summary>
export class WexBimShapeMultiInstance implements IWexBimShape {
    public IsSingleInstance: boolean = false;
    public ProductLabel: number;
    public InstanceTypeId: number;
    public InstanceLabel: number;
    public StyleId: number;
    public Transformation: Float64Array = null;

    //inverse relation
    public GeometryModel: WexBimGeometryModel;

    public static ReadFromStream(reader: BinaryReader, model: WexBimGeometryModel): WexBimShapeMultiInstance {
        var shape = new WexBimShapeMultiInstance();
        shape.ProductLabel = reader.readInt32();
        shape.InstanceTypeId = reader.readInt16();
        shape.InstanceLabel = reader.readInt32();
        shape.StyleId = reader.readInt32();
        shape.Transformation = reader.readFloat64Array(16);

        //set inverse
        shape.GeometryModel = model;
        return shape;
    }
}

export class WexBimGeometryModel {

    public Shapes: IWexBimShape[] = new Array<IWexBimShape>();
    public Geometry: WexBimMesh;

    public get MatrixCount(): number {
        return this.Shapes.filter((s) => s instanceof WexBimShapeMultiInstance).length;
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

    public static ReadFromStream(reader: BinaryReader): WexBimGeometryModel {
        var geometry = new WexBimGeometryModel();
        var numShapes = reader.readInt32();
        if (numShapes > 1) { //we have a multi used geometry

            for (let i = 0; i < numShapes; i++) {
                var instance = WexBimShapeMultiInstance.ReadFromStream(reader, geometry);
                geometry.Shapes[instance.ProductLabel] = instance;
            }
        } else { //just the one
            var instance = WexBimShapeSingleInstance.ReadFromStream(reader, geometry);
            geometry.Shapes[instance.ProductLabel] = instance;
        }
        //read the geometry
        let numBytes = reader.readInt32();
        geometry.Geometry = new WexBimMesh(reader.readData(numBytes));
        return geometry;
    }


}
export class WexBimStream {
    public Header: WexBimHeader;
    public Regions: WexBimRegion[] = new Array<WexBimRegion>();
    public Styles: WexBimStyle[] = new Array<WexBimStyle>();
    public Products: { [id: number]: WexBimProduct } = {};

    public AddRegion(region: WexBimRegion): void {
        this.Regions.push(region);
    }

    public AddStyle(style: WexBimStyle): void {
        this.Styles.push(style);
    }

    private Union(boxA: Float32Array, boxB: Float32Array): Float32Array {
        var result = new Float32Array(6);
        if (boxA == null && boxB != null) {
            result.set(boxB);
            return result;
        }

        if (boxB == null) {
            return null;
        }

        result[0] = Math.min(boxA[0], boxB[0]);
        result[1] = Math.min(boxA[1], boxB[1]);
        result[2] = Math.min(boxA[2], boxB[2]);

        result[3] = Math.max((boxA[0] + boxA[3]), (boxB[0] + boxB[3])) - result[0];
        result[4] = Math.max((boxA[1] + boxA[4]), (boxB[1] + boxB[4])) - result[1];
        result[5] = Math.max((boxA[2] + boxA[5]), (boxB[2] + boxB[5])) - result[2];

        return result;
    }

    /// <summary>
    /// Adds a product part representation to the view, if parts of the product are already added the bounding box is expanded, the first product type is retained
    /// </summary>
    /// <param name="product"></param>
    public AddProduct(product: WexBimProduct): void {
        let existingProduct = this.Products[product.ProductLabel];

        if (existingProduct) {
            existingProduct.BoundingBox = this.Union(existingProduct.BoundingBox, product.BoundingBox);
        } else {
            this.Products[product.ProductLabel] = product;
        }
    }

    public static Load(source: string | Blob | File | ArrayBuffer, callback: (wexbim: WexBimStream) => void): void {
        if (source == null) {
            throw new Error("Undefined source");
        }

        if (callback == null) {
            throw new Error("You have to use callback to get the stream");
        }

        var reader = new BinaryReader();
        reader.onloaded = (r) => {
            let wexbim = WexBimStream.ReadFromStream(r);
            if (callback) {
                callback(wexbim);
            }
        };
        reader.load(source, null, null);
    }

    public static ReadFromStream(reader: BinaryReader): WexBimStream {
        var wexBimStream = new WexBimStream();
        wexBimStream.Header = WexBimHeader.ReadFromStream(reader);

        for (let i = 0; i < wexBimStream.Header.RegionCount; i++) {
            wexBimStream.AddRegion(WexBimRegion.ReadFromStream(reader));
        }

        for (let i = 0; i < wexBimStream.Header.StyleCount; i++) {
            wexBimStream.AddStyle(WexBimStyle.ReadFromStream(reader));
        }

        for (let i = 0; i < wexBimStream.Header.ProductCount; i++) {
            wexBimStream.AddProduct(WexBimProduct.ReadFromStream(reader));
        }

        wexBimStream.Regions.forEach((region) => {
            let geometryCount = reader.readInt32();
            for (let i = 0; i < geometryCount; i++) {
                region.AddGeometryModel(WexBimGeometryModel.ReadFromStream(reader));
            }
        });

        //set up products with shapes
        wexBimStream.Regions.forEach((region) => {
            region.GeometryModels.forEach((model) => {
                model.Shapes.forEach((shape) => {
                    var product = wexBimStream.Products[shape.ProductLabel];
                    product.Shapes.push(shape);
                });
            });
        });

        return wexBimStream;
    }
}
