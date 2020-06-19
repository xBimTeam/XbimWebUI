import { Viewer, ViewType } from "../../viewer";
import { IPlugin } from "../plugin";
import { cube_fshader } from "./cube_fshader";
import { cube_vshader } from "./cube_vshader";
import { CubeTextures } from "./navigation-cube-textures";
import { ProductIdentity } from "../../common/product-identity";
import { vec3, mat4, mat3, quat } from "gl-matrix";
import { Framebuffer } from "../../framebuffer";


export class NavigationCube implements IPlugin {

    /**
     * This is constructor of the Navigation Cube plugin for {@link Viewer xBIM Viewer}. It gets optional Image as an argument.
     * The image will be used as a texture of the navigation cube. If you don't specify eny image default one will be used.
     * Image has to be square and its size has to be power of 2. 
     * @name NavigationCube
     * @constructor
     * @classdesc This is a plugin for Viewer which renders interactive navigation cube. It is customizable in terms of alpha 
     * behaviour and its position on the viewer canvas. Use of plugin:
     *  
     *     var cube = new NavigationCube();
     *     viewer.addPlugin(cube);
     * 
     * You can specify your own texture of the cube as an [Image](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image)
     * object argumen in constructor. If you don't specify any image default texture will be used (you can also use this one and enhance it if you want):
     * 
     * ![Cube texture](cube_texture.png) 
     *
     * @param {Image} [image = null] - optional image to be used for a cube texture.
    */
    constructor(image?: ImageBitmap | ImageData | HTMLVideoElement | HTMLImageElement | HTMLCanvasElement) {
        this._image = image;
    }

    private _image: ImageBitmap | ImageData | HTMLVideoElement | HTMLImageElement | HTMLCanvasElement;
    private TOP = 1;
    private BOTTOM = 2;
    private LEFT = 3;
    private RIGHT = 4;
    private FRONT = 5;
    private BACK = 6;

    private TOP_LEFT_FRONT = 7;
    private TOP_RIGHT_FRONT = 8;
    private TOP_LEFT_BACK = 9;
    private TOP_RIGHT_BACK = 10;
    private BOTTOM_LEFT_FRONT = 11;
    private BOTTOM_RIGHT_FRONT = 12;
    private BOTTOM_LEFT_BACK = 13;
    private BOTTOM_RIGHT_BACK = 14;

    private TOP_LEFT = 15;
    private TOP_RIGHT = 16;
    private TOP_FRONT = 17;
    private TOP_BACK = 18;
    private BOTTOM_LEFT = 19;
    private BOTTOM_RIGHT = 20;
    private BOTTOM_FRONT = 21;
    private BOTTOM_BACK = 22;

    private FRONT_RIGHT = 23;
    private FRONT_LEFT = 24;
    private BACK_RIGHT = 25;
    private BACK_LEFT = 26;

    private _initialized: boolean = false;
    private _modelId = 1000001;

    //region where the cube is drawn. This helps to avoid unnecessary requests for ID
    private _region: number[];

    /**
    * Size of the cube relative to the size of viewer canvas. This has to be a positive number between [0,1] Default value is 0.15. 
    * @member {Number} NavigationCube#ratio
    */
    public ratio = 0.15;


    /**
     * Minimum size of the cube when scaling the view. Default is 50px
     * @member {Number} NavigationCube#minSize
     */
    public minSize = 50;

    /**
     * Maximum size of the cube when scaling the view. Default is 200px
     * @member {Number} NavigationCube#maxSize
     */
    public maxSize = 200;

    /**
    * Active parts of the navigation cube are highlighted so that user can recognize which part is active. 
    * This should be a positive number between [0,2]. If the value is less than 1 active area is darker.
    * If the value is greater than 1 active area is lighter. Default value is 1.2. 
    * @member {Number} NavigationCube#highlighting
    */
    public highlighting = 1.2;

    /**
    * Navigation cube has two transparency states. One is when user hovers over the cube and the second when the cursor is anywhere else.
    * This is for the hovering shate and it should be a positive number between [0,1]. If the value is less than 1 cube will be semitransparent 
    * when user hovers over. Default value is 1.0. 
    * @member {Number} NavigationCube#activeAlpha
    */
    public activeAlpha = 1.0;

    /**
    * Navigation cube has two transparency states. One is when user hovers over the cube and the second when the cursor is anywhere else.
    * This is for the non-hovering shate and it should be a positive number between [0,1]. If the value is less than 1 cube will be semitransparent 
    * when user is not hovering over. Default value is 0.3. 
    * @member {Number} NavigationCube#passiveAlpha
    */
    public passiveAlpha = 0.7;

    /**
    * It is possible to place navigation cube to any of the corners of the canvas using this property. Default value is cube.BOTTOM_RIGHT. 
    * Allowed values are cube.BOTTOM_RIGHT, cube.BOTTOM_LEFT, cube.TOP_RIGHT and cube.TOP_LEFT.
    * @member {Enum} NavigationCube#position
    */
    public position = this.BOTTOM_RIGHT;

    /**
     * True north correction to be applied to navigation cube both for visualization and for navigation. Value should be in degrees. Default is 0.
     * @member {Enum} NavigationCube#trueNorth
     */
    public trueNorth: number = 0;

    /**
    * Set this to true to stop rendering of this plugin
    * @member {boolean} NavigationCube#stopped
    */
    public get stopped(): boolean { return this._stopped; }
    public set stopped(value: boolean) {
        this._stopped = value;
        if (this.viewer) {
            this.viewer.draw();
        }
    }
    private _stopped = false;

    private viewer: Viewer;
    private _shader: WebGLProgram;
    private _alpha: number;
    private _selection: number;

    private _pMatrixUniformPointer: WebGLUniformLocation;
    private _rotationUniformPointer: WebGLUniformLocation;
    private _colourCodingUniformPointer: WebGLUniformLocation;
    private _alphaUniformPointer: WebGLUniformLocation;
    private _selectionUniformPointer: WebGLUniformLocation;
    private _textureUniformPointer: WebGLUniformLocation;
    private _highlightingUniformPointer: WebGLUniformLocation;

    private _vertexAttrPointer: number;
    private _texCoordAttrPointer: number;
    private _idAttrPointer: number;

    private _indexBuffer: any;
    private _vertexBuffer: any;
    private _texCoordBuffer: any;
    private _idBuffer: any;

    private _texture: WebGLTexture;

    private _drag: boolean;

    private _originalNavigation: any;


