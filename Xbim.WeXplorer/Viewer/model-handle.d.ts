import { ModelGeometry, ProductMap, Region } from "./model-geometry";
import { State } from "./state";
import { ModelPointers } from "./viewer";
export declare class ModelHandle {
    private _gl;
    private _model;
    /**
     * ID used to manipulate this handle/model
     */
    id: number;
    /**
     * Tag used to identify the model
     */
    tag: any;
    /**
    * Conversion factor to one meter from model units
    */
    meter: number;
    /**
    * indicates if this model should be used in a rendering loop or not.
    */
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
    region: Region;
    constructor(_gl: WebGLRenderingContext, _model: ModelGeometry);
    private InitRegions(regions);
    private InitGlBuffersAndTextures(gl);
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
    private InitGPU(gl, model);
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
