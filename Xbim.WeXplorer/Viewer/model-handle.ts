import { ModelGeometry, ProductMap, Region } from "./model-geometry";
import { State } from "./state";
import { ModelPointers } from "./viewer";

//this class holds pointers to textures, uniforms and data buffers which
//make up a model in GPU
export class ModelHandle {

    /**
     * ID used to manipulate this handle/model
     */
    public id: number;

    /**
     * Tag used to identify the model
     */
    public tag: any = null;

    /**
     * Conversion factor to one meter from model units
     */
    public meter: number;

    /**
     * indicates if this model should be used in a rendering loop or not.
     */
    public stopped: boolean = false;

    /**
     * participates in picking operation only if true
     */
    public pickable: boolean = true;

    /**
     * participates in clipping operation only if true
     */
    public clippable: boolean = true;

    /**
     * If drawProductId is defined, only this single product is drawn
     */
    public drawProductId = -1;

    public region: Region;

    /**
     * Indicates if there are any changes to be drawn
     */
    public changed: boolean = true;

    private _numberOfIndices: number;
    private _vertexTextureSize: number;
    private _matrixTextureSize: number;
    private _styleTextureSize: number;

    private _vertexTexture: WebGLTexture;
    private _matrixTexture: WebGLTexture;
    private _styleTexture: WebGLTexture;

    private _normalBuffer: WebGLBuffer;
    private _indexBuffer: WebGLBuffer;
    private _productBuffer: WebGLBuffer;
    private _styleBuffer: WebGLBuffer;
    private _stateBuffer: WebGLBuffer;
    private _transformationBuffer: WebGLBuffer;

    private get _drawProduct() { return this.drawProductId >= 0; }
    private _clippingPlaneA: number[] = null;
    private _clippingPlaneB: number[] = null;
    private _clippingA: boolean = false;
    private _clippingB: boolean = false;

    public set clippingPlaneA(plane: number[]) {
        this._clippingPlaneA = plane;
        this._clippingA = plane != null;
        this.changed = true;
    }

    public get clippingPlaneA(): number[] {
        return this._clippingPlaneA;
    }

    public set clippingPlaneB(plane: number[]) {
        this._clippingPlaneB = plane;
        this._clippingB = plane != null;
        this.changed = true;
    }

    public get clippingPlaneB(): number[] {
        return this._clippingPlaneA;
    }

    constructor(
        private _gl: WebGLRenderingContext,
        private _model: ModelGeometry) {

        if (typeof (_gl) == 'undefined' || typeof (_model) == 'undefined') {
            throw 'WebGL context and geometry model must be specified';
        }

        /**
         * unique ID which can be used to identify this handle 
         */
        this.id = ModelHandle._instancesNum++;


        this.meter = _model.meter;
        this.InitGlBuffersAndTextures(_gl);
        this.InitRegions(_model.regions);
        this.InitGPU(_gl, _model);
    }

    private InitRegions(regions: Region[]): void {
        this.region = regions[0];
        //set the most populated region
        regions.forEach((region) => {
            if (region.population > this.region.population) {
                this.region = region;
            }
        });
        //set default region if no region is defined. This shouldn't ever happen if model contains any geometry.
        if (typeof (this.region) == 'undefined') {
            this.region = new Region();
            this.region.population = 1;
            this.region.centre = new Float32Array([0.0, 0.0, 0.0]);
            this.region.bbox = new Float32Array([0.0, 0.0, 0.0, 10 * this.meter, 10 * this.meter, 10 * this.meter]);
        }
    }

    private InitGlBuffersAndTextures(gl: WebGLRenderingContext): void {
        //data structure 
        this._vertexTexture = gl.createTexture();
        this._matrixTexture = gl.createTexture();
        this._styleTexture = gl.createTexture();

        this._vertexTextureSize = 0;
        this._matrixTextureSize = 0;
        this._styleTextureSize = 0;

        this._normalBuffer = gl.createBuffer();
        this._indexBuffer = gl.createBuffer();
        this._productBuffer = gl.createBuffer();
        this._styleBuffer = gl.createBuffer();
        this._stateBuffer = gl.createBuffer();
        this._transformationBuffer = gl.createBuffer();
    }