    public init(viewer: Viewer) {
        var self = this;
        this.viewer = viewer;
        var gl = this.viewer.gl;

        //create own shader 
        this._shader = null;
        this._initShader();

        this._alpha = this.passiveAlpha;
        this._selection = 0.0;

        //set own shader for init
        gl.useProgram(this._shader);

        //create uniform and attribute pointers
        this._pMatrixUniformPointer = gl.getUniformLocation(this._shader, "uPMatrix");
        this._rotationUniformPointer = gl.getUniformLocation(this._shader, "uRotation");
        this._colourCodingUniformPointer = gl.getUniformLocation(this._shader, "uColorCoding");
        this._alphaUniformPointer = gl.getUniformLocation(this._shader, "uAlpha");
        this._selectionUniformPointer = gl.getUniformLocation(this._shader, "uSelection");
        this._textureUniformPointer = gl.getUniformLocation(this._shader, "uTexture");
        this._highlightingUniformPointer = gl.getUniformLocation(this._shader, "uHighlighting");

        this._vertexAttrPointer = gl.getAttribLocation(this._shader, "aVertex"),
            this._texCoordAttrPointer = gl.getAttribLocation(this._shader, "aTexCoord"),
            this._idAttrPointer = gl.getAttribLocation(this._shader, "aId"),
            gl.enableVertexAttribArray(this._vertexAttrPointer);
        gl.enableVertexAttribArray(this._texCoordAttrPointer);
        gl.enableVertexAttribArray(this._idAttrPointer);

        //feed data into the GPU and keep pointers
        this._indexBuffer = gl.createBuffer();
        this._vertexBuffer = gl.createBuffer();
        this._texCoordBuffer = gl.createBuffer();
        this._idBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.txtCoords, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._idBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.ids, gl.STATIC_DRAW);

