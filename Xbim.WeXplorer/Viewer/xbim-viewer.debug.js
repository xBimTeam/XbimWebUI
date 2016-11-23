
/**
* This is constructor of the xBIM Viewer. It gets HTMLCanvasElement or string ID as an argument. Viewer will than be initialized 
* in the context of specified canvas. Any other argument will throw exception.
* @name xViewer
* @constructor
* @classdesc This is the main and the only class you need to load and render IFC models in wexBIM format. This viewer is part of
* xBIM toolkit which can be used to create wexBIM files from IFC, ifcZIP and ifcXML. WexBIM files are highly optimized for
* transmition over internet and rendering performance. Viewer uses WebGL technology for hardware accelerated 3D rendering and SVG for
* certain kinds of user interaction. This means that it won't work with obsolete and non-standard-compliant browsers like IE10 and less.
*
* @param {string | HTMLCanvasElement} canvas - string ID of the canvas or HTML canvas element.
*/
function xViewer(canvas) {
    if (typeof (canvas) == 'undefined') {
        throw 'Canvas has to be defined';
    }
    this._canvas = null;
    if (typeof(canvas.nodeName) != 'undefined' && canvas.nodeName == 'CANVAS') { 
        this._canvas = canvas;
    }
    if (typeof (canvas) == 'string') {
        this._canvas = document.getElementById(canvas);
    }
    if (this._canvas == null) {
        throw 'You have to specify canvas either as an ID of HTML element or the element itself';
    }

    /**
    * This is a structure that holds settings of perspective camera.
    * @member {PerspectiveCamera} xViewer#perspectiveCamera
    */
    /**
    * This is only a structure. Don't call the constructor.
    * @classdesc This is a structure that holds settings of perspective camera. If you want 
    * to switch viewer to use perspective camera set {@link xViewer#camera camera} to 'perspective'.
    * You can modify this but it is not necessary because sensible values are 
    * defined when geometry model is loaded with {@link xViewer#load load()} method. If you want to 
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
    * defined when geometry model is loaded with {@link xViewer#load load()} method. If you want to change these values you have to do it after geometry is loaded.
    * @member {OrthogonalCamera} xViewer#orthogonalCamera
    */
    /**
    * This is only a structure. Don't call the constructor.
    * @classdesc This is a structure that holds settings of orthogonal camera. If you want to switch viewer to use orthogonal camera set {@link xViewer#camera camera} to 'orthogonal'.
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
    * @member {string} xViewer#camera
    */
    this.camera = 'perspective';

    /**
    * Array of four integers between 0 and 255 representing RGBA colour components. This defines background colour of the viewer. You can change this value at any time with instant effect.
    * @member {Number[]} xViewer#background
    */
    this.background = [230, 230, 230, 255];
    /**
    * Array of four integers between 0 and 255 representing RGBA colour components. This defines colour for highlighted elements. You can change this value at any time with instant effect.
    * @member {Number[]} xViewer#highlightingColour
    */
    this.highlightingColour = [255, 173, 33, 255];
    /**
    * Array of four floats. It represents Light A's position <strong>XYZ</strong> and intensity <strong>I</strong> as [X, Y, Z, I]. Intensity should be in range 0.0 - 1.0.
    * @member {Number[]} xViewer#lightA
    */
    this.lightA = [0, 1000000, 200000, 0.8];
    /**
    * Array of four floats. It represents Light B's position <strong>XYZ</strong> and intensity <strong>I</strong> as [X, Y, Z, I]. Intensity should be in range 0.0 - 1.0.
    * @member {Number[]} xViewer#lightB
    */
    this.lightB = [0, -500000, 50000, 0.2];

    /**
    * Switch between different navigation modes for left mouse button. Allowed values: <strong> 'pan', 'zoom', 'orbit' (or 'fixed-orbit') , 'free-orbit' and 'none'</strong>. Default value is <strong>'orbit'</strong>;
    * @member {String} xViewer#navigationMode
    */
    this.navigationMode = 'orbit';

    /**
    * Switch between different rendering modes. Allowed values: <strong> 'normal', 'x-ray'</strong>. Default value is <strong>'normal'</strong>;
    * Only products with state set to state.HIGHLIGHTED or xState.XRAYVISIBLE will be rendered highlighted or in a normal colours. All other products
    * will be rendered semi-transparent and single sided.
    * @member {String} xViewer#renderingMode
    */
    this.renderingMode = 'normal';

    /** 
    * Clipping plane [a, b, c, d] defined as normal equation of the plane ax + by + cz + d = 0. [0,0,0,0] is for no clipping plane.
    * @member {Number[]} xViewer#clippingPlane
    */
    this.clippingPlane = [0, 0, 0, 0];

    this._lastClippingPoint = [0, 0, 0];


    //*************************** Do all the set up of WebGL **************************
    var gl = WebGLUtils.setupWebGL(this._canvas);

    //do not even initialize this object if WebGL is not supported
    if (!gl) {
        return;
    }

    this._gl = gl;

    //detect floating point texture support
    this._fpt = (
	gl.getExtension('OES_texture_float') ||
	gl.getExtension('MOZ_OES_texture_float') ||
	gl.getExtension('WEBKIT_OES_texture_float')
	);


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
    this._width = this._canvas.width = this._canvas.offsetWidth;
    this._height = this._canvas.height = this._canvas.offsetHeight;

    this._geometryLoaded = false;
    //number of active models is used to indicate that state has changed
    this._numberOfActiveModels = 0;
    //this object is used to identify if anything changed before two frames (hence if it is necessary to redraw)
    this._lastStates = {};
    this._visualStateAttributes = ["perspectiveCamera", "orthogonalCamera", "camera", "background", "lightA", "lightB",
        "renderingMode", "clippingPlane", "_mvMatrix", "_pMatrix", "_distance", "_origin", "highlightingColour", "_numberOfActiveModels"];
    this._stylingChanged = true;

    //this is to indicate that user has done some interaction
    this._userAction = true;

    //dictionary of named events which can be registered and unregistered by using '.on('eventname', callback)'
    // and '.off('eventname', callback)'. Registered call-backs are triggered by the viewer when important events occur.
    this._events = {};

    //array of plugins which can implement certain methods which get called at certain points like before draw, after draw and others.
    this._plugins = [];

    //pointers to uniforms in shaders
    this._mvMatrixUniformPointer = null;
    this._pMatrixUniformPointer = null;
    this._lightAUniformPointer = null;
    this._lightBUniformPointer = null;
    this._colorCodingUniformPointer = null;
    this._clippingPlaneUniformPointer = null;
    this._meterUniformPointer = null;
    this._renderingModeUniformPointer = null;
    this._highlightingColourUniformPointer = null;

    //transformation matrices
    this._mvMatrix = mat4.create(); 	//world matrix
    this._pMatrix = mat4.create(); 		//camera matrix (this can be either perspective or orthogonal camera)

    //Navigation settings - coordinates in the WCS of the origin used for orbiting and panning
    this._origin = [0, 0, 0]
    //Default distance for default views (top, bottom, left, right, front, back)
    this._distance = 0;
    //shader program used for rendering
    this._shaderProgram = null;

    //Array of handles which can eventually contain handles to one or more models.
    //Models are loaded using 'load()' function.
    this._handles = [];

    //This array keeps data for overlay styles.
    this._stateStyles = new Uint8Array(15 * 15 * 4);

    //This is a switch which can stop animation.
    this._isRunning = true;

    //********************** Run all the initialize functions *****************************
    //compile shaders for use
    this._initShaders();
    //initialize vertex attribute and uniform pointers
    this._initAttributesAndUniforms();
    //initialize mouse events to capture user interaction
    this._initMouseEvents();
};

