declare namespace Xbim.Viewer {
    interface ReadIndex {
        (view: DataView, offset: number): number;
    }
    class WexBimMesh {
        private _array;
        private _view;
        private VersionPos;
        private VertexCountPos;
        private TriangleCountPos;
        private VertexPos;
        constructor(meshData: ArrayBuffer);
        readonly Version: number;
        readonly VertexCount: number;
        readonly TriangleCount: number;
        readonly FaceCount: number;
        readonly Length: number;
        readonly Vertices: Float32Array;
        readonly Faces: WexBimMeshFace[];
    }
    class WexBimMeshFace {
        private _array;
        private _view;
        private _offsetStart;
        private _readIndex;
        private _sizeofIndex;
        constructor(readIndex: ReadIndex, sizeofIndex: number, array: ArrayBuffer, facesOffset: number);
        readonly TriangleCount: number;
        readonly IsPlanar: boolean;
        readonly Indices: Uint32Array;
        readonly Normals: Float32Array;
        private unpackNormal(u, v, normals, index);
    }
}
