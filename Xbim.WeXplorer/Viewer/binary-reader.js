"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Convenient class for binary reading. Arrays are read as new views on slices of the original data buffer,
 * individual values are read using little endian data view.
 */
var BinaryReader = /** @class */ (function () {
    function BinaryReader() {
        this._buffer = null;
        this._view = null;
        this._position = 0;
    }
    Object.defineProperty(BinaryReader.prototype, "Position", {
        /**
         * Current position
         */
        get: function () {
            return this._position;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Pass url string, blob, file of byte array to this function to initialize the reader. Only array buffer takes imidiate effect.
     * Othe sources are loaded asynchronously and you need to use 'onloaded' delegate to use the reader only after it is initialized woth the data.
     * @param source URL string of the file or BLOB or File or ArrayBuffer object
     */
    BinaryReader.prototype.load = function (source) {
        this._position = 0;
        var self = this;
        if (typeof (source) == 'undefined' || source == null)
            throw 'Source must be defined';
        if (typeof (source) == 'string') {
            var xhr;
            xhr = new XMLHttpRequest();
            xhr.open("GET", source, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var fReader = new FileReader();
                    fReader.onloadend = function () {
                        if (fReader.result) {
                            //set data buffer for next processing
                            self._buffer = fReader.result;
                            self._view = new DataView(self._buffer);
                            //do predefined processing of the data
                            if (self.onloaded) {
                                self.onloaded(self);
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
                    if (self.onerror)
                        self.onerror(msg);
                    throw msg;
                }
            };
            xhr.responseType = 'blob';
            xhr.send();
        }
        else if (source instanceof Blob || source instanceof File) {
            var fReader = new FileReader();
            fReader.onloadend = function () {
                if (fReader.result) {
                    //set data buffer for next processing
                    self._buffer = fReader.result;
                    self._view = new DataView(self._buffer);
                    //do predefined processing of the data
                    if (self.onloaded) {
                        self.onloaded(self);
                    }
                }
            };
            fReader.readAsArrayBuffer(source);
        }
        else if (source instanceof ArrayBuffer) {
            this._buffer = source;
            this._view = new DataView(self._buffer);
            if (self.onloaded) {
                self.onloaded(self);
            }
        }
    };
    BinaryReader.prototype.seek = function (position) {
        if (position < 0 || position > this._buffer.byteLength)
            throw "Position out of range.";
        this._position = position;
    };
    BinaryReader.prototype.isEOF = function () {
        if (this._position == null)
            throw "Position is not defined";
        return this._position == this._buffer.byteLength;
    };
    BinaryReader.prototype.readArray = function (unitSize, count, ctor) {
        if (count == null)
            count = 1;
        var length = unitSize * count;
        var offset = this._position;
        this._position += length;
        var result;
        return count === 1
            ? new ctor(this._buffer.slice(offset, offset + length))[0]
            : new ctor(this._buffer.slice(offset, offset + length));
    };
    BinaryReader.prototype.move = function (size) {
        var offset = this._position;
        this._position += size;
        return offset;
    };
    BinaryReader.prototype.readByte = function () {
        return this.readUint8();
    };
    BinaryReader.prototype.readByteArray = function (count) {
        return this.readUint8Array(count);
    };
    BinaryReader.prototype.readUint8 = function () {
        var offset = this.move(1);
        return this._view.getUint8(offset);
    };
    BinaryReader.prototype.readUint8Array = function (count) {
        return this.readArray(1, count, Uint8Array);
    };
    BinaryReader.prototype.readInt16 = function () {
        var offset = this.move(2);
        return this._view.getInt16(offset, true);
    };
    BinaryReader.prototype.readInt16Array = function (count) {
        return this.readArray(2, count, Int16Array);
    };
    BinaryReader.prototype.readUInt16 = function () {
        var offset = this.move(2);
        return this._view.getUint16(offset, true);
    };
    BinaryReader.prototype.readUint16Array = function (count) {
        return this.readArray(2, count, Uint16Array);
    };
    BinaryReader.prototype.readInt32 = function () {
        var offset = this.move(4);
        return this._view.getInt32(offset, true);
    };
    BinaryReader.prototype.readInt32Array = function (count) {
        return this.readArray(4, count, Int32Array);
    };
    BinaryReader.prototype.readUint32 = function () {
        var offset = this.move(4);
        return this._view.getUint32(offset, true);
    };
    BinaryReader.prototype.readUint32Array = function (count) {
        return this.readArray(4, count, Uint32Array);
    };
    BinaryReader.prototype.readFloat32 = function () {
        var offset = this.move(4);
        return this._view.getFloat32(offset, true);
    };
    BinaryReader.prototype.readFloat32Array = function (count) {
        return this.readArray(4, count, Float32Array);
    };
    BinaryReader.prototype.readFloat64 = function () {
        var offset = this.move(8);
        return this._view.getFloat64(offset, true);
    };
    BinaryReader.prototype.readFloat64Array = function (count) {
        return this.readArray(8, count, Float64Array);
    };
    //functions for a higher objects like points, colours and matrices
    BinaryReader.prototype.readChar = function (count) {
        if (count == null)
            count = 1;
        var bytes = this.readByteArray(count);
        var result = new Array(count);
        for (var i in bytes) {
            result[i] = String.fromCharCode(bytes[i]);
        }
        return count === 1 ? result[0] : result;
    };
    BinaryReader.prototype.readPoint = function (count) {
        if (count == null)
            count = 1;
        var coords = this.readFloat32Array(count * 3);
        var result = new Array(count);
        for (var i = 0; i < count; i++) {
            var offset = i * 3 * 4;
            //only create new view on the buffer so that no new memory is allocated
            var point = new Float32Array(coords.buffer, offset, 3);
            result[i] = point;
        }
        return count === 1 ? result[0] : result;
    };
    BinaryReader.prototype.readRgba = function (count) {
        if (count == null)
            count = 1;
        var values = this.readByteArray(count * 4);
        var result = new Array(count);
        for (var i = 0; i < count; i++) {
            var offset = i * 4;
            var colour = new Uint8Array(values.buffer, offset, 4);
            result[i] = colour;
        }
        return count === 1 ? result[0] : result;
    };
    BinaryReader.prototype.readPackedNormal = function (count) {
        if (count == null)
            count = 1;
        var values = this.readUint8Array(count * 2);
        var result = new Array(count);
        for (var i = 0; i < count; i++) {
            var uv = new Uint8Array(values.buffer, i * 2, 2);
            result[i] = uv;
        }
        return count === 1 ? result[0] : result;
    };
    BinaryReader.prototype.readMatrix4x4 = function (count) {
        if (count == null)
            count = 1;
        var values = this.readFloat32Array(count * 16);
        var result = new Array(count);
        for (var i = 0; i < count; i++) {
            var offset = i * 16 * 4;
            var matrix = new Float32Array(values.buffer, offset, 16);
            result[i] = matrix;
        }
        return count === 1 ? result[0] : result;
    };
    BinaryReader.prototype.readMatrix4x4_64 = function (count) {
        if (count == null)
            count = 1;
        var values = this.readFloat64Array(count * 16);
        var result = new Array(count);
        for (var i = 0; i < count; i++) {
            var offset = i * 16 * 8;
            var matrix = new Float64Array(values.buffer, offset, 16);
            result[i] = matrix;
        }
        return count === 1 ? result[0] : result;
    };
    /**
     * Reads slice of data from the underlying array buffer
     * @param length Length of requested data. Start is at current position
     */
    BinaryReader.prototype.readData = function (length) {
        var offset = this.move(length);
        return this._buffer.slice(offset, offset + length);
    };
    return BinaryReader;
}());
exports.BinaryReader = BinaryReader;
//# sourceMappingURL=binary-reader.js.map