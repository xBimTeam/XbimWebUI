namespace Xbim.Viewer {
    export class ShapeNode extends Node {

        public Indices: Int16Array;
        public Vertices: Float32Array;
        public Normals: Uint8Array;


        protected CompileNode(): void {
        }

        protected DrawNode(): void {
        }
    }
}