/**
* This is a static function which should always be called before xViewer is instantiated.
* It will check all prerequisites of the viewer and will report all issues. If Prerequisities.errors contain
* any messages viewer won't work. If Prerequisities.warnings contain any messages it will work but some
* functions may be restricted or may not work or it may have poor performance.
* @function xViewer.check
* @return {Prerequisites}
*/
xViewer.check = function () {
    /**
    * This is a structure reporting errors and warnings about prerequisites of {@link xViewer xViewer}. It is result of {@link xViewer.checkPrerequisities checkPrerequisities()} static method.
    *
    * @name Prerequisites
    * @class
    */
    var result = {
        /**
        * If this array contains any warnings xViewer will work but it might be slow or may not support full functionality.
        * @member {string[]}  Prerequisites#warnings
        */
        warnings: [],
        /**
        * If this array contains any errors xViewer won't work at all or won't work as expected. 
        * You can use messages in this array to report problems to user. However, user won't probably 
        * be able to do to much with it except trying to use different browser. IE10- are not supported for example. 
        * The latest version of IE should be all right.
        * @member {string[]}  Prerequisites#errors
        */
        errors: [],
        /**
        * If false xViewer won't work at all or won't work as expected. 
        * You can use messages in {@link Prerequisites#errors errors array} to report problems to user. However, user won't probably 
        * be able to do to much with it except trying to use different browser. IE10- are not supported for example. 
        * The latest version of IE should be all right.
        * @member {string[]}  Prerequisites#noErrors
        */
        noErrors: false,
        /**
        * If false xViewer will work but it might be slow or may not support full functionality. Use {@link Prerequisites#warnings warnings array} to report problems.
        * @member {string[]}  Prerequisites#noWarnings
        */
        noWarnings: false
    };

    //check WebGL support
    var canvas = document.createElement('canvas');
    if (!canvas) result.errors.push("Browser doesn't have support for HTMLCanvasElement. This is critical.");
    else {
        var gl = WebGLUtils.setupWebGL(canvas);
        if (gl == null) result.errors.push("Browser doesn't support WebGL. This is critical.");
        else {
            //check floating point extension availability
            var fpt = (
	            gl.getExtension('OES_texture_float') ||
	            gl.getExtension('MOZ_OES_texture_float') ||
	            gl.getExtension('WEBKIT_OES_texture_float')
	            );
            if (!fpt) result.warnings.push('Floating point texture extension is not supported. Performance of the viewer will be very bad. But it should work.');

            //check number of supported vertex shader textures. Minimum is 5 but standard requires 0.
            var vertTextUnits = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
            if (vertTextUnits < 4) result.errors.push("Browser supports only " + vertTextUnits + " vertex texture image units but minimal requirement for the viewer is 4.");
        }
    }

    //check FileReader and Blob support
    if (!window.File || !window.FileReader ||  !window.Blob)  result.errors.push("Browser doesn't support 'File', 'FileReader' or 'Blob' objects.");
    

    //check for typed arrays
    if (!window.Int32Array || !window.Float32Array) result.errors.push("Browser doesn't support TypedArrays. These are crucial for binary parsing and for comunication with GPU.");
    
    //check SVG support
    if (!document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1")) result.warnings.push("Browser doesn't support SVG. This is used for user interaction like interactive clipping. Functions using SVG shouldn't crash but they won't work as expected.");

    //set boolean members for convenience
    if (result.errors.length == 0) result.noErrors = true;
    if (result.warnings.length == 0) result.noWarnings = true;
    return result;
};

/**
* Adds plugin to the viewer. Plugins can implement certain methods which get called in certain moments in time like
* before draw, after draw etc. This makes it possible to implement functionality tightly integrated into xViewer like navigation cube or others. 
* @function xViewer#addPlugin
* @param {object} plugin - plug-in object
*/
xViewer.prototype.addPlugin = function (plugin) {
    this._plugins.push(plugin);

    if (!plugin.init) return;
    plugin.init(this);
};

/**
* Removes plugin from the viewer. Plugins can implement certain methods which get called in certain moments in time like
* before draw, after draw etc. This makes it possible to implement functionality tightly integrated into xViewer like navigation cube or others. 
* @function xViewer#removePlugin
* @param {object} plugin - plug-in object
*/
xViewer.prototype.removePlugin = function (plugin) {
    var index = this._plugins.indexOf(plugin, 0);
    if (index < 0) return;
    this._plugins.splice(index, 1);
};

/**
* Use this function to define up to 224 optional styles which you can use to change appearance of products and types if you pass the index specified in this function to {@link xViewer#setState setState()} function.
* @function xViewer#defineStyle
* @param {Number} index - Index of the style to be defined. This has to be in range 0 - 224. Index can than be passed to change appearance of the products in model
* @param {Number[]} colour - Array of four numbers in range 0 - 255 representing RGBA colour. If there are less or more numbers exception is thrown.
*/
xViewer.prototype.defineStyle = function (index, colour) {
    if (typeof (index) == 'undefined' || (index < 0 && index > 224)) throw 'Style index has to be defined as a number 0-224';
    if (typeof (colour) == 'undefined' || colour.length == 'undefined' || colour.length != 4) throw 'Colour must be defined as an array of 4 bytes';
    this._stylingChanged = true;

    //set style to style texture via model handle
    var colData = new Uint8Array(colour);
    this._stateStyles.set(colData, index * 4);

    //if there are some handles already set this style in there
    this._handles.forEach(function (handle) {
        handle.stateStyle = this._stateStyles;
        handle.refreshStyles();
    }, this);
};

    

/**
* You can use this function to change state of products in the model. State has to have one of values from {@link xState xState} enumeration. 
* Target is either enumeration from {@link xProductType xProductType} or array of product IDs. If you specify type it will effect all elements of the type.
*
* @function xViewer#setState
* @param {Number} state - One of {@link xState xState} enumeration values.
* @param {Number[] | Number} target - Target of the change. It can either be array of product IDs or product type from {@link xProductType xProductType}.
*/
xViewer.prototype.setState = function (state, target) {
    if (typeof (state) == 'undefined' || !(state >= 225 && state <= 255)) throw 'State has to be defined as 225 - 255. Use xState enum.';
    this._handles.forEach(function (handle) {
        handle.setState(state, target);
    }, this);
    this._stylingChanged = true;
};

/**
* Use this function to get state of the products in the model. You can compare result of this function 
* with one of values from {@link xState xState} enumeration. 0xFF is the default value.
*
* @function xViewer#getState
* @param {Number} id - Id of the product. You would typically get the id from {@link xViewer#event:pick pick event} or similar event.
*/
xViewer.prototype.getState = function (id) {
    var state = null;
    this._handles.forEach(function (handle) {
        state = handle.getState(id);
        if (state !== null) {
            return;
        }
    }, this);
    return state;
};

/**
* Use this function to reset state of all products to 'UNDEFINED' which means visible and not highlighted. 
* You can use optional hideSpaces parameter if you also want to show spaces. They will be hidden by default.
* 
* @function xViewer#resetStates
* @param {Bool} [hideSpaces = true] - Default state is UNDEFINED which would also show spaces. That is often not 
* desired so it can be excluded with this parameter.
*/
xViewer.prototype.resetStates = function (hideSpaces) {
    this._handles.forEach(function (handle) {
        handle.resetStates();
    }, this);
    //hide spaces
    hideSpaces = typeof (hideSpaces) != 'undefined' ? hideSpaces : true;
    if (hideSpaces){
        this._handles.forEach(function (handle) {
            handle.setState(xState.HIDDEN, xProductType.IFCSPACE);
        }, this);
    }
    this._stylingChanged = true;
};

/**
 * Gets complete model state and style. Resulting object can be used to restore the state later on.
 * 
 * @param {Number} id - Model ID which you can get from {@link xViewer#event:loaded loaded} event.
 * @returns {Array} - Array representing model state in compact form suitable for serialization
 */
xViewer.prototype.getModelState = function (id) {
    var handle = this._handles[id];
    if (typeof (handle) === "undefined") {
        throw "Model doesn't exist";
    }

    return handle.getModelState();
};

/**
 * Restores model state from the data previously captured with {@link xViewer#getModelState getModelState()} function
 * @param {Number} id - ID of the model
 * @param {Array} state - State of the model as obtained from {@link xViewer#getModelState getModelState()} function
 */
xViewer.prototype.restoreModelState = function (id, state) {
    var handle = this._handles[id];
    if (typeof (handle) === "undefined") {
        throw "Model doesn't exist";
    }

    handle.restoreModelState(state);
    this._stylingChanged = true;
};

/**
* Use this method for restyling of the model. This doesn't change the default appearance of the products so you can think about it as an overlay. You can 
* remove the overlay if you set the style to {@link xState#UNSTYLED xState.UNSTYLED} value. You can combine restyling and hiding in this way. 
* Use {@link xViewer#defineStyle defineStyle()} to define styling first. 
* 
* @function xViewer#setStyle
* @param style - style defined in {@link xViewer#defineStyle defineStyle()} method
* @param {Number[] | Number} target - Target of the change. It can either be array of product IDs or product type from {@link xProductType xProductType}.
*/
xViewer.prototype.setStyle = function (style, target) {
    if (typeof (style) == 'undefined' || !(style >= 0 && style <= 225)) throw 'Style has to be defined as 0 - 225 where 225 is for default style.';
    var c = [
        this._stateStyles[style * 4],
        this._stateStyles[style * 4 + 1],
        this._stateStyles[style * 4 + 2],
        this._stateStyles[style * 4 + 3]
    ];
    if (c[0] == 0 && c[1] == 0 && c[2] == 0 && c[3] == 0 && console && console.warn)
        console.warn('You have used undefined colour for restyling. Elements with this style will have transparent black colour and hence will be invisible.');

    this._handles.forEach(function (handle) {
        handle.setState(style, target);
    }, this);
    this._stylingChanged = true;
};

/**
* Use this function to get overriding colour style of the products in the model. The number you get is the index of 
* your custom colour which you have defined in {@link xViewer#defineStyle defineStyle()} function. 0xFF is the default value.
*
* @function xViewer#getStyle
* @param {Number} id - Id of the product. You would typically get the id from {@link xViewer#event:pick pick event} or similar event.
*/
xViewer.prototype.getStyle = function (id) {
    this._handles.forEach(function (handle) {
        var style = handle.getStyle(id);
        if (style !== null) {
            return style;
        }
    }, this);
    return null;
};

/**
* Use this function to reset appearance of all products to their default styles.
*
* @function xViewer#resetStyles 
*/
xViewer.prototype.resetStyles = function () {
    this._handles.forEach(function (handle) {
        handle.resetStyles();
    }, this);
    this._stylingChanged = true;
};

/**
* 
* @function xViewer#getProductType
* @return {Number} Product type ID. This is either null if no type is identified or one of {@link xProductType type ids}.
* @param {Number} prodID - Product ID. You can get this value either from semantic structure of the model or by listening to {@link xViewer#event:pick pick} event.
*/
xViewer.prototype.getProductType = function (prodId) {
    var pType = null;
    this._handles.forEach(function (handle) {
        var map = handle.getProductMap(prodId);
        if (map) pType = map.type;
    }, this);
    return pType;
};

/**
* Use this method to set position of camera. Use it after {@link xViewer#setCameraTarget setCameraTarget()} to get desired result.
* 
* @function xViewer#setCameraPosition
* @param {Number[]} coordinates - 3D coordinates of the camera in WCS
*/
xViewer.prototype.setCameraPosition = function (coordinates) {
    if (typeof (coordinates) == 'undefined') throw 'Parameter coordinates must be defined';
    mat4.lookAt(this._mvMatrix, coordinates, this._origin, [0,0,1]);
}

/**
* This method sets navigation origin to the centroid of specified product's bounding box or to the centre of model if no product ID is specified.
* This method doesn't affect the view itself but it has an impact on navigation. Navigation origin is used as a centre for orbiting and it is used
* if you call functions like {@link xViewer.show show()} or {@link xViewer#zoomTo zoomTo()}.
* @function xViewer#setCameraTarget
* @param {Number} prodId [optional] Product ID. You can get ID either from semantic structure of the model or from {@link xViewer#event:pick pick event}.
* @return {Bool} True if the target exists and is set, False otherwise
*/
xViewer.prototype.setCameraTarget = function (prodId) {
    var viewer = this;
    //helper function for setting of the distance based on camera field of view and size of the product's bounding box
    var setDistance = function (bBox) {
        var size = Math.max(bBox[3], bBox[4], bBox[5]);
        var ratio = Math.max(viewer._width, viewer._height) / Math.min(viewer._width, viewer._height);
        viewer._distance = size / Math.tan(viewer.perspectiveCamera.fov * Math.PI / 180.0) * ratio * 1.0;
    }

    //set navigation origin and default distance to the product BBox
    if (typeof (prodId) != 'undefined' && prodId != null) {
        //get product BBox and set it's centre as a navigation origin
        var bbox = null;
        this._handles.every(function (handle) {
            var map = handle.getProductMap(prodId);
            if (map) {
                bbox = map.bBox;
                return false;
            }
            return true;
        });
        if (bbox) {
            this._origin = [bbox[0] + bbox[3] / 2.0, bbox[1] + bbox[4] / 2.0, bbox[2] + bbox[5] / 2.0];
            setDistance(bbox);
            return true;
        }
        else
            return false;
    }
        //set navigation origin and default distance to the most populated region from the first model
    else {
        //get region extent and set it's centre as a navigation origin
        var handle = this._handles[0];
        if (handle) {
            var region = handle.region
            if (region) {
                this._origin = [region.centre[0], region.centre[1], region.centre[2]]
                setDistance(region.bbox);
            }
        }
        return true;
    }
};

/**
* This method can be used for batch setting of viewer members. It doesn't check validity of the input.
* @function xViewer#set
* @param {Object} settings - Object containing key - value pairs
*/
xViewer.prototype.set = function (settings) {
    for (key in settings) {
        this[key] = settings[key];
    }
};

/**
* This method is used to load model data into viewer. Model has to be either URL to wexBIM file or Blob or File representing wexBIM file binary data. Any other type of argument will throw an exception.
* Region extend is determined based on the region of the model
* Default view if 'front'. If you want to define different view you have to set it up in handler of {@link xViewer#event:loaded loaded} event. <br>
* You can load more than one model if they occupy the same space, use the same scale and have unique product IDs. Duplicated IDs won't affect 
* visualization itself but would cause unexpected user interaction (picking, zooming, ...)
* @function xViewer#load
* @param {String | Blob | File} model - Model has to be either URL to wexBIM file or Blob or File representing wexBIM file binary data.
* @param {Any} tag [optional] - Tag to be used to identify the model in {@link xViewer#event:loaded loaded} event.
* @fires xViewer#loaded
*/
xViewer.prototype.load = function (model, tag) {
    if (typeof (model) == 'undefined') throw 'You have to specify model to load.';
    if (typeof(model) != 'string' && !(model instanceof Blob) && !(model instanceof File))
        throw 'Model has to be specified either as a URL to wexBIM file or Blob object representing the wexBIM file.';
    var gl = this._gl;
    var viewer = this;

    var geometry = new xModelGeometry();
    geometry.onloaded = function () {
        var handle = new xModelHandle(viewer._gl, geometry, viewer._fpt != null);
        viewer._handles.push(handle);

        handle.stateStyle = viewer._stateStyles;
        handle.feedGPU();

        //get one meter size from model and set it to shader
        var meter = handle._model.meter;
        gl.uniform1f(viewer._meterUniformPointer, meter);

        //only set camera parameters and the view if this is the first model
        if (viewer._handles.length === 1) {
            //set centre and default distance based on the most populated region in the model
            viewer.setCameraTarget();

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
            viewer.orthogonalCamera.left = maxSize / ratio * -1 * viewer._width / viewer._height;
            viewer.orthogonalCamera.right = maxSize / ratio * viewer._width / viewer._height;

            //set default view
            viewer.setCameraTarget();
            var dist = Math.sqrt(viewer._distance * viewer._distance / 3.0);
            viewer.setCameraPosition([region.centre[0] + dist * -1.0, region.centre[1] + dist * -1.0, region.centre[2] + dist]);
        }

        /**
         * Occurs when geometry model is loaded into the viewer. This event returns object containing ID of the model.
         * This ID can later be used to unload or temporarily stop the model.
         * 
         * @event xViewer#loaded
         * @type {object}
         * @param {Number} id - model ID
         * @param {Any} tag - tag which was passed to 'xViewer.load()' function
         * 
        */
        viewer._fire('loaded', {id: handle.id, tag: tag})
        viewer._geometryLoaded = true;
    };
    geometry.onerror = function (msg) {
        viewer._error(msg);
    }
    geometry.load(model);
};

/**
 * Unloads model from the GPU. This action is not reversible.
 * 
 * @param {Number} modelId - ID of the model which you can get from {@link xViewer#event:loaded loaded} event.
 */
xViewer.prototype.unload = function (modelId) {
    var handle = this._handles.filter(function (h) { return h.id === modelId }).pop();
    if (typeof (handle) === "undefined") throw "Model with id: " + modelId + " doesn't exist or was unloaded already."

    //stop for start so it doesn't interfere with the rendering loop
    handle.stopped = true;

    //remove from the array
    var index = this._handles.indexOf(handle);
    this._handles.splice(index, 1);
    this._numberOfActiveModels = this._handles.length;

    //unload and delete
    handle.unload();
    delete handle;
};


//this function should be only called once during initialization
//or when shader set-up changes
xViewer.prototype._initShaders = function () {
        
    var gl = this._gl;
    var viewer = this;
    var compile = function (shader, code) {
        gl.shaderSource(shader, code);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            viewer._error(gl.getShaderInfoLog(shader));
            return null;
        }
    }

    //fragment shader
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    compile(fragmentShader, xShaders.fragment_shader);
    
    //vertex shader (the more complicated one)
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    if (this._fpt != null) compile(vertexShader, xShaders.vertex_shader);
    else compile(vertexShader, xShaders.vertex_shader_noFPT);

    //link program
    this._shaderProgram = gl.createProgram();
    gl.attachShader(this._shaderProgram, vertexShader);
    gl.attachShader(this._shaderProgram, fragmentShader);
    gl.linkProgram(this._shaderProgram);

    if (!gl.getProgramParameter(this._shaderProgram, gl.LINK_STATUS)) {
        this._error('Could not initialise shaders ');
    }

    gl.useProgram(this._shaderProgram);
};

