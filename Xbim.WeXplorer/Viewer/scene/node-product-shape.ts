 import { Node } from "./node";

export class ProductShape extends Node {
    public Transform: Float64Array;
    public DifuseColour: Float32Array;

    protected CompileNode(): void {
    }

    protected DrawNode(): void {
    }
}
