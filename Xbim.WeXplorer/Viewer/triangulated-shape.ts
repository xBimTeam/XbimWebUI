 import { BinaryReader } from "./binary-reader";

export class TriangulatedShape {

    //this will get xBinaryReader on the current position and will parse it's content to fill itself with vertices, normals and vertex indices
    public parse(binReader: BinaryReader) {
        let self = this;
        let version = binReader.readByte();
        let numVertices = binReader.readInt32();
        let numOfTriangles = binReader.readInt32();
        self.vertices = binReader.readFloat32Array(numVertices * 3);
        //allocate memory of defined size (to avoid reallocation of memory)
        self.indices = new Uint32Array(numOfTriangles * 3);
        self.normals = new Uint8Array(numOfTriangles * 6);
        //indices for incremental adding of indices and normals
        let iIndex = 0;
        let readIndex;
        if (numVertices <= 0xFF) {
            readIndex = function(count) { return binReader.readByteArray(count); };
        } else if (numVertices <= 0xFFFF) {
            readIndex = function(count) { return binReader.readUint16Array(count); };
        } else {
            readIndex = function(count) { return binReader.readInt32Array(count); };
        }

        let numFaces = binReader.readInt32();

        if (numVertices === 0 || numOfTriangles === 0)
            return;

        for (let i = 0; i < numFaces; i++) {
            let numTrianglesInFace = binReader.readInt32();
            if (numTrianglesInFace == 0) continue;

            let isPlanar = numTrianglesInFace > 0;
            numTrianglesInFace = Math.abs(numTrianglesInFace);
            if (isPlanar) {
                let normal = binReader.readByteArray(2);
                //read and set all indices
                let planarIndices = readIndex(3 * numTrianglesInFace);
                self.indices.set(planarIndices, iIndex);

                for (let j = 0; j < numTrianglesInFace * 3; j++) {
                    //add three identical normals because this is planar but needs to be expanded for WebGL
                    self.normals[iIndex * 2] = normal[0];
                    self.normals[iIndex * 2 + 1] = normal[1];
                    iIndex++;
                }
            } else {
                for (let j = 0; j < numTrianglesInFace; j++) {
                    self.indices[iIndex] = readIndex(); //a
                    self.normals.set(binReader.readByteArray(2), iIndex * 2);
                    iIndex++;

                    self.indices[iIndex] = readIndex(); //b
                    self.normals.set(binReader.readByteArray(2), iIndex * 2);
                    iIndex++;

                    self.indices[iIndex] = readIndex(); //c
                    self.normals.set(binReader.readByteArray(2), iIndex * 2);
                    iIndex++;
                }
            }
        }
    }

    //This would load only shape data from binary file
    public load = function(source) {
        //binary reading
        let br = new BinaryReader();
        let self = this;
        br.onloaded = function() {
            self.parse(br);
            if (self.onloaded) {
                self.onloaded(this);
            }
        };
        br.load(source);
    };

    public vertices: Float32Array;
    public indices: Uint32Array;
    public normals: Uint8Array;

    //this function will get called when loading is finished.
    //This won't get called after parse which is supposed to happen in large operation.
    public onloaded: (shape: TriangulatedShape) => void;
}
