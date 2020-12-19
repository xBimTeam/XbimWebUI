import { freemem } from "os";
import { Message, MessageType } from "../common/message";

/**
 * Convenient class for binary reading. Arrays are read as new views on slices of the original data buffer,
 * individual values are read using little endian data view. 
 */
export class BinaryReader {
    private _buffer: ArrayBuffer = null;
    private _view: DataView = null;
    private _position: number = 0;
    // tslint:disable: no-empty
    private _progress: (message: Message) => void = (m) => { };
    private _lastProgress = 0;

    /**
     * callback which will be called after asynchronous loading of data is finished
     */
    public onloaded: (reader: BinaryReader) => void;

    public onerror: (message?: string) => void;

    /**
     * Current position
     */
    public get Position(): number {
        return this._position;
    }

    /**
     * Gets reader for a sub array starting at current position.
     * This enforces isolation of reading within certain data island.
     * 
     * @param length Byte length of the data island
     */
    public getSubReader(length: number): BinaryReader {
        var reader = new BinaryReader();
        //get slice of the data
        var data = this._buffer.slice(this._position, this._position + length);
        //load is synchronous with ArrayBuffer argument
        reader.load(data, null, null);

        //move position after the data island
        this._position += length;

        //return new reader
        return reader;
    }

    /**
     * Pass url string, blob, file of byte array to this function to initialize the reader. Only array buffer takes imidiate effect.
     * Othe sources are loaded asynchronously and you need to use 'onloaded' delegate to use the reader only after it is initialized woth the data.
     * @param source URL string of the file or BLOB or File or ArrayBuffer object
     * @param headers http headers to be used to fetch data
     * @param progress Callback which can be repeatedly called to report processing progress
     */
    public load(source: string | Blob | File | ArrayBuffer, headers: { [name: string]: string }, progress: (message: Message) => void): void {
        this._position = 0;
        var self = this;
        progress = progress ? progress : (m) => { };
        this._progress = progress;

        if (typeof (source) == 'undefined' || source == null) {
            throw 'Source must be defined';
        }
        if (typeof (source) == 'string') {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", source, true);
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var fReader = new FileReader();
                    fReader.onloadend = () => {
                        if (fReader.result && typeof(fReader.result) !== 'string') {
                            //set data buffer for next processing
                            self._buffer = fReader.result as ArrayBuffer;
                            self._view = new DataView(self._buffer);
                            //do predefined processing of the data
                            if (self.onloaded) {
                                self.onloaded(self);
                            }
                        }
                    };
                    fReader.onprogress = (evt: ProgressEvent) => {
                        progress({
                            message: 'Downloading geometry',
                            percent: Math.floor(evt.loaded / evt.total * 100.0),
                            type: MessageType.PROGRESS
                        });
                    };
                    fReader.readAsArrayBuffer(xhr.response);
                }
                //throw exception as a warning
                if (xhr.readyState == 4 && xhr.status != 200) {
                    var msg = 'Failed to fetch binary data from server. Server code: ' +
                        xhr.status +
                        '. This might be due to CORS policy of your browser if you run this as a local file.';
                    progress(
                            {
                                message: 'Downloading geometry',
                                percent: 0,
                                type: MessageType.FAILED
                            }
                        );
                    if (self.onerror) {
                        self.onerror(msg);
                    }
                    throw msg;
                }
            };
            xhr.responseType = 'blob';
            if (headers != null) {
                Object.keys(headers).forEach((header) => {
                    const value = headers[header];
                    xhr.setRequestHeader(header, value);
                });
            }
            xhr.send();
        } else if (source instanceof Blob || (typeof(File) !== 'undefined' && source instanceof File)) { 
            var fReader = new FileReader();
            fReader.onloadend = () => {
                if (fReader.result && typeof(fReader.result) !== 'string') {
                    //set data buffer for next processing
                    self._buffer = fReader.result as ArrayBuffer;
                    self._view = new DataView(self._buffer);
                    //do predefined processing of the data
                    if (self.onloaded) {
                        self.onloaded(self);
                    }
                }
            };
            fReader.onprogress = (evt: ProgressEvent) => {
                progress({
                    message: 'Loading binary data',
                    percent: Math.floor(evt.loaded / evt.total * 100.0),
                    type: MessageType.PROGRESS
                });
            };
            fReader.readAsArrayBuffer(source);
        } else if (source instanceof ArrayBuffer) {
            this._buffer = source;
            this._view = new DataView(self._buffer);
            if (self.onloaded) {
                self.onloaded(self);
            }
        }
    }

    public seek(position: number): void {
        if (position < 0 || position > this._buffer.byteLength) {
            throw "Position out of range.";
        }

        this._position = position;
    }

    public isEOF(): boolean {
        if (this._position == null) {
            throw "Position is not defined";
        }
        return this._position == this._buffer.byteLength;
    }

    private readArray<T>(unitSize: number, count: number, ctor: new (data: ArrayBuffer) => T): T {
        if (count == null) {
            count = 1;
        }
        var length = unitSize * count;
        var offset = this._position;
        this._position += length;

        this.reportProgress();

        return count === 1
            ? new ctor(this._buffer.slice(offset, offset + length))[0]
            : new ctor(this._buffer.slice(offset, offset + length));
    }

    private move(size: number): number {
        var offset = this._position;
        this._position += size;
        this.reportProgress();
        return offset;
    }

    private reportProgress() {
        if (this._progress == null) {
            return;
        }
        // report every 0.5MB
        if ((this._position - this._lastProgress) > 5e5) {
            this._lastProgress = this._position;
            this._progress({
                type: MessageType.PROGRESS,
                message: "Processing data",
                percent: Math.floor(100.0 * this._position / this._buffer.byteLength)
            });
        }
    }

    public readByte(): number {
        return this.readUint8();
    }

    public readByteArray(count: number): Uint8Array {
        return this.readUint8Array(count);
    }

    public readUint8(): number {
        var offset = this.move(1);
        return this._view.getUint8(offset);
    }

    public readUint8Array(count: number): Uint8Array {
        return this.readArray(1, count, Uint8Array);
    }

    public readInt16(): number {
        var offset = this.move(2);
        return this._view.getInt16(offset, true);
    }

    public readInt16Array(count: number): Int16Array {
        return this.readArray(2, count, Int16Array);
    }

    public readUInt16(): number {
        var offset = this.move(2);
        return this._view.getUint16(offset, true);
    }

    public readUint16Array(count: number): Uint16Array {
        return this.readArray(2, count, Uint16Array);
    }

    public readInt32(): number {
        var offset = this.move(4);
        return this._view.getInt32(offset, true);
    }

    public readInt32Array(count: number): Int32Array {
        return this.readArray(4, count, Int32Array);
    }

    public readUint32(): number {
        var offset = this.move(4);
        return this._view.getUint32(offset, true);
    }

    public readUint32Array(count: number): Uint32Array {
        return this.readArray(4, count, Uint32Array);
    }

    public readFloat32(): number {
        var offset = this.move(4);
        return this._view.getFloat32(offset, true);
    }

    public readFloat32Array(count: number): Float32Array {
        return this.readArray(4, count, Float32Array);
    }

    public readFloat64(): number {
        var offset = this.move(8);
        return this._view.getFloat64(offset, true);
    }

    public readFloat64Array(count: number): Float64Array {
        return this.readArray(8, count, Float64Array);
    }

    //functions for a higher objects like points, colours and matrices
    public readChar(count?: number) {
        if (count == null) {
            count = 1;
        }
        var bytes = this.readByteArray(count);
        var result = new Array(count);
        for (var i in bytes) {
            result[i] = String.fromCharCode(bytes[i]);
        }
        return count === 1 ? result[0] : result;
    }

    public readPoint(count?: number) {
        if (count == null) {
            count = 1;
        }
        var coords = this.readFloat32Array(count * 3);
        var result = new Array(count);
        for (var i = 0; i < count; i++) {
            var offset = i * 3 * 4;
            //only create new view on the buffer so that no new memory is allocated
            var point = new Float32Array(coords.buffer, offset, 3);
            result[i] = point;
        }
        return count === 1 ? result[0] : result;
    }

    public readRgba(count?: number) {
        if (count == null) {
            count = 1;
        }
        var values = this.readByteArray(count * 4);
        var result = new Array(count);
        for (var i = 0; i < count; i++) {
            var offset = i * 4;
            var colour = new Uint8Array(values.buffer, offset, 4);
            result[i] = colour;
        }
        return count === 1 ? result[0] : result;
    }

    public readPackedNormal(count?: number) {
        if (count == null) {
            count = 1;
        }
        var values = this.readUint8Array(count * 2);
        var result = new Array(count);
        for (var i = 0; i < count; i++) {
            var uv = new Uint8Array(values.buffer, i * 2, 2);
            result[i] = uv;
        }
        return count === 1 ? result[0] : result;
    }

    public readMatrix4x4(count?: number) {
        if (count == null) {
            count = 1;
        }
        var values = this.readFloat32Array(count * 16);
        var result = new Array(count);
        for (var i = 0; i < count; i++) {
            var offset = i * 16 * 4;
            var matrix = new Float32Array(values.buffer, offset, 16);
            result[i] = matrix;
        }
        return count === 1 ? result[0] : result;
    }

    public readMatrix4x4_64(count?: number) {
        if (count == null) {
            count = 1;
        }
        var values = this.readFloat64Array(count * 16);
        var result = new Array(count);
        for (var i = 0; i < count; i++) {
            var offset = i * 16 * 8;
            var matrix = new Float64Array(values.buffer, offset, 16);
            result[i] = matrix;
        }
        return count === 1 ? result[0] : result;
    }

    /**
     * Reads slice of data from the underlying array buffer
     * @param length Length of requested data. Start is at current position
     */
    public readData(length: number): ArrayBuffer {
        let offset = this.move(length);
        return this._buffer.slice(offset, offset + length);
    }
}
