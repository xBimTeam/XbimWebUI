import { ModelGeometry, Region } from "./reader/model-geometry";
import { State, StatePriorities } from "./common/state";
import { ModelPointers } from "./model-pointers";
import { Product } from "./product-inheritance";
import { Message, MessageType } from "./common/message";
import { vec3 } from "gl-matrix";
import { ProductMap } from "./common/product-map";
import { BBox } from "./common/bbox";
import { ProductType } from "./product-type";

//this class holds pointers to textures, uniforms and data buffers which
//make up a model in GPU
export class ModelHandle {

    /**
     * Session unique ID used to manipulate this handle/model
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
     * local World Coordinate System origin
     */
    public wcs: vec3 = vec3.create();

    /**
     * indicates if this model should be used in a rendering loop or not.
     */
    public get stopped(): boolean { return this._stopped; }
    public set stopped(value: boolean) { this._stopped = value; this._changed = true; }
    private _stopped: boolean = false;

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
    public get isolatedProducts(): number[] { return this._drawProductIds; }
    public set isolatedProducts(value: number[]) { this._drawProductIds = value; this._changed = true; }

    public getRegion(wcs: vec3): Region {
        let result: Region = null;
        if (this.isolatedProducts == null) {
            result = Region.clone(this._region);
        } else {
            let maps: ProductMap[] = [];
            this.isolatedProducts.forEach((id) => {
                const map = this.getProductMap(id, wcs);
                if (map) {
                    maps.push(map);
                }
            });
            if (maps.length === 0) {
                return null;
            }
            // aggregated bounding box
            const bb = maps.reduce((prev: Float32Array, curr: ProductMap) => {
                if (prev == null) {
                    return curr.bBox;
                }
                return BBox.union(prev, curr.bBox);
            }, null);
            result = new Region();
            result.population = maps.length;
            result.bbox = new Float32Array(bb);
            result.centre = new Float32Array([
                bb[0] + bb[3] / 2.0,
                bb[1] + bb[4] / 2.0,
                bb[2] + bb[5] / 2.0
            ]);
            return result;
        }

        // fix local displacement
        const shift = vec3.subtract(vec3.create(), this.wcs, wcs);
        result.centre = vec3.add(vec3.create(), shift, this.getVec3(result.centre));
        let bboxOrigin = vec3.add(vec3.create(), shift, this.getVec3(result.bbox.subarray(0, 3)));
        result.bbox.set(new Float32Array(bboxOrigin), 0);
        return result;
    }

    /**
     * Indicates if there are any changes to be drawn.
     * This flag is checked by the viewer to see if redraw is necessary
     */
    public get changed(): boolean {
        return this._changed;
    }
    private _changed = false;

    /**
     * Some models are empty - they don't contain any geometry
     */
    public get empty(): boolean {
        return this._empty;
    }
    private _empty = false;

    private _region: Region;
    private _drawProductIds: number[] = null;
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

    private _clippingPlaneA: number[] = null;
    private _clippingPlaneB: number[] = null;
    private _clippingA: boolean = false;
    private _clippingB: boolean = false;

    private _glVersion: number = 1;

    private get gl1(): WebGLRenderingContext {
        return this._glVersion === 1 ? this._gl : null;
    }

    private get gl2(): WebGL2RenderingContext {
        return this._glVersion === 2 ? this._gl as WebGL2RenderingContext : null;
    }

    public set clippingPlaneA(plane: number[]) {
        this._clippingPlaneA = plane;
        this._clippingA = plane != null;
        this._changed = true;
    }

    public get clippingPlaneA(): number[] {
        return this._clippingPlaneA;
    }

    public set clippingPlaneB(plane: number[]) {
        this._clippingPlaneB = plane;
        this._clippingB = plane != null;
        this._changed = true;
    }

    public get clippingPlaneB(): number[] {
        return this._clippingPlaneB;
    }