xViewer.prototype._initAttributesAndUniforms = function () {
    var gl = this._gl;

    //create pointers to uniform variables for transformations
    this._pMatrixUniformPointer = gl.getUniformLocation(this._shaderProgram, "uPMatrix");
    this._mvMatrixUniformPointer = gl.getUniformLocation(this._shaderProgram, "uMVMatrix");
    this._lightAUniformPointer = gl.getUniformLocation(this._shaderProgram, "ulightA");
    this._lightBUniformPointer = gl.getUniformLocation(this._shaderProgram, "ulightB");
    this._colorCodingUniformPointer = gl.getUniformLocation(this._shaderProgram, "uColorCoding");
    this._clippingPlaneUniformPointer = gl.getUniformLocation(this._shaderProgram, "uClippingPlane");
    this._meterUniformPointer = gl.getUniformLocation(this._shaderProgram, "uMeter");
    this._renderingModeUniformPointer = gl.getUniformLocation(this._shaderProgram, "uRenderingMode");
    this._highlightingColourUniformPointer = gl.getUniformLocation(this._shaderProgram, "uHighlightColour");

    this._pointers = {
        normalAttrPointer: gl.getAttribLocation(this._shaderProgram, "aNormal"),
        indexlAttrPointer: gl.getAttribLocation(this._shaderProgram, "aVertexIndex"),
        productAttrPointer: gl.getAttribLocation(this._shaderProgram, "aProduct"),
        stateAttrPointer: gl.getAttribLocation(this._shaderProgram, "aState"),
        styleAttrPointer: gl.getAttribLocation(this._shaderProgram, "aStyleIndex"),
        transformationAttrPointer: gl.getAttribLocation(this._shaderProgram, "aTransformationIndex"),
        vertexSamplerUniform: gl.getUniformLocation(this._shaderProgram, "uVertexSampler"),
        matrixSamplerUniform: gl.getUniformLocation(this._shaderProgram, "uMatrixSampler"),
        styleSamplerUniform: gl.getUniformLocation(this._shaderProgram, "uStyleSampler"),
        stateStyleSamplerUniform: gl.getUniformLocation(this._shaderProgram, "uStateStyleSampler"),
        vertexTextureSizeUniform: gl.getUniformLocation(this._shaderProgram, "uVertexTextureSize"),
        matrixTextureSizeUniform: gl.getUniformLocation(this._shaderProgram, "uMatrixTextureSize"),
        styleTextureSizeUniform: gl.getUniformLocation(this._shaderProgram, "uStyleTextureSize")
    };

    //enable vertex attributes arrays
    gl.enableVertexAttribArray(this._pointers.normalAttrPointer);
    gl.enableVertexAttribArray(this._pointers.indexlAttrPointer);
    gl.enableVertexAttribArray(this._pointers.productAttrPointer);
    gl.enableVertexAttribArray(this._pointers.stateAttrPointer);
    gl.enableVertexAttribArray(this._pointers.styleAttrPointer);
    gl.enableVertexAttribArray(this._pointers.transformationAttrPointer);
};

