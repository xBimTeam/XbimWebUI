"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WexBimMesh = /** @class */ (function () {
    function WexBimMesh(meshData) {
        this.VersionPos = 0;
        this.VertexCountPos = this.VersionPos + 1; //sizeof(byte)
        this.TriangleCountPos = this.VertexCountPos + 4; //sizeof(int)
        this.VertexPos = this.TriangleCountPos + 4; //sizeof(int)
        this._array = meshData;
        this._view = new DataView(meshData);
    }
    Object.defineProperty(WexBimMesh.prototype, "Version", {
        get: function () {
            return this._array[this.VersionPos];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WexBimMesh.prototype, "VertexCount", {
        get: function () {
            return this._view.getInt32(this.VertexCountPos, true);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WexBimMesh.prototype, "TriangleCount", {
        get: function () {
            return this._view.getInt32(this.TriangleCountPos, true);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WexBimMesh.prototype, "FaceCount", {
        get: function () {
            var faceCountPos = this.VertexPos + (this.VertexCount * 3 * 4); //4 = sizeof(float)
            return this._view.getInt32(faceCountPos, true);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WexBimMesh.prototype, "Length", {
        get: function () {
            return this._array.byteLength;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WexBimMesh.prototype, "Vertices", {
        get: function () {
            return new Float32Array(this._array.slice(this.VertexPos, this.VertexPos + this.VertexCount));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WexBimMesh.prototype, "Faces", {
        get: function () {
            //start of vertices * space taken by vertices + the number of faces
            var facesOffset = this.VertexPos + (this.VertexCount * 3 * 4 /*sizeof(float)*/) + 4 /*sizeof(int)*/;
            var readIndex;
            var sizeofIndex;
            if (this.VertexCount <= 0xFF) {
                readIndex = function (view, offset) { return view.getUint8(offset); };
                sizeofIndex = 8 /*sizeof(byte)*/;
            }
            else if (this.VertexCount <= 0xFFFF) {
                readIndex = function (view, offset) { return view.getInt16(offset, true); };
                sizeofIndex = 16 /*sizeof(short)*/;
            }
            else {
                readIndex = function (view, offset) { return view.getInt32(offset, true); };
                sizeofIndex = 32 /*sizeof(int)*/;
            }
            var result = new Array();
            for (var i = 0; i < this.FaceCount; i++) {
                result.push(new WexBimMeshFace(readIndex, sizeofIndex, this._array, facesOffset));
            }
            return result;
        },
        enumerable: true,
        configurable: true
    });
    return WexBimMesh;
}());
exports.WexBimMesh = WexBimMesh;
var WexBimMeshFace = /** @class */ (function () {
    function WexBimMeshFace(readIndex, sizeofIndex, array, facesOffset) {
        this._readIndex = readIndex;
        this._array = array;
        this._offsetStart = facesOffset;
        this._sizeofIndex = sizeofIndex;
        this._view = new DataView(array);
    }
    Object.defineProperty(WexBimMeshFace.prototype, "TriangleCount", {
        get: function () {
            return Math.abs(this._view.getInt32(this._offsetStart, true));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WexBimMeshFace.prototype, "IsPlanar", {
        get: function () {
            return this._view.getInt32(this._offsetStart, true) > 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WexBimMeshFace.prototype, "Indices", {
        get: function () {
            var result = new Uint32Array(this.TriangleCount * 3);
            if (this.IsPlanar) {
                var indexOffset = this._offsetStart + 2 + 4 /*sizeof(int)*/;
                for (var i = 0; i < this.TriangleCount; i++) {
                    indexOffset += (i * 3 * this._sizeofIndex); //skip the 2 bytes that are the packed normal
                    for (var j = 0; j < 3; j++) {
                        result[i * 3 + j] = this._readIndex(this._view, indexOffset + (j * this._sizeofIndex)); //skip the normal in the 2 bytes
                    }
                }
            }
            else {
                var indexSpan = this._sizeofIndex + 2;
                var triangleSpan = 3 * indexSpan;
                var indexOffset = this._offsetStart + 4 /*sizeof(int)*/;
                for (var i = 0; i < this.TriangleCount; i++) {
                    for (var j = 0; j < 3; j++) {
                        result[i * 3 + j] = this._readIndex(this._view, indexOffset + (j * indexSpan));
                    }
                    indexOffset += triangleSpan;
                }
            }
            return result;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WexBimMeshFace.prototype, "Normals", {
        get: function () {
            var result = new Float32Array(this.TriangleCount * 3 * 3);
            var indexOffset = this._offsetStart + 4 /*sizeof(int)*/;
            if (this.IsPlanar) {
                var u = this._view.getUint8(indexOffset);
                var v = this._view.getUint8(indexOffset + 1);
                this.unpackNormal(u, v, result, 0);
                //copy to the rest of the result
                for (var i = 1; i < this.TriangleCount; i++) {
                    result[3 * i] = result[0];
                    result[3 * i + 1] = result[1];
                    result[3 * i + 2] = result[2];
                }
                return result;
            }
            var indexSpan = this._sizeofIndex + 2;
            var triangleSpan = 3 * indexSpan;
            var normalOffset = indexOffset + this._sizeofIndex;
            for (var i = 0; i < this.TriangleCount; i++) {
                for (var j = 0; j < 3; j++) {
                    var u = this._view.getUint8(normalOffset + (j * indexSpan));
                    var v = this._view.getUint8(normalOffset + (j * indexSpan) + 1);
                    this.unpackNormal(u, v, result, 3 * i + j);
                }
                normalOffset += triangleSpan;
            }
        },
        enumerable: true,
        configurable: true
    });
    WexBimMeshFace.prototype.unpackNormal = function (u, v, normals, index) {
        var packSize = 252;
        var lon = u / packSize * Math.PI * 2;
        var lat = v / packSize * Math.PI;
        normals[index] = Math.cos(lat);
        normals[index + 1] = Math.sin(lon) * Math.sin(lat);
        normals[index + 2] = Math.cos(lon) * Math.sin(lat);
    };
    return WexBimMeshFace;
}());
exports.WexBimMeshFace = WexBimMeshFace;
//# sourceMappingURL=wexbim-mesh.js.map