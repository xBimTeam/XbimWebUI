declare namespace Xbim.Viewer {
    class ModelHandle {
        private _gl;
        _model: ModelGeometry;
        id: number;
        stopped: boolean;
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
        region: any;
        constructor(gl: any, model: ModelGeometry);
        /**
         * Static counter to keep unique ID of the model handles
         */
        private static _instancesNum;
        setActive(pointers: ModelPointers): void;
        draw(mode: 'solid' | 'transparent'): void;
        drawProduct(id: number): void;
        private getProductMap(id);
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
}
