declare namespace Xbim.Viewer {
    class BinaryReader {
        private _buffer;
        private _position;
        onloaded(): void;
        onerror(message?: string): void;
        load(source: string | Blob | File | ArrayBuffer): void;
        getIsEOF(type: any, count: any): boolean;
        read(arity: any, count: any, ctor: any): any;
        readByte(count: any): any;
        readUint8(count: any): any;
        readInt16(count: any): any;
        readUint16(count: any): any;
        readInt32(count: any): any;
        readUint32(count: any): any;
        readFloat32(count: any): any;
        readFloat64(count: any): any;
        readChar(count: any): any;
        readPoint(count: any): any;
        readRgba(count: any): any;
        readPackedNormal(count: any): any;
        readMatrix4x4(count: any): any;
        readMatrix4x4_64(count: any): any;
    }
}