xViewer.prototype._initMouseEvents = function () {
    var viewer = this;

    var mouseDown = false;
    var lastMouseX = null;
    var lastMouseY = null;
    var startX = null;
    var startY = null;
    var button = 'L';
    var id = -1;

    //set initial conditions so that different gestures can be identified
    function handleMouseDown(event) {
        mouseDown = true;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
        startX = event.clientX;
        startY = event.clientY;

        //get coordinates within canvas (with the right orientation)
        var r = viewer._canvas.getBoundingClientRect();
        var viewX = startX - r.left;
        var viewY = viewer._height - (startY - r.top);

        //this is for picking
        id = viewer._getID(viewX, viewY);

        /**
        * Occurs when mousedown event happens on underlying canvas.
        *
        * @event xViewer#mouseDown
        * @type {object}
        * @param {Number} id - product ID of the element or null if there wasn't any product under mouse
        */
        viewer._fire('mouseDown', {id: id});


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

        viewer._disableTextSelection();
    }

    function handleMouseUp(event) {
        mouseDown = false;

        var endX = event.clientX;
        var endY = event.clientY;

        var deltaX = Math.abs(endX - startX);
        var deltaY = Math.abs(endY - startY);

        //if it was a longer movement do not perform picking
        if (deltaX < 3 && deltaY < 3 && button == 'left') {

            var handled = false;
            viewer._plugins.forEach(function (plugin) {
                if (!plugin.onBeforePick) {
                    return;
                }
                handled = handled || plugin.onBeforePick(id);
            }, this);

            /**
            * Occurs when user click on model.
            *
            * @event xViewer#pick
            * @type {object}
            * @param {Number} id - product ID of the element or null if there wasn't any product under mouse
            */
            if(!handled) viewer._fire('pick', {id : id});
        }

        viewer._enableTextSelection();
    }

    function handleMouseMove(event) {
        if (!mouseDown) {
            return;
        }

        if (viewer.navigationMode == 'none') {
            return;
        }

        var newX = event.clientX;
        var newY = event.clientY;

        var deltaX = newX - lastMouseX;
        var deltaY = newY - lastMouseY;

        lastMouseX = newX;
        lastMouseY = newY;

        if (button == 'left') {
            switch (viewer.navigationMode) {
                case 'free-orbit':
                    navigate('free-orbit', deltaX, deltaY);
                    break;

                case 'fixed-orbit':
                case 'orbit':
                    navigate('orbit', deltaX, deltaY);
                    break;

                case 'pan':
                    navigate('pan', deltaX, deltaY);
                    break;

                case 'zoom':
                    navigate('zoom', deltaX, deltaY);
                    break;

                default:
                    break;

            }
        }
        if (button == 'middle') {
            navigate('pan', deltaX, deltaY);
        }

    }

    function handleMouseScroll(event) {
        if (viewer.navigationMode == 'none') {
            return;
        }
        if (event.stopPropagation) {
            event.stopPropagation();
        }
        if (event.preventDefault) {
            event.preventDefault();
        }
        function sign(x) {
            x = +x // convert to a number
            if (x === 0 || isNaN(x))
                return x
            return x > 0 ? 1 : -1
        }

        //deltaX and deltaY have very different values in different web browsers so fixed value is used for constant functionality.
        navigate('zoom', sign(event.deltaX) * -1.0, sign(event.deltaY) * -1.0);
    }

    function navigate(type, deltaX, deltaY) {
        if(!viewer._handles || !viewer._handles[0]) return;
        //translation in WCS is position from [0, 0, 0]
        var origin = viewer._origin;
        var camera = viewer.getCameraPosition();

        //get origin coordinates in view space
        var mvOrigin = vec3.transformMat4(vec3.create(), origin, viewer._mvMatrix)

        //movement factor needs to be dependant on the distance but one meter is a minimum so that movement wouldn't stop when camera is in 0 distance from navigation origin
        var distanceVec = vec3.subtract(vec3.create(), origin, camera);
        var distance = Math.max(vec3.length(distanceVec), viewer._handles[0]._model.meter);

        //move to the navigation origin in view space
        var transform = mat4.translate(mat4.create(), mat4.create(), mvOrigin)

        //function for conversion from degrees to radians
        function degToRad(deg) {
            return deg * Math.PI / 180.0;
        }

        switch (type) {
            case 'free-orbit':
                transform = mat4.rotate(mat4.create(), transform, degToRad(deltaY / 4), [1, 0, 0]);
                transform = mat4.rotate(mat4.create(), transform, degToRad(deltaX / 4), [0, 1, 0]);
                break;

            case 'fixed-orbit':
            case 'orbit':
                mat4.rotate(transform, transform, degToRad(deltaY / 4), [1, 0, 0]);

                //z rotation around model z axis
                var mvZ = vec3.transformMat3(vec3.create(), [0, 0, 1], mat3.fromMat4(mat3.create(), viewer._mvMatrix));
                mvZ = vec3.normalize(vec3.create(), mvZ);
                transform = mat4.rotate(mat4.create(), transform, degToRad(deltaX / 4), mvZ);

                break;

            case 'pan':
                mat4.translate(transform, transform, [deltaX * distance / 150, 0, 0]);
                mat4.translate(transform, transform, [0, (-1.0 * deltaY) * distance / 150, 0]);
                break;

            case 'zoom':
                mat4.translate(transform, transform, [0, 0, deltaX * distance / 20]);
                mat4.translate(transform, transform, [0, 0, deltaY * distance / 20]);
                break;

            default:
                break;
        }

        //reverse the translation in view space and leave only navigation changes
        var translation = vec3.negate(vec3.create(), mvOrigin);
        transform = mat4.translate(mat4.create(), transform, translation);

        //apply transformation in right order
        viewer._mvMatrix = mat4.multiply(mat4.create(), transform, viewer._mvMatrix);
    }

    //watch resizing of canvas every 500ms
    var elementHeight = viewer.height;
    var elementWidth = viewer.width;
    setInterval(function () {
        if (viewer._canvas.offsetHeight !== elementHeight || viewer._canvas.offsetWidth !== elementWidth) {
            elementHeight = viewer._height = viewer._canvas.height = viewer._canvas.offsetHeight;
            elementWidth = viewer._width = viewer._canvas.width = viewer._canvas.offsetWidth;
        }
    }, 500);


    //attach callbacks
    this._canvas.addEventListener('mousedown', handleMouseDown, true);
    this._canvas.addEventListener('wheel', handleMouseScroll, true);
    window.addEventListener('mouseup', handleMouseUp, true);
    window.addEventListener('mousemove', handleMouseMove, true);

    this._canvas.addEventListener('mousemove', function() {
        viewer._userAction = true;
    }, true);


    /**
    * Occurs when user double clicks on model.
    *
    * @event xViewer#dblclick
    * @type {object}
    * @param {Number} id - product ID of the element or null if there wasn't any product under mouse
    */
    this._canvas.addEventListener('dblclick', function () { viewer._fire('dblclick', { id: id }); }, true);
};