    constructor(
        private _gl: WebGLRenderingContext | WebGL2RenderingContext,
        private _model: ModelGeometry, progress: (msg: Message) => void) {

        if (typeof (_gl) === 'undefined' || typeof (_model) === 'undefined') {
            throw new Error('WebGL context and geometry model must be specified');
        }

        if (typeof (WebGL2RenderingContext) !== 'undefined' && _gl instanceof WebGL2RenderingContext) {
            this._glVersion = 2;
        }

        // tslint:disable-next-line: no-empty
        progress = progress ? progress : (msg) => { };
        this.id = ModelHandle._instancesNum++;

        this.meter = _model.meter;
        this.wcs = this.getVec3(_model.wcs);

        // handle the case when there is actually nothing in the model
        if (_model.indices.length === 0) {
            this._empty = true;
            this._changed = false;
            return;
        }

        this.InitGlBuffersAndTextures(_gl);
        this.InitRegions(_model.regions);
        this.InitGPU(_gl, _model, progress);
        this._changed = true;
    }

    private InitRegions(regions: Region[]): void {
        if (this.empty) {
            return;
        }
        this._region = regions[0];

        // set the most populated region
        regions.forEach((region) => {
            if (region.population > this._region.population) {
                this._region = region;
            }
        });

        // set default region if no region is defined. This shouldn't ever happen if model contains any geometry.
        if (this._region == null) {
            this._region = new Region();
            this._region.population = 0;
            this._region.centre = new Float32Array([0.0, 0.0, 0.0]);
            this._region.bbox = new Float32Array([0.0, 0.0, 0.0, 0.0, 0.0, 0.0]);
        }
    }