    /**
     * Static counter to keep unique ID of the model handles
     */
    private static _instancesNum = 1;

    //this function sets this model as an active one
    //it needs an argument 'pointers' which contains pointers to
    //shader attributes and uniforms which are to be set.
    public setActive(pointers: ModelPointers): void {
        if (this.stopped) return;

        var gl = this._gl;
        //set predefined textures
        if (this._vertexTextureSize > 0) {
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this._vertexTexture);
            gl.uniform1i(pointers.VertexSamplerUniform, 1);
        }

        if (this._matrixTextureSize > 0) {
            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, this._matrixTexture);
            gl.uniform1i(pointers.MatrixSamplerUniform, 2);
        }

        if (this._styleTextureSize > 0) {
            gl.activeTexture(gl.TEXTURE3);
            gl.bindTexture(gl.TEXTURE_2D, this._styleTexture);
            gl.uniform1i(pointers.StyleSamplerUniform, 3);
        }

        //set attributes and uniforms
        gl.bindBuffer(gl.ARRAY_BUFFER, this._normalBuffer);
        gl.vertexAttribPointer(pointers.NormalAttrPointer, 2, gl.UNSIGNED_BYTE, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._indexBuffer);
        gl.vertexAttribPointer(pointers.IndexlAttrPointer, 1, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._productBuffer);
        gl.vertexAttribPointer(pointers.ProductAttrPointer, 1, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._stateBuffer);
        gl.vertexAttribPointer(pointers.StateAttrPointer, 2, gl.UNSIGNED_BYTE, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._styleBuffer);
        gl.vertexAttribPointer(pointers.StyleAttrPointer, 1, gl.UNSIGNED_SHORT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._transformationBuffer);
        gl.vertexAttribPointer(pointers.TransformationAttrPointer, 1, gl.FLOAT, false, 0, 0);

        gl.uniform1i(pointers.VertexTextureSizeUniform, this._vertexTextureSize);
        gl.uniform1i(pointers.MatrixTextureSizeUniform, this._matrixTextureSize);
        gl.uniform1i(pointers.StyleTextureSizeUniform, this._styleTextureSize);

        //clipping uniforms
        gl.uniform1i(pointers.ClippingAUniform, this._clippingA ? 1 : 0);
        gl.uniform1i(pointers.ClippingBUniform, this._clippingB ? 1 : 0);
        if (this._clippingA) {
            gl.uniform4fv(pointers.ClippingPlaneAUniform, new Float32Array(this._clippingPlaneA));
        }
        if (this._clippingB) {
            gl.uniform4fv(pointers.ClippingPlaneBUniform, new Float32Array(this._clippingPlaneB));
        }
    }

    //this function must be called AFTER 'setActive()' function which sets up active buffers and uniforms
    public draw(mode?: DrawMode): void {
        if (this.stopped) return;

        var gl = this._gl;

        // reset flag because current state is drawn
        this.changed = false;

        if (typeof (mode) === 'undefined') {
            //draw image frame
            gl.drawArrays(gl.TRIANGLES, 0, this._numberOfIndices);
            return;
        }

        if (mode === DrawMode.SOLID && this._model.transparentIndex > 0) {
            gl.drawArrays(gl.TRIANGLES, 0, this._model.transparentIndex);
            return;
        }

        if (mode === DrawMode.TRANSPARENT && this._model.transparentIndex < this._numberOfIndices) {
            //following recomendations from http://www.openglsuperbible.com/2013/08/20/is-order-independent-transparency-really-necessary/
            //disable writing to a depth buffer
            gl.depthMask(false);
            //gl.enable(gl.BLEND);
            //multiplicative blending
            //gl.blendFunc(gl.ZERO, gl.SRC_COLOR);

            gl.drawArrays(gl.TRIANGLES, this._model.transparentIndex, this._numberOfIndices - this._model.transparentIndex);

            //enable writing to depth buffer and default blending again
            gl.depthMask(true);
            //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

            return;
        }
    }


    public drawProduct(id: number): void {
        if (this.stopped) return;

        var gl = this._gl;
        var map = this.getProductMap(id);

        if (map != null) {
            map.spans.forEach((span) => {
                gl.drawArrays(gl.TRIANGLES, span[0], span[1] - span[0]);
            },
                this);
        }
    }

    public getProductMap(id: number): ProductMap {
        var map = this._model.productMaps[id];
        if (typeof (map) !== 'undefined') return map;
        return null;
    }

    public getProductMaps(ids: number[]): ProductMap[] {
        let result = new Array<ProductMap>();
        ids.forEach(id => {
            var map = this._model.productMaps[id];
            if (typeof (map) !== 'undefined')
                result.push(map);
        });

        return result;
    }

    public unload() {
        var gl = this._gl;

        gl.deleteTexture(this._vertexTexture);
        gl.deleteTexture(this._matrixTexture);
        gl.deleteTexture(this._styleTexture);

        gl.deleteBuffer(this._normalBuffer);
        gl.deleteBuffer(this._indexBuffer);
        gl.deleteBuffer(this._productBuffer);
        gl.deleteBuffer(this._styleBuffer);
        gl.deleteBuffer(this._stateBuffer);
        gl.deleteBuffer(this._transformationBuffer);
    }

    private InitGPU(gl: WebGLRenderingContext, model: ModelGeometry) {

        this._numberOfIndices = model.indices.length;

        //fill all buffers
        this.bufferData(this._normalBuffer, model.normals);
        this.bufferData(this._indexBuffer, model.indices);
        this.bufferData(this._productBuffer, model.products);
        this.bufferData(this._stateBuffer, model.states);
        this.bufferData(this._transformationBuffer, model.transformations);
        this.bufferData(this._styleBuffer, model.styleIndices);

        //fill in all textures
        this._vertexTextureSize = ModelHandle.bufferTexture(gl, this._vertexTexture, model.vertices, 3);
        this._matrixTextureSize = ModelHandle.bufferTexture(gl, this._matrixTexture, model.matrices, 4);
        this._styleTextureSize = ModelHandle.bufferTexture(gl, this._styleTexture, model.styles);


        //Forget everything except for states and styles (this should save some RAM).
        //data is already loaded to GPU by now
        model.normals = null;
        model.indices = null;
        model.products = null;
        model.transformations = null;
        model.styleIndices = null;

        model.vertices = null;
        model.matrices = null;
    }

    private bufferData(pointer, data) {
        var gl = this._gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, pointer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    }

    public static bufferTexture(gl: WebGLRenderingContext, pointer: WebGLTexture, data: any, numberOfComponents?: number): number {

        if (data.length == 0) {
            let dummySize = 2;
            gl.bindTexture(gl.TEXTURE_2D, pointer);
            //2 x 2 transparent black dummy pixels texture
            let image = new Uint8Array([
                0, 0, 0, 0,
                0, 0, 0, 0,
                0, 0, 0, 0,
                0, 0, 0, 0
            ])
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, dummySize, dummySize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating).
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating).
            return dummySize;
        }

        var fp = data instanceof Float32Array;

        //compute size of the image (length should be correct already)
        let size = 0;
        const maxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);

        if (fp) {
            //recompute to smaller size, but make it +1 to make sure it is all right
            size = Math.ceil(Math.sqrt(Math.ceil(data.length / numberOfComponents))) + 1;
        } else {
            var dim = Math.sqrt(data.byteLength / 4);
            size = Math.ceil(dim);
        }


        if (size == 0) return 0;
        if (size > maxSize) throw 'Too much data! It cannot fit into the texture.';

        gl.bindTexture(gl.TEXTURE_2D, pointer);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0); //this is our convention
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0); //this should preserve values of alpha
        //gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, 0); //this should preserve values of colours

        if (fp) {
            //create new data buffer and fill it in with data
            var image: Float32Array = null;
            if (size * size * numberOfComponents != data.length) {
                image = new Float32Array(size * size * numberOfComponents);
                image.set(data);
            } else {
                image = data;
            }
            var type = null;
            switch (numberOfComponents) {
                case 1:
                    type = gl.ALPHA;
                    break;
                case 3:
                    type = gl.RGB;
                    break;
                case 4:
                    type = gl.RGBA;
                    break;
            }
            gl.texImage2D(gl.TEXTURE_2D, 0, type, size, size, 0, type, gl.FLOAT, image);
        } else {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(data.buffer));
        }


        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating).
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating).

        return size;
    }

    public getState(id: number): State {
        if (typeof (id) === 'undefined') throw 'id must be defined';
        var map = this.getProductMap(id);
        if (map === null) return null;

        var span = map.spans[0];
        if (typeof (span) == 'undefined') return null;

        return this._model.states[span[0] * 2];
    }

    public getStyle(id: number): number {
        if (typeof (id) === 'undefined') throw 'id must be defined';
        var map = this.getProductMap(id);
        if (map === null) return null;

        var span = map.spans[0];
        if (typeof (span) == 'undefined') return null;

        return this._model.states[span[0] * 2 + 1];
    }

    public setState(state: State, args: number | number[]): void {
        if (typeof (state) != 'number' && state < 0 && state > 255
        ) throw 'You have to specify state as an ID of state or index in style pallete.';
        if (typeof (args) == 'undefined')
            throw 'You have to specify products as an array of product IDs or as a product type ID';

        var maps = [];
        //it is type
        if (typeof (args) == 'number') {
            for (var n in this._model.productMaps) {
                var map = this._model.productMaps[n];
                if (map.type == args) maps.push(map);
            }
        }
        //it is a list of IDs
        else {
            for (var l = 0; l < args.length; l++) {
                var id = args[l];
                var map = this.getProductMap(id);
                if (map != null) maps.push(map);
            }
        }

        //shift +1 if it is an overlay colour style or 0 if it is a state.
        var shift = state <= 225 ? 1 : 0;
        maps.forEach((map) => {
            map.spans.forEach((span) => {
                //set state or style
                for (var k = span[0]; k < span[1]; k++) {
                    this._model.states[k * 2 + shift] = state;
                }
            });
        });

        //buffer data to GPU
        this.bufferData(this._stateBuffer, this._model.states);
    }

    public resetStates(): void {
        for (var i = 0; i < this._model.states.length; i += 2) {
            this._model.states[i] = State.UNDEFINED;
        }
        //buffer data to GPU
        this.bufferData(this._stateBuffer, this._model.states);
    }

    public resetStyles(): void {
        for (var i = 0; i < this._model.states.length; i += 2) {
            this._model.states[i + 1] = State.UNSTYLED;
        }
        //buffer data to GPU
        this.bufferData(this._stateBuffer, this._model.states);
    };

    public getModelState(): Array<Array<number>> {
        var result = [];
        var products = this._model.productMaps;
        for (var i in products) {
            if (!products.hasOwnProperty(i)) {
                continue;
            }
            var map = products[i];
            var span = map.spans[0];
            if (typeof (span) == 'undefined') continue;

            var state = this._model.states[span[0] * 2];
            var style = this._model.states[span[0] * 2 + 1];

            result.push([map.productID, state + (style << 8)]);
        }
        return result;
    }

    public restoreModelState(state: Array<Array<number>>): void {
        state.forEach((s) => {
            var id = s[0];
            var style = s[1] >> 8;
            var state = s[1] - (style << 8);

            var map = this.getProductMap(id);
            if (map != null) {
                map.spans.forEach((span) => {
                    //set state or style
                    for (var k = span[0]; k < span[1]; k++) {
                        this._model.states[k * 2] = state;
                        this._model.states[k * 2 + 1] = style;
                    }
                });
            }

        });

        //buffer data to GPU
        this.bufferData(this._stateBuffer, this._model.states);
    }
}

export enum DrawMode {
    SOLID,
    TRANSPARENT
}