/**
* This is a static draw method. You can use it if you just want to render model once with no navigation and interaction.
* If you want interactive model call {@link xViewer#start start()} method. {@link xViewer#frame Frame event} is fired when draw call is finished.
* @function xViewer#draw
* @fires xViewer#frame
*/
xViewer.prototype.draw = function () {
    if (!this._geometryLoaded || this._handles.length == 0 || !(this._stylingChanged || this._isChanged())) {
        if (!this._userAction) return;
    }
    this._userAction = false;

    //call all before-draw plugins
    this._plugins.forEach(function (plugin) {
        if (!plugin.onBeforeDraw) {
            return;
        }
        plugin.onBeforeDraw();
    }, this);

    //styles are up to date when new frame is drawn
    this._stylingChanged = false;

    var gl = this._gl;
    var width = this._width;
    var height = this._height;

    gl.useProgram(this._shaderProgram);
    gl.viewport(0, 0, width, height);
    gl.clearColor(this.background[0] / 255, this.background[1] / 255, this.background[2] / 255, this.background[3] / 255);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //set up camera
    switch (this.camera) {
        case 'perspective':
            mat4.perspective(this._pMatrix, this.perspectiveCamera.fov * Math.PI / 180.0, this._width / this._height, this.perspectiveCamera.near, this.perspectiveCamera.far);
            break;

        case 'orthogonal':
            mat4.ortho(this._pMatrix, this.orthogonalCamera.left, this.orthogonalCamera.right, this.orthogonalCamera.bottom, this.orthogonalCamera.top, this.orthogonalCamera.near, this.orthogonalCamera.far);
            break;

        default:
            mat4.perspective(this._pMatrix, this.perspectiveCamera.fov * Math.PI / 180.0, this._width / this._height, this.perspectiveCamera.near, this.perspectiveCamera.far);
            break;
    }

    //set uniforms (these may quickly change between calls to draw)
    gl.uniformMatrix4fv(this._pMatrixUniformPointer, false, this._pMatrix);
    gl.uniformMatrix4fv(this._mvMatrixUniformPointer, false, this._mvMatrix);
    gl.uniform4fv(this._lightAUniformPointer, new Float32Array(this.lightA));
    gl.uniform4fv(this._lightBUniformPointer, new Float32Array(this.lightB));
    gl.uniform4fv(this._clippingPlaneUniformPointer, new Float32Array(this.clippingPlane));

    //use normal colour representation (1 would cause shader to use colour coding of IDs)
    gl.uniform1i(this._colorCodingUniformPointer, 0);

    //update highlighting colour
    gl.uniform4fv(this._highlightingColourUniformPointer, new Float32Array(
        [this.highlightingColour[0]/255.0, 
        this.highlightingColour[1]/255.0, 
        this.highlightingColour[2]/255.0, 
        this.highlightingColour[3]/255.0]));

    //check for x-ray mode
    if (this.renderingMode == 'x-ray')
    {
        //two passes - first one for non-transparent objects, second one for all the others
        gl.uniform1i(this._renderingModeUniformPointer, 2);
        gl.disable(gl.CULL_FACE);
        this._handles.forEach(function (handle) {
            if (!handle.stopped) {
                handle.setActive(this._pointers);
                handle.draw("solid");
            }
        }, this);

        //transparent objects should have only one side so that they are even more transparent.
        gl.uniform1i(this._renderingModeUniformPointer, 2);
        gl.enable(gl.CULL_FACE);
        this._handles.forEach(function (handle) {
            if (!handle.stopped) {
                handle.setActive(this._pointers);
                handle.draw("transparent");
            }
        }, this);
        gl.uniform1i(this._renderingModeUniformPointer, 0);
    }
    else {
        gl.uniform1i(this._renderingModeUniformPointer, 0);
        gl.disable(gl.CULL_FACE);

        //two runs, first for solids from all models, second for transparent objects from all models
        //this makes sure that transparent objects are always rendered at the end.
        this._handles.forEach(function (handle) {
            if (!handle.stopped) {
                handle.setActive(this._pointers);
                handle.draw("solid");
            }
        }, this);

        this._handles.forEach(function (handle) {
            if (!handle.stopped) {
                handle.setActive(this._pointers);
                handle.draw("transparent");
            }
        }, this);
    }
    
    //call all after-draw plugins
    this._plugins.forEach(function (plugin) {
        if (!plugin.onAfterDraw) {
            return;
        }
        plugin.onAfterDraw();
    }, this);

    /**
     * Occurs after every frame in animation. Don't do anything heavy weighted in here as it will happen about 60 times in a second all the time.
     *
     * @event xViewer#frame 
     * @type {object}
     */
    this._fire('frame', {});
};

