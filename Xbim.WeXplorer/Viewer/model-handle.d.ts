import { ModelGeometry, ProductMap, Region } from "./model-geometry";
import { State } from "./state";
import { ModelPointers } from "./viewer";
export declare class ModelHandle {
    private gl;
    private model;
    id: number;
    /**
    * Conversion factor to one meter from model units
    */
    meter: number;
    stopped: boolean;
    pickable: boolean;
    private _numberOfIndices;
    private _vertexTextureSize;
    private _matrixTextureSize;
    private _styleTextureSize;
    private _vertexTexture;
    private _matrixTexture;
    private _styleTexture;
    private _normalBuffer;
    private _indexBuffer;
    private _productBuffer;
    private _styleBuffer;
    private _stateBuffer;
    private _transformationBuffer;
    private _feedCompleted;
    region: Region;
    constructor(gl: WebGLRenderingContext, model: ModelGeometry);
    /**
     * Static counter to keep unique ID of the model handles
     */
    private static _instancesNum;
    setActive(pointers: ModelPointers): void;
    draw(mode?: DrawMode): void;
    drawProduct(id: number): void;
    getProductMap(id: number): ProductMap;
    getProductMaps(ids: number[]): ProductMap[];
    unload(): void;
    feedGPU(): void;
    private bufferData(pointer, data);
    static bufferTexture(gl: WebGLRenderingContext, pointer: WebGLTexture, data: any, numberOfComponents?: number): number;
    getState(id: number): State;
    getStyle(id: number): number;
    setState(state: State, args: number | number[]): void;
    resetStates(): void;
    resetStyles(): void;
    getModelState(): Array<Array<number>>;
    restoreModelState(state: Array<Array<number>>): void;
}
export declare enum DrawMode {
    SOLID = 0,
    TRANSPARENT = 1,
}
