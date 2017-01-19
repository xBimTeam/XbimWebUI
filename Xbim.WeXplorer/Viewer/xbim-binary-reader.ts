export class xBinaryReader {
    private _buffer: any = null;
    private _position: number = 0;

    public onloaded() {}

    public onerror(message?: string) {}

    public load(source: string | Blob | File | ArrayBuffer) {
        this._position = 0;
        var self = this;

        if (typeof (source) == 'undefined' || source == null) throw 'Source must be defined';
        if (typeof (source) == 'string') {
            var xhr;
            xhr = new XMLHttpRequest();
            xhr.open("GET", source, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var fReader = new FileReader();
                    fReader.onloadend = function() {
                        if (fReader.result) {
                            //set data buffer for next processing
                            self._buffer = fReader.result;
                            //do predefined processing of the data
                            if (self.onloaded) {
                                self.onloaded();
                            }
                        }
                    };
                    fReader.readAsArrayBuffer(xhr.response);
                }
                //throw exception as a warning
                if (xhr.readyState == 4 && xhr.status != 200) {
                    var msg = 'Failed to fetch binary data from server. Server code: ' +
                        xhr.status +
                        '. This might be due to CORS policy of your browser if you run this as a local file.';
                    if (self.onerror) self.onerror(msg);
                    throw msg;
                }
            };
            xhr.responseType = 'blob';
            xhr.send();
        } else if (source instanceof Blob || source instanceof File) {
            var fReader = new FileReader();
            fReader.onloadend = function() {
                if (fReader.result) {
                    //set data buffer for next processing
                    self._buffer = fReader.result;
                    //do predefined processing of the data
                    if (self.onloaded) {
                        self.onloaded();
                    }
                }
            };
            fReader.readAsArrayBuffer(source);
        } else if (source instanceof ArrayBuffer) {
            this._buffer = source;
        }
    }

    public getIsEOF(type, count) {
        if (typeof (this._position) === "undefined")
            throw "Position is not defined";
        return this._position == this._buffer.byteLength;
    }

    public read(arity, count, ctor) {
        if (typeof (count) === "undefined") count = 1;
        var length = arity * count;
        var offset = this._position;
        this._position += length;
        var result;

        return count === 1
            ? new ctor(this._buffer.slice(offset, offset + length))[0]
            : new ctor(this._buffer.slice(offset, offset + length));
    }

    public readByte(count) {
        return this.read(1, count, Uint8Array);
    }

    public readUint8(count) {
        return this.read(1, count, Uint8Array);
    }

    public readInt16(count) {
        return this.read(2, count, Int16Array);
    }

    public readUint16(count) {
        return this.read(2, count, Uint16Array);
    }

    public readInt32(count) {
        return this.read(4, count, Int32Array);
    }

    public readUint32(count) {
        return this.read(4, count, Uint32Array);
    }

    public readFloat32(count) {
        return this.read(4, count, Float32Array);
    }

    public readFloat64(count) {
        return this.read(8, count, Float64Array);
    }

    //functions for a higher objects like points, colours and matrices
    public readChar(count) {
        if (typeof (count) === "undefined") count = 1;
        var bytes = this.readByte(count);
        var result = new Array(count);
        for (var i in bytes) {
            result[i] = String.fromCharCode(bytes[i]);
        }
        return count === 1 ? result[0] : result;
    }

    public readPoint(count) {
        if (typeof (count) === "undefined") count = 1;
        var coords = this.readFloat32(count * 3);
        var result = new Array(count);
        for (var i = 0; i < count; i++) {
            var offset = i * 3 * 4;
            //only create new view on the buffer so that no new memory is allocated
            var point = new Float32Array(coords.buffer, offset, 3);
            result[i] = point;
        }
        return count === 1 ? result[0] : result;
    }

    public readRgba(count) {
        if (typeof (count) === "undefined") count = 1;
        var values = this.readByte(count * 4);
        var result = new Array(count);
        for (var i = 0; i < count; i++) {
            var offset = i * 4;
            var colour = new Uint8Array(values.buffer, offset, 4);
            result[i] = colour;
        }
        return count === 1 ? result[0] : result;
    }

    public readPackedNormal(count) {
        if (typeof (count) === "undefined") count = 1;
        var values = this.readUint8(count * 2);
        var result = new Array(count);
        for (var i = 0; i < count; i++) {
            var uv = new Uint8Array(values.buffer, i * 2, 2);
            result[i] = uv;
        }
        return count === 1 ? result[0] : result;
    }

    public readMatrix4x4(count) {
        if (typeof (count) === "undefined") count = 1;
        var values = this.readFloat32(count * 16);
        var result = new Array(count);
        for (var i = 0; i < count; i++) {
            var offset = i * 16 * 4;
            var matrix = new Float32Array(values.buffer, offset, 16);
            result[i] = matrix;
        }
        return count === 1 ? result[0] : result;
    }

    public readMatrix4x4_64(count) {
        if (typeof (count) === "undefined") count = 1;
        var values = this.readFloat64(count * 16);
        var result = new Array(count);
        for (var i = 0; i < count; i++) {
            var offset = i * 16 * 8;
            var matrix = new Float64Array(values.buffer, offset, 16);
            result[i] = matrix;
        }
        return count === 1 ? result[0] : result;
    }
}