xViewer.prototype._isChanged = function () {
    var theSame = true;
    this._visualStateAttributes.forEach(function (visualStateAttribute) {
        var state = JSON.stringify(this[visualStateAttribute]);
        var lastState = this._lastStates[visualStateAttribute];
        this._lastStates[visualStateAttribute] = state;
        theSame = theSame && (state === lastState)
    }, this);
    return !theSame;
};

/**
* Use this method get actual camera position.
* @function xViewer#getCameraPosition
*/
xViewer.prototype.getCameraPosition = function () {
    var transform = mat4.create();
    mat4.multiply(transform, this._pMatrix, this._mvMatrix);
    var inv = mat4.create()
    mat4.invert(inv, transform);
    var eye = vec3.create();
    vec3.transformMat4(eye, vec3.create(), inv);

    return eye;
}

/**
* Use this method to zoom to specified element. If you don't specify a product ID it will zoom to full extent.
* @function xViewer#zoomTo
* @param {Number} [id] Product ID
* @return {Bool} True if target exists and zoom was successful, False otherwise
*/
xViewer.prototype.zoomTo = function (id) {
    var found = this.setCameraTarget(id);
    if (!found)  return false;

    var eye = this.getCameraPosition();
    var dir = vec3.create();
    vec3.subtract(dir, eye, this._origin);
    dir = vec3.normalize(vec3.create(), dir);

    var translation = vec3.create();
    vec3.scale(translation, dir, this._distance);
    vec3.add(eye, translation, this._origin);

    mat4.lookAt(this._mvMatrix, eye, this._origin, [0, 0, 1]);
    return true;
};

/**
* Use this function to show default views.
*
* @function xViewer#show
* @param {String} type - Type of view. Allowed values are <strong>'top', 'bottom', 'front', 'back', 'left', 'right'</strong>. 
* Directions of this views are defined by the coordinate system. Target and distance are defined by {@link xViewer#setCameraTarget setCameraTarget()} method to certain product ID
* or to the model extent if {@link xViewer#setCameraTarget setCameraTarget()} is called with no arguments.
*/
xViewer.prototype.show = function (type) {
    var origin = this._origin;
    var distance = this._distance;
    var camera = [0, 0, 0];
    var heading = [0, 0, 1];
    switch (type) {
        //top and bottom are different because these are singular points for look-at function if heading is [0,0,1]
        case 'top':
            //only move to origin and up (negative values because we move camera against model)
            mat4.translate(this._mvMatrix, mat4.create(), [origin[0] * -1.0, origin[1] * -1.0, (distance + origin[2])* -1.0 ]);
            return;
        case 'bottom':
            //only move to origin and up and rotate 180 degrees around Y axis
            var toOrigin = mat4.translate(mat4.create(), mat4.create(), [origin[0] * -1.0, origin[1] * +1.0, (origin[2] + distance) * -1]);
            var rotationY = mat4.rotateY(mat4.create(), toOrigin, Math.PI);
            var rotationZ = mat4.rotateZ(mat4.create(), rotationY, Math.PI);
            this._mvMatrix = rotationZ; // mat4.translate(mat4.create(), rotationZ, [0, 0, -1.0 * distance]);
            return;

        case 'front':
            camera = [origin[0], origin[1] - distance, origin[2]];
            break;
        case 'back':
            camera = [origin[0], origin[1] + distance, origin[2]];
            break;
        case 'left':
            camera = [origin[0] - distance, origin[1], origin[2]];
            break;
        case 'right':
            camera = [origin[0] + distance, origin[1], origin[2]];
            break;
        default:
            break;
    }
    //use look-at function to set up camera and target
    mat4.lookAt(this._mvMatrix, camera, origin, heading);
};

