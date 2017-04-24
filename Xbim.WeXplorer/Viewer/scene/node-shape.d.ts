import { Node } from "./node";
export declare class ShapeNode extends Node {
    Indices: Int16Array;
    Vertices: Float32Array;
    Normals: Uint8Array;
    protected CompileNode(): void;
    protected DrawNode(): void;
}
