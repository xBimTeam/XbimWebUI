 import { ProductType } from "../product-type";
import { Node } from "./node";

export class ProductNode extends Node {
    public BBox: Float32Array;
    public ProductType: ProductType;

    protected CompileNode(): void {
    }

    protected DrawNode(): void {
    }
}
