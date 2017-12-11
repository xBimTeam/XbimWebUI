import { State } from './state';
import { Framebuffer } from './framebuffer';
export declare class Viewer {
    canvas: HTMLCanvasElement;
    perspectiveCamera: {
        fov: number;
        near: number;
        far: number;
    };
    orthogonalCamera: {
        left: number;
        right: number;
        top: number;
        bottom: number;
        near: number;
        far: number;
    };
    width: number;
    height: number;
    distance: number;
    camera: 'perspective' | 'orthogonal';
    background: number[];
    highlightingColour: number[];
    navigationMode: 'pan' | 'zoom' | 'orbit' | 'fixed-orbit' | 'free-orbit' | 'none';
    origin: number[];
    lightA: number[];
    lightB: number[];
    gl: WebGLRenderingContext;
    mvMatrix: Float32Array;
    pMatrix: Float32Array;
    renderingMode: RenderingMode;
    private _isRunning;
    private _stateStyles;
    private _stateStyleTexture;
    private _geometryLoaded;
    private _plugins;
    private _stylingChanged;
    private _handles;
    private _userAction;
    private _shaderProgram;
    private _mvMatrixUniformPointer;
    private _pMatrixUniformPointer;
    private _lightAUniformPointer;
    private _lightBUniformPointer;
    private _colorCodingUniformPointer;
    private _clippingPlaneAUniformPointer;
    private _clippingAUniformPointer;
    private _clippingPlaneBUniformPointer;
    private _clippingBUniformPointer;
    private _meterUniformPointer;
    private _renderingModeUniformPointer;
    private _highlightingColourUniformPointer;
    private _stateStyleSamplerUniform;
    private _events;
    private _numberOfActiveModels;
    private _lastStates;
    private _visualStateAttributes;
    private _clippingPlaneA;
    private _clippingA;
    private _clippingPlaneB;
    private _clippingB;
    private _lastClippingPoint;
    private _isShiftKeyDown;
    private _fpt;
    private _pointers;
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
    constructor(canvas: string | HTMLCanvasElement);
    /**
    * This is a static function which should always be called before Viewer is instantiated.
    * It will check all prerequisites of the viewer and will report all issues. If Prerequisities.errors contain
    * any messages viewer won't work. If Prerequisities.warnings contain any messages it will work but some
    * functions may be restricted or may not work or it may have poor performance.
    * @function Viewer.check
    * @return {Prerequisites}
    */
    static check(): {
        warnings: any[];
        errors: any[];
        noErrors: boolean;
        noWarnings: boolean;
    };
    /**
    * Adds plugin to the viewer. Plugins can implement certain methods which get called in certain moments in time like
    * before draw, after draw etc. This makes it possible to implement functionality tightly integrated into Viewer like navigation cube or others.
    * @function Viewer#addPlugin
    * @param {object} plugin - plug-in object
    */
    addPlugin(plugin: IPlugin): void;
    /**
    * Removes plugin from the viewer. Plugins can implement certain methods which get called in certain moments in time like
    * before draw, after draw etc. This makes it possible to implement functionality tightly integrated into Viewer like navigation cube or others.
    * @function Viewer#removePlugin
    * @param {object} plugin - plug-in object
    */
    removePlugin(plugin: IPlugin): void;
    /**
    * Use this function to define up to 224 optional styles which you can use to change appearance of products and types if you pass the index specified in this function to {@link Viewer#setState setState()} function.
    * @function Viewer#defineStyle
    * @param {Number} index - Index of the style to be defined. This has to be in range 0 - 224. Index can than be passed to change appearance of the products in model
    * @param {Number[]} colour - Array of four numbers in range 0 - 255 representing RGBA colour. If there are less or more numbers exception is thrown.
    */
    defineStyle(index: number, colour: number[]): void;
    /**
    * You can use this function to change state of products in the model. State has to have one of values from {@link xState xState} enumeration.
    * Target is either enumeration from {@link xProductType xProductType} or array of product IDs. If you specify type it will effect all elements of the type.
    *
    * @function Viewer#setState
    * @param {State} state - One of {@link State State} enumeration values.
    * @param {Number} [modelId] - Id of the model
    * @param {Number[] | Number} target - Target of the change. It can either be array of product IDs or product type from {@link xProductType xProductType}.
    */
    setState(state: State, target: number | number[], modelId?: number): void;
    /**
     * Executes callback for one model if modelId is specified or for all handles.
     * If no modelId is specified, last result will get returned, not an aggregation.
     * @param callback Function to execute
     * @param modelId ID of the model
     */
    private forHandleOrAll<T>(callback, modelId?);
    private getHandle(id);
    /**
    * Use this function to get state of the products in the model. You can compare result of this function
    * with one of values from {@link xState xState} enumeration. 0xFF is the default value.
    *
    * @function Viewer#getState
    * @param {Number} id - Id of the product. You would typically get the id from {@link Viewer#event:pick pick event} or similar event.
    * @param {Number} [modelId] - Id of the model
    */
    getState(id: number, modelId?: number): number;
    /**
    * Use this function to reset state of all products to 'UNDEFINED' which means visible and not highlighted.
    * You can use optional hideSpaces parameter if you also want to show spaces. They will be hidden by default.
    *
    * @function Viewer#resetStates
    * @param {Bool} [hideSpaces = true] - Default state is UNDEFINED which would also show spaces. That is often not
    * @param {Number} [modelId = null] - Optional Model ID. Id no ID is specified states are reset for all models.
    */
    resetStates(hideSpaces?: boolean, modelId?: number): void;
    getCurrentImageHtml(width?: number, height?: number): HTMLImageElement;
    getCurrentImageDataUrl(width?: number, height?: number): string;
    getCurrentImageBlob(callback: (blob: Blob) => void): void;
    /**
     * Gets complete model state and style. Resulting object can be used to restore the state later on.
     *
     * @param {Number} id - Model ID which you can get from {@link Viewer#event:loaded loaded} event.
     * @returns {Array} - Array representing model state in compact form suitable for serialization
     */
    getModelState(id: number): Array<Array<number>>;
    /**
     * Restores model state from the data previously captured with {@link Viewer#getModelState getModelState()} function
     * @param {Number} id - ID of the model
     * @param {Array} state - State of the model as obtained from {@link Viewer#getModelState getModelState()} function
     */
    restoreModelState(id: number, state: Array<Array<number>>): void;
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
    setStyle(style: number, target: number | number[], modelId?: number): void;
    /**
    * Use this function to get overriding colour style of the products in the model. The number you get is the index of
    * your custom colour which you have defined in {@link Viewer#defineStyle defineStyle()} function. 0xFF is the default value.
    *
    * @function Viewer#getStyle
    * @param {Number} id - Id of the product. You would typically get the id from {@link Viewer#event:pick pick event} or similar event.
    * @param {Number} [modelId] - Optional Model ID. If not defined first style available for a product with certain ID will be returned. This might be ambiguous.
    */
    getStyle(id: number, modelId?: number): void;
    /**
    * Use this function to reset appearance of all products to their default styles.
    *
    * @function Viewer#resetStyles
    * @param {Number} [modelId] - Optional ID of a specific model.
    */
    resetStyles(modelId?: number): void;
    /**
    *
    * @function Viewer#getProductType
    * @param {Number} prodID - Product ID. You can get this value either from semantic structure of the model or by listening to {@link Viewer#event:pick pick} event.
    * @param {Number} [modelId] - Optional Model ID. If not defined first type of a product with certain ID will be returned. This might be ambiguous.
    * @return {Number} Product type ID. This is either null if no type is identified or one of {@link xProductType type ids}.
    */
    getProductType(prodId: number, modelId?: number): number;
    /**
    * Use this method to set position of camera. Use it after {@link Viewer#setCameraTarget setCameraTarget()} to get desired result.
    *
    * @function Viewer#setCameraPosition
    * @param {Number[]} coordinates - 3D coordinates of the camera in WCS
    */
    setCameraPosition(coordinates: number[]): void;
    /**
    * This method sets navigation origin to the centroid of specified product's bounding box or to the centre of model if no product ID is specified.
    * This method doesn't affect the view itself but it has an impact on navigation. Navigation origin is used as a centre for orbiting and it is used
    * if you call functions like {@link Viewer.show show()} or {@link Viewer#zoomTo zoomTo()}.
    * @function Viewer#setCameraTarget
    * @param {Number} prodId [optional] Product ID. You can get ID either from semantic structure of the model or from {@link Viewer#event:pick pick event}.
    * @param {Number} [modelId] - Optional ID of a specific model.
    * @return {Bool} True if the target exists and is set, False otherwise
    */
    setCameraTarget(prodId?: number, modelId?: number): boolean;
    private getMergedRegion();
    private getBiggestRegion();
    /**
    * This method can be used for batch setting of viewer members. It doesn't check validity of the input.
    * @function Viewer#set
    * @param {Object} settings - Object containing key - value pairs
    */
    set(settings: any): void;
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
    loadAsync(loaderUrl: string, model: string | Blob | File, tag?: any, headers?: {
        [name: string]: string;
    }): void;
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
    load(model: string | Blob | File, tag?: any, headers?: {
        [name: string]: string;
    }): void;
    private addHandle(geometry, tag?);
    /**
     * Unloads model from the GPU. This action is not reversible.
     *
     * @param {Number} modelId - ID of the model which you can get from {@link Viewer#event:loaded loaded} event.
     */
    unload(modelId: number): void;
    _initShaders(): void;
    private setActive();
    private _initAttributesAndUniforms();
    /**
     * Prevents default context menu to appear. Custom menu can be created instead by listening to contextmenu event
     * of the viewer. Nothing is displayed othervise.
     */
    private _initContextMenuEvent();
    private _initMouseEvents();
    private _initTouchNavigationEvents();
    private _initTouchTapEvents();
    private readonly meter;
    private navigate(type, deltaX, deltaY);
    /**
    * This is a static draw method. You can use it if you just want to render model once with no navigation and interaction.
    * If you want interactive model call {@link Viewer#start start()} method. {@link Viewer#frame Frame event} is fired when draw call is finished.
    * @function Viewer#draw
    * @fires Viewer#frame
    */
    draw(force: boolean, framebuffer?: Framebuffer): void;
    private _lastActiveHandlesCount;
    private isChanged();
    /**
    * Use this method to get actual camera position.
    * @function Viewer#getCameraPosition
    */
    getCameraPosition(): Float32Array;
    /**
    * Use this method to zoom to specified element. If you don't specify a product ID it will zoom to full extent.
    * @function Viewer#zoomTo
    * @param {Number} [id] Product ID
    * @param {Number} [model] Model ID
    * @return {Bool} True if target exists and zoom was successful, False otherwise
    */
    zoomTo(id?: number, model?: number): boolean;
    /**
    * Use this function to show default views.
    *
    * @function Viewer#show
    * @param {String} type - Type of view. Allowed values are <strong>'top', 'bottom', 'front', 'back', 'left', 'right'</strong>.
    * Directions of this views are defined by the coordinate system. Target and distance are defined by {@link Viewer#setCameraTarget setCameraTarget()} method to certain product ID
    * or to the model extent if {@link Viewer#setCameraTarget setCameraTarget()} is called with no arguments.
    */
    show(type: ViewType): void;
    private _rotationOn;
    startRotation(): void;
    stopRotation(): void;
    error(msg: any): void;
    getIdsFromEvent(event: MouseEvent | Touch): {
        id: number;
        model: number;
    };
    getID(x: number, y: number, modelId?: boolean): number;
    /**
    * Use this function to start animation of the model. If you start animation before geometry is loaded it will wait for content to render it.
    * This function is bound to browser framerate of the screen so it will stop consuming any resources if you switch to another tab.
    *
    * @function Viewer#start
    * @param {Number} id [optional] - Optional ID of the model to be stopped. You can get this ID from {@link Viewer#event:loaded loaded} event.
    */
    start(id?: number): void;
    /**
    * Use this function to stop animation of the model. User will still be able to see the latest state of the model. You can
    * switch animation of the model on again by calling {@link Viewer#start start()}.
    *
    * @function Viewer#stop
    * @param {Number} id [optional] - Optional ID of the model to be stopped. You can get this ID from {@link Viewer#event:loaded loaded} event.
    */
    stop(id?: number): void;
    /**
    * Use this function to stop all models. You can
    * switch animation of the model on again by calling {@link Viewer#start start()}.
    *
    * @function Viewer#stopAll
    */
    stopAll(): void;
    /**
     * Checks if the model with defined ID is currently loaded and running
     *
     * @param {number} id - Model ID
     * @returns {boolean} True if model is loaded and running, false otherwise
     */
    isModelOn(id: number): boolean;
    /**
     * Checks if the model with defined ID is currently loaded in the viewer.
     *
     * @param {number} id - Model ID
     * @returns {boolean} True if model is loaded, false otherwise
     */
    isModelLoaded(id: number): boolean;
    /**
    * Use this function to start all models. You can
    * switch animation of the model off by calling {@link Viewer#stop stop()}.
    *
    * @function Viewer#startAll
    */
    startAll(): void;
    /**
    * Use this function to stop picking of the objects in the specified model. It will behave as if not present for all picking operations.
    * All models are pickable by default when loaded.
    *
    * @function Viewer#stopPicking
    * @param {Number} id - ID of the model to be stopped. You can get this ID from {@link Viewer#event:loaded loaded} event.
    */
    stopPicking(id: number): void;
    /**
    * Use this function to enable picking of the objects in the specified model.
    * All models are pickable by default when loaded. You can stop the model from being pickable using {@link Viewer#stopPicking} function.
    *
    * @function Viewer#startPicking
    * @param {Number} id - ID of the model to be stopped. You can get this ID from {@link Viewer#event:loaded loaded} event.
    */
    startPicking(id: number): void;
    /**
     * Use this method to register to events of the viewer like {@link Viewer#event:pick pick}, {@link Viewer#event:mouseDown mouseDown},
     * {@link Viewer#event:loaded loaded} and others. You can define arbitrary number
     * of event handlers for any event. You can remove handler by calling {@link Viewer#off off()} method.
     *
     * @function Viewer#on
     * @param {String} eventName - Name of the event you would like to listen to.
     * @param {Object} callback - Callback handler of the event which will consume arguments and perform any custom action.
    */
    on(eventName: string, callback: Function): void;
    /**
    * Use this method to unregister handlers from events. You can add event handlers by calling the {@link Viewer#on on()} method.
    *
    * @function Viewer#off
    * @param {String} eventName - Name of the event
    * @param {Object} callback - Handler to be removed
    */
    off(eventName: string, callback: any): void;
    private fire(eventName, args);
    disableTextSelection(): void;
    enableTextSelection(): void;
    /**
    * This method can be used to get parameter of the current clipping plane. If no clipping plane is active
    * this returns [[0,0,0],[0,0,0]];
    *
    * @function xViewer#getClip
    * @return  {Number[][]} Point and normal defining current clipping plane
    */
    getClip(): number[][];
    /**
    * Use this method to clip the model. Use {@link xViewer#unclip unclip()} method to
    * unset clipping plane.
    *
    * @function xViewer#clip
    * @param {Number[]} point - point in clipping plane
    * @param {Number[]} normal - normal pointing to the half space which will be hidden
    * @fires xViewer#clipped
    */
    clip(point: number[], normal: number[]): void;
    /**
    * This method will cancel any clipping plane if it is defined. Use {@link xViewer#clip clip()}
    * method to define clipping by point and normal of the plane or interactively if you call it with no arguments.
    * @function xViewer#unclip
    * @fires xViewer#unclipped
    */
    unclip(): void;
    clippingPlaneA: number[];
    clippingPlaneB: number[];
}
export declare class ModelPointers {
    NormalAttrPointer: number;
    IndexlAttrPointer: number;
    ProductAttrPointer: number;
    StateAttrPointer: number;
    StyleAttrPointer: number;
    TransformationAttrPointer: number;
    VertexSamplerUniform: WebGLUniformLocation;
    MatrixSamplerUniform: WebGLUniformLocation;
    StyleSamplerUniform: WebGLUniformLocation;
    VertexTextureSizeUniform: WebGLUniformLocation;
    MatrixTextureSizeUniform: WebGLUniformLocation;
    StyleTextureSizeUniform: WebGLUniformLocation;
    constructor(gl: WebGLRenderingContext, program: WebGLProgram);
}
export declare enum RenderingMode {
    NORMAL = 0,
    GRAYSCALE = 1,
    XRAY = 2,
    _XRAY2 = 3,
}
export declare enum ViewType {
    TOP = 0,
    BOTTOM = 1,
    FRONT = 2,
    BACK = 3,
    LEFT = 4,
    RIGHT = 5,
    DEFAULT = 6,
}
export interface IPlugin {
    init(viewer: Viewer): void;
    onBeforeDraw(width: number, height: number): void;
    onAfterDraw(width: number, height: number): void;
    onBeforeDrawId(): void;
    onAfterDrawId(): void;
    /**
     * When this function returns true, viewer doesn't use the ID for anything else taking this ID as reserved by the plugin
     */
    onBeforeGetId(id: number): boolean;
    /**
     * When this function returns true, viewer doesn't use the ID for anything else taking this ID as reserved by the plugin
     */
    onBeforePick(id: number): boolean;
}
