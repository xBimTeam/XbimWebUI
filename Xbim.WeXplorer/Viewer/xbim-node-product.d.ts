declare namespace Xbim.Viewer {
    class ProductNode extends Node {
        BBox: Float32Array;
        ProductType: ProductType;
        protected CompileNode(): void;
        protected DrawNode(): void;
    }
}
