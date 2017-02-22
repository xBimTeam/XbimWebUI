declare namespace Xbim.Viewer {
    class ModelGeometry {
        normals: Uint8Array;
        indices: Float32Array;
        products: Float32Array;
        transformations: Float32Array;
        styleIndices: Uint16Array;
        states: Uint8Array;
        vertices: Float32Array;
        matrices: Float32Array;
        styles: Uint8Array;
        meter: number;
        productMap: {};
        regions: any[];
        transparentIndex: number;
        parse(binReader: BinaryReader): void;
        load(source: any): void;
        onloaded: (geometry: ModelGeometry) => void;
        onerror: (message?: string) => void;
    }
}
