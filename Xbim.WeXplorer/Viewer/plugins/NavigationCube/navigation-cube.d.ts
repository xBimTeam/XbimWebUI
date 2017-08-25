import { IPlugin, Viewer } from "../../viewer";
export declare class NavigationCube implements IPlugin {
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
    constructor(image?: any);
    private _image;
    private TOP;
    private BOTTOM;
    private LEFT;
    private RIGHT;
    private FRONT;
    private BACK;
    private TOP_LEFT_FRONT;
    private TOP_RIGHT_FRONT;
    private TOP_LEFT_BACK;
    private TOP_RIGHT_BACK;
    private BOTTOM_LEFT_FRONT;
    private BOTTOM_RIGHT_FRONT;
    private BOTTOM_LEFT_BACK;
    private BOTTOM_RIGHT_BACK;
    private TOP_LEFT;
    private TOP_RIGHT;
    private TOP_FRONT;
    private TOP_BACK;
    private BOTTOM_LEFT;
    private BOTTOM_RIGHT;
    private BOTTOM_FRONT;
    private BOTTOM_BACK;
    private FRONT_RIGHT;
    private FRONT_LEFT;
    private BACK_RIGHT;
    private BACK_LEFT;
    private _initialized;
    private _region;
    /**
    * Size of the cube relative to the size of viewer canvas. This has to be a positive number between [0,1] Default value is 0.15.
    * @member {Number} NavigationCube#ratio
    */
    ratio: number;
    /**
    * Active parts of the navigation cube are highlighted so that user can recognize which part is active.
    * This should be a positive number between [0,2]. If the value is less than 1 active area is darker.
    * If the value is greater than 1 active area is lighter. Default value is 1.2.
    * @member {Number} NavigationCube#highlighting
    */
    highlighting: number;
    /**
    * Navigation cube has two transparency states. One is when user hovers over the cube and the second when the cursor is anywhere else.
    * This is for the hovering shate and it should be a positive number between [0,1]. If the value is less than 1 cube will be semitransparent
    * when user hovers over. Default value is 1.0.
    * @member {Number} NavigationCube#activeAlpha
    */
    activeAlpha: number;
    /**
    * Navigation cube has two transparency states. One is when user hovers over the cube and the second when the cursor is anywhere else.
    * This is for the non-hovering shate and it should be a positive number between [0,1]. If the value is less than 1 cube will be semitransparent
    * when user is not hovering over. Default value is 0.3.
    * @member {Number} NavigationCube#passiveAlpha
    */
    passiveAlpha: number;
    /**
    * It is possible to place navigation cube to any of the corners of the canvas using this property. Default value is cube.BOTTOM_RIGHT.
    * Allowed values are cube.BOTTOM_RIGHT, cube.BOTTOM_LEFT, cube.TOP_RIGHT and cube.TOP_LEFT.
    * @member {Enum} NavigationCube#position
    */
    position: number;
    private viewer;
    private _shader;
    private _alpha;
    private _selection;
    private _pMatrixUniformPointer;
    private _rotationUniformPointer;
    private _colourCodingUniformPointer;
    private _alphaUniformPointer;
    private _selectionUniformPointer;
    private _textureUniformPointer;
    private _highlightingUniformPointer;
    private _vertexAttrPointer;
    private _texCoordAttrPointer;
    private _idAttrPointer;
    private _indexBuffer;
    private _vertexBuffer;
    private _texCoordBuffer;
    private _idBuffer;
    private _texture;
    private _drag;
    private _originalNavigation;
    init(viewer: Viewer): void;
    onBeforeDraw(): void;
    onBeforePick(id: any): boolean;
    onAfterDraw(): void;
    onBeforeDrawId(): void;
    onAfterDrawId(): void;
    onBeforeGetId(id: any): boolean;
    setActive(): WebGLRenderingContext;
    setInactive(): void;
    private draw();
    private _initShader();
    vertices: Float32Array;
    private indices;
    private txtCoords;
    private ids;
}