xViewer.prototype._error = function (msg) {
    /**
    * Occurs when viewer encounters error. You should listen to this because it might also report asynchronous errors which you would miss otherwise.
    *
    * @event xViewer#error
    * @type {object}
    * @param {string} message - Error message
    */
    this._fire('error', {message: msg});
};

//this renders the colour coded model into the memory buffer
//not to the canvas and use it to identify ID of the object from that
xViewer.prototype._getID = function (x, y) {

    //call all before-drawId plugins
    this._plugins.forEach(function (plugin) {
        if (!plugin.onBeforeDrawId) {
            return;
        }
        plugin.onBeforeDrawId();
    }, this);

    //it is not necessary to render the image in full resolution so this factor is used for less resolution. 
    var factor = 2;
    var gl = this._gl;
    var width = this._width / factor;
    var height = this._height / factor;
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
        this._error("this combination of attachments does not work");
        return null;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    gl.viewport(0, 0, width, height);

    gl.enable(gl.DEPTH_TEST); //we don't use any kind of blending or transparency
    gl.disable(gl.BLEND);
    gl.clearColor(0, 0, 0, 0); //zero colour for no-values
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //set uniform for colour coding
    gl.uniform1i(this._colorCodingUniformPointer, 1);

    //render colour coded image using latest buffered data
    this._handles.forEach(function (handle) {
        if (!handle.stopped) {
            handle.setActive(this._pointers);
            handle.draw();
        }
    }, this);

    //call all after-drawId plugins
    this._plugins.forEach(function (plugin) {
        if (!plugin.onAfterDrawId) {
            return;
        }
        plugin.onAfterDrawId();
    }, this);

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
        }, this);

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
* @function xViewer#start
* @param {Number} id [optional] - Optional ID of the model to be stopped. You can get this ID from {@link xViewer#event:loaded loaded} event.
*/
xViewer.prototype.start = function (id) {
    if (typeof (id) !== "undefined") {
        var model = this._handles.filter(function (h) { return h.id === id; }).pop();
        if (typeof (model) === "undefined")
            throw "Model doesn't exist.";

        model.stopped = false;
        this._numberOfActiveModels++;
        return;
    }

    this._isRunning = true;
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
            * @event xViewer#fps 
            * @type {Number}
            */
            viewer._fire('fps', Math.floor(fps) );
        }

        if (viewer._isRunning) {
            window.requestAnimFrame(tick)
            viewer.draw()
        }
    }
    tick();
};

/**
* Use this function to stop animation of the model. User will still be able to see the latest state of the model. You can 
* switch animation of the model on again by calling {@link xViewer#start start()}.
*
* @function xViewer#stop
* @param {Number} id [optional] - Optional ID of the model to be stopped. You can get this ID from {@link xViewer#event:loaded loaded} event.
*/
xViewer.prototype.stop = function (id) {
    if (typeof (id) == "undefined") {
        this._isRunning = false;
        return;
    }

    var model = this._handles.filter(function (h) { return h.id === id; }).pop();
    if (typeof (model) === "undefined")
        throw "Model doesn't exist.";

    model.stopped = true;
    this._numberOfActiveModels--;
};

/**
 * Use this method to register to events of the viewer like {@link xViewer#event:pick pick}, {@link xViewer#event:mouseDown mouseDown}, 
 * {@link xViewer#event:loaded loaded} and others. You can define arbitrary number
 * of event handlers for any event. You can remove handler by calling {@link xViewer#off off()} method.
 *
 * @function xViewer#on
 * @param {String} eventName - Name of the event you would like to listen to.
 * @param {Object} callback - Callback handler of the event which will consume arguments and perform any custom action.
*/
xViewer.prototype.on = function (eventName, callback) {
    var events = this._events;
    if (!events[eventName]) {
        events[eventName] = [];
    }
    events[eventName].push(callback);
};