        //create texture
        var self = this;
        this._texture = gl.createTexture();
        if (typeof (this._image) === "undefined") {
            //add HTML UI to viewer port
            var data = CubeTextures.en;
            var image = new Image();
            self._image = image;
            image.addEventListener("load",
                () => {
                    //load image texture into GPU
                    gl.bindTexture(gl.TEXTURE_2D, self._texture);
                    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, self._image);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
                    gl.generateMipmap(gl.TEXTURE_2D);
                });
            image.src = data;
        } else {
            //load image texture into GPU
            gl.bindTexture(gl.TEXTURE_2D, self._texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, self._image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);
        }

        viewer.canvas.addEventListener('mousemove',
            (event) => {
                if (this.stopped || viewer.plugins.indexOf(this) < 0) {
                    // don't do anything if this plugin is not active
                    return;
                }


                var startX = event.clientX;
                var startY = event.clientY;

                //get coordinates within canvas (with the right orientation)
                var r = viewer.canvas.getBoundingClientRect();
                var x = startX - r.left;
                var y = viewer.height - (startY - r.top);

                //cube hasn't been drawn yet
                if (!self._region) {
                    return;
                }

                // user doing anything should cause redraw in case there is any form of interaction
                // viewer.changed = true;

                if (!self.isInRegion(x, y)) {
                    self._alpha = self.passiveAlpha;
                    self._selection = 0;
                    return;
                }

                //this is for picking
                var id = this.getId(event);
                if (id == null) {
                    self._alpha = self.passiveAlpha;
                    self._selection = 0;
                } else if (id >= self.TOP && id <= self.BACK_LEFT) {
                    self._alpha = self.activeAlpha;
                    self._selection = id;
                }
                // overdraw the cube
                this.onAfterDraw(viewer.width, viewer.height);
            },
            true);

        self._drag = false;

        viewer.canvas.addEventListener('mousedown',
            (event) => {
                // don't do anything if this plugin is not active
                if (this.stopped || viewer.plugins.indexOf(this) < 0) {
                    return;
                }


                var startX = event.clientX;
                var startY = event.clientY;

                //get coordinates within canvas (with the right orientation)
                var r = viewer.canvas.getBoundingClientRect();
                var viewX = startX - r.left;
                var viewY = viewer.height - (startY - r.top);

                // don't do anything if mousedown 
                if (!this._region || !self.isInRegion(viewX, viewY)) {
                    return;
                }

                var id = this.getId(event);
                // not an event of this plugin
                if (id == null) {
                    return;
                }

                if (id >= self.TOP && id <= self.BACK_LEFT) {
                    //change viewer navigation mode to be 'orbit'
                    self._drag = true;
                    self._originalNavigation = viewer.navigationMode;
                    viewer.navigationMode = "orbit";
                }
            },
            true);

        window.addEventListener('mouseup',
            (event) => {
                if (this.stopped || viewer.plugins.indexOf(this) < 0) {
                    // don't do anything if this plugin is not active
                    self._drag = false;
                    return;
                }

                if (self._drag === true) {
                    viewer.navigationMode = self._originalNavigation;
                }
                self._drag = false;
            },
            true);

        viewer.on('pick', (args) => {
            // normal pick where something from the model is actually selected
            if (args.model != null) {
                return;
            }

            const event = args.event;
            if (!(event instanceof MouseEvent || event instanceof TouchEvent)) {
                return;
            }

            let idArg: MouseEvent | Touch = null;
            if (event instanceof MouseEvent) {
                idArg = event;
            } else {
                const te = event as TouchEvent;
                idArg = te.changedTouches[0];
            }

            const id = this.getId(idArg);
            let dir = vec3.create();
            let heading: vec3 = vec3.fromValues(0, 0, 1);

            switch (id) {
                case this.TOP:
                    dir = vec3.fromValues(0, 0, 1);
                    heading = vec3.fromValues(0, 1, 0);
                    break;
                case this.BOTTOM:
                    dir = vec3.fromValues(0, 0, -1);
                    heading = vec3.fromValues(0, -1, 0);
                    break;
                case this.FRONT:
                    dir = vec3.fromValues(0, -1, 0);
                    break;
                case this.BACK:
                    dir = vec3.fromValues(0, 1, 0);
                    break;
                case this.LEFT:
                    dir = vec3.fromValues(-1, 0, 0);
                    break;
                case this.RIGHT:
                    dir = vec3.fromValues(1, 0, 0);
                    break;
                case this.TOP_LEFT_FRONT:
                    dir = vec3.fromValues(-1, -1, 1);
                    break;
                case this.TOP_RIGHT_FRONT:
                    dir = vec3.fromValues(1, -1, 1);
                    break;
                case this.TOP_LEFT_BACK:
                    dir = vec3.fromValues(-1, 1, 1);
                    break;
                case this.TOP_RIGHT_BACK:
                    dir = vec3.fromValues(1, 1, 1);
                    break;
                case this.BOTTOM_LEFT_FRONT:
                    dir = vec3.fromValues(-1, -1, -1);
                    break;
                case this.BOTTOM_RIGHT_FRONT:
                    dir = vec3.fromValues(1, -1, -1);
                    break;
                case this.BOTTOM_LEFT_BACK:
                    dir = vec3.fromValues(-1, 1, -1);
                    break;
                case this.BOTTOM_RIGHT_BACK:
                    dir = vec3.fromValues(1, 1, -1);
                    break;
                case this.TOP_LEFT:
                    dir = vec3.fromValues(-1, 0, 1);
                    break;
                case this.TOP_RIGHT:
                    dir = vec3.fromValues(1, 0, 1);
                    break;
                case this.TOP_FRONT:
                    dir = vec3.fromValues(0, -1, 1);
                    break;
                case this.TOP_BACK:
                    dir = vec3.fromValues(0, 1, 1);
                    break;
                case this.BOTTOM_LEFT:
                    dir = vec3.fromValues(-1, 0, -1);
                    break;
                case this.BOTTOM_RIGHT:
                    dir = vec3.fromValues(1, 0, -1);
                    break;
                case this.BOTTOM_FRONT:
                    dir = vec3.fromValues(0, -1, -1);
                    break;
                case this.BOTTOM_BACK:
                    dir = vec3.fromValues(0, 1, -1);
                    break;
                case this.FRONT_RIGHT:
                    dir = vec3.fromValues(1, -1, 0);
                    break;
                case this.FRONT_LEFT:
                    dir = vec3.fromValues(-1, -1, 0);
                    break;
                case this.BACK_RIGHT:
                    dir = vec3.fromValues(1, 1, 0);
                    break;
                case this.BACK_LEFT:
                    dir = vec3.fromValues(-1, 1, 0);
                    break;
                default:
                    return false;
            }

            const bbox = viewer.getTargetBoundingBox();
            const origin = vec3.fromValues(bbox[0] + bbox[3] / 2.0, bbox[1] + bbox[4] / 2.0, bbox[2] + bbox[5] / 2.0);
            dir = vec3.normalize(vec3.create(), dir);

            // fix to true north if needed
            if (this.trueNorth !== 0) {
                const angle = -this.trueNorth * Math.PI / 180.0;
                const rotation = quat.rotateZ(quat.create(), quat.create(), angle);
                dir = vec3.transformQuat(vec3.create(), dir, rotation);
                heading = vec3.transformQuat(vec3.create(), heading, rotation);
            }

            const widthAndDistance = viewer.getDistanceAndHeight(bbox, dir, heading);

            const shift = vec3.scale(vec3.create(), dir, widthAndDistance.distance);
            const camera = vec3.add(vec3.create(), origin, shift);

            // use look-at function to set up camera and target
            let mv = mat4.lookAt(mat4.create(), camera, origin, heading);
            this.viewer.animations.viewTo({ mv: mv, height: widthAndDistance.height }, this.viewer.zoomDuration);
        });

        this._initialized = true;

    }

    // tslint:disable: no-empty
    public onBeforeDraw(width: number, height: number) { }

    public onBeforePick(identity: ProductIdentity) {
        if (identity.model !== this._modelId || identity.id == null) {
            return false;
        }


        return true;

    }

    public onAfterDraw(width: number, height: number) {
        if (this.stopped) {
            return;
        }
        var gl = this.setActive();
        gl.disable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);

        //set uniform for colour coding to false
        gl.uniform1f(this._colourCodingUniformPointer, 0);
        this.draw(width, height);
    }

    public onBeforeDrawId() { }

    public onAfterDrawId() {
        if (this.stopped) {
            return;
        }
        var gl = this.setActive();
        //set uniform for colour coding to true
        gl.uniform1f(this._colourCodingUniformPointer, 1);
        this.draw(this.viewer.width, this.viewer.height);
    }

    public onAfterDrawModelId() {
        if (this.stopped) {
            return;
        }
        var gl = this.setActive();
        //set uniform for colour coding to this model id
        gl.uniform1f(this._colourCodingUniformPointer, this._modelId);
        this.draw(this.viewer.width, this.viewer.height);
    }

    private getId(event: MouseEvent | Touch) {
        let x = event.clientX;
        let y = event.clientY;

        //get coordinates within canvas (with the right orientation)
        let r = this.viewer.canvas.getBoundingClientRect();
        let viewX = x - r.left;
        let viewY = this.viewer.height - (y - r.top);

        const gl = this.viewer.gl;
        var fb = new Framebuffer(gl, this.viewer.width, this.viewer.height, this.viewer.hasDepthSupport, this.viewer.glVersion);
        gl.viewport(0, 0, this.viewer.width, this.viewer.height);
        gl.enable(gl.DEPTH_TEST); //we don't use any kind of blending or transparency
        gl.disable(gl.BLEND);
        // clear all
        gl.clearColor(0, 0, 0, 0); //zero colour for no-values
        // tslint:disable-next-line: no-bitwise
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this.onAfterDrawId();
        const id = fb.getId(viewX, viewY);
        fb.delete();
        return id;
    }

    private setActive(): WebGLRenderingContext {
        var gl = this.viewer.gl;
        //set own shader
        gl.useProgram(this._shader);

        return gl;
    }

    private isInRegion(x: number, y: number) {
        const minX = this._region[0] * this.viewer.width;
        const maxX = this._region[2] * this.viewer.width;
        const minY = this._region[1] * this.viewer.height;
        const maxY = this._region[3] * this.viewer.height;

        return !(x < minX || x > maxX || y < minY || y > maxY);
    }

    private draw(viewerWidth: number, viewerHeight: number) {
        if (this.stopped) {
            return;
        }

        if (!this._initialized) {
            return;
        }

        const gl = this.viewer.gl;

        const minDim = Math.min(viewerWidth, viewerHeight);
        const minRatio = this.minSize / minDim;
        const maxRatio = this.maxSize / minDim;
        let ratio = this.ratio;
        if (ratio < minRatio) {
            ratio = minRatio;
        } else if (ratio > maxRatio) {
            ratio = maxRatio;
        }

        //set navigation data from Viewer to this shader
        let pMatrix = mat4.create();
        let height = 1.0 / ratio;
        let width = height / viewerHeight * viewerWidth;
        if (viewerHeight > viewerWidth) {
            width = 1.0 / ratio;
            height = width / viewerWidth * viewerHeight;
        }

        var regionX = ratio * viewerHeight / viewerWidth * 2.0;
        var regionY = ratio * 2.0;

        //create orthogonal projection matrix
        switch (this.position) {
            case this.BOTTOM_RIGHT:
                mat4.ortho(pMatrix,
                    1.0 - width, //left
                    1.0, //right
                    -1.0, //bottom
                    height - 1.0, //top
                    -1, //near
                    1); //far
                this._region = [1 - regionX, 0.0, 1.0, regionY];
                break;
            case this.BOTTOM_LEFT:
                mat4.ortho(pMatrix,
                    -1.0, //left
                    width - 1.0, //right
                    -1.0, //bottom
                    height - 1.0, //top
                    -1, //near
                    1); //far
                this._region = [0.0, 0.0, regionX, regionY];
                break;
            case this.TOP_LEFT:
                mat4.ortho(pMatrix,
                    -1.0, //left
                    width - 1.0, //right
                    1.0 - height, //bottom
                    1.0, //top
                    -1, //near
                    1); //far
                this._region = [0.0, 1.0 - regionY, regionX, 1.0];
                break;
            case this.TOP_RIGHT:
                mat4.ortho(pMatrix,
                    1.0 - width, //left
                    1.0, //right
                    1.0 - height, //bottom
                    1.0, //top
                    -1, //near
                    1); //far
                this._region = [1.0 - regionX, 1.0 - regionY, 1.0, 1.0];
                break;
            default:
        }

        //extract just a rotation from model-view matrix
        let rotation = mat3.fromMat4(mat3
            .create(),
            this.viewer.mvMatrix);

        // adjust to true north if needed
        if (this.trueNorth !== 0) {
            const angle = -this.trueNorth * Math.PI / 180.0;
            const northRotation = mat3.fromRotation(mat3.create(), angle);
            rotation = mat3.multiply(mat3.create(), rotation, northRotation);
        }

        gl.uniformMatrix4fv(this._pMatrixUniformPointer, false, pMatrix);
        gl.uniformMatrix3fv(this._rotationUniformPointer, false, rotation);
        gl.uniform1f(this._alphaUniformPointer, this._alpha);
        gl.uniform1f(this._highlightingUniformPointer, this.highlighting);
        gl.uniform1f(this._selectionUniformPointer, this._selection);

        //bind data buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
        gl.vertexAttribPointer(this._vertexAttrPointer, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._idBuffer);
        gl.vertexAttribPointer(this._idAttrPointer, 1, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._texCoordBuffer);
        gl.vertexAttribPointer(this._texCoordAttrPointer, 2, gl.FLOAT, false, 0, 0);
        
        //bind texture
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this._texture);
        gl.uniform1i(this._textureUniformPointer, 1);
        
        var cfEnabled = gl.getParameter(gl.CULL_FACE);
        if (!cfEnabled) {
            gl.enable(gl.CULL_FACE);
        }
        
        gl.disable(gl.BLEND);
        
        //draw the cube as an element array
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);

        if (!cfEnabled) {
            gl.disable(gl.CULL_FACE);
        }

    }

    private _initShader(): void {

        var gl = this.viewer.gl;
        var viewer = this.viewer;
        var compile = (shader, code) => {
            gl.shaderSource(shader, code);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                let msg = gl.getShaderInfoLog(shader);
                viewer.error(msg);
                return null;
            }
        };

        //fragment shader
        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        compile(fragmentShader, cube_fshader);

        //vertex shader (the more complicated one)
        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        compile(vertexShader, cube_vshader);

        //link program
        this._shader = gl.createProgram();
        gl.attachShader(this._shader, vertexShader);
        gl.attachShader(this._shader, fragmentShader);
        gl.linkProgram(this._shader);

        if (!gl.getProgramParameter(this._shader, gl.LINK_STATUS)) {
            viewer.error('Could not initialise shaders for a navigation cube plugin');
        }
    }


    public vertices = new Float32Array([
        // Front face
        -0.3, -0.5, -0.3,
        0.3, -0.5, -0.3,
        0.3, -0.5, 0.3,
        -0.3, -0.5, 0.3,

        // Back face
        -0.3, 0.5, -0.3,
        -0.3, 0.5, 0.3,
        0.3, 0.5, 0.3,
        0.3, 0.5, -0.3,


        // Top face
        -0.3, -0.3, 0.5,
        0.3, -0.3, 0.5,
        0.3, 0.3, 0.5,
        -0.3, 0.3, 0.5,

        // Bottom face
        -0.3, -0.3, -0.5,
        -0.3, 0.3, -0.5,
        0.3, 0.3, -0.5,
        0.3, -0.3, -0.5,

        // Right face
        0.5, -0.3, -0.3,
        0.5, 0.3, -0.3,
        0.5, 0.3, 0.3,
        0.5, -0.3, 0.3,

        // Left face
        -0.5, -0.3, -0.3,
        -0.5, -0.3, 0.3,
        -0.5, 0.3, 0.3,
        -0.5, 0.3, -0.3,

        //top - left - front (--+)
        -0.5, -0.5, 0.5,
        -0.3, -0.5, 0.5,
        -0.3, -0.3, 0.5,
        -0.5, -0.3, 0.5,
        -0.5, -0.5, 0.3,
        -0.5, -0.5, 0.5,
        -0.5, -0.3, 0.5,
        -0.5, -0.3, 0.3,
        -0.5, -0.5, 0.3,
        -0.3, -0.5, 0.3,
        -0.3, -0.5, 0.5,
        -0.5, -0.5, 0.5,

        //top-right-front (+-+)
        0.3, -0.5, 0.5,
        0.5, -0.5, 0.5,
        0.5, -0.3, 0.5,
        0.3, -0.3, 0.5,
        0.5, -0.5, 0.3,
        0.5, -0.3, 0.3,
        0.5, -0.3, 0.5,
        0.5, -0.5, 0.5,
        0.3, -0.5, 0.3,
        0.5, -0.5, 0.3,
        0.5, -0.5, 0.5,
        0.3, -0.5, 0.5,

        //top-left-back (-++)
        -0.5, 0.3, 0.5,
        -0.3, 0.3, 0.5,
        -0.3, 0.5, 0.5,
        -0.5, 0.5, 0.5,
        -0.5, 0.3, 0.3,
        -0.5, 0.3, 0.5,
        -0.5, 0.5, 0.5,
        -0.5, 0.5, 0.3,
        -0.5, 0.5, 0.3,
        -0.5, 0.5, 0.5,
        -0.3, 0.5, 0.5,
        -0.3, 0.5, 0.3,

        //top-right-back (+++)
        0.3, 0.3, 0.5,
        0.5, 0.3, 0.5,
        0.5, 0.5, 0.5,
        0.3, 0.5, 0.5,
        0.5, 0.3, 0.3,
        0.5, 0.5, 0.3,
        0.5, 0.5, 0.5,
        0.5, 0.3, 0.5,
        0.3, 0.5, 0.3,
        0.3, 0.5, 0.5,
        0.5, 0.5, 0.5,
        0.5, 0.5, 0.3,

        //bottom - left - front (---)
        -0.5, -0.5, -0.5,
        -0.3, -0.5, -0.5,
        -0.3, -0.3, -0.5,
        -0.5, -0.3, -0.5,
        -0.5, -0.5, -0.5,
        -0.5, -0.5, -0.3,
        -0.5, -0.3, -0.3,
        -0.5, -0.3, -0.5,
        -0.5, -0.5, -0.5,
        -0.3, -0.5, -0.5,
        -0.3, -0.5, -0.3,
        -0.5, -0.5, -0.3,

        //bottom-right-front (+--)
        0.3, -0.5, -0.5,
        0.5, -0.5, -0.5,
        0.5, -0.3, -0.5,
        0.3, -0.3, -0.5,
        0.5, -0.5, -0.5,
        0.5, -0.3, -0.5,
        0.5, -0.3, -0.3,
        0.5, -0.5, -0.3,
        0.3, -0.5, -0.5,
        0.5, -0.5, -0.5,
        0.5, -0.5, -0.3,
        0.3, -0.5, -0.3,

        //bottom-left-back (-+-)
        -0.5, 0.3, -0.5,
        -0.3, 0.3, -0.5,
        -0.3, 0.5, -0.5,
        -0.5, 0.5, -0.5,
        -0.5, 0.3, -0.5,
        -0.5, 0.3, -0.3,
        -0.5, 0.5, -0.3,
        -0.5, 0.5, -0.5,
        -0.5, 0.5, -0.5,
        -0.5, 0.5, -0.3,
        -0.3, 0.5, -0.3,
        -0.3, 0.5, -0.5,

        //bottom-right-back (++-)
        0.3, 0.3, -0.5,
        0.5, 0.3, -0.5,
        0.5, 0.5, -0.5,
        0.3, 0.5, -0.5,
        0.5, 0.3, -0.5,
        0.5, 0.5, -0.5,
        0.5, 0.5, -0.3,
        0.5, 0.3, -0.3,
        0.3, 0.5, -0.5,
        0.3, 0.5, -0.3,
        0.5, 0.5, -0.3,
        0.5, 0.5, -0.5,

        //top-right (+0+)
        0.3, -0.3, 0.5,
        0.5, -0.3, 0.5,
        0.5, 0.3, 0.5,
        0.3, 0.3, 0.5,
        0.5, -0.3, 0.3,
        0.5, 0.3, 0.3,
        0.5, 0.3, 0.5,
        0.5, -0.3, 0.5,

        //top-left (-0+)
        -0.5, -0.3, 0.5,
        -0.3, -0.3, 0.5,
        -0.3, 0.3, 0.5,
        -0.5, 0.3, 0.5,
        -0.5, -0.3, 0.3,
        -0.5, -0.3, 0.5,
        -0.5, 0.3, 0.5,
        -0.5, 0.3, 0.3,

        //top-front (0-+)
        -0.3, -0.5, 0.5,
        0.3, -0.5, 0.5,
        0.3, -0.3, 0.5,
        -0.3, -0.3, 0.5,
        -0.3, -0.5, 0.3,
        0.3, -0.5, 0.3,
        0.3, -0.5, 0.5,
        -0.3, -0.5, 0.5,

        //top-back (0++)
        -0.3, 0.3, 0.5,
        0.3, 0.3, 0.5,
        0.3, 0.5, 0.5,
        -0.3, 0.5, 0.5,
        -0.3, 0.5, 0.3,
        -0.3, 0.5, 0.5,
        0.3, 0.5, 0.5,
        0.3, 0.5, 0.3,

        //bottom-right (+0-)
        0.3, -0.3, -0.5,
        0.5, -0.3, -0.5,
        0.5, 0.3, -0.5,
        0.3, 0.3, -0.5,
        0.5, -0.3, -0.5,
        0.5, 0.3, -0.5,
        0.5, 0.3, -0.3,
        0.5, -0.3, -0.3,

        //bottom-left (-0-)
        -0.5, -0.3, -0.5,
        -0.5, 0.3, -0.5,
        -0.3, 0.3, -0.5,
        -0.3, -0.3, -0.5,
        -0.5, -0.3, -0.5,
        -0.5, -0.3, -0.3,
        -0.5, 0.3, -0.3,
        -0.5, 0.3, -0.5,

        //bottom-front (0--)
        -0.3, -0.5, -0.5,
        0.3, -0.5, -0.5,
        0.3, -0.3, -0.5,
        -0.3, -0.3, -0.5,
        -0.3, -0.5, -0.5,
        0.3, -0.5, -0.5,
        0.3, -0.5, -0.3,
        -0.3, -0.5, -0.3,

        //bottom-back (0+-)
        -0.3, 0.3, -0.5,
        0.3, 0.3, -0.5,
        0.3, 0.5, -0.5,
        -0.3, 0.5, -0.5,
        -0.3, 0.5, -0.5,
        -0.3, 0.5, -0.3,
        0.3, 0.5, -0.3,
        0.3, 0.5, -0.5,

        //front-right (+-0)
        0.3, -0.5, -0.3,
        0.5, -0.5, -0.3,
        0.5, -0.5, 0.3,
        0.3, -0.5, 0.3,
        0.5, -0.5, -0.3,
        0.5, -0.3, -0.3,
        0.5, -0.3, 0.3,
        0.5, -0.5, 0.3,

        //front-left (--0)
        -0.5, -0.5, -0.3,
        -0.3, -0.5, -0.3,
        -0.3, -0.5, 0.3,
        -0.5, -0.5, 0.3,
        -0.5, -0.5, -0.3,
        -0.5, -0.5, 0.3,
        -0.5, -0.3, 0.3,
        -0.5, -0.3, -0.3,

        //back-right (++0)
        0.3, 0.5, -0.3,
        0.3, 0.5, 0.3,
        0.5, 0.5, 0.3,
        0.5, 0.5, -0.3,
        0.5, 0.3, -0.3,
        0.5, 0.5, -0.3,
        0.5, 0.5, 0.3,
        0.5, 0.3, 0.3,

        //back-left (-+0)
        -0.5, 0.5, -0.3,
        -0.5, 0.5, 0.3,
        -0.3, 0.5, 0.3,
        -0.3, 0.5, -0.3,
        -0.5, 0.3, -0.3,
        -0.5, 0.3, 0.3,
        -0.5, 0.5, 0.3,
        -0.5, 0.5, -0.3,
    ]);


    //// Front face
    //-0.5, -0.5, -0.5,
    // 0.5, -0.5, -0.5,
    // 0.5, -0.5, 0.5,
    //-0.5, -0.5, 0.5,
    //
    //// Back face
    //-0.5, 0.5, -0.5,
    //-0.5, 0.5, 0.5,
    // 0.5, 0.5, 0.5,
    // 0.5, 0.5, -0.5,
    //
    //// Top face
    //-0.5, -0.5, 0.5,
    // 0.5, -0.5, 0.5,
    // 0.5, 0.5, 0.5,
    //-0.5, 0.5, 0.5,
    //
    //// Bottom face
    //-0.5, -0.5, -0.5,
    //-0.5, 0.5, -0.5,
    // 0.5, 0.5, -0.5,
    // 0.5, -0.5, -0.5,
    //
    //// Right face
    // 0.5, -0.5, -0.5,
    // 0.5, 0.5, -0.5,
    // 0.5, 0.5, 0.5,
    // 0.5, -0.5, 0.5,
    //
    //// Left face
    //-0.5, -0.5, -0.5,
    //-0.5, -0.5, 0.5,
    //-0.5, 0.5, 0.5,
    //-0.5, 0.5, -0.5,

    private indices = new Uint16Array([
        0, 1, 2, 0, 2, 3, // Front face
        4, 5, 6, 4, 6, 7, // Back face
        8, 9, 10, 8, 10, 11, // Top face
        12, 13, 14, 12, 14, 15, // Bottom face
        16, 17, 18, 16, 18, 19, // Right face
        20, 21, 22, 20, 22, 23, // Left face

        //top - left - front 
        0 + 24, 1 + 24, 2 + 24, 0 + 24, 2 + 24, 3 + 24,
        4 + 24, 5 + 24, 6 + 24, 4 + 24, 6 + 24, 7 + 24,
        8 + 24, 9 + 24, 10 + 24, 8 + 24, 10 + 24, 11 + 24,

        //top-right-front 
        0 + 36, 1 + 36, 2 + 36, 0 + 36, 2 + 36, 3 + 36,
        4 + 36, 5 + 36, 6 + 36, 4 + 36, 6 + 36, 7 + 36,
        8 + 36, 9 + 36, 10 + 36, 8 + 36, 10 + 36, 11 + 36,

        //top-left-back 
        0 + 48, 1 + 48, 2 + 48, 0 + 48, 2 + 48, 3 + 48,
        4 + 48, 5 + 48, 6 + 48, 4 + 48, 6 + 48, 7 + 48,
        8 + 48, 9 + 48, 10 + 48, 8 + 48, 10 + 48, 11 + 48,

        //top-right-back
        0 + 60, 1 + 60, 2 + 60, 0 + 60, 2 + 60, 3 + 60,
        4 + 60, 5 + 60, 6 + 60, 4 + 60, 6 + 60, 7 + 60,
        8 + 60, 9 + 60, 10 + 60, 8 + 60, 10 + 60, 11 + 60,

        //bottom - left - front
        0 + 72, 2 + 72, 1 + 72, 0 + 72, 3 + 72, 2 + 72,
        4 + 72, 5 + 72, 6 + 72, 4 + 72, 6 + 72, 7 + 72,
        8 + 72, 9 + 72, 10 + 72, 8 + 72, 10 + 72, 11 + 72,

        //bottom-right-front 
        0 + 84, 2 + 84, 1 + 84, 0 + 84, 3 + 84, 2 + 84,
        4 + 84, 5 + 84, 6 + 84, 4 + 84, 6 + 84, 7 + 84,
        8 + 84, 9 + 84, 10 + 84, 8 + 84, 10 + 84, 11 + 84,

        //bottom-left-back 
        0 + 96, 2 + 96, 1 + 96, 0 + 96, 3 + 96, 2 + 96,
        4 + 96, 5 + 96, 6 + 96, 4 + 96, 6 + 96, 7 + 96,
        8 + 96, 9 + 96, 10 + 96, 8 + 96, 10 + 96, 11 + 96,

        //bottom-right-back
        0 + 108, 2 + 108, 1 + 108, 0 + 108, 3 + 108, 2 + 108,
        4 + 108, 5 + 108, 6 + 108, 4 + 108, 6 + 108, 7 + 108,
        8 + 108, 9 + 108, 10 + 108, 8 + 108, 10 + 108, 11 + 108,

        //top-right
        0 + 120, 1 + 120, 2 + 120, 0 + 120, 2 + 120, 3 + 120,
        4 + 120, 5 + 120, 6 + 120, 4 + 120, 6 + 120, 7 + 120,

        //top-left
        0 + 128, 1 + 128, 2 + 128, 0 + 128, 2 + 128, 3 + 128,
        4 + 128, 5 + 128, 6 + 128, 4 + 128, 6 + 128, 7 + 128,

        //top-front
        0 + 136, 1 + 136, 2 + 136, 0 + 136, 2 + 136, 3 + 136,
        4 + 136, 5 + 136, 6 + 136, 4 + 136, 6 + 136, 7 + 136,

        //top-back
        0 + 144, 1 + 144, 2 + 144, 0 + 144, 2 + 144, 3 + 144,
        4 + 144, 5 + 144, 6 + 144, 4 + 144, 6 + 144, 7 + 144,

        //bottom-right
        0 + 152, 2 + 152, 1 + 152, 0 + 152, 3 + 152, 2 + 152,
        4 + 152, 5 + 152, 6 + 152, 4 + 152, 6 + 152, 7 + 152,

        //bottom-left
        0 + 160, 1 + 160, 2 + 160, 0 + 160, 2 + 160, 3 + 160,
        4 + 160, 5 + 160, 6 + 160, 4 + 160, 6 + 160, 7 + 160,

        //bottom-front
        0 + 168, 2 + 168, 1 + 168, 0 + 168, 3 + 168, 2 + 168,
        4 + 168, 5 + 168, 6 + 168, 4 + 168, 6 + 168, 7 + 168,

        //bottom-back
        0 + 176, 2 + 176, 1 + 176, 0 + 176, 3 + 176, 2 + 176,
        4 + 176, 5 + 176, 6 + 176, 4 + 176, 6 + 176, 7 + 176,

        //front-right
        0 + 184, 1 + 184, 2 + 184, 0 + 184, 2 + 184, 3 + 184,
        4 + 184, 5 + 184, 6 + 184, 4 + 184, 6 + 184, 7 + 184,

        //front-left
        0 + 192, 1 + 192, 2 + 192, 0 + 192, 2 + 192, 3 + 192,
        4 + 192, 5 + 192, 6 + 192, 4 + 192, 6 + 192, 7 + 192,

        //back-right
        0 + 200, 1 + 200, 2 + 200, 0 + 200, 2 + 200, 3 + 200,
        4 + 200, 5 + 200, 6 + 200, 4 + 200, 6 + 200, 7 + 200,

        //back-left
        0 + 208, 1 + 208, 2 + 208, 0 + 208, 2 + 208, 3 + 208,
        4 + 208, 5 + 208, 6 + 208, 4 + 208, 6 + 208, 7 + 208,
    ]);

    //// Front face
    //1.0 / 3.0, 0.0 / 3.0,
    //2.0 / 3.0, 0.0 / 3.0,
    //2.0 / 3.0, 1.0 / 3.0,
    //1.0 / 3.0, 1.0 / 3.0,
    //
    //// Back face
    //1.0, 0.0 / 3.0,
    //1.0, 1.0 / 3.0,
    //2.0 / 3.0, 1.0 / 3.0,
    //2.0 / 3.0, 0.0 / 3.0,
    //
    //
    //// Top face
    //2.0 / 3.0, 1.0 / 3.0,
    //1.0, 1.0 / 3.0,
    //1.0, 2.0 / 3.0,
    //2.0 / 3.0, 2.0 / 3.0,
    //
    //// Bottom face
    //0.0, 1.0 / 3.0,
    //0.0, 0.0 / 3.0,
    //1.0 / 3.0, 0.0 / 3.0,
    //1.0 / 3.0, 1.0 / 3.0,
    //
    //// Right face
    //0.0, 1.0 / 3.0,
    //1.0 / 3.0, 1.0 / 3.0,
    //1.0 / 3.0, 2.0 / 3.0,
    //0.0, 2.0 / 3.0,
    //
    //// Left face
    //2.0 / 3.0, 1.0 / 3.0,
    //2.0 / 3.0, 2.0 / 3.0,
    //1.0 / 3.0, 2.0 / 3.0,
    //1.0 / 3.0, 1.0 / 3.0

    private txtCoords = new Float32Array([
        // Front face
        1.0 / 3.0 + 1.0 / 15.0, 0.0 / 3.0 + 1.0 / 15.0,
        2.0 / 3.0 - 1.0 / 15.0, 0.0 / 3.0 + 1.0 / 15.0,
        2.0 / 3.0 - 1.0 / 15.0, 1.0 / 3.0 - 1.0 / 15.0,
        1.0 / 3.0 + 1.0 / 15.0, 1.0 / 3.0 - 1.0 / 15.0,

        // Back face
        1.0 - 1.0 / 15.0, 0.0 / 3.0 + 1.0 / 15.0,
        1.0 - 1.0 / 15.0, 1.0 / 3.0 - 1.0 / 15.0,
        2.0 / 3.0 + 1.0 / 15.0, 1.0 / 3.0 - 1.0 / 15.0,
        2.0 / 3.0 + 1.0 / 15.0, 0.0 / 3.0 + 1.0 / 15.0,


        // Top face
        2.0 / 3.0 + 1.0 / 15.0, 1.0 / 3.0 + 1.0 / 15.0,
        1.0 - 1.0 / 15.0, 1.0 / 3.0 + 1.0 / 15.0,
        1.0 - 1.0 / 15.0, 2.0 / 3.0 - 1.0 / 15.0,
        2.0 / 3.0 + 1.0 / 15.0, 2.0 / 3.0 - 1.0 / 15.0,

        // Bottom face
        0.0 + 1.0 / 15.0, 1.0 / 3.0 - 1.0 / 15.0,
        0.0 + 1.0 / 15.0, 0.0 / 3.0 + 1.0 / 15.0,
        1.0 / 3.0 - 1.0 / 15.0, 0.0 / 3.0 + 1.0 / 15.0,
        1.0 / 3.0 - 1.0 / 15.0, 1.0 / 3.0 - 1.0 / 15.0,

        // Right face
        0.0 + 1.0 / 15.0, 1.0 / 3.0 + 1.0 / 15.0,
        1.0 / 3.0 - 1.0 / 15.0, 1.0 / 3.0 + 1.0 / 15.0,
        1.0 / 3.0 - 1.0 / 15.0, 2.0 / 3.0 - 1.0 / 15.0,
        0.0 + 1.0 / 15.0, 2.0 / 3.0 - 1.0 / 15.0,

        // Left face
        2.0 / 3.0 - 1.0 / 15.0, 1.0 / 3.0 + 1.0 / 15.0,
        2.0 / 3.0 - 1.0 / 15.0, 2.0 / 3.0 - 1.0 / 15.0,
        1.0 / 3.0 + 1.0 / 15.0, 2.0 / 3.0 - 1.0 / 15.0,
        1.0 / 3.0 + 1.0 / 15.0, 1.0 / 3.0 + 1.0 / 15.0,

        //top - left - front 
        2.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        2.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        2.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        2.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
        1.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
        1.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
        1.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,

        //top-right-front 
        2.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        2.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        2.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        2.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
        1.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
        1.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
        1.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,

        //top-left-back 
        2.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        2.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        2.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        2.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        2.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
        2.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
        2.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
        2.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,

        //top-right-back 
        2.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        2.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        2.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        2.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        2.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
        2.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
        2.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
        2.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,

        //bottom - left - front 
        1.0 / 30.0, 1.0 / 30.0,
        1.0 / 30.0, 1.0 / 30.0,
        1.0 / 30.0, 1.0 / 30.0,
        1.0 / 30.0, 1.0 / 30.0,
        1.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
        1.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
        1.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
        1.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,

        //bottom-right-front 
        1.0 / 30.0, 1.0 / 30.0,
        1.0 / 30.0, 1.0 / 30.0,
        1.0 / 30.0, 1.0 / 30.0,
        1.0 / 30.0, 1.0 / 30.0,
        1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
        1.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
        1.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
        1.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,

        //bottom-left-back 
        1.0 / 30.0, 1.0 / 30.0,
        1.0 / 30.0, 1.0 / 30.0,
        1.0 / 30.0, 1.0 / 30.0,
        1.0 / 30.0, 1.0 / 30.0,
        1.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        2.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
        2.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
        2.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
        2.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,

        //bottom-right-back 
        1.0 / 30.0, 1.0 / 30.0,
        1.0 / 30.0, 1.0 / 30.0,
        1.0 / 30.0, 1.0 / 30.0,
        1.0 / 30.0, 1.0 / 30.0,
        1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        2.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
        2.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
        2.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
        2.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,

        //top-right
        2.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        2.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        2.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        2.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,

        //top-left
        2.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        2.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        2.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        2.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,

        //top-front
        2.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        2.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        2.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        2.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
        1.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
        1.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
        1.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,

        //top-back
        2.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        2.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        2.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        2.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        2.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
        2.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
        2.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
        2.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,

        //bottom-right
        2.0 / 30.0, 1.0 / 30.0,
        2.0 / 30.0, 1.0 / 30.0,
        2.0 / 30.0, 1.0 / 30.0,
        2.0 / 30.0, 1.0 / 30.0,
        2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,

        //bottom-left
        2.0 / 30.0, 1.0 / 30.0,
        2.0 / 30.0, 1.0 / 30.0,
        2.0 / 30.0, 1.0 / 30.0,
        2.0 / 30.0, 1.0 / 30.0,
        1.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,

        //bottom-front
        2.0 / 30.0, 1.0 / 30.0,
        2.0 / 30.0, 1.0 / 30.0,
        2.0 / 30.0, 1.0 / 30.0,
        2.0 / 30.0, 1.0 / 30.0,
        1.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
        1.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
        1.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
        1.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,

        //bottom-back
        2.0 / 30.0, 1.0 / 30.0,
        2.0 / 30.0, 1.0 / 30.0,
        2.0 / 30.0, 1.0 / 30.0,
        2.0 / 30.0, 1.0 / 30.0,
        2.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
        2.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
        2.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
        2.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,

        //front-right
        1.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
        1.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
        1.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
        1.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
        2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,

        //front-left
        1.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
        1.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
        1.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
        1.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
        1.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,

        //back-right
        2.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
        2.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
        2.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
        2.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
        2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,

        //back-left
        2.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
        2.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
        2.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
        2.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
        1.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
        1.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
    ]);

    private ids = new Float32Array([
        this.FRONT, // Front face
        this.FRONT,
        this.FRONT,
        this.FRONT,
        this.BACK, // Back face
        this.BACK,
        this.BACK,
        this.BACK,
        this.TOP, // Top face
        this.TOP,
        this.TOP,
        this.TOP,
        this.BOTTOM, // Bottom face
        this.BOTTOM,
        this.BOTTOM,
        this.BOTTOM,
        this.RIGHT, // Right face
        this.RIGHT,
        this.RIGHT,
        this.RIGHT,
        this.LEFT, // Left face
        this.LEFT,
        this.LEFT,
        this.LEFT,
        this.TOP_LEFT_FRONT,
        this.TOP_LEFT_FRONT,
        this.TOP_LEFT_FRONT,
        this.TOP_LEFT_FRONT,
        this.TOP_LEFT_FRONT,
        this.TOP_LEFT_FRONT,
        this.TOP_LEFT_FRONT,
        this.TOP_LEFT_FRONT,
        this.TOP_LEFT_FRONT,
        this.TOP_LEFT_FRONT,
        this.TOP_LEFT_FRONT,
        this.TOP_LEFT_FRONT,
        this.TOP_RIGHT_FRONT,
        this.TOP_RIGHT_FRONT,
        this.TOP_RIGHT_FRONT,
        this.TOP_RIGHT_FRONT,
        this.TOP_RIGHT_FRONT,
        this.TOP_RIGHT_FRONT,
        this.TOP_RIGHT_FRONT,
        this.TOP_RIGHT_FRONT,
        this.TOP_RIGHT_FRONT,
        this.TOP_RIGHT_FRONT,
        this.TOP_RIGHT_FRONT,
        this.TOP_RIGHT_FRONT,
        this.TOP_LEFT_BACK,
        this.TOP_LEFT_BACK,
        this.TOP_LEFT_BACK,
        this.TOP_LEFT_BACK,
        this.TOP_LEFT_BACK,
        this.TOP_LEFT_BACK,
        this.TOP_LEFT_BACK,
        this.TOP_LEFT_BACK,
        this.TOP_LEFT_BACK,
        this.TOP_LEFT_BACK,
        this.TOP_LEFT_BACK,
        this.TOP_LEFT_BACK,
        this.TOP_RIGHT_BACK,
        this.TOP_RIGHT_BACK,
        this.TOP_RIGHT_BACK,
        this.TOP_RIGHT_BACK,
        this.TOP_RIGHT_BACK,
        this.TOP_RIGHT_BACK,
        this.TOP_RIGHT_BACK,
        this.TOP_RIGHT_BACK,
        this.TOP_RIGHT_BACK,
        this.TOP_RIGHT_BACK,
        this.TOP_RIGHT_BACK,
        this.TOP_RIGHT_BACK,
        this.BOTTOM_LEFT_FRONT,
        this.BOTTOM_LEFT_FRONT,
        this.BOTTOM_LEFT_FRONT,
        this.BOTTOM_LEFT_FRONT,
        this.BOTTOM_LEFT_FRONT,
        this.BOTTOM_LEFT_FRONT,
        this.BOTTOM_LEFT_FRONT,
        this.BOTTOM_LEFT_FRONT,
        this.BOTTOM_LEFT_FRONT,
        this.BOTTOM_LEFT_FRONT,
        this.BOTTOM_LEFT_FRONT,
        this.BOTTOM_LEFT_FRONT,
        this.BOTTOM_RIGHT_FRONT,
        this.BOTTOM_RIGHT_FRONT,
        this.BOTTOM_RIGHT_FRONT,
        this.BOTTOM_RIGHT_FRONT,
        this.BOTTOM_RIGHT_FRONT,
        this.BOTTOM_RIGHT_FRONT,
        this.BOTTOM_RIGHT_FRONT,
        this.BOTTOM_RIGHT_FRONT,
        this.BOTTOM_RIGHT_FRONT,
        this.BOTTOM_RIGHT_FRONT,
        this.BOTTOM_RIGHT_FRONT,
        this.BOTTOM_RIGHT_FRONT,
        this.BOTTOM_LEFT_BACK,
        this.BOTTOM_LEFT_BACK,
        this.BOTTOM_LEFT_BACK,
        this.BOTTOM_LEFT_BACK,
        this.BOTTOM_LEFT_BACK,
        this.BOTTOM_LEFT_BACK,
        this.BOTTOM_LEFT_BACK,
        this.BOTTOM_LEFT_BACK,
        this.BOTTOM_LEFT_BACK,
        this.BOTTOM_LEFT_BACK,
        this.BOTTOM_LEFT_BACK,
        this.BOTTOM_LEFT_BACK,
        this.BOTTOM_RIGHT_BACK,
        this.BOTTOM_RIGHT_BACK,
        this.BOTTOM_RIGHT_BACK,
        this.BOTTOM_RIGHT_BACK,
        this.BOTTOM_RIGHT_BACK,
        this.BOTTOM_RIGHT_BACK,
        this.BOTTOM_RIGHT_BACK,
        this.BOTTOM_RIGHT_BACK,
        this.BOTTOM_RIGHT_BACK,
        this.BOTTOM_RIGHT_BACK,
        this.BOTTOM_RIGHT_BACK,
        this.BOTTOM_RIGHT_BACK,
        this.TOP_RIGHT,
        this.TOP_RIGHT,
        this.TOP_RIGHT,
        this.TOP_RIGHT,
        this.TOP_RIGHT,
        this.TOP_RIGHT,
        this.TOP_RIGHT,
        this.TOP_RIGHT,
        this.TOP_LEFT,
        this.TOP_LEFT,
        this.TOP_LEFT,
        this.TOP_LEFT,
        this.TOP_LEFT,
        this.TOP_LEFT,
        this.TOP_LEFT,
        this.TOP_LEFT,
        this.TOP_FRONT,
        this.TOP_FRONT,
        this.TOP_FRONT,
        this.TOP_FRONT,
        this.TOP_FRONT,
        this.TOP_FRONT,
        this.TOP_FRONT,
        this.TOP_FRONT,
        this.TOP_BACK,
        this.TOP_BACK,
        this.TOP_BACK,
        this.TOP_BACK,
        this.TOP_BACK,
        this.TOP_BACK,
        this.TOP_BACK,
        this.TOP_BACK,
        this.BOTTOM_RIGHT,
        this.BOTTOM_RIGHT,
        this.BOTTOM_RIGHT,
        this.BOTTOM_RIGHT,
        this.BOTTOM_RIGHT,
        this.BOTTOM_RIGHT,
        this.BOTTOM_RIGHT,
        this.BOTTOM_RIGHT,
        this.BOTTOM_LEFT,
        this.BOTTOM_LEFT,
        this.BOTTOM_LEFT,
        this.BOTTOM_LEFT,
        this.BOTTOM_LEFT,
        this.BOTTOM_LEFT,
        this.BOTTOM_LEFT,
        this.BOTTOM_LEFT,
        this.BOTTOM_FRONT,
        this.BOTTOM_FRONT,
        this.BOTTOM_FRONT,
        this.BOTTOM_FRONT,
        this.BOTTOM_FRONT,
        this.BOTTOM_FRONT,
        this.BOTTOM_FRONT,
        this.BOTTOM_FRONT,
        this.BOTTOM_BACK,
        this.BOTTOM_BACK,
        this.BOTTOM_BACK,
        this.BOTTOM_BACK,
        this.BOTTOM_BACK,
        this.BOTTOM_BACK,
        this.BOTTOM_BACK,
        this.BOTTOM_BACK,
        this.FRONT_RIGHT,
        this.FRONT_RIGHT,
        this.FRONT_RIGHT,
        this.FRONT_RIGHT,
        this.FRONT_RIGHT,
        this.FRONT_RIGHT,
        this.FRONT_RIGHT,
        this.FRONT_RIGHT,
        this.FRONT_LEFT,
        this.FRONT_LEFT,
        this.FRONT_LEFT,
        this.FRONT_LEFT,
        this.FRONT_LEFT,
        this.FRONT_LEFT,
        this.FRONT_LEFT,
        this.FRONT_LEFT,
        this.BACK_RIGHT,
        this.BACK_RIGHT,
        this.BACK_RIGHT,
        this.BACK_RIGHT,
        this.BACK_RIGHT,
        this.BACK_RIGHT,
        this.BACK_RIGHT,
        this.BACK_RIGHT,
        this.BACK_LEFT,
        this.BACK_LEFT,
        this.BACK_LEFT,
        this.BACK_LEFT,
        this.BACK_LEFT,
        this.BACK_LEFT,
        this.BACK_LEFT,
        this.BACK_LEFT,
    ]);
}
