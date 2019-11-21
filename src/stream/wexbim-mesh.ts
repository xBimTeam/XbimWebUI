// tslint:disable-next-line: interface-name
export interface ReadIndex {
    (view: DataView, offset: number): number;
}

export class WexBimMesh {
    private _array: ArrayBuffer;
    private _view: DataView;

    private VersionPos: number = 0;
    private VertexCountPos: number = this.VersionPos + 1; //sizeof(byte)
    private TriangleCountPos: number = this.VertexCountPos + 4; //sizeof(int)
    private VertexPos: number = this.TriangleCountPos + 4; //sizeof(int)

    constructor(meshData: ArrayBuffer) {
        this._array = meshData;
        this._view = new DataView(meshData);
    }

    public get Version(): number {
        return this._array[this.VersionPos];
    }

    public get VertexCount(): number {
        return this._view.getInt32(this.VertexCountPos, true);
    }

    public get TriangleCount(): number {
        return this._view.getInt32(this.TriangleCountPos, true);
    }

    public get FaceCount(): number {
        var faceCountPos = this.VertexPos + (this.VertexCount * 3 * 4); //4 = sizeof(float)
        return this._view.getInt32(faceCountPos, true);
    }

    public get Length(): number {
        return this._array.byteLength;
    }

    public get Vertices(): Float32Array {
        return new Float32Array(this._array.slice(this.VertexPos, this.VertexPos + this.VertexCount));
    }

    public get Faces(): WexBimMeshFace[] {
        //start of vertices * space taken by vertices + the number of faces
        let facesOffset = this.VertexPos + (this.VertexCount * 3 * 4 /*sizeof(float)*/) + 4/*sizeof(int)*/;
        let readIndex: ReadIndex;
        let sizeofIndex: number;

        if (this.VertexCount <= 0xFF) {
            readIndex = (view, offset) => view.getUint8(offset);
            sizeofIndex = 8 /*sizeof(byte)*/;
        } else if (this.VertexCount <= 0xFFFF) {
            readIndex = (view, offset) => view.getInt16(offset, true);
            sizeofIndex = 16 /*sizeof(short)*/;
        } else {
            readIndex = (view, offset) => view.getInt32(offset, true);
            sizeofIndex = 32 /*sizeof(int)*/;
        }
        let result = new Array<WexBimMeshFace>();

        for (let i = 0; i < this.FaceCount; i++) {
            result.push(new WexBimMeshFace(readIndex, sizeofIndex, this._array, facesOffset));
        }
        return result;
    }
}

// tslint:disable-next-line: max-classes-per-file
export class WexBimMeshFace {
    private _array: ArrayBuffer;
    private _view: DataView;
    private _offsetStart: number;
    private _readIndex: ReadIndex;
    private _sizeofIndex: number;

    constructor(readIndex: ReadIndex, sizeofIndex: number, array: ArrayBuffer, facesOffset: number) {
        this._readIndex = readIndex;
        this._array = array;
        this._offsetStart = facesOffset;
        this._sizeofIndex = sizeofIndex;
        this._view = new DataView(array);
    }

    public get TriangleCount(): number {
        return Math.abs(this._view.getInt32(this._offsetStart, true));
    }

    public get IsPlanar(): boolean {
        return this._view.getInt32(this._offsetStart, true) > 0;
    }

    public get Indices(): Uint32Array {
        let result = new Uint32Array(this.TriangleCount * 3);

        if (this.IsPlanar) {
            var indexOffset = this._offsetStart + 2 + 4 /*sizeof(int)*/;
            for (let i = 0; i < this.TriangleCount; i++) {
                indexOffset += (i * 3 * this._sizeofIndex); //skip the 2 bytes that are the packed normal
                for (let j = 0; j < 3; j++) {
                    result[i * 3 + j] = this._readIndex(this._view, indexOffset + (j * this._sizeofIndex)); //skip the normal in the 2 bytes
                }
            }
        } else {
            var indexSpan = this._sizeofIndex + 2;
            var triangleSpan = 3 * indexSpan;
            var indexOffset = this._offsetStart + 4 /*sizeof(int)*/;
            for (let i = 0; i < this.TriangleCount; i++) {
                for (let j = 0; j < 3; j++) {
                    result[i * 3 + j] = this._readIndex(this._view, indexOffset + (j * indexSpan));
                }
                indexOffset += triangleSpan;
            }
        }

        return result;
    }


    public get Normals(): Float32Array {

        let result = new Float32Array(this.TriangleCount * 3 * 3);
        let indexOffset = this._offsetStart + 4 /*sizeof(int)*/;

        if (this.IsPlanar) {
            var u = this._view.getUint8(indexOffset);
            var v = this._view.getUint8(indexOffset + 1);
            this.unpackNormal(u, v, result, 0);

            //copy to the rest of the result
            for (let i = 1; i < this.TriangleCount; i++) {
                result[3 * i] = result[0];
                result[3 * i + 1] = result[1];
                result[3 * i + 2] = result[2];
            }
            return result;
        }

        var indexSpan = this._sizeofIndex + 2;
        var triangleSpan = 3 * indexSpan;
        var normalOffset = indexOffset + this._sizeofIndex;
        for (let i = 0; i < this.TriangleCount; i++) {
            for (let j = 0; j < 3; j++) {
                var u = this._view.getUint8(normalOffset + (j * indexSpan));
                var v = this._view.getUint8(normalOffset + (j * indexSpan) + 1);

                this.unpackNormal(u, v, result, 3 * i + j);
            }
            normalOffset += triangleSpan;
        }
    }

    private unpackNormal(u: number, v: number, normals: Float32Array, index: number): void {
        const packSize = 252;
        let lon = u / packSize * Math.PI * 2;
        let lat = v / packSize * Math.PI;

        normals[index] = Math.cos(lat);
        normals[index + 1] = Math.sin(lon) * Math.sin(lat);
        normals[index + 2] = Math.cos(lon) * Math.sin(lat);
    }
}