/**
* Use this method to unregister handlers from events. You can add event handlers by calling the {@link xViewer#on on()} method.
*
* @function xViewer#off
* @param {String} eventName - Name of the event
* @param {Object} callback - Handler to be removed
*/
xViewer.prototype.off = function (eventName, callback) {
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
xViewer.prototype._fire = function (eventName, args) {
    var handlers = this._events[eventName];
    if (!handlers) {
        return;
    }
    //cal the callbacks
    handlers.forEach(function (handler) {
        handler(args);
    }, this);
};

xViewer.prototype._disableTextSelection = function () {
    //disable text selection
    document.documentElement.style['-webkit-touch-callout'] = 'none';
    document.documentElement.style['-webkit-user-select'] = 'none';
    document.documentElement.style['-khtml-user-select'] = 'none';
    document.documentElement.style['-moz-user-select'] = 'none';
    document.documentElement.style['-ms-user-select'] = 'none';
    document.documentElement.style['user-select'] = 'none';
};

xViewer.prototype._enableTextSelection = function () {
    //enable text selection again
    document.documentElement.style['-webkit-touch-callout'] = 'text';
    document.documentElement.style['-webkit-user-select'] = 'text';
    document.documentElement.style['-khtml-user-select'] = 'text';
    document.documentElement.style['-moz-user-select'] = 'text';
    document.documentElement.style['-ms-user-select'] = 'text';
    document.documentElement.style['user-select'] = 'text';
};

xViewer.prototype._getSVGOverlay = function() {
    //check support for SVG
    if (!document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1")) return false;
    var ns = "http://www.w3.org/2000/svg";

    function getOffsetRect(elem) {
        var box = elem.getBoundingClientRect();

        var body = document.body;
        var docElem = document.documentElement;

        var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
        var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

        var clientTop = docElem.clientTop || body.clientTop || 0;
        var clientLeft = docElem.clientLeft || body.clientLeft || 0;
        var clientBottom = docElem.clientBottom || body.clientBottom || 0;
        var clientRight = docElem.clientRight || body.clientRight || 0;


        var top = Math.round(box.top + scrollTop - clientTop);
        var left = Math.round(box.left + scrollLeft - clientLeft);
        var bottom = Math.round(box.top + scrollTop - clientBottom);
        var right = Math.round(box.left + scrollLeft - clientRight);

        return { top: top, left: left, width: right - left, height: bottom - top };
    }

    //create SVG overlay
    var svg = document.createElementNS(ns, "svg");
    //document.body.appendChild(svg);

    var cRect = getOffsetRect(this._canvas);

    svg.style.position = 'absolute';
    svg.style.top = cRect.top + 'px';
    svg.style.left = cRect.left + 'px';
    svg.style['z-index'] = 100;
    svg.setAttribute('width', this._width);
    svg.setAttribute('height', this._height);

    return svg;
};

/**
* This method can be used to get parameter of the current clipping plane. If no clipping plane is active
* this returns [[0,0,0],[0,0,0]];
*
* @function xViewer#getClip
* @return  {Number[][]} Point and normal defining current clipping plane
*/
xViewer.prototype.getClip = function () {
    var cp = this.clippingPlane;
    if (cp.every(function(e) { return e === 0; })) {
        return [[0, 0, 0], [0, 0, 0]];
    }

    var normal = vec3.normalize([0.0 ,0.0, 0.0], [cp[0], cp[1], cp[2]]);

    //test if the last clipping point fits in the condition
    var lp = this._lastClippingPoint;
    var test = lp[0] * cp[0] + lp[1] * cp[1] + lp[2] * cp[2] + cp[3];
    if (Math.abs(test) < 1e-5) {
        return [lp, normal];
    }

    //find the point on the plane
    var x = cp[0] !== 0 ? -1.0 * cp[3] / cp[0] : 0.0;
    var y = cp[1] !== 0 ? -1.0 * cp[3] / cp[1] : 0.0;
    var z = cp[2] !== 0 ? -1.0 * cp[3] / cp[2] : 0.0;

    return [[x,y,z], normal];
};

/**
* Use this method to clip the model. If you call the function with no arguments interactive clipping will start. This is based on SVG overlay
* so SVG support is necessary for it. But as WebGL is more advanced technology than SVG it is sound assumption that it is present in the browser.
* Use {@link xViewer.check xViewer.check()} to make sure it is supported at the very beginning of using of xViewer. Use {@link xViewer#unclip unclip()} method to 
* unset clipping plane.
*
* @function xViewer#clip
* @param {Number[]} [point] - point in clipping plane
* @param {Number[]} [normal] - normal pointing to the half space which will be hidden
* @fires xViewer#clipped
*/
xViewer.prototype.clip = function (point, normal) {

    //non interactive clipping, all information is there
    if (typeof (point) != 'undefined' && typeof (normal) != 'undefined') {

        this._lastClippingPoint = point;

        //compute normal equation of the plane
        var d = 0.0 - normal[0] * point[0] - normal[1] * point[1] - normal[2] * point[2];

        //set clipping plane
        this.clippingPlane = [normal[0], normal[1], normal[2], d]

        /**
        * Occurs when model is clipped. This event has empty object.
        *
        * @event xViewer#clipped
        * @type {object}
        */
        this._fire('clipped', {});
        return;
    }

    //********************************************** Interactive clipping ********************************************//
    var ns = "http://www.w3.org/2000/svg";
    var svg = this._getSVGOverlay();
    var viewer = this;
    var position = {};
    var down = false;
    var g = {};

    var handleMouseDown = function (event) {
        if (down) return;
        down = true;

        viewer._disableTextSelection();

        var r = svg.getBoundingClientRect();
        position.x = event.clientX - r.left;
        position.y = event.clientY - r.top;
        position.angle = 0.0;

        //create very long vertical line going through the point
        g = document.createElementNS(ns, "g");
        g.setAttribute('id', 'section');
        svg.appendChild(g);

        var line = document.createElementNS(ns, "line");
        g.appendChild(line);

        line.setAttribute('style', "stroke:rgb(255,0,0);stroke-width:2");
        line.setAttribute('x1', position.x);
        line.setAttribute('y1', 99999);
        line.setAttribute('x2', position.x);
        line.setAttribute('y2', -99999);
    };

    var handleMouseUp = function (event) {
        if (!down) return;

        //check if the points are not identical. 
        var r = svg.getBoundingClientRect();
        if (position.x == event.clientX - r.left && position.y == event.clientY - r.top) {
            return;
        }

        down = false;
        viewer._enableTextSelection();


        //get inverse transformation
        var transform = mat4.create();
        mat4.multiply(transform, viewer._pMatrix, viewer._mvMatrix);
        var inverse = mat4.create();
        mat4.invert(inverse, transform);

        //get normalized coordinates the point in WebGL CS
        var x1 = position.x / (viewer._width / 2.0) - 1.0;
        var y1 = 1.0 - position.y / (viewer._height / 2.0);

        //First point in WCS
        var A = vec3.create();
        vec3.transformMat4(A, [x1, y1, -1], inverse); //near clipping plane

        //Second point in WCS
        var B = vec3.create();
        vec3.transformMat4(B, [x1, y1, 1], inverse); //far clipping plane

        //Compute third point on plane
        var angle = position.angle * Math.PI / 180.0 ;
        var x2 = x1 + Math.cos(angle);
        var y2 = y1 + Math.sin(angle);

        //Third point in WCS
        var C = vec3.create();
        vec3.transformMat4(C, [x2, y2, 1], inverse); // far clipping plane


        //Compute normal in WCS
        var BA = vec3.subtract(vec3.create(), A, B);
        var BC = vec3.subtract(vec3.create(), C, B);
        var N = vec3.cross(vec3.create(), BA, BC);
        
        viewer.clip(B, N);

        //clean
        svg.parentNode.removeChild(svg);
        svg.removeEventListener('mousedown', handleMouseDown, true);
        window.removeEventListener('mouseup', handleMouseUp, true);
        window.removeEventListener('mousemove', handleMouseMove, true);
    };

    var handleMouseMove = function (event) {
        if (!down) return;

        var r = svg.getBoundingClientRect();
        var x = event.clientX - r.left;
        var y = event.clientY - r.top;

        //rotate
        var dX = x - position.x;
        var dY = y - position.y;
        var angle = Math.atan2(dX, dY) * -180.0 / Math.PI + 90.0;

        //round to 5 DEG
        angle = Math.round(angle / 5.0) * 5.0
        position.angle = 360.0 - angle + 90;

        g.setAttribute('transform', 'rotate(' + angle + ' ' + position.x + ' ' + position.y + ')');
    }

    //this._canvas.parentNode.appendChild(svg);
    document.documentElement.appendChild(svg)
    svg.addEventListener('mousedown', handleMouseDown, true);
    window.addEventListener('mouseup', handleMouseUp, true);
    window.addEventListener('mousemove', handleMouseMove, true);

    this.stopClipping = function() {
        svg.parentNode.removeChild(svg);
        svg.removeEventListener('mousedown', handleMouseDown, true);
        window.removeEventListener('mouseup', handleMouseUp, true);
        window.removeEventListener('mousemove', handleMouseMove, true);
        //clear also itself
        viewer.stopClipping = function() {};
    };
};

/**
* This method is only active when interactive clipping is active. It stops interactive clipping operation.
* 
* @function xViewer#stopClipping
*/
//this is only a placeholder. It is actually created only when interactive clipping is active.
xViewer.prototype.stopClipping = function() {};

/**
* This method will cancel any clipping plane if it is defined. Use {@link xViewer#clip clip()} 
* method to define clipping by point and normal of the plane or interactively if you call it with no arguments.
* @function xViewer#unclip
* @fires xViewer#unclipped
*/
xViewer.prototype.unclip = function () {
    this.clippingPlane = [0, 0, 0, 0];
    /**
      * Occurs when clipping of the model is dismissed. This event has empty object.
      *
      * @event xViewer#unclipped
      * @type {object}
      */
    this._fire('unclipped', {});
};
