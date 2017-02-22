declare namespace Xbim.Viewer {
    class TriangulatedShape {
        parse(binReader: BinaryReader): void;
        load: (source: any) => void;
        vertices: Float32Array;
        indices: Uint32Array;
        normals: Uint8Array;
        onloaded: (shape: TriangulatedShape) => void;
    }
}
