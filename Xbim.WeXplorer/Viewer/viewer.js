"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var state_1 = require("./state");
var product_type_1 = require("./product-type");
var model_geometry_1 = require("./model-geometry");
var model_handle_1 = require("./model-handle");
var shaders_1 = require("./shaders/shaders");
var framebuffer_1 = require("./framebuffer");
//ported libraries
var webgl_utils_1 = require("./common/webgl-utils");
var vec3_1 = require("./matrix/vec3");
var mat3_1 = require("./matrix/mat3");
var mat4_1 = require("./matrix/mat4");
var Viewer = (function () {
    /**
    * This is constructor of the xBIM Viewer. It gets HTMLCanvasElement or string ID as an argument. Viewer will than be initialized
    * in the context of specified canvas. Any other argument will throw exception.
    * @name Viewer
    * @constructor
    * @classdesc This is the main and the only class you need to load and render IFC models in wexBIM format. This viewer is part of
    * xBIM toolkit which can be used to create wexBIM files from IFC, ifcZIP and ifcXML. WexBIM files are highly optimized for
    * transmition over internet and rendering performance. Viewer uses WebGL technology for hardware accelerated 3D rendering and SVG for
    * certain kinds of user interaction. This means that it won't work with obsolete and non-standard-compliant browsers like IE10 and less.
    *
    * @param {string | HTMLCanvasElement} canvas - string ID of the canvas or HTML canvas element.
    */
    function Viewer(canvas) {
        var _this = this;
        this._isShiftKeyDown = false;
        this._lastActiveHandlesCount = 0;
        this._rotationOn = false;
        if (typeof (canvas) == 'undefined') {
            throw 'Canvas has to be defined';
        }
        if (typeof (canvas['nodeName']) != 'undefined' && canvas['nodeName'] === 'CANVAS') {
            this.canvas = canvas;
        }
        if (typeof (canvas) == 'string') {
            this.canvas = document.getElementById(canvas);
        }
        if (this.canvas == null) {
            throw 'You have to specify canvas either as an ID of HTML element or the element itself';
        }
        /**
        * This is a structure that holds settings of perspective camera.
        * @member {PerspectiveCamera} Viewer#perspectiveCamera
        */
        /**
        * This is only a structure. Don't call the constructor.
        * @classdesc This is a structure that holds settings of perspective camera. If you want
        * to switch viewer to use perspective camera set {@link Viewer#camera camera} to 'perspective'.
        * You can modify this but it is not necessary because sensible values are
        * defined when geometry model is loaded with {@link Viewer#load load()} method. If you want to
        * change these values you have to do it after geometry is loaded.
        * @class
        * @name PerspectiveCamera
        */
        this.perspectiveCamera = {
            /** @member {Number} PerspectiveCamera#fov - Field of view*/
            fov: 45,
            /** @member {Number} PerspectiveCamera#near - Near cutting plane*/
            near: 0,
            /** @member {Number} PerspectiveCamera#far - Far cutting plane*/
            far: 0
        };
        /**
        * This is a structure that holds settings of orthogonal camera. You can modify this but it is not necessary because sensible values are
        * defined when geometry model is loaded with {@link Viewer#load load()} method. If you want to change these values you have to do it after geometry is loaded.
        * @member {OrthogonalCamera} Viewer#orthogonalCamera
        */
        /**
        * This is only a structure. Don't call the constructor.
        * @classdesc This is a structure that holds settings of orthogonal camera. If you want to switch viewer to use orthogonal camera set {@link Viewer#camera camera} to 'orthogonal'.
        * @class
        * @name OrthogonalCamera
        */
        this.orthogonalCamera = {
            /** @member {Number} OrthogonalCamera#left*/
            left: 0,
            /** @member {Number} OrthogonalCamera#right*/
            right: 0,
            /** @member {Number} OrthogonalCamera#top*/
            top: 0,
            /** @member {Number} OrthogonalCamera#bottom*/
            bottom: 0,
            /** @member {Number} OrthogonalCamera#near*/
            near: 0,
            /** @member {Number} OrthogonalCamera#far*/
            far: 0
        };
        /**
        * Type of camera to be used. Available values are <strong>'perspective'</strong> and <strong>'orthogonal'</strong> You can change this value at any time with instant effect.
        * @member {string} Viewer#camera
        */
        this.camera = 'perspective';
        /**
        * Array of four integers between 0 and 255 representing RGBA colour components. This defines background colour of the viewer. You can change this value at any time with instant effect.
        * @member {Number[]} Viewer#background
        */
        this.background = [230, 230, 230, 255];
        /**
        * Array of four integers between 0 and 255 representing RGBA colour components. This defines colour for highlighted elements. You can change this value at any time with instant effect.
        * @member {Number[]} Viewer#highlightingColour
        */
        this.highlightingColour = [255, 173, 33, 255];
        /**
        * Array of four floats. It represents Light A's position <strong>XYZ</strong> and intensity <strong>I</strong> as [X, Y, Z, I]. Intensity should be in range 0.0 - 1.0.
        * @member {Number[]} Viewer#lightA
        */
        this.lightA = [0, 1000000, 200000, 0.8];
        /**
        * Array of four floats. It represents Light B's position <strong>XYZ</strong> and intensity <strong>I</strong> as [X, Y, Z, I]. Intensity should be in range 0.0 - 1.0.
        * @member {Number[]} Viewer#lightB
        */
        this.lightB = [0, -500000, 50000, 0.2];
        /**
        * Switch between different navigation modes for left mouse button. Allowed values: <strong> 'pan', 'zoom', 'orbit' (or 'fixed-orbit') , 'free-orbit' and 'none'</strong>. Default value is <strong>'orbit'</strong>;
        * @member {String} Viewer#navigationMode
        */
        this.navigationMode = 'orbit';
        /**
        * Switch between different rendering modes. Allowed values: <strong> 'normal', 'x-ray'</strong>. Default value is <strong>'normal'</strong>;
        * Only products with state set to state.HIGHLIGHTED or xState.XRAYVISIBLE will be rendered highlighted or in a normal colours. All other products
        * will be rendered semi-transparent and single sided.
        * @member {String} Viewer#renderingMode
        */
        this.renderingMode = RenderingMode.NORMAL;
        /**
        * Clipping plane [a, b, c, d] defined as normal equation of the plane ax + by + cz + d = 0. [0,0,0,0] is for no clipping plane.
        * @member {Number[]} Viewer#clippingPlaneA
        */
        this._clippingPlaneA = [0, 0, 0, 0];
        /**
        * Clipping plane [a, b, c, d] defined as normal equation of the plane ax + by + cz + d = 0. [0,0,0,0] is for no clipping plane.
        * @member {Number[]} Viewer#clippingPlaneB
        */
        this._clippingPlaneB = [0, 0, 0, 0];
        //*************************** Do all the set up of WebGL **************************
        var gl = webgl_utils_1.WebGLUtils.setupWebGL(this.canvas, { preserveDrawingBuffer: true });
        //do not even initialize this object if WebGL is not supported
        if (!gl) {
            return;
        }
        this.gl = gl;
        //detect floating point texture support
        this._fpt = (gl.getExtension('OES_texture_float') ||
            gl.getExtension('MOZ_OES_texture_float') ||
            gl.getExtension('WEBKIT_OES_texture_float'));
        //set up DEPTH_TEST and BLEND so that transparent objects look right
        //this is not 100% perfect as it would be necessary to sort all objects from back to
        //front when rendering them. We have sacrificed this for the sake of performance.
        //Objects with no transparency in their default style are drawn first and semi-transparent last.
        //This gives 90% right when there is not too much of transparency. It may not look right if you
        //have a look through two windows or if you have a look from inside of the building out.
        //It is granted to be alright when looking from outside of the building inside through one
        //semi-transparent object like curtain wall panel or window which is the case most of the time.
        //This is known limitation but there is no plan to change this behaviour.
        gl.enable(gl.DEPTH_TEST);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
        //cache canvas width and height and change it only when size change
        // it is better to cache this value because it is used frequently and it takes a time to get a value from HTML
        this.width = this.canvas.width = this.canvas.offsetWidth;
        this.height = this.canvas.height = this.canvas.offsetHeight;
        this._geometryLoaded = false;
        //number of active models is used to indicate that state has changed
        this._numberOfActiveModels = 0;
        //this object is used to identify if anything changed between two frames (hence if it is necessary to redraw)
        this._lastStates = {};
        this._visualStateAttributes = [
            'perspectiveCamera', 'orthogonalCamera', 'camera', 'background', 'lightA', 'lightB',
            'renderingMode', '_clippingA', '_clippingB', 'mvMatrix', '_pMatrix', 'distance', 'origin', 'highlightingColour',
            '_numberOfActiveModels', "width", "height"
        ];
        this._stylingChanged = true;
        //this is to indicate that user has done some interaction
        this._userAction = true;
        //dictionary of named events which can be registered and unregistered by using '.on('eventname', callback)'
        // and '.off('eventname', callback)'. Registered call-backs are triggered by the viewer when important events occur.
        this._events = {};
        //array of plugins which can implement certain methods which get called at certain points like before draw, after draw and others.
        this._plugins = new Array();
        //transformation matrices
        this.mvMatrix = mat4_1.mat4.create(); //world matrix
        this.pMatrix = mat4_1.mat4.create(); //camera matrix (this can be either perspective or orthogonal camera)
        //Navigation settings - coordinates in the WCS of the origin used for orbiting and panning
        this.origin = [0, 0, 0];
        //Default distance for default views (top, bottom, left, right, front, back)
        this.distance = 0;
        //shader program used for rendering
        this._shaderProgram = null;
        //Array of handles which can eventually contain handles to one or more models.
        //Models are loaded using 'load()' function.
        this._handles = [];
        //This is a switch which can stop animation.
        this._isRunning = true;
        //********************** Run all the initialize functions *****************************
        //compile shaders for use
        this._initShaders();
        //initialize vertex attribute and uniform pointers
        this._initAttributesAndUniforms();
        //initialize mouse events to capture user interaction
        this._initMouseEvents();
        //initialize touch events to capute user interaction on touch devices
        this._initTouchNavigationEvents();
        this._initTouchTapEvents();
        //disable default context menu as it doesn't make much sense for the viewer
        //it can be replaced by custom menu when listening to 'contextMenu' of the viewer
        this._initContextMenuEvent();
        //This array keeps data for overlay styles.
        this._stateStyles = new Uint8Array(15 * 15 * 4);
        this._stateStyleTexture = gl.createTexture();
        //this texture has constant size and is bound at all times
        gl.activeTexture(gl.TEXTURE4);
        gl.bindTexture(gl.TEXTURE_2D, this._stateStyleTexture);
        gl.uniform1i(this._stateStyleSamplerUniform, 4);
        //this has a constant size 15 which is defined in vertex shader
        model_handle_1.ModelHandle.bufferTexture(gl, this._stateStyleTexture, this._stateStyles);
        // watch resizing on every frame
        var elementHeight = this.height;
        var elementWidth = this.width;
        var watchCanvasSize = function () {
            if (_this.canvas.offsetHeight !== elementHeight || _this.canvas.offsetWidth !== elementWidth) {
                elementHeight = _this.height = _this.canvas.height = _this.canvas.offsetHeight;
                elementWidth = _this.width = _this.canvas.width = _this.canvas.offsetWidth;
            }
            window.requestAnimationFrame(watchCanvasSize);
        };
        watchCanvasSize();
    }
    /**
    * This is a static function which should always be called before Viewer is instantiated.
    * It will check all prerequisites of the viewer and will report all issues. If Prerequisities.errors contain
    * any messages viewer won't work. If Prerequisities.warnings contain any messages it will work but some
    * functions may be restricted or may not work or it may have poor performance.
    * @function Viewer.check
    * @return {Prerequisites}
    */
    Viewer.check = function () {
        /**
        * This is a structure reporting errors and warnings about prerequisites of {@link Viewer Viewer}. It is result of {@link Viewer.checkPrerequisities checkPrerequisities()} static method.
        *
        * @name Prerequisites
        * @class
        */
        var result = {
            /**
            * If this array contains any warnings Viewer will work but it might be slow or may not support full functionality.
            * @member {string[]}  Prerequisites#warnings
            */
            warnings: [],
            /**
            * If this array contains any errors Viewer won't work at all or won't work as expected.
            * You can use messages in this array to report problems to user. However, user won't probably
            * be able to do to much with it except trying to use different browser. IE10- are not supported for example.
            * The latest version of IE should be all right.
            * @member {string[]}  Prerequisites#errors
            */
            errors: [],
            /**
            * If false Viewer won't work at all or won't work as expected.
            * You can use messages in {@link Prerequisites#errors errors array} to report problems to user. However, user won't probably
            * be able to do to much with it except trying to use different browser. IE10- are not supported for example.
            * The latest version of IE should be all right.
            * @member {string[]}  Prerequisites#noErrors
            */
            noErrors: false,
            /**
            * If false Viewer will work but it might be slow or may not support full functionality. Use {@link Prerequisites#warnings warnings array} to report problems.
            * @member {string[]}  Prerequisites#noWarnings
            */
            noWarnings: false
        };
        //check WebGL support
        var canvas = document.createElement('canvas');
        if (!canvas)
            result.errors.push("Browser doesn't have support for HTMLCanvasElement. This is critical.");
        else {
            var gl = webgl_utils_1.WebGLUtils.setupWebGL(canvas);
            if (gl == null)
                result.errors.push("Browser doesn't support WebGL. This is critical.");
            else {
                //check floating point extension availability
                var fpt = (gl.getExtension('OES_texture_float') ||
                    gl.getExtension('MOZ_OES_texture_float') ||
                    gl.getExtension('WEBKIT_OES_texture_float'));
                if (!fpt)
                    result.warnings
                        .push('Floating point texture extension is not supported. Performance of the viewer will be very bad. But it should work.');
                //check number of supported vertex shader textures. Minimum is 5 but standard requires 0.
                var vertTextUnits = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
                if (vertTextUnits < 4)
                    result.errors.push('Browser supports only ' +
                        vertTextUnits +
                        ' vertex texture image units but minimal requirement for the viewer is 4.');
            }
        }
        //check FileReader and Blob support
        if (!window['File'] ||
            !window['FileReader'] ||
            !window.Blob)
            result.errors.push("Browser doesn't support 'File', 'FileReader' or 'Blob' objects.");
        //check for typed arrays
        if (!window['Int32Array'] || !window['Float32Array'])
            result.errors
                .push("Browser doesn't support TypedArrays. These are crucial for binary parsing and for comunication with GPU.");
        //set boolean members for convenience
        if (result.errors.length == 0)
            result.noErrors = true;
        if (result.warnings.length == 0)
            result.noWarnings = true;
        return result;
    };
    /**
    * Adds plugin to the viewer. Plugins can implement certain methods which get called in certain moments in time like
    * before draw, after draw etc. This makes it possible to implement functionality tightly integrated into Viewer like navigation cube or others.
    * @function Viewer#addPlugin
    * @param {object} plugin - plug-in object
    */
    Viewer.prototype.addPlugin = function (plugin) {
        if (!plugin.init)
            return;
        plugin.init(this);
        this._plugins.push(plugin);
    };
    /**
    * Removes plugin from the viewer. Plugins can implement certain methods which get called in certain moments in time like
    * before draw, after draw etc. This makes it possible to implement functionality tightly integrated into Viewer like navigation cube or others.
    * @function Viewer#removePlugin
    * @param {object} plugin - plug-in object
    */
    Viewer.prototype.removePlugin = function (plugin) {
        var index = this._plugins.indexOf(plugin, 0);
        if (index < 0)
            return;
        this._plugins.splice(index, 1);
    };
    /**
    * Use this function to define up to 224 optional styles which you can use to change appearance of products and types if you pass the index specified in this function to {@link Viewer#setState setState()} function.
    * @function Viewer#defineStyle
    * @param {Number} index - Index of the style to be defined. This has to be in range 0 - 224. Index can than be passed to change appearance of the products in model
    * @param {Number[]} colour - Array of four numbers in range 0 - 255 representing RGBA colour. If there are less or more numbers exception is thrown.
    */
    Viewer.prototype.defineStyle = function (index, colour) {
        if (typeof (index) == 'undefined' || (index < 0 && index > 224))
            throw 'Style index has to be defined as a number 0-224';
        if (typeof (colour) == 'undefined' || !colour.length || colour.length != 4)
            throw 'Colour must be defined as an array of 4 bytes';
        //set style to style texture via model handle
        var colData = new Uint8Array(colour);
        this._stateStyles.set(colData, index * 4);
        //reset data in GPU
        var gl = this.setActive();
        model_handle_1.ModelHandle.bufferTexture(gl, this._stateStyleTexture, this._stateStyles);
        //set flag
        this._stylingChanged = true;
    };
    /**
    * You can use this function to change state of products in the model. State has to have one of values from {@link xState xState} enumeration.
    * Target is either enumeration from {@link xProductType xProductType} or array of product IDs. If you specify type it will effect all elements of the type.
    *
    * @function Viewer#setState
    * @param {State} state - One of {@link State State} enumeration values.
    * @param {Number} [modelId] - Id of the model
    * @param {Number[] | Number} target - Target of the change. It can either be array of product IDs or product type from {@link xProductType xProductType}.
    */
    Viewer.prototype.setState = function (state, target, modelId) {
        if (typeof (state) == 'undefined' || !(state >= 225 && state <= 255)) {
            throw new Error('State has to be defined as 225 - 255. Use xState enum.');
        }
        if (typeof (target) === 'undefined' || target === null) {
            throw new Error('Target must be defined either as type ID or as a list of product IDs');
        }
        this.forHandleOrAll(function (h) { h.setState(state, target); }, modelId);
        this._stylingChanged = true;
    };
    /**
     * Executes callback for one model if modelId is specified or for all handles.
     * If no modelId is specified, last result will get returned, not an aggregation.
     * @param callback Function to execute
     * @param modelId ID of the model
     */
    Viewer.prototype.forHandleOrAll = function (callback, modelId) {
        if (typeof (modelId) !== 'undefined') {
            var handle = this.getHandle(modelId);
            if (!handle) {
                throw new Error("Model with id '" + modelId + "' doesn't exist.");
            }
            return callback(handle);
        }
        else {
            var result_1 = null;
            this._handles.forEach(function (handle) {
                if (handle) {
                    var value = callback(handle);
                    if (typeof (value) !== 'undefined') {
                        result_1 = value;
                    }
                }
            });
            return result_1;
        }
    };
    Viewer.prototype.getHandle = function (id) {
        return this._handles.filter(function (h) { return h != null && h.id == id; }).pop();
    };
    /**
    * Use this function to get state of the products in the model. You can compare result of this function
    * with one of values from {@link xState xState} enumeration. 0xFF is the default value.
    *
    * @function Viewer#getState
    * @param {Number} id - Id of the product. You would typically get the id from {@link Viewer#event:pick pick event} or similar event.
    * @param {Number} [modelId] - Id of the model
    */
    Viewer.prototype.getState = function (id, modelId) {
        return this.forHandleOrAll(function (h) {
            return h.getState(id);
        }, modelId);
    };
    /**
    * Use this function to reset state of all products to 'UNDEFINED' which means visible and not highlighted.
    * You can use optional hideSpaces parameter if you also want to show spaces. They will be hidden by default.
    *
    * @function Viewer#resetStates
    * @param {Bool} [hideSpaces = true] - Default state is UNDEFINED which would also show spaces. That is often not
    * @param {Number} [modelId = null] - Optional Model ID. Id no ID is specified states are reset for all models.
    */
    Viewer.prototype.resetStates = function (hideSpaces, modelId) {
        this.forHandleOrAll(function (h) {
            h.resetStates();
            if (hideSpaces)
                h.setState(state_1.State.HIDDEN, product_type_1.ProductType.IFCSPACE);
        }, modelId);
        this._stylingChanged = true;
    };
    Viewer.prototype.getCurrentImageHtml = function (width, height) {
        if (width === void 0) { width = this.width; }
        if (height === void 0) { height = this.height; }
        var element = document.createElement("img");
        element.src = this.getCurrentImageDataUrl(width, height);
        return element;
    };
    Viewer.prototype.getCurrentImageDataUrl = function (width, height) {
        if (width === void 0) { width = this.width; }
        if (height === void 0) { height = this.height; }
        //use background framebuffer
        var frame = new framebuffer_1.Framebuffer(this.gl, width, height);
        //force draw into defined framebuffer
        this.draw(true, frame);
        var result = frame.getImageDataUrl();
        //free resources
        frame.delete();
        return result;
    };
    Viewer.prototype.getCurrentImageBlob = function (callback) {
        return this.canvas.toBlob(callback, 'image/png');
    };
    /**
     * Gets complete model state and style. Resulting object can be used to restore the state later on.
     *
     * @param {Number} id - Model ID which you can get from {@link Viewer#event:loaded loaded} event.
     * @returns {Array} - Array representing model state in compact form suitable for serialization
     */
    Viewer.prototype.getModelState = function (id) {
        var handle = this.getHandle(id);
        if (typeof (handle) === 'undefined') {
            throw "Model doesn't exist";
        }
        return handle.getModelState();
    };
    /**
     * Restores model state from the data previously captured with {@link Viewer#getModelState getModelState()} function
     * @param {Number} id - ID of the model
     * @param {Array} state - State of the model as obtained from {@link Viewer#getModelState getModelState()} function
     */
    Viewer.prototype.restoreModelState = function (id, state) {
        var handle = this.getHandle(id);
        if (typeof (handle) === 'undefined') {
            throw "Model doesn't exist";
        }
        handle.restoreModelState(state);
        this._stylingChanged = true;
    };
    /**
    * Use this method for restyling of the model. This doesn't change the default appearance of the products so you can think about it as an overlay. You can
    * remove the overlay if you set the style to {@link xState#UNSTYLED xState.UNSTYLED} value. You can combine restyling and hiding in this way.
    * Use {@link Viewer#defineStyle defineStyle()} to define styling first.
    *
    * @function Viewer#setStyle
    * @param style - style defined in {@link Viewer#defineStyle defineStyle()} method
    * @param {Number[] | Number} target - Target of the change. It can either be array of product IDs or product type from {@link xProductType xProductType}.
    * @param {Number} [modelId] - Optional ID of a specific model.
    */
    Viewer.prototype.setStyle = function (style, target, modelId) {
        if (typeof (style) == 'undefined' || !(style >= 0 && style <= 225))
            throw 'Style has to be defined as 0 - 225 where 225 is for default style.';
        var c = [
            this._stateStyles[style * 4],
            this._stateStyles[style * 4 + 1],
            this._stateStyles[style * 4 + 2],
            this._stateStyles[style * 4 + 3]
        ];
        if (c[0] == 0 && c[1] == 0 && c[2] == 0 && c[3] == 0 && console && console.warn)
            console
                .warn('You have used undefined colour for restyling. Elements with this style will have transparent black colour and hence will be invisible.');
        this.forHandleOrAll(function (handle) {
            handle.setState(style, target);
        }, modelId);
        this._stylingChanged = true;
    };
    /**
    * Use this function to get overriding colour style of the products in the model. The number you get is the index of
    * your custom colour which you have defined in {@link Viewer#defineStyle defineStyle()} function. 0xFF is the default value.
    *
    * @function Viewer#getStyle
    * @param {Number} id - Id of the product. You would typically get the id from {@link Viewer#event:pick pick event} or similar event.
    * @param {Number} [modelId] - Optional Model ID. If not defined first style available for a product with certain ID will be returned. This might be ambiguous.
    */
    Viewer.prototype.getStyle = function (id, modelId) {
        this.forHandleOrAll(function (handle) {
            return handle.getStyle(id);
        }, modelId);
    };
    /**
    * Use this function to reset appearance of all products to their default styles.
    *
    * @function Viewer#resetStyles
    * @param {Number} [modelId] - Optional ID of a specific model.
    */
    Viewer.prototype.resetStyles = function (modelId) {
        this.forHandleOrAll(function (handle) {
            handle.resetStyles();
        }, modelId);
        this._stylingChanged = true;
    };
    /**
    *
    * @function Viewer#getProductType
    * @param {Number} prodID - Product ID. You can get this value either from semantic structure of the model or by listening to {@link Viewer#event:pick pick} event.
    * @param {Number} [modelId] - Optional Model ID. If not defined first type of a product with certain ID will be returned. This might be ambiguous.
    * @return {Number} Product type ID. This is either null if no type is identified or one of {@link xProductType type ids}.
    */
    Viewer.prototype.getProductType = function (prodId, modelId) {
        return this.forHandleOrAll(function (handle) {
            var map = handle.getProductMap(prodId);
            if (map) {
                return map.type;
            }
        }, modelId);
    };
    /**
    * Use this method to set position of camera. Use it after {@link Viewer#setCameraTarget setCameraTarget()} to get desired result.
    *
    * @function Viewer#setCameraPosition
    * @param {Number[]} coordinates - 3D coordinates of the camera in WCS
    */
    Viewer.prototype.setCameraPosition = function (coordinates) {
        if (typeof (coordinates) == 'undefined')
            throw 'Parameter coordinates must be defined';
        mat4_1.mat4.lookAt(this.mvMatrix, coordinates, this.origin, [0, 0, 1]);
    };
    /**
    * This method sets navigation origin to the centroid of specified product's bounding box or to the centre of model if no product ID is specified.
    * This method doesn't affect the view itself but it has an impact on navigation. Navigation origin is used as a centre for orbiting and it is used
    * if you call functions like {@link Viewer.show show()} or {@link Viewer#zoomTo zoomTo()}.
    * @function Viewer#setCameraTarget
    * @param {Number} prodId [optional] Product ID. You can get ID either from semantic structure of the model or from {@link Viewer#event:pick pick event}.
    * @param {Number} [modelId] - Optional ID of a specific model.
    * @return {Bool} True if the target exists and is set, False otherwise
    */
    Viewer.prototype.setCameraTarget = function (prodId, modelId) {
        var viewer = this;
        //helper function for setting of the distance based on camera field of view and size of the product's bounding box
        var setDistance = function (bBox) {
            var size = Math.sqrt(bBox[3] * bBox[3] + bBox[4] * bBox[4] + bBox[5] * bBox[5]);
            //set ratio to 1 if the viewer has no size (for example if canvas is not added to DOM yet)
            var ratio = (viewer.width > 0 && viewer.height > 0) && viewer.width < viewer.height ?
                Math.min(viewer.width, viewer.height) / Math.max(viewer.width, viewer.height) :
                1;
            viewer.distance = size / (Math.tan(viewer.perspectiveCamera.fov * Math.PI / 180.0 / 2.0 * ratio) * 2.0);
        };
        //set navigation origin and default distance to the product BBox
        if (typeof (prodId) !== 'undefined' && prodId != null) {
            //get product BBox and set it's centre as a navigation origin
            var bbox = this.forHandleOrAll(function (handle) {
                var map = handle.getProductMap(prodId);
                if (map) {
                    return map.bBox;
                }
            }, modelId);
            if (bbox) {
                this.origin = [bbox[0] + bbox[3] / 2.0, bbox[1] + bbox[4] / 2.0, bbox[2] + bbox[5] / 2.0];
                setDistance(bbox);
                return true;
            }
            else
                return false;
        }
        else {
            var region = this.getMergedRegion();
            if (region) {
                this.origin = [region.centre[0], region.centre[1], region.centre[2]];
                setDistance(region.bbox);
            }
            return true;
        }
    };
    Viewer.prototype.getMergedRegion = function () {
        var region = new model_geometry_1.Region();
        this._handles
            .filter(function (h) { return h != null && !h.stopped; })
            .forEach(function (h) {
            region = region.merge(h.region);
        });
        return region;
    };
    Viewer.prototype.getBiggestRegion = function () {
        var volume = function (box) {
            return box[3] * box[4] * box[5];
        };
        var handle = this._handles
            .filter(function (h) { return h != null && !h.stopped; })
            .sort(function (a, b) {
            var volA = volume(a.region.bbox);
            var volB = volume(b.region.bbox);
            if (volA < volB) {
                return -1;
            }
            if (volA == volB) {
                return 0;
            }
            if (volA > volB) {
                return 1;
            }
        })
            .pop();
        if (handle)
            return handle.region;
        else
            return null;
    };
    /**
    * This method can be used for batch setting of viewer members. It doesn't check validity of the input.
    * @function Viewer#set
    * @param {Object} settings - Object containing key - value pairs
    */
    Viewer.prototype.set = function (settings) {
        for (var key in settings) {
            this[key] = settings[key];
        }
    };
    ;
    /**
    * This method uses WebWorker if available to load the model into this viewer.
    * Model has to be either URL to wexBIM file or Blob or File representing wexBIM file binary data. Any other type of argument will throw an exception.
    * You can load more than one model if they occupy the same space, use the same scale and have unique product IDs. Duplicated IDs won't affect
    * visualization itself but would cause unexpected user interaction (picking, zooming, ...).
    * @function Viewer#load
    * @param {String} loaderUrl - Url of the 'xbim-geometry-loader.js' script which will be called as a worker
    * @param {String | Blob | File} model - Model has to be either URL to wexBIM file or Blob or File representing wexBIM file binary data.
    * @param {Any} tag [optional] - Tag to be used to identify the model in {@link Viewer#event:loaded loaded} event.
    * @param {Object} headers [optional] - Headers to be used for request. This can be used for authorized access for example.
    * @fires Viewer#loaded
    */
    Viewer.prototype.loadAsync = function (loaderUrl, model, tag, headers) {
        if (typeof (model) == 'undefined')
            throw 'You have to specify model to load.';
        if (typeof (model) != 'string' && !(model instanceof Blob))
            throw 'Model has to be specified either as a URL to wexBIM file or Blob object representing the wexBIM file.';
        var self = this;
        //fall back to synchronous loading if worker is not available
        if (typeof (Worker) === 'undefined') {
            this.load(model, tag, headers);
        }
        var worker = new Worker(loaderUrl);
        worker.onmessage = function (msg) {
            //console.log('Message received from worker');
            var geometry = msg.data;
            self.addHandle(geometry, tag);
        };
        worker.onerror = function (e) {
            self.error(e.message);
        };
        worker.postMessage({ model: model, headers: headers });
        //console.log('Message posted to worker');
        return;
    };
    /**
    * This method is used to load model data into viewer. Model has to be either URL to wexBIM file or Blob or File representing wexBIM file binary data. Any other type of argument will throw an exception.
    * Region extend is determined based on the region of the model
    * Default view if 'front'. If you want to define different view you have to set it up in handler of {@link Viewer#event:loaded loaded} event. <br>
    * You can load more than one model if they occupy the same space, use the same scale and have unique product IDs. Duplicated IDs won't affect
    * visualization itself but would cause unexpected user interaction (picking, zooming, ...)
    * @function Viewer#load
    * @param {String | Blob | File} model - Model has to be either URL to wexBIM file or Blob or File representing wexBIM file binary data.
    * @param {Any} tag [optional] - Tag to be used to identify the model in {@link Viewer#event:loaded loaded} event.
    * @param {Object} headers [optional] - Headers to be used for request. This can be used for authorized access for example.
    * @fires Viewer#loaded
    */
    Viewer.prototype.load = function (model, tag, headers) {
        if (typeof (model) == 'undefined')
            throw 'You have to specify model to load.';
        if (typeof (model) != 'string' && !(model instanceof Blob))
            throw 'Model has to be specified either as a URL to wexBIM file or Blob object representing the wexBIM file.';
        var viewer = this;
        var geometry = new model_geometry_1.ModelGeometry();
        geometry.onloaded = function () {
            viewer.addHandle(geometry, tag);
        };
        geometry.onerror = function (msg) {
            viewer.error(msg);
        };
        geometry.load(model, headers);
    };
    //this is a private function used to add loaded geometry as a new handle and to set up camera and 
    //default view if this is the first geometry loaded
    Viewer.prototype.addHandle = function (geometry, tag) {
        var viewer = this;
        var gl = this.setActive();
        var handle = new model_handle_1.ModelHandle(viewer.gl, geometry);
        //assign handle used to identify the model
        handle.tag = tag;
        viewer._handles.push(handle);
        //get one meter size from model and set it to shader
        var meter = handle.meter;
        gl.uniform1f(viewer._meterUniformPointer, meter);
        //only set camera parameters and the view if this is the first model
        if (viewer._handles.length === 1) {
            //set perspective camera near and far based on 1 meter dimension and size of the model
            var region = handle.region;
            var maxSize = Math.max(region.bbox[3], region.bbox[4], region.bbox[5]);
            viewer.perspectiveCamera.far = maxSize * 50;
            viewer.perspectiveCamera.near = meter / 10.0;
            //set orthogonalCamera boundaries so that it makes a sense
            viewer.orthogonalCamera.far = viewer.perspectiveCamera.far;
            viewer.orthogonalCamera.near = viewer.perspectiveCamera.near;
            var ratio = 1.8;
            viewer.orthogonalCamera.top = maxSize / ratio;
            viewer.orthogonalCamera.bottom = maxSize / ratio * -1;
            viewer.orthogonalCamera.left = maxSize / ratio * -1 * viewer.width / viewer.height;
            viewer.orthogonalCamera.right = maxSize / ratio * viewer.width / viewer.height;
            //set centre and default distance based on the most populated region in the model
            viewer.setCameraTarget();
            //set default view
            viewer.show(ViewType.DEFAULT);
        }
        viewer._geometryLoaded = true;
        // force redraw so when 'loaded' is called listeners can operate with current canvas.
        viewer.draw(true);
        /**
         * Occurs when geometry model is loaded into the viewer. This event returns object containing ID of the model.
         * This ID can later be used to unload or temporarily stop the model.
         *
         * @event Viewer#loaded
         * @type {object}
         * @param {Number} id - model ID assigned by the viewer
         * @param {Any} tag - tag which was passed to 'Viewer.load()' function
         *
        */
        viewer.fire('loaded', { id: handle.id, tag: tag });
    };
    ;
    /**
     * Unloads model from the GPU. This action is not reversible.
     *
     * @param {Number} modelId - ID of the model which you can get from {@link Viewer#event:loaded loaded} event.
     */
    Viewer.prototype.unload = function (modelId) {
        var handle = this.getHandle(modelId);
        if (typeof (handle) === 'undefined')
            throw 'Model with id: ' + modelId + " doesn't exist or was unloaded already.";
        //stop for start so it doesn't interfere with the rendering loop
        handle.stopped = true;
        //remove from the array
        var index = this._handles.indexOf(handle);
        this._handles.splice(index, 1);
        this._numberOfActiveModels = this._handles.length;
        //unload and delete
        handle.unload();
    };
    //this function should be only called once during initialization
    //or when shader set-up changes
    Viewer.prototype._initShaders = function () {
        var gl = this.gl;
        var viewer = this;
        var compile = function (shader, code) {
            gl.shaderSource(shader, code);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                var err = gl.getShaderInfoLog(shader);
                viewer.error(err);
                console.error(err);
                return null;
            }
        };
        //fragment shader
        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        compile(fragmentShader, shaders_1.Shaders.fragment_shader);
        //vertex shader (the more complicated one)
        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        compile(vertexShader, shaders_1.Shaders.vertex_shader);
        //link program
        this._shaderProgram = gl.createProgram();
        gl.attachShader(this._shaderProgram, vertexShader);
        gl.attachShader(this._shaderProgram, fragmentShader);
        gl.linkProgram(this._shaderProgram);
        if (!gl.getProgramParameter(this._shaderProgram, gl.LINK_STATUS)) {
            this.error('Could not initialise shaders ');
        }
        gl.useProgram(this._shaderProgram);
    };
    Viewer.prototype.setActive = function () {
        var gl = this.gl;
        //set own shader in case other shader program was used before
        gl.useProgram(this._shaderProgram);
        return gl;
    };
    Viewer.prototype._initAttributesAndUniforms = function () {
        var gl = this.setActive();
        ;
        //create pointers to uniform variables for transformations
        this._pMatrixUniformPointer = gl.getUniformLocation(this._shaderProgram, 'uPMatrix');
        this._mvMatrixUniformPointer = gl.getUniformLocation(this._shaderProgram, 'uMVMatrix');
        this._lightAUniformPointer = gl.getUniformLocation(this._shaderProgram, 'ulightA');
        this._lightBUniformPointer = gl.getUniformLocation(this._shaderProgram, 'ulightB');
        this._colorCodingUniformPointer = gl.getUniformLocation(this._shaderProgram, 'uColorCoding');
        this._clippingPlaneAUniformPointer = gl.getUniformLocation(this._shaderProgram, 'uClippingPlaneA');
        this._clippingAUniformPointer = gl.getUniformLocation(this._shaderProgram, 'uClippingA');
        this._clippingPlaneBUniformPointer = gl.getUniformLocation(this._shaderProgram, 'uClippingPlaneB');
        this._clippingBUniformPointer = gl.getUniformLocation(this._shaderProgram, 'uClippingB');
        this._meterUniformPointer = gl.getUniformLocation(this._shaderProgram, 'uMeter');
        this._renderingModeUniformPointer = gl.getUniformLocation(this._shaderProgram, 'uRenderingMode');
        this._highlightingColourUniformPointer = gl.getUniformLocation(this._shaderProgram, 'uHighlightColour');
        this._stateStyleSamplerUniform = gl.getUniformLocation(this._shaderProgram, 'uStateStyleSampler');
        this._pointers = new ModelPointers(gl, this._shaderProgram);
    };
    /**
     * Prevents default context menu to appear. Custom menu can be created instead by listening to contextmenu event
     * of the viewer. Nothing is displayed othervise.
     */
    Viewer.prototype._initContextMenuEvent = function () {
        var _this = this;
        this.canvas.addEventListener("contextmenu", function (event) {
            var ids = _this.getIdsFromEvent(event);
            /**
            * Occurs when mousedown event happens on underlying canvas.
            *
            * @event Viewer#contextMenu
            * @type {object}
            * @param {Number} id - product ID of the element or null if there wasn't any product under mouse
            * @param {Number} model - Model ID
            * @param {MouseEvent} event - original event as captured by the viewer
            */
            _this.fire("contextMenu", { event: event, id: ids.id, model: ids.model });
            event.preventDefault();
            return false;
        }, true);
    };
    Viewer.prototype._initMouseEvents = function () {
        var _this = this;
        var viewer = this;
        var mouseDown = false;
        var lastMouseX = null;
        var lastMouseY = null;
        var startX = null;
        var startY = null;
        var button = 'L';
        var id = -1;
        var modelId = -1;
        //set initial conditions so that different gestures can be identified
        var handleMouseDown = function (event) {
            mouseDown = true;
            lastMouseX = event.clientX;
            lastMouseY = event.clientY;
            startX = event.clientX;
            startY = event.clientY;
            //get coordinates within canvas (with the right orientation)
            var r = viewer.canvas.getBoundingClientRect();
            var viewX = startX - r.left;
            var viewY = viewer.height - (startY - r.top);
            //this is for picking
            id = viewer.getID(viewX, viewY);
            modelId = viewer.getID(viewX, viewY, true);
            /**
            * Occurs when mousedown event happens on underlying canvas.
            *
            * @event Viewer#mouseDown
            * @type {object}
            * @param {Number} id - product ID of the element or -1 if there wasn't any product under mouse
            * @param {Number} model - model ID of the element or -1 if there wasn't any product under mouse
            * @param {MouseEvent} event - original HTML event
            */
            viewer.fire('mouseDown', { id: id, model: modelId, event: event });
            //keep information about the mouse button
            switch (event.button) {
                case 0:
                    button = 'left';
                    break;
                case 1:
                    button = 'middle';
                    break;
                case 2:
                    button = 'right';
                    break;
                default:
                    button = 'left';
                    break;
            }
            viewer.disableTextSelection();
        };
        var handleMouseUp = function (event) {
            mouseDown = false;
            var endX = event.clientX;
            var endY = event.clientY;
            var deltaX = Math.abs(endX - startX);
            var deltaY = Math.abs(endY - startY);
            //if it was a longer movement do not perform picking
            if (deltaX < 3 && deltaY < 3 && button === 'left') {
                var handled = false;
                viewer._plugins.forEach(function (plugin) {
                    if (!plugin.onBeforePick) {
                        return;
                    }
                    handled = handled || plugin.onBeforePick(id);
                });
                /**
                * Occurs when user click on model.
                *
                * @event Viewer#pick
                * @type {object}
                * @param {Number} id - product ID of the element or null if there wasn't any product under mouse
                * @param {Number} model - Model ID
                * @param {MouseEvent} event - Original HTML event
                */
                if (!handled) {
                    viewer.fire('pick', { id: id, model: modelId, event: event });
                }
            }
            viewer.enableTextSelection();
        };
        var handleMouseMove = function (event) {
            if (!mouseDown) {
                return;
            }
            if (viewer.navigationMode === 'none') {
                return;
            }
            var newX = event.clientX;
            var newY = event.clientY;
            var deltaX = newX - lastMouseX;
            var deltaY = newY - lastMouseY;
            lastMouseX = newX;
            lastMouseY = newY;
            if (button === 'left') {
                if (viewer._isShiftKeyDown) {
                    _this.navigate('pan', deltaX, deltaY);
                }
                else {
                    switch (viewer.navigationMode) {
                        case 'free-orbit':
                            _this.navigate('free-orbit', deltaX, deltaY);
                            break;
                        case 'fixed-orbit':
                        case 'orbit':
                            _this.navigate('orbit', deltaX, deltaY);
                            break;
                        case 'pan':
                            _this.navigate('pan', deltaX, deltaY);
                            break;
                        case 'zoom':
                            _this.navigate('zoom', deltaX, deltaY);
                            break;
                        default:
                            break;
                    }
                }
            }
            if (button === 'middle' || button === 'right') {
                _this.navigate('pan', deltaX, deltaY);
            }
        };
        var handleMouseScroll = function (event) {
            if (viewer.navigationMode === 'none') {
                return;
            }
            if (event.stopPropagation) {
                event.stopPropagation();
            }
            if (event.preventDefault) {
                event.preventDefault();
            }
            var sign = function (x) {
                x = +x; // convert to a number
                if (x === 0 || isNaN(x))
                    return x;
                return x > 0 ? 1 : -1;
            };
            //deltaX and deltaY have very different values in different web browsers so fixed value is used for constant functionality.
            _this.navigate('zoom', sign(event.deltaX) * -1.0, sign(event.deltaY) * -1.0);
        };
        var handleDoubleClick = function (event) {
            var ids = viewer.getIdsFromEvent(event);
            /**
             * Occurs when mousedown event happens on underlying canvas.
             *
             * @event Viewer#dblclick
             * @type {object}
             * @param {Number} id - product ID of the element or -1 if there wasn't any product under mouse
             * @param {Number} model - model ID of the element or -1 if there wasn't any product under mouse
             * @param {MouseEvent} event - Original HTML event
             */
            viewer.fire('dblclick', { id: ids.id, model: ids.model, event: event });
        };
        //attach callbacks
        this.canvas.addEventListener('mousedown', function (event) { return handleMouseDown(event); }, true);
        this.canvas.addEventListener('wheel', function (event) { return handleMouseScroll(event); }, true);
        this.canvas.addEventListener('dblclick', function (event) { return handleDoubleClick(event); }, true);
        window.addEventListener('mouseup', function (event) { return handleMouseUp(event); }, true);
        window.addEventListener('mousemove', function (event) { return handleMouseMove(event); }, true);
        // user doing anything should cause redraw in case there is any for of interaction
        this.canvas.addEventListener('mousemove', function () {
            viewer._userAction = true;
        }, true);
        //listen to key events to help navigation
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Shift') {
                _this._isShiftKeyDown = true;
                return;
            }
        }, false);
        document.addEventListener('keyup', function (event) {
            if (event.key === 'Shift') {
                _this._isShiftKeyDown = false;
                return;
            }
        }, false);
    };
    Viewer.prototype._initTouchNavigationEvents = function () {
        var _this = this;
        var lastTouchX_1;
        var lastTouchY_1;
        var lastTouchX_2;
        var lastTouchY_2;
        var lastTouchX_3;
        var lastTouchY_3;
        var handleTouchStart = function (event) {
            event.preventDefault();
            if (event.touches.length >= 1) {
                lastTouchX_1 = event.touches[0].clientX;
                lastTouchY_1 = event.touches[0].clientY;
            }
            if (event.touches.length >= 2) {
                lastTouchX_2 = event.touches[1].clientX;
                lastTouchY_2 = event.touches[1].clientY;
            }
            if (event.touches.length >= 3) {
                lastTouchX_3 = event.touches[2].clientX;
                lastTouchY_3 = event.touches[2].clientY;
            }
        };
        var handleTouchMove = function (event) {
            event.preventDefault();
            if (_this.navigationMode === 'none' || !event.touches) {
                return;
            }
            if (event.touches.length === 1) {
                // touch move with single finger -> orbit
                var deltaX = event.touches[0].clientX - lastTouchX_1;
                var deltaY = event.touches[0].clientY - lastTouchY_1;
                lastTouchX_1 = event.touches[0].clientX;
                lastTouchY_1 = event.touches[0].clientY;
                // force-setting navigation mode to 'free-orbit' currently for touch navigation since regular orbit
                // feels awkward and un-intuitive on touch devices
                // MC: I prefer fixed orbit as it doesn't allow for wierd angles
                _this.navigate('orbit', deltaX, deltaY);
            }
            else if (event.touches.length === 2) {
                // touch move with two fingers -> zoom
                var distanceBefore = Math.sqrt((lastTouchX_1 - lastTouchX_2) * (lastTouchX_1 - lastTouchX_2) +
                    (lastTouchY_1 - lastTouchY_2) * (lastTouchY_1 - lastTouchY_2));
                lastTouchX_1 = event.touches[0].clientX;
                lastTouchY_1 = event.touches[0].clientY;
                lastTouchX_2 = event.touches[1].clientX;
                lastTouchY_2 = event.touches[1].clientY;
                var distanceAfter = Math.sqrt((lastTouchX_1 - lastTouchX_2) * (lastTouchX_1 - lastTouchX_2) +
                    (lastTouchY_1 - lastTouchY_2) * (lastTouchY_1 - lastTouchY_2));
                if (distanceBefore > distanceAfter) {
                    _this.navigate('zoom', -1, -1); // Zooming out, fingers are getting closer together
                }
                else {
                    _this.navigate('zoom', 1, 1); // zooming in, fingers are getting further apart
                }
            }
            else if (event.touches.length === 3) {
                // touch move with three fingers -> pan
                var directionX = ((event.touches[0]
                    .clientX +
                    event.touches[1].clientX +
                    event.touches[2].clientX) /
                    3) -
                    ((lastTouchX_1 + lastTouchX_2 + lastTouchX_3) / 3);
                var directionY = ((event.touches[0]
                    .clientY +
                    event.touches[1].clientY +
                    event.touches[2].clientY) /
                    3) -
                    ((lastTouchY_1 + lastTouchY_2 + lastTouchY_3) / 3);
                lastTouchX_1 = event.touches[0].clientX;
                lastTouchY_1 = event.touches[0].clientY;
                lastTouchX_2 = event.touches[1].clientX;
                lastTouchY_2 = event.touches[1].clientY;
                lastTouchY_3 = event.touches[2].clientX;
                lastTouchY_3 = event.touches[2].clientY;
                // pan seems to be too fast, just adding a factor here
                var panFactor = 0.2;
                _this.navigate('pan', panFactor * directionX, panFactor * directionY);
            }
        };
        this.canvas.addEventListener('touchstart', function (event) { return handleTouchStart(event); }, true);
        this.canvas.addEventListener('touchmove', function (event) { return handleTouchMove(event); }, true);
    };
    Viewer.prototype._initTouchTapEvents = function () {
        var _this = this;
        var touchDown = false;
        var lastTouchX;
        var lastTouchY;
        var maximumLengthBetweenDoubleTaps = 200;
        var lastTap = new Date();
        var id = -1;
        var modelId = -1;
        //set initial conditions so that different gestures can be identified
        var handleTouchStart = function (event) {
            if (event.touches.length !== 1) {
                return;
            }
            touchDown = true;
            lastTouchX = event.touches[0].clientX;
            lastTouchY = event.touches[0].clientY;
            //get coordinates within canvas (with the right orientation)
            var r = _this.canvas.getBoundingClientRect();
            var viewX = lastTouchX - r.left;
            var viewY = _this.height - (lastTouchY - r.top);
            //this is for picking
            id = _this.getID(viewX, viewY);
            modelId = _this.getID(viewX, viewY, true);
            var now = new Date();
            var isDoubleTap = (now.getTime() - lastTap.getTime()) < maximumLengthBetweenDoubleTaps;
            if (isDoubleTap) {
                _this.fire('dblclick', { id: id, model: modelId, event: event });
            }
            ;
            lastTap = now;
            /**
            * Occurs when mousedown event happens on underlying canvas.
            *
            * @event Viewer#mouseDown
            * @type {object}
            * @param {Number} id - product ID of the element or null if there wasn't any product under mouse
            * @param {Number} model - model ID
            * @param {MouseEvent} event - original HTML event
            */
            _this.fire('mouseDown', { id: id, model: modelId, event: event });
            _this.disableTextSelection();
        };
        var handleTouchEnd = function (event) {
            if (!touchDown) {
                return;
            }
            touchDown = false;
            var endX = event.changedTouches[0].clientX;
            var endY = event.changedTouches[0].clientY;
            var deltaX = Math.abs(endX - lastTouchX);
            var deltaY = Math.abs(endY - lastTouchY);
            //if it was a longer movement do not perform picking
            if (deltaX < 3 && deltaY < 3) {
                var handled = false;
                _this._plugins.forEach(function (plugin) {
                    if (!plugin.onBeforePick) {
                        return;
                    }
                    handled = handled || plugin.onBeforePick(id);
                }, _this);
                if (!handled)
                    _this.fire('pick', { id: id, model: modelId, event: event });
            }
            _this.enableTextSelection();
        };
        this.canvas.addEventListener('touchstart', function (event) { return handleTouchStart(event); }, true);
        this.canvas.addEventListener('touchend', function (event) { return handleTouchEnd(event); }, true);
    };
    Object.defineProperty(Viewer.prototype, "meter", {
        get: function () {
            var handle = this._handles[0];
            if (!handle) {
                return 1.0;
            }
            return handle.meter;
        },
        enumerable: true,
        configurable: true
    });
    Viewer.prototype.navigate = function (type, deltaX, deltaY) {
        if (!this._handles || !this._handles[0])
            return;
        //translation in WCS is position from [0, 0, 0]
        var origin = this.origin;
        var camera = this.getCameraPosition();
        //get origin coordinates in view space
        var mvOrigin = vec3_1.vec3.transformMat4(vec3_1.vec3.create(), origin, this.mvMatrix);
        //movement factor needs to be dependant on the distance but one meter is a minimum so that movement wouldn't stop when camera is in 0 distance from navigation origin
        var distanceVec = vec3_1.vec3.subtract(vec3_1.vec3.create(), origin, camera);
        var distance = Math.max(vec3_1.vec3.vectorLength(distanceVec), this.meter);
        //move to the navigation origin in view space
        var transform = mat4_1.mat4.translate(mat4_1.mat4.create(), mat4_1.mat4.create(), mvOrigin);
        //function for conversion from degrees to radians
        function degToRad(deg) {
            return deg * Math.PI / 180.0;
        }
        switch (type) {
            case 'free-orbit':
                transform = mat4_1.mat4.rotate(mat4_1.mat4.create(), transform, degToRad(deltaY / 4), [1, 0, 0]);
                transform = mat4_1.mat4.rotate(mat4_1.mat4.create(), transform, degToRad(deltaX / 4), [0, 1, 0]);
                break;
            case 'fixed-orbit':
            case 'orbit':
                mat4_1.mat4.rotate(transform, transform, degToRad(deltaY / 4), [1, 0, 0]);
                //z rotation around model z axis
                var mvZ = vec3_1.vec3.transformMat3(vec3_1.vec3.create(), [0, 0, 1], mat3_1.mat3.fromMat4(mat3_1.mat3.create(), this.mvMatrix));
                mvZ = vec3_1.vec3.normalize(vec3_1.vec3.create(), mvZ);
                transform = mat4_1.mat4.rotate(mat4_1.mat4.create(), transform, degToRad(deltaX / 4), mvZ);
                break;
            case 'pan':
                mat4_1.mat4.translate(transform, transform, [deltaX * distance / 150, 0, 0]);
                mat4_1.mat4.translate(transform, transform, [0, (-1.0 * deltaY) * distance / 150, 0]);
                break;
            case 'zoom':
                mat4_1.mat4.translate(transform, transform, [0, 0, deltaX * distance / 20]);
                mat4_1.mat4.translate(transform, transform, [0, 0, deltaY * distance / 20]);
                break;
            default:
                break;
        }
        //reverse the translation in view space and leave only navigation changes
        var translation = vec3_1.vec3.negate(vec3_1.vec3.create(), mvOrigin);
        transform = mat4_1.mat4.translate(mat4_1.mat4.create(), transform, translation);
        //apply transformation in right order
        this.mvMatrix = mat4_1.mat4.multiply(mat4_1.mat4.create(), transform, this.mvMatrix);
    };
    /**
    * This is a static draw method. You can use it if you just want to render model once with no navigation and interaction.
    * If you want interactive model call {@link Viewer#start start()} method. {@link Viewer#frame Frame event} is fired when draw call is finished.
    * @function Viewer#draw
    * @fires Viewer#frame
    */
    Viewer.prototype.draw = function (force, framebuffer) {
        var _this = this;
        if (!force) {
            if (!this._isRunning || !this._geometryLoaded || this._handles.length == 0 || !(this._stylingChanged || this.isChanged())) {
                if (!this._userAction)
                    return;
            }
            this._userAction = false;
        }
        //call all before-draw plugins
        this._plugins.forEach(function (plugin) {
            if (!plugin.onBeforeDraw) {
                return;
            }
            plugin.onBeforeDraw(width, height);
        });
        var gl = this.setActive();
        //styles are up to date when new frame is drawn
        if (this._stylingChanged) {
            //update overlay styles
            gl.activeTexture(gl.TEXTURE4);
            gl.bindTexture(gl.TEXTURE_2D, this._stateStyleTexture);
            gl.uniform1i(this._stateStyleSamplerUniform, 4);
            //set the flag
            this._stylingChanged = false;
        }
        gl.useProgram(this._shaderProgram);
        var width = framebuffer ? framebuffer.width : this.width;
        var height = framebuffer ? framebuffer.height : this.height;
        gl.viewport(0, 0, width, height);
        gl.clearColor(this.background[0] / 255, this.background[1] / 255, this.background[2] / 255, this.background[3] / 255);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        //set up camera
        switch (this.camera) {
            case 'perspective':
                mat4_1.mat4.perspective(this.pMatrix, this.perspectiveCamera.fov * Math.PI / 180.0, width / height, this.perspectiveCamera.near, this.perspectiveCamera.far);
                break;
            case 'orthogonal':
                mat4_1.mat4.ortho(this.pMatrix, this.orthogonalCamera.left, this.orthogonalCamera.right, this.orthogonalCamera.bottom, this.orthogonalCamera.top, this.orthogonalCamera.near, this.orthogonalCamera.far);
                break;
            default:
                mat4_1.mat4.perspective(this.pMatrix, this.perspectiveCamera.fov * Math.PI / 180.0, width / height, this.perspectiveCamera.near, this.perspectiveCamera.far);
                break;
        }
        //set uniforms (these may quickly change between calls to draw)
        gl.uniformMatrix4fv(this._pMatrixUniformPointer, false, this.pMatrix);
        gl.uniformMatrix4fv(this._mvMatrixUniformPointer, false, this.mvMatrix);
        gl.uniform4fv(this._lightAUniformPointer, new Float32Array(this.lightA));
        gl.uniform4fv(this._lightBUniformPointer, new Float32Array(this.lightB));
        //clipping
        gl.uniform1i(this._clippingAUniformPointer, this._clippingA ? 1 : 0);
        gl.uniform1i(this._clippingBUniformPointer, this._clippingB ? 1 : 0);
        if (this._clippingA) {
            gl.uniform4fv(this._clippingPlaneAUniformPointer, new Float32Array(this._clippingPlaneA));
        }
        if (this._clippingB) {
            gl.uniform4fv(this._clippingPlaneBUniformPointer, new Float32Array(this._clippingPlaneB));
        }
        //use normal colour representation (1 would cause shader to use colour coding of IDs)
        gl.uniform1i(this._colorCodingUniformPointer, ColourCoding.NONE);
        //update highlighting colour
        gl.uniform4fv(this._highlightingColourUniformPointer, new Float32Array([
            this.highlightingColour[0] / 255.0,
            this.highlightingColour[1] / 255.0,
            this.highlightingColour[2] / 255.0,
            this.highlightingColour[3] / 255.0
        ]));
        // bind buffer if defined
        if (framebuffer) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer.framebuffer);
        }
        else {
            //set framebuffer to render into canvas (in case it was set for rendering to different framebuffer)
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }
        gl.uniform1i(this._renderingModeUniformPointer, this.renderingMode);
        // check for x-ray mode. XRAY mode uses 2 phase rendering to
        // sort out all transparency issues so that all selected objects are
        // properly visible
        if (this.renderingMode == RenderingMode.XRAY) {
            gl.enable(gl.CULL_FACE);
            // only highlighted and x-ray visible
            gl.uniform1i(this._renderingModeUniformPointer, RenderingMode.XRAY);
            gl.enable(gl.DEPTH_TEST);
            this._handles.forEach(function (handle) {
                if (!handle.stopped) {
                    handle.setActive(_this._pointers);
                    handle.draw();
                }
            });
            // the rest as semitransparent overlay
            gl.uniform1i(this._renderingModeUniformPointer, RenderingMode._XRAY2);
            // disable writing to depth buffer. This will respect depth buffer
            // from first pass but will render everything from this pass as
            // semitransparent without depth testing
            gl.depthMask(false);
            this._handles.forEach(function (handle) {
                if (!handle.stopped) {
                    handle.setActive(_this._pointers);
                    handle.draw();
                }
            });
            gl.depthMask(true);
        }
        else {
            gl.disable(gl.CULL_FACE);
            gl.enable(gl.DEPTH_TEST);
            //two runs, first for solids from all models, second for transparent objects from all models
            //this makes sure that transparent objects are always rendered at the end.
            this._handles.forEach(function (handle) {
                if (!handle.stopped) {
                    handle.setActive(_this._pointers);
                    handle.draw(model_handle_1.DrawMode.SOLID);
                }
            });
            this._handles.forEach(function (handle) {
                if (!handle.stopped) {
                    handle.setActive(_this._pointers);
                    handle.draw(model_handle_1.DrawMode.TRANSPARENT);
                }
            });
        }
        //call all after-draw plugins
        this._plugins.forEach(function (plugin) {
            if (!plugin.onAfterDraw) {
                return;
            }
            plugin.onAfterDraw(width, height);
        });
        /**
         * Occurs after every frame in animation. Don't do anything heavy weighted in here as it will happen about 60 times in a second all the time.
         *
         * @event Viewer#frame
         * @type {object}
         */
        if (!framebuffer && !force) {
            this.fire('frame', {});
        }
    };
    ;
    Viewer.prototype.isChanged = function () {
        var _this = this;
        var theSame = true;
        this._visualStateAttributes.forEach(function (vsa) {
            var state = JSON.stringify(_this[vsa]);
            var lastState = _this._lastStates[vsa];
            _this._lastStates[vsa] = state;
            theSame = theSame && (state === lastState);
        });
        var activeHandlesCount = this._handles.filter(function (h) { return !h.stopped; }).length;
        theSame = theSame && (this._lastActiveHandlesCount == activeHandlesCount);
        this._lastActiveHandlesCount = activeHandlesCount;
        return !theSame;
    };
    /**
    * Use this method to get actual camera position.
    * @function Viewer#getCameraPosition
    */
    Viewer.prototype.getCameraPosition = function () {
        var transform = mat4_1.mat4.create();
        mat4_1.mat4.multiply(transform, this.pMatrix, this.mvMatrix);
        var inv = mat4_1.mat4.create();
        mat4_1.mat4.invert(inv, transform);
        var eye = vec3_1.vec3.create();
        vec3_1.vec3.transformMat4(eye, vec3_1.vec3.create(), inv);
        return eye;
    };
    /**
    * Use this method to zoom to specified element. If you don't specify a product ID it will zoom to full extent.
    * @function Viewer#zoomTo
    * @param {Number} [id] Product ID
    * @param {Number} [model] Model ID
    * @return {Bool} True if target exists and zoom was successful, False otherwise
    */
    Viewer.prototype.zoomTo = function (id, model) {
        var found = this.setCameraTarget(id, model);
        if (!found)
            return false;
        var eye = this.getCameraPosition();
        var dir = vec3_1.vec3.create();
        vec3_1.vec3.subtract(dir, eye, this.origin);
        dir = vec3_1.vec3.normalize(vec3_1.vec3.create(), dir);
        var translation = vec3_1.vec3.create();
        vec3_1.vec3.scale(translation, dir, this.distance * 1.2);
        vec3_1.vec3.add(eye, translation, this.origin);
        mat4_1.mat4.lookAt(this.mvMatrix, eye, this.origin, [0, 0, 1]);
        return true;
    };
    /**
    * Use this function to show default views.
    *
    * @function Viewer#show
    * @param {String} type - Type of view. Allowed values are <strong>'top', 'bottom', 'front', 'back', 'left', 'right'</strong>.
    * Directions of this views are defined by the coordinate system. Target and distance are defined by {@link Viewer#setCameraTarget setCameraTarget()} method to certain product ID
    * or to the model extent if {@link Viewer#setCameraTarget setCameraTarget()} is called with no arguments.
    */
    Viewer.prototype.show = function (type) {
        var origin = this.origin;
        var distance = this.distance;
        var camera = [0, 0, 0];
        var heading = [0, 0, 1];
        switch (type) {
            //top and bottom are different because these are singular points for look-at function if heading is [0,0,1]
            case ViewType.TOP:
                //only move to origin and up (negative values because we move camera against model)
                mat4_1.mat4.translate(this.mvMatrix, mat4_1.mat4.create(), [origin[0] * -1.0, origin[1] * -1.0, (distance + origin[2]) * -1.0]);
                return;
            case ViewType.BOTTOM:
                //only move to origin and up and rotate 180 degrees around Y axis
                var toOrigin = mat4_1.mat4.translate(mat4_1.mat4.create(), mat4_1.mat4.create(), [origin[0] * -1.0, origin[1] * +1.0, (origin[2] + distance) * -1]);
                var rotationY = mat4_1.mat4.rotateY(mat4_1.mat4.create(), toOrigin, Math.PI);
                var rotationZ = mat4_1.mat4.rotateZ(mat4_1.mat4.create(), rotationY, Math.PI);
                this
                    .mvMatrix = rotationZ;
                // mat4.translate(mat4.create(), rotationZ, [0, 0, -1.0 * distance]);
                return;
            case ViewType.FRONT:
                camera = [origin[0], origin[1] - distance, origin[2]];
                break;
            case ViewType.BACK:
                camera = [origin[0], origin[1] + distance, origin[2]];
                break;
            case ViewType.LEFT:
                camera = [origin[0] - distance, origin[1], origin[2]];
                break;
            case ViewType.RIGHT:
                camera = [origin[0] + distance, origin[1], origin[2]];
                break;
            case ViewType.DEFAULT:
                var a = Math.sqrt(distance * distance / 3);
                camera = [origin[0] - a, origin[1] - a, origin[2] + a];
                break;
            default:
                break;
        }
        // use look-at function to set up camera and target
        mat4_1.mat4.lookAt(this.mvMatrix, camera, origin, heading);
    };
    Viewer.prototype.startRotation = function () {
        var _this = this;
        this._rotationOn = true;
        var interval = 30; // ms
        var rotate = function () {
            if (!_this._rotationOn) {
                return;
            }
            mat4_1.mat4.rotateZ(_this.mvMatrix, new Float32Array(_this.mvMatrix), 0.2 * Math.PI / 180.0);
            setTimeout(rotate, interval);
        };
        setTimeout(rotate, interval);
    };
    Viewer.prototype.stopRotation = function () {
        this._rotationOn = false;
    };
    Viewer.prototype.error = function (msg) {
        /**
        * Occurs when viewer encounters error. You should listen to this because it might also report asynchronous errors which you would miss otherwise.
        *
        * @event Viewer#error
        * @type {object}
        * @param {string} message - Error message
        */
        this.fire('error', { message: msg });
    };
    Viewer.prototype.getIdsFromEvent = function (event) {
        var x = event.clientX;
        var y = event.clientY;
        //get coordinates within canvas (with the right orientation)
        var r = this.canvas.getBoundingClientRect();
        var viewX = x - r.left;
        var viewY = this.height - (y - r.top);
        //get product id and model id
        return { id: this.getID(viewX, viewY, false), model: this.getID(viewX, viewY, true) };
    };
    //this renders the colour coded model into the memory buffer
    //not to the canvas and use it to identify ID of the object from that
    Viewer.prototype.getID = function (x, y, modelId) {
        var _this = this;
        if (modelId === void 0) { modelId = false; }
        //skip all the GPU work if there is only one model loaded and model ID is requested
        if (modelId && this._handles.length === 1) {
            return this._handles[0].id;
        }
        //call all before-drawId plugins
        this._plugins.forEach(function (plugin) {
            if (!plugin.onBeforeDrawId) {
                return;
            }
            plugin.onBeforeDrawId();
        });
        //it is not necessary to render the image in full resolution so this factor is used for less resolution. 
        var factor = 2;
        var gl = this.setActive();
        var width = this.width / factor;
        var height = this.height / factor;
        x = x / factor;
        y = y / factor;
        //create framebuffer
        var frameBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        // create renderbuffer
        var renderBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer);
        // allocate renderbuffer
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        var texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        // Set the parameters so we can render any image size.        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        // attach renderbuffer and texture
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderBuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
            this.error('this combination of attachments does not work');
            return null;
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        gl.viewport(0, 0, width, height);
        gl.enable(gl.DEPTH_TEST); //we don't use any kind of blending or transparency
        gl.disable(gl.BLEND);
        gl.clearColor(0, 0, 0, 0); //zero colour for no-values
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        //set uniform for colour coding
        gl.uniform1i(this._colorCodingUniformPointer, ColourCoding.PRODUCTS);
        //render colour coded image using latest buffered data
        this._handles.forEach(function (handle) {
            if (!handle.stopped && handle.pickable) {
                if (modelId) {
                    gl.uniform1i(_this._colorCodingUniformPointer, handle.id);
                }
                handle.setActive(_this._pointers);
                handle.draw();
            }
        });
        //call all after-drawId plugins
        this._plugins.forEach(function (plugin) {
            if (!plugin.onAfterDrawId) {
                return;
            }
            plugin.onAfterDrawId();
        });
        //get colour in of the pixel
        var result = new Uint8Array(4);
        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, result);
        //reset framebuffer to render into canvas again
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        //free GPU memory
        gl.deleteTexture(texture);
        gl.deleteRenderbuffer(renderBuffer);
        gl.deleteFramebuffer(frameBuffer);
        //set back blending
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
        //decode ID (bit shifting by multiplication)
        var hasValue = result[3] != 0; //0 transparency is only for no-values
        if (hasValue) {
            var id = result[0] + result[1] * 256 + result[2] * 256 * 256;
            var handled = false;
            this._plugins.forEach(function (plugin) {
                if (!plugin.onBeforeGetId) {
                    return;
                }
                handled = handled || plugin.onBeforeGetId(id);
            });
            if (!handled)
                return id;
            else
                return null;
        }
        else {
            return null;
        }
    };
    /**
    * Use this function to start animation of the model. If you start animation before geometry is loaded it will wait for content to render it.
    * This function is bound to browser framerate of the screen so it will stop consuming any resources if you switch to another tab.
    *
    * @function Viewer#start
    * @param {Number} id [optional] - Optional ID of the model to be stopped. You can get this ID from {@link Viewer#event:loaded loaded} event.
    */
    Viewer.prototype.start = function (id) {
        if (typeof (id) !== 'undefined') {
            var handle = this.getHandle(id);
            if (typeof (handle) === 'undefined')
                throw "Model doesn't exist.";
            handle.stopped = false;
            this._numberOfActiveModels++;
            return;
        }
        this._isRunning = true;
        this._userAction = true; // force redraw in case some config has changed
        var viewer = this;
        var lastTime = new Date();
        var counter = 0;
        function tick() {
            counter++;
            if (counter == 30) {
                counter = 0;
                var newTime = new Date();
                var span = newTime.getTime() - lastTime.getTime();
                lastTime = newTime;
                var fps = 1000 / span * 30;
                /**
                * Occurs after every 30th frame in animation. Use this event if you want to report FPS to the user. It might also be interesting performance measure.
                *
                * @event Viewer#fps
                * @type {Number}
                */
                viewer.fire('fps', Math.floor(fps));
            }
            if (viewer._isRunning) {
                window.requestAnimationFrame(tick);
                viewer.draw(false);
            }
        }
        tick();
    };
    /**
    * Use this function to stop animation of the model. User will still be able to see the latest state of the model. You can
    * switch animation of the model on again by calling {@link Viewer#start start()}.
    *
    * @function Viewer#stop
    * @param {Number} id [optional] - Optional ID of the model to be stopped. You can get this ID from {@link Viewer#event:loaded loaded} event.
    */
    Viewer.prototype.stop = function (id) {
        if (typeof (id) === 'undefined') {
            this._isRunning = false;
            return;
        }
        var model = this.getHandle(id);
        if (typeof (model) === 'undefined')
            throw "Model doesn't exist.";
        model.stopped = true;
        this._numberOfActiveModels--;
    };
    /**
    * Use this function to stop all models. You can
    * switch animation of the model on again by calling {@link Viewer#start start()}.
    *
    * @function Viewer#stopAll
    */
    Viewer.prototype.stopAll = function () {
        var _this = this;
        this._handles.forEach(function (model) {
            model.stopped = true;
            _this._numberOfActiveModels--;
        });
        // we can stop the loop when there isn't anything to draw
        this._isRunning = false;
    };
    /**
     * Checks if the model with defined ID is currently loaded and running
     *
     * @param {number} id - Model ID
     * @returns {boolean} True if model is loaded and running, false otherwise
     */
    Viewer.prototype.isModelOn = function (id) {
        var model = this.getHandle(id);
        if (!model)
            return false;
        return !model.stopped;
    };
    /**
     * Checks if the model with defined ID is currently loaded in the viewer.
     *
     * @param {number} id - Model ID
     * @returns {boolean} True if model is loaded, false otherwise
     */
    Viewer.prototype.isModelLoaded = function (id) {
        var model = this.getHandle(id);
        if (!model)
            return false;
        return true;
    };
    /**
    * Use this function to start all models. You can
    * switch animation of the model off by calling {@link Viewer#stop stop()}.
    *
    * @function Viewer#startAll
    */
    Viewer.prototype.startAll = function () {
        var _this = this;
        this._handles.forEach(function (model) {
            model.stopped = false;
            _this._numberOfActiveModels++;
        });
        // make sure the viewer is running
        this._isRunning = true;
    };
    /**
    * Use this function to stop picking of the objects in the specified model. It will behave as if not present for all picking operations.
    * All models are pickable by default when loaded.
    *
    * @function Viewer#stopPicking
    * @param {Number} id - ID of the model to be stopped. You can get this ID from {@link Viewer#event:loaded loaded} event.
    */
    Viewer.prototype.stopPicking = function (id) {
        var model = this.getHandle(id);
        if (typeof (model) === 'undefined')
            throw "Model doesn't exist.";
        model.pickable = false;
    };
    /**
    * Use this function to enable picking of the objects in the specified model.
    * All models are pickable by default when loaded. You can stop the model from being pickable using {@link Viewer#stopPicking} function.
    *
    * @function Viewer#startPicking
    * @param {Number} id - ID of the model to be stopped. You can get this ID from {@link Viewer#event:loaded loaded} event.
    */
    Viewer.prototype.startPicking = function (id) {
        var model = this.getHandle(id);
        if (typeof (model) === 'undefined')
            throw "Model doesn't exist.";
        model.pickable = true;
    };
    /**
     * Use this method to register to events of the viewer like {@link Viewer#event:pick pick}, {@link Viewer#event:mouseDown mouseDown},
     * {@link Viewer#event:loaded loaded} and others. You can define arbitrary number
     * of event handlers for any event. You can remove handler by calling {@link Viewer#off off()} method.
     *
     * @function Viewer#on
     * @param {String} eventName - Name of the event you would like to listen to.
     * @param {Object} callback - Callback handler of the event which will consume arguments and perform any custom action.
    */
    Viewer.prototype.on = function (eventName, callback) {
        var events = this._events;
        if (!events[eventName]) {
            events[eventName] = new Array();
        }
        events[eventName].push(callback);
    };
    /**
    * Use this method to unregister handlers from events. You can add event handlers by calling the {@link Viewer#on on()} method.
    *
    * @function Viewer#off
    * @param {String} eventName - Name of the event
    * @param {Object} callback - Handler to be removed
    */
    Viewer.prototype.off = function (eventName, callback) {
        var events = this._events;
        var callbacks = events[eventName];
        if (!callbacks) {
            return;
        }
        var index = callbacks.indexOf(callback);
        if (index >= 0) {
            callbacks.splice(index, 1);
        }
    };
    //executes all handlers bound to event name
    Viewer.prototype.fire = function (eventName, args) {
        var handlers = this._events[eventName];
        if (!handlers) {
            return;
        }
        //call the callbacks
        handlers.slice().forEach(function (handler) {
            try {
                handler(args);
            }
            catch (e) {
                console.error(e);
            }
        });
    };
    Viewer.prototype.disableTextSelection = function () {
        //disable text selection
        document.documentElement.style['-webkit-touch-callout'] = 'none';
        document.documentElement.style['-webkit-user-select'] = 'none';
        document.documentElement.style['-khtml-user-select'] = 'none';
        document.documentElement.style['-moz-user-select'] = 'none';
        document.documentElement.style['-ms-user-select'] = 'none';
        document.documentElement.style['user-select'] = 'none';
    };
    Viewer.prototype.enableTextSelection = function () {
        //enable text selection again
        document.documentElement.style['-webkit-touch-callout'] = 'text';
        document.documentElement.style['-webkit-user-select'] = 'text';
        document.documentElement.style['-khtml-user-select'] = 'text';
        document.documentElement.style['-moz-user-select'] = 'text';
        document.documentElement.style['-ms-user-select'] = 'text';
        document.documentElement.style['user-select'] = 'text';
    };
    /**
    * This method can be used to get parameter of the current clipping plane. If no clipping plane is active
    * this returns [[0,0,0],[0,0,0]];
    *
    * @function xViewer#getClip
    * @return  {Number[][]} Point and normal defining current clipping plane
    */
    Viewer.prototype.getClip = function () {
        var cp = this._clippingPlaneA;
        if (!this._clippingA || cp.every(function (e) { return e === 0; })) {
            return [[0, 0, 0], [0, 0, 0]];
        }
        var normal = vec3_1.vec3.normalize(vec3_1.vec3.create(), [cp[0], cp[1], cp[2]]);
        //test if the last clipping point fits in the condition
        var lp = this._lastClippingPoint;
        var test = lp[0] * cp[0] + lp[1] * cp[1] + lp[2] * cp[2] + cp[3];
        if (Math.abs(test) < 1e-5) {
            return [lp, [normal[0], normal[1], normal[2]]];
        }
        //find the point on the plane
        var x = cp[0] !== 0 ? -1.0 * cp[3] / cp[0] : 0.0;
        var y = cp[1] !== 0 ? -1.0 * cp[3] / cp[1] : 0.0;
        var z = cp[2] !== 0 ? -1.0 * cp[3] / cp[2] : 0.0;
        return [[x, y, z], [normal[0], normal[1], normal[2]]];
    };
    /**
    * Use this method to clip the model. Use {@link xViewer#unclip unclip()} method to
    * unset clipping plane.
    *
    * @function xViewer#clip
    * @param {Number[]} point - point in clipping plane
    * @param {Number[]} normal - normal pointing to the half space which will be hidden
    * @fires xViewer#clipped
    */
    Viewer.prototype.clip = function (point, normal) {
        if (typeof (point) != 'undefined' && typeof (normal) != 'undefined') {
            this._lastClippingPoint = point;
            //compute normal equation of the plane
            var d = 0.0 - normal[0] * point[0] - normal[1] * point[1] - normal[2] * point[2];
            //set clipping plane
            this.clippingPlaneA = [normal[0], normal[1], normal[2], d];
            /**
            * Occurs when model is clipped. This event has empty object.
            *
            * @event xViewer#clipped
            * @type {object}
            */
            this.fire('clipped', {});
            return;
        }
    };
    /**
    * This method will cancel any clipping plane if it is defined. Use {@link xViewer#clip clip()}
    * method to define clipping by point and normal of the plane or interactively if you call it with no arguments.
    * @function xViewer#unclip
    * @fires xViewer#unclipped
    */
    Viewer.prototype.unclip = function () {
        this.clippingPlaneA = null;
        this.clippingPlaneB = null;
    };
    Object.defineProperty(Viewer.prototype, "clippingPlaneA", {
        get: function () {
            return this._clippingPlaneA;
        },
        set: function (plane) {
            this._clippingPlaneA = plane;
            this._clippingA = plane != null;
            if (this._clippingA) {
                this.fire('clipped', {});
            }
            else {
                /**
              * Occurs when clipping of the model is dismissed. This event has empty object.
              *
              * @event xViewer#unclipped
              * @type {object}
              */
                this.fire('unclipped', {});
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Viewer.prototype, "clippingPlaneB", {
        get: function () {
            return this._clippingPlaneA;
        },
        set: function (plane) {
            this._clippingPlaneB = plane;
            this._clippingB = plane != null;
            if (this._clippingA) {
                this.fire('clipped', {});
            }
            else {
                this.fire('unclipped', {});
            }
        },
        enumerable: true,
        configurable: true
    });
    return Viewer;
}());
exports.Viewer = Viewer;
var ModelPointers = (function () {
    function ModelPointers(gl, program) {
        //get attribute pointers
        this.NormalAttrPointer = gl.getAttribLocation(program, 'aNormal');
        this.IndexlAttrPointer = gl.getAttribLocation(program, 'aVertexIndex');
        this.ProductAttrPointer = gl.getAttribLocation(program, 'aProduct');
        this.StateAttrPointer = gl.getAttribLocation(program, 'aState');
        this.StyleAttrPointer = gl.getAttribLocation(program, 'aStyleIndex');
        this.TransformationAttrPointer = gl.getAttribLocation(program, 'aTransformationIndex');
        //get uniform pointers
        this.VertexSamplerUniform = gl.getUniformLocation(program, 'uVertexSampler');
        this.MatrixSamplerUniform = gl.getUniformLocation(program, 'uMatrixSampler');
        this.StyleSamplerUniform = gl.getUniformLocation(program, 'uStyleSampler');
        this.VertexTextureSizeUniform = gl.getUniformLocation(program, 'uVertexTextureSize');
        this.MatrixTextureSizeUniform = gl.getUniformLocation(program, 'uMatrixTextureSize');
        this.StyleTextureSizeUniform = gl.getUniformLocation(program, 'uStyleTextureSize');
        //enable vertex attributes arrays
        gl.enableVertexAttribArray(this.NormalAttrPointer);
        gl.enableVertexAttribArray(this.IndexlAttrPointer);
        gl.enableVertexAttribArray(this.ProductAttrPointer);
        gl.enableVertexAttribArray(this.StateAttrPointer);
        gl.enableVertexAttribArray(this.StyleAttrPointer);
        gl.enableVertexAttribArray(this.TransformationAttrPointer);
    }
    return ModelPointers;
}());
exports.ModelPointers = ModelPointers;
var ColourCoding;
(function (ColourCoding) {
    ColourCoding[ColourCoding["NONE"] = -1] = "NONE";
    ColourCoding[ColourCoding["PRODUCTS"] = -2] = "PRODUCTS";
})(ColourCoding || (ColourCoding = {}));
var RenderingMode;
(function (RenderingMode) {
    RenderingMode[RenderingMode["NORMAL"] = 0] = "NORMAL";
    RenderingMode[RenderingMode["GRAYSCALE"] = 1] = "GRAYSCALE";
    RenderingMode[RenderingMode["XRAY"] = 2] = "XRAY";
    RenderingMode[RenderingMode["_XRAY2"] = 3] = "_XRAY2";
})(RenderingMode = exports.RenderingMode || (exports.RenderingMode = {}));
var ViewType;
(function (ViewType) {
    ViewType[ViewType["TOP"] = 0] = "TOP";
    ViewType[ViewType["BOTTOM"] = 1] = "BOTTOM";
    ViewType[ViewType["FRONT"] = 2] = "FRONT";
    ViewType[ViewType["BACK"] = 3] = "BACK";
    ViewType[ViewType["LEFT"] = 4] = "LEFT";
    ViewType[ViewType["RIGHT"] = 5] = "RIGHT";
    ViewType[ViewType["DEFAULT"] = 6] = "DEFAULT";
})(ViewType = exports.ViewType || (exports.ViewType = {}));
//# sourceMappingURL=viewer.js.map