    private InitGlBuffersAndTextures(gl: WebGLRenderingContext): void {
        if (this.empty) {
            return;
        }

        // data structure 
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
    public setActive(pointers: ModelPointers, wcs: vec3): void {
        if (this.stopped || this.empty) {
            return;
        }

        var gl = this._glVersion === 1 ? this.gl1 : this.gl2;
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

        gl.uniform1f(pointers.VertexTextureSizeUniform, this._vertexTextureSize);
        gl.uniform1f(pointers.MatrixTextureSizeUniform, this._matrixTextureSize);
        gl.uniform1f(pointers.StyleTextureSizeUniform, this._styleTextureSize);

        gl.uniform1f(pointers.MeterUniform, this.meter);

        // only shift by difference between this WCS and current global wcs
        // this is expected to be a small correction allowing to work with relatively small numbers
        //  in the viewer for models in real world coordinates
        var diff = vec3.subtract(vec3.create(), this.wcs, wcs);
        gl.uniform3fv(pointers.WcsUniform, diff);

        //clipping uniforms
        gl.uniform1i(pointers.ClippingAUniform, this._clippingA ? 1 : 0);
        gl.uniform1i(pointers.ClippingBUniform, this._clippingB ? 1 : 0);
        if (this._clippingA) {
            const c = this.transformPlane(this._clippingPlaneA, wcs);
            gl.uniform4fv(pointers.ClippingPlaneAUniform, c);
        }
        if (this._clippingB) {
            const c = this.transformPlane(this._clippingPlaneB, wcs);
            gl.uniform4fv(pointers.ClippingPlaneBUniform, c);
        }
    }

    private transformPlane(plane: number[], transform: vec3): Float32Array {
        const normalLength = vec3.len(plane);
        // plane components
        const a = plane[0];
        const b = plane[1];
        const c = plane[2];
        let d = plane[3];

        // point closest to [0,0,0]
        let x = (a * -d) / normalLength;
        let y = (b * -d) / normalLength;
        let z = (c * -d) / normalLength;

        // translate
        x -= transform[0];
        y -= transform[1];
        z -= transform[2];

        //compute new normal equation of the plane
        d = 0.0 - a * x - b * y - c * z;

        return new Float32Array([a, b, c, d]);
    }

    //this function must be called AFTER 'setActive()' function which sets up active buffers and uniforms
    public draw(mode?: DrawMode, percent?: number): void {
        // reset flag because current state is drawn
        this._changed = false;

        if (this.stopped || this.empty) {
            return;
        }

        var gl = this._gl;
        const maps = this.isolatedProducts && this.isolatedProducts.length > 0 ?
            this.isolatedProducts.reduce((result: ProductMap[], id: number) => {
                const map = this.getProductMap(id);
                if (map) {
                    result.push(map);
                }
                return result;
            }, new Array<ProductMap>())
            : null;

        // if isolated product is requested but is not in this handle, don't draw and return
        if (maps != null && maps.length === 0) {
            return;
        }

        if (mode == null) {
            // make sure depth testing is on for general rendering
            if (maps == null) {
                gl.drawArrays(gl.TRIANGLES, 0, this._numberOfIndices);
                // if (percent == null || percent === 100 || this._model.breaks[percent] == null) {
                //     gl.drawArrays(gl.TRIANGLES, 0, this._numberOfIndices);
                // } else {
                //     const breaks = this._model.breaks[percent];
                //     gl.drawArrays(gl.TRIANGLES, 0, breaks[0]);
                //     gl.drawArrays(gl.TRIANGLES, breaks[1], this._numberOfIndices - breaks[1]);
                // }
            } else {
                maps.forEach((map) => {
                    map.spans.forEach((span) => {
                        gl.drawArrays(gl.TRIANGLES, span[0], span[1] - span[0]);
                    });
                });
            }
            return;
        }

        if (mode === DrawMode.SOLID && this._model.transparentIndex > 0) {
            // make sure depth testing is on for solid rendering
            if (maps == null) {
                if (percent == null || percent === 100 || this._model.breaks[percent] == null) {
                    gl.drawArrays(gl.TRIANGLES, 0, this._model.transparentIndex);
                } else {
                    const breaks = this._model.breaks[percent];
                    gl.drawArrays(gl.TRIANGLES, 0, breaks[0] + 1);
                }
            } else {
                maps.forEach((map) => {
                    map.spans
                        .filter((s) => s[1] <= this._model.transparentIndex)
                        .forEach((span) => {
                            gl.drawArrays(gl.TRIANGLES, span[0], span[1] - span[0]);
                        });
                });
            }
            return;
        }

        if (mode === DrawMode.TRANSPARENT && this._model.transparentIndex < this._numberOfIndices) {
            //following recomendations from http://www.openglsuperbible.com/2013/08/20/is-order-independent-transparency-really-necessary/
            //disable writing to a depth buffer
            gl.depthMask(false);
            //gl.enable(gl.BLEND);
            //multiplicative blending
            //gl.blendFunc(gl.ZERO, gl.SRC_COLOR);

            if (maps == null) {
                if (percent == null || percent === 100 || this._model.breaks[percent] == null) {
                    gl.drawArrays(gl.TRIANGLES, this._model.transparentIndex, this._numberOfIndices - this._model.transparentIndex);
                } else {
                    const breaks = this._model.breaks[percent];
                    gl.drawArrays(gl.TRIANGLES, breaks[1], this._numberOfIndices - breaks[1]);
                }
            } else {
                maps.forEach((map) => {
                    map.spans
                        .filter((s) => s[0] >= this._model.transparentIndex)
                        .forEach((span) => {
                            gl.drawArrays(gl.TRIANGLES, span[0], span[1] - span[0]);
                        });
                });
            }

            //enable writing to depth buffer and default blending again
            gl.depthMask(true);
            //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

            return;
        }
    }


    //public drawProduct(id: number): void {
    //    if (this.stopped) return;
    //    var gl = this._gl;
    //    var map = this.getProductMap(id);
    //    if (map != null) {
    //        map.spans.forEach((span) => {
    //            gl.drawArrays(gl.TRIANGLES, span[0], span[1] - span[0]);
    //        },
    //            this);
    //    }
    //}


    public getProductId(renderId: number): number {
        if (this.empty) {
            return null;
        }

        return this._model.productIdLookup[renderId];
    }

    public getProductMap(id: number, wcs?: vec3): ProductMap {
        if (this.empty) {
            return null;
        }

        let map = this._model.productMaps[id];
        if (map != null) {
            if (wcs != null) {
                // create clone before we start changing it
                map = ProductMap.clone(map);
                const origin = this.getVec3(map.bBox.subarray(0, 3));
                const shift = vec3.subtract(vec3.create(), this.wcs, wcs);
                const position = vec3.add(vec3.create(), origin, shift);
                map.bBox.set(position, 0);
            }
            return map;
        }
        return null;
    }

    public getProductMaps(ids: number[]): ProductMap[] {
        let result = new Array<ProductMap>();
        if (this.empty) {
            return result;
        }

        ids.forEach((id) => {
            var map = this._model.productMaps[id];
            if (map != null) {
                result.push(map);
            }
        });

        return result;
    }

    public getProductsOfType(type: ProductType): ProductMap[] {
        let result: ProductMap[] = [];
        if (this.empty) {
            return result;
        }

        var typeIds = Product.getAllSubTypes(type);

        Object.getOwnPropertyNames(this._model.productMaps).forEach(id => {
            var map: ProductMap = this._model.productMaps[id];
            if (typeIds[map.type]) {
                result.push(map)
            }
        })
        return result;
    }

    public unload() {
        if (this.empty) {
            return null;
        }

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

    private InitGPU(gl: WebGLRenderingContext, model: ModelGeometry, progress: (msg: Message) => void) {
        if (this.empty) {
            return null;
        }

        const report = (percent: number): void => {
            const message: Message = {
                message: 'Loading data into GPU',
                percent: percent,
                type: MessageType.PROGRESS
            };
            progress(message);
        };
        this._numberOfIndices = model.indices.length;

        //fill all buffers
        this.bufferData(this._normalBuffer, model.normals);
        report(10);
        this.bufferData(this._indexBuffer, model.indices);
        report(30);
        this.bufferData(this._productBuffer, model.products);
        report(40);
        this.bufferData(this._stateBuffer, model.states);
        report(50);
        this.bufferData(this._transformationBuffer, model.transformations);
        report(60);
        this.bufferData(this._styleBuffer, model.styleIndices);

        //fill in all textures
        this._vertexTextureSize = ModelHandle.bufferTexture(gl, this._vertexTexture, model.vertices, 3);
        report(80);
        this._matrixTextureSize = ModelHandle.bufferTexture(gl, this._matrixTexture, model.matrices, 4);
        report(90);
        this._styleTextureSize = ModelHandle.bufferTexture(gl, this._styleTexture, model.styles);
        report(100);


        //Forget everything except for states and styles (this should save some RAM).
        //data is already loaded to GPU by now
        model.normals = null;
        model.indices = null;
        model.products = null;
        model.transformations = null;
        model.styleIndices = null;

        model.vertices = null;
        model.matrices = null;

        const msg: Message = {
            message: 'Loading data into GPU',
            percent: 100,
            type: MessageType.COMPLETED
        };
        progress(msg);
    }

    private bufferData(pointer, data) {
        if (this._glVersion === 1) {
            let gl = this.gl1;
            gl.bindBuffer(gl.ARRAY_BUFFER, pointer);
            gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        }
        if (this._glVersion === 2) {
            let gl = this.gl2;
            gl.bindBuffer(gl.ARRAY_BUFFER, pointer);
            gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        }
    }

    private getVec3(a: ArrayLike<number>) {
        return vec3.fromValues(a[0], a[1], a[2]);
    }

    public static bufferTexture(gl: WebGLRenderingContext | WebGL2RenderingContext, pointer: WebGLTexture, data: Float32Array | Uint8Array, numberOfComponents?: number): number {

        if (data.length === 0) {
            let dummySize = 2;
            gl.bindTexture(gl.TEXTURE_2D, pointer);
            //2 x 2 transparent black dummy pixels texture
            let image = new Uint8Array([
                0, 0, 0, 0,
                0, 0, 0, 0,
                0, 0, 0, 0,
                0, 0, 0, 0
            ]);
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


        if (size === 0) {
            return 0;
        }
        if (size > maxSize) {
            throw new Error('Too much data! It cannot fit into the texture.');
        }

        gl.bindTexture(gl.TEXTURE_2D, pointer);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0); //this is our convention
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0); //this should preserve values of alpha
        //gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, 0); //this should preserve values of colours

        if (data instanceof Float32Array) {
            //create new data buffer and fill it in with data
            let image: Float32Array = null;
            if (size * size * numberOfComponents !== data.length) {
                image = new Float32Array(size * size * numberOfComponents);
                image.set(data);
            } else {
                image = data;
            }

            if (gl instanceof WebGLRenderingContext) {
                let type = null;
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
            }
            if (typeof (WebGL2RenderingContext) !== 'undefined' && gl instanceof WebGL2RenderingContext) {
                const gl2 = gl as WebGL2RenderingContext;
                let internalFormat = null;
                let format = null;
                switch (numberOfComponents) {
                    case 1:
                        format = gl2.RED;
                        internalFormat = gl2.R32F;
                        break;
                    case 3:
                        format = gl2.RGB;
                        internalFormat = gl2.RGB32F;
                        break;
                    case 4:
                        format = gl2.RGBA;
                        internalFormat = gl2.RGBA32F;
                        break;
                }
                gl2.texImage2D(gl2.TEXTURE_2D, 0, internalFormat, size, size, 0, format, gl2.FLOAT, image);
            }

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
        var span = this.getFirstSpan(id);
        if (span == null) {
            return null;
        }
        return this._model.states[span[0] * 2];
    }

    public getStates(): { id: number, states: State[] }[] {
        const result: { id: number, states: State[] }[] = [];
        var prodIds = Object.getOwnPropertyNames(this._model.productMaps);
        prodIds.forEach((id) => {
            const map = this._model.productMaps[+id];
            if (map.states == null || map.states.length === 0) {
                return;
            }
            if (map.states.length === 1 && map.states[0] === State.UNDEFINED) {
                return;
            }
            result.push({ id: map.productID, states: map.states.slice(0) });
        });
        return result;
    }

    public getStyle(id: number): number {
        var span = this.getFirstSpan(id);
        if (span == null) {
            return null;
        }
        return this._model.states[span[0] * 2 + 1];
    }

    private getFirstSpan(id: number): Int32Array {
        if (this.empty) {
            return null;
        }

        if (typeof (id) === 'undefined') {
            throw new Error('id must be defined');
        }
        var map = this.getProductMap(id);
        if (map === null) {
            return null;
        }

        var span = map.spans[0];
        if (typeof (span) === 'undefined') {
            return null;
        }

        return span;
    }

    public addState(state: State, args: number | number[]): void {
        if (this.empty) {
            return;
        }
        this.checkStateArgs(state, args);
        const maps = this.getMaps(args);

        //shift +1 if it is an overlay colour style or 0 if it is a state.
        maps.forEach((map) => {
            ProductMap.addState(map, state);
            const priorityState = ProductMap.getState(map);
            map.spans.forEach((span) => {
                //set state or style
                for (var k = span[0]; k < span[1]; k++) {
                    this._model.states[k * 2] = priorityState;
                }
            });
        });

        //buffer data to GPU
        this.bufferData(this._stateBuffer, this._model.states);
        this._changed = true;
    }

    public setState(state: State, args: number | number[]): void {
        if (this.empty) {
            return;
        }
        this.checkStateArgs(state, args);
        const maps = this.getMaps(args);

        //shift +1 if it is an overlay colour style or 0 if it is a state.
        maps.forEach((map) => {
            map.states = [state];
            map.spans.forEach((span) => {
                //set state or style
                for (var k = span[0]; k < span[1]; k++) {
                    this._model.states[k * 2] = state;
                }
            });
        });

        //buffer data to GPU
        this.bufferData(this._stateBuffer, this._model.states);
        this._changed = true;
    }

    public clearHighlighting(): void {
        const prodIds = Object.getOwnPropertyNames(this._model.productMaps);
        prodIds.forEach((id) => {
            const map = this._model.productMaps[+id];
            ProductMap.removeState(map, State.HIGHLIGHTED);
            const priorityState = ProductMap.getState(map);
            map.spans.forEach((span) => {
                //set state or style
                for (var k = span[0]; k < span[1]; k++) {
                    this._model.states[k * 2] = priorityState;
                }
            });
        });

        //buffer data to GPU
        this.bufferData(this._stateBuffer, this._model.states);
        this._changed = true;
    }

    public removeState(state: State, args: number | number[]): void {
        if (this.empty) {
            return;
        }
        this.checkStateArgs(state, args);
        const maps = this.getMaps(args);

        //shift +1 if it is an overlay colour style or 0 if it is a state.
        maps.forEach((map) => {
            ProductMap.removeState(map, state);
            const priorityState = ProductMap.getState(map);
            map.spans.forEach((span) => {
                //set state or style
                for (var k = span[0]; k < span[1]; k++) {
                    this._model.states[k * 2] = priorityState;
                }
            });
        });

        //buffer data to GPU
        this.bufferData(this._stateBuffer, this._model.states);
        this._changed = true;
    }

    private checkStateArgs(state: State, args: number | number[]) {
        if (typeof (state) !== 'number' || state < 0 || state > 255) {
            throw new Error('You have to specify state as an ID of state or index in style pallete.');
        }
        if (typeof (args) === 'undefined') {
            throw new Error('You have to specify products as an array of product IDs or as a product type ID');
        }
    }

    public resetState(args?: number | number[]): void {
        if (this.empty) {
            return null;
        }
        // no args, so reset all states of all products
        if (args == null) {

            var prodIds = Object.getOwnPropertyNames(this._model.productMaps);
            prodIds.forEach((id) => {
                const map = this._model.productMaps[+id];
                map.states = [];
            });

            for (var i = 0; i < this._model.states.length; i += 2) {
                this._model.states[i] = State.UNDEFINED;
            }
        } else {
            // reset only products defined by type or list of instance ids
            const maps = this.getMaps(args);

            //shift +1 if it is an overlay colour style or 0 if it is a state.
            maps.forEach((map) => {
                map.states = [];
                map.spans.forEach((span) => {
                    //set state or style
                    for (var k = span[0]; k < span[1]; k++) {
                        this._model.states[k * 2] = State.UNDEFINED;
                    }
                });
            });
        }

        //buffer data to GPU
        this.bufferData(this._stateBuffer, this._model.states);
        this._changed = true;
    }

    public getProductsWithState(state: State): { id: number, model: number }[] {
        const result: { id: number, model: number }[] = [];

        // hashset of isolated products for fast lookup
        const isolated: { [id: number]: boolean } = {};
        const isolation = this.isolatedProducts != null && this.isolatedProducts.length > 0;
        if (isolation) {
            this.isolatedProducts.forEach(i => isolated[i] = true);
        }

        Object.getOwnPropertyNames(this._model.productMaps).forEach((n) => {
            const map: ProductMap = this._model.productMaps[n];
            if (map.states.indexOf(state) === -1) {
                return;
            }
            // filter out products not isolated in the current state
            if (isolation && !isolated[map.productID]) {
                return;
            }
            // transform to result
            result.push({ id: map.productID, model: this.id });
        });
        return result;
    }

    public setStyle(styleId: number, args: number | number[]): void {
        if (this.empty) {
            return null;
        }

        if (typeof (styleId) !== 'number' && styleId < 0 && styleId > 255) {
            throw new Error('You have to specify state as an ID of state or index in style pallete.');
        }
        if (typeof (args) === 'undefined') {
            throw new Error('You have to specify products as an array of product IDs or as a product type ID');
        }

        const maps = this.getMaps(args);

        //shift +1 if it is an overlay colour style or 0 if it is a state.
        maps.forEach((map) => {
            map.spans.forEach((span) => {
                //set state or style
                for (var k = span[0]; k < span[1]; k++) {
                    this._model.states[k * 2 + 1] = styleId;
                }
            });
        });

        //buffer data to GPU
        this.bufferData(this._stateBuffer, this._model.states);
        this._changed = true;
    }

    private getMaps(args: number | number[]): ProductMap[] {
        var maps: ProductMap[] = [];
        //it is type
        if (typeof (args) === 'number') {
            // get all non-abstract subtypes
            const subTypes = Product.getAllSubTypes(args);

            Object.getOwnPropertyNames(this._model.productMaps).forEach((n) => {
                const map: ProductMap = this._model.productMaps[n];
                if (subTypes[map.type]) {
                    maps.push(map);
                }
            });
        } else {         //it is a list of IDs
            args.forEach(id => {
                const map = this.getProductMap(id);
                if (map != null) {
                    maps.push(map);
                }
            });
        }
        return maps;
    }

    public resetStyles(): void {
        if (this.empty) {
            return null;
        }

        for (var i = 0; i < this._model.states.length; i += 2) {
            this._model.states[i + 1] = State.UNSTYLED;
        }
        //buffer data to GPU
        this.bufferData(this._stateBuffer, this._model.states);
        this._changed = true;
    }

    public getModelState(): number[][] {
        var result = [];
        if (this.empty) {
            return result;
        }

        var products = this._model.productMaps;
        for (var i in products) {
            if (!products.hasOwnProperty(i)) {
                continue;
            }
            var map = products[i];
            var span = map.spans[0];
            if (typeof (span) === 'undefined') {
                continue;
            }

            var state = this._model.states[span[0] * 2];
            var style = this._model.states[span[0] * 2 + 1];

            // tslint:disable-next-line: no-bitwise
            result.push([map.productID, state + (style << 8)]);
        }
        return result;
    }

    public restoreModelState(states: number[][]): void {
        if (this.empty) {
            return null;
        }

        states.forEach((s) => {
            const id = s[0];
            // tslint:disable: no-bitwise
            const style = s[1] >> 8;
            const state = s[1] - (style << 8);

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
        this._changed = true;
    }
}

export enum DrawMode {
    SOLID,
    TRANSPARENT
}
