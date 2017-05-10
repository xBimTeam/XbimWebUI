import { ProductType } from "../product-type";
import { Node } from "./node";
export declare class ProductNode extends Node {
    BBox: Float32Array;
    ProductType: ProductType;
    protected CompileNode(): void;
    protected DrawNode(): void;
}
