function xBinaryReader() {
    this._buffer = null;
    this._position = 0;
}

xBinaryReader.prototype.onloaded = function() {};
xBinaryReader.prototype.onerror = function() {};


xBinaryReader.prototype.load = function (source) {
    var self = this;

    if (typeof (source) == 'undefined' || source == null) throw 'Source must be defined';
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
                var msg = 'Failed to fetch binary data from server. Server code: ' + xhr.status +
                    '. This might be due to CORS policy of your browser if you run this as a local file.';
                if (self.onerror) self.onerror(msg);
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
                //do predefined processing of the data
                if (self.onloaded) {
                    self.onloaded();
                }
            }
        };
        fReader.readAsArrayBuffer(source);
    }
};

xBinaryReader.prototype.getIsEOF = function (type, count) {
    return this._position == this._buffer.byteLength;
};

xBinaryReader.prototype.read = function (type, count) {
    if (typeof (type) == 'undefined') {
        throw 'You have to specify one of predefined types.';
    }

    var self = this;
    var subBuffer = function (arity) {
        if (!self._buffer) {
            throw "No data loaded. You can't get any data unless data is loaded. Use 'onloaded' callback.";
        }

        var length = arity;
        if (typeof (count) != 'undefined' && count > 0) {
            length = count * arity;
        }

        if (self._position + length > self._buffer.byteLength) {
            throw 'Data buffer overflow. You have asked for ' + length + ' bytes which is more than is currently available in data buffer (position: ' + self._position + ').';
        }

        var result = self._buffer.slice(self._position, self._position + length);
        self._position += length;
        return result;
    };
    var results = type.ctor(subBuffer(type.arity));

    if (typeof (count) == 'undefined') {
        return results[0];
    }
    else {
        return results;
    }
};

//types containing arity of the type (number of bytes for a unit) and function used to convert bytes to the type. Base types are created as typed arrays.
xBinaryReader.prototype.BYTE = { arity: 1, ctor: function (slice) { return new Uint8Array(slice); } };
xBinaryReader.prototype.UINT8 = { arity: 1, ctor: function (slice) { return new Uint8Array(slice); } };
xBinaryReader.prototype.INT16 = { arity: 2, ctor: function (slice) { return new Int16Array(slice); } };
xBinaryReader.prototype.UINT16 = { arity: 2, ctor: function (slice) { return new Uint16Array(slice); } };
xBinaryReader.prototype.INT32 = { arity: 4, ctor: function (slice) { return new Int32Array(slice); } };
xBinaryReader.prototype.UINT32 = { arity: 4, ctor: function (slice) { return new Uint32Array(slice); } };
xBinaryReader.prototype.FLOAT32 = { arity: 4, ctor: function (slice) { return new Float32Array(slice); } };
xBinaryReader.prototype.FLOAT64 = { arity: 8, ctor: function (slice) { return new Float64Array(slice); } };
xBinaryReader.prototype.CHAR = {
    arity: 1, ctor: function (slice) {
        var bytes = new Uint8Array(slice);
        var result = [];
        for (var i in bytes) {
            result.push(String.fromCharCode(bytes[i]));
        }
        return result;
    }
};
xBinaryReader.prototype.POINT = {
    arity: 12, ctor: function (slice) {
        var coords = new Float32Array(slice);
        var result = [];
        for (var i = 0; i < coords.length / 3; i++) {
            var index = i * 3;
            var point = new Float32Array(3);
            point[0] = coords[index];
            point[1] = coords[index + 1];
            point[2] = coords[index + 2];
            result.push(point)
        }
        return result;
    }
};
xBinaryReader.prototype.RGBA = {
    arity: 4, ctor: function (slice) {
        var values = new Uint8Array(slice);
        var result = [];
        for (var i = 0; i < values.length / 4; i++) {
            var index = i * 4;
            var colour = new Uint8Array(4);
            colour[0] = values[index];
            colour[1] = values[index + 1];
            colour[2] = values[index + 2];
            colour[3] = values[index + 3];
            result.push(colour)
        }
        return result;
    }
};
xBinaryReader.prototype.PACKED_NORMAL = {
    arity: 2, ctor: function (slice) {
        var values = new Uint8Array(slice);
        var result = [];
        for (var i = 0; i < values.length / 2; i++) {
            var index = i * 2;
            var uv = new Uint8Array(2);
            uv[0] = values[index];
            uv[1] = values[index + 1];
            result.push(uv)
        }
        return result;
    }
};
xBinaryReader.prototype.MATRIX4x4 = {
    arity: 16 * 4, ctor: function (slice) {
        var vals = new Float32Array(slice);
        var result = [];
        for (var i = 0; i < vals.length / 16; i++) {
            var index = i * 16;
            var matrix = new Float32Array(16);
            for (var j = 0; j < 16; j++) {
                matrix[j] = vals[index + j]
            }
            result.push(matrix)
        }
        return result;
    }
};