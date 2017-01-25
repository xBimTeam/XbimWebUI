import { xModelGeometry } from './xbim-model-geometry';
export declare class xModelHandle {
    private _gl;
    _model: xModelGeometry;
    private _fpt;
    id: number;
    stopped: boolean;
    count: number;
    vertexTextureSize: number;
    matrixTextureSize: number;
    styleTextureSize: number;
    vertexTexture: any;
    matrixTexture: any;
    styleTexture: any;
    stateStyleTexture: any;
    normalBuffer: any;
    indexBuffer: any;
    productBuffer: any;
    styleBuffer: any;
    stateBuffer: any;
    transformationBuffer: any;
    stateStyle: Uint8Array;
    private _feedCompleted;
    region: any;
    constructor(gl: any, model: xModelGeometry, fpt: boolean);
    /**
     * Static counter to keep unique ID of the model handles
     */
    private static _instancesNum;
    setActive(pointers: any): void;
    draw(mode: 'solid' | 'transparent'): void;
    drawProduct(ID: any): void;
    getProductMap(ID: any): any;
    unload(): void;
    feedGPU(): void;
    refreshStyles(): void;
    _bufferData(pointer: any, data: any): void;
    _bufferTexture(pointer: any, data: any, arity?: any): number;
    getState(id: any): number;
    getStyle(id: any): number;
    setState(state: any, args: any): void;
    resetStates(): void;
    resetStyles(): void;
    getModelState(): any[];
    restoreModelState(state: any): void;
}
