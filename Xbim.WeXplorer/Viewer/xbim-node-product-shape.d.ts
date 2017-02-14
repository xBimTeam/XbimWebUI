declare namespace Xbim.Viewer {
    class ProductShape extends Node {
        Transform: Float64Array;
        DifuseColour: Float32Array;
        protected CompileNode(): void;
        protected DrawNode(): void;
    }
}
