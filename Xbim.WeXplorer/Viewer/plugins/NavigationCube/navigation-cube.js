"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var navigation_cube_shaders_1 = require("./navigation-cube-shaders");
var navigation_cube_textures_1 = require("./navigation-cube-textures");
var NavigationCube = (function () {
    /**
     * This is constructor of the Navigation Cube plugin for {@link Viewer xBIM Viewer}. It gets optional Image as an argument.
     * The image will be used as a texture of the navigation cube. If you don't specify eny image default one will be used.
     * Image has to be square and its size has to be power of 2.
     * @name xNavigationCube
     * @constructor
     * @classdesc This is a plugin for Viewer which renders interactive navigation cube. It is customizable in terms of alpha
     * behaviour and its position on the viewer canvas. Use of plugin:
     *
     *     var cube = new xNavigationCube();
     *     viewer.addPlugin(cube);
     *
     * You can specify your own texture of the cube as an [Image](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image)
     * object argumen in constructor. If you don't specify any image default texture will be used (you can also use this one and enhance it if you want):
     *
     * ![Cube texture](cube_texture.png)
     *
     * @param {Image} [image = null] - optional image to be used for a cube texture.
    */
    function NavigationCube(image) {
        this.TOP = 1600000;
        this.BOTTOM = 1600001;
        this.LEFT = 1600002;
        this.RIGHT = 1600003;
        this.FRONT = 1600004;
        this.BACK = 1600005;
        this.TOP_LEFT_FRONT = 1600006;
        this.TOP_RIGHT_FRONT = 1600007;
        this.TOP_LEFT_BACK = 1600008;
        this.TOP_RIGHT_BACK = 1600009;
        this.BOTTOM_LEFT_FRONT = 1600010;
        this.BOTTOM_RIGHT_FRONT = 1600011;
        this.BOTTOM_LEFT_BACK = 1600012;
        this.BOTTOM_RIGHT_BACK = 1600013;
        this.TOP_LEFT = 1600014;
        this.TOP_RIGHT = 1600015;
        this.TOP_FRONT = 1600016;
        this.TOP_BACK = 1600017;
        this.BOTTOM_LEFT = 1600018;
        this.BOTTOM_RIGHT = 1600019;
        this.BOTTOM_FRONT = 1600020;
        this.BOTTOM_BACK = 1600021;
        this.FRONT_RIGHT = 1600022;
        this.FRONT_LEFT = 1600023;
        this.BACK_RIGHT = 1600024;
        this.BACK_LEFT = 1600025;
        this._initialized = false;
        /**
        * Size of the cube relative to the size of viewer canvas. This has to be a positive number between [0,1] Default value is 0.15.
        * @member {Number} xNavigationCube#ratio
        */
        this.ratio = 0.15;
        /**
        * Active parts of the navigation cube are highlighted so that user can recognize which part is active.
        * This should be a positive number between [0,2]. If the value is less than 1 active area is darker.
        * If the value is greater than 1 active area is lighter. Default value is 1.2.
        * @member {Number} xNavigationCube#highlighting
        */
        this.highlighting = 1.2;
        /**
        * Navigation cube has two transparency states. One is when user hovers over the cube and the second when the cursor is anywhere else.
        * This is for the hovering shate and it should be a positive number between [0,1]. If the value is less than 1 cube will be semitransparent
        * when user hovers over. Default value is 1.0.
        * @member {Number} xNavigationCube#activeAlpha
        */
        this.activeAlpha = 1.0;
        /**
        * Navigation cube has two transparency states. One is when user hovers over the cube and the second when the cursor is anywhere else.
        * This is for the non-hovering shate and it should be a positive number between [0,1]. If the value is less than 1 cube will be semitransparent
        * when user is not hovering over. Default value is 0.3.
        * @member {Number} xNavigationCube#passiveAlpha
        */
        this.passiveAlpha = 0.7;
        /**
        * It is possible to place navigation cube to any of the corners of the canvas using this property. Default value is cube.BOTTOM_RIGHT.
        * Allowed values are cube.BOTTOM_RIGHT, cube.BOTTOM_LEFT, cube.TOP_RIGHT and cube.TOP_LEFT.
        * @member {Enum} xNavigationCube#position
        */
        this.position = this.BOTTOM_RIGHT;
        this.vertices = new Float32Array([
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
        this.indices = new Uint16Array([
            0, 1, 2, 0, 2, 3,
            4, 5, 6, 4, 6, 7,
            8, 9, 10, 8, 10, 11,
            12, 13, 14, 12, 14, 15,
            16, 17, 18, 16, 18, 19,
            20, 21, 22, 20, 22, 23,
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
        this.txtCoords = new Float32Array([
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
        this._image = image;
    }
    NavigationCube.prototype.init = function (viewer) {
        var self = this;
        this.viewer = viewer;
        var gl = this.viewer._gl;
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
        gl.bufferData(gl.ARRAY_BUFFER, this.ids(), gl.STATIC_DRAW);
        //create texture
        var self = this;
        this._texture = gl.createTexture();
        if (typeof (this._image) === "undefined") {
            //add HTML UI to viewer port
            var data = navigation_cube_textures_1.CubeTextures.en;
            var image = new Image();
            self._image = image;
            image.addEventListener("load", function () {
                //load image texture into GPU
                gl.bindTexture(gl.TEXTURE_2D, self._texture);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, self._image);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
                gl.generateMipmap(gl.TEXTURE_2D);
            });
            image.src = data;
        }
        else {
            //load image texture into GPU
            gl.bindTexture(gl.TEXTURE_2D, self._texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, self._image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);
        }
        //reset original shader program 
        gl.useProgram(this.viewer._shaderProgram);
        viewer._canvas.addEventListener('mousemove', function (event) {
            var startX = event.clientX;
            var startY = event.clientY;
            //get coordinates within canvas (with the right orientation)
            var r = viewer._canvas.getBoundingClientRect();
            var x = startX - r.left;
            var y = viewer._height - (startY - r.top);
            //cube hasn't been drawn yet
            if (!self._region) {
                return;
            }
            var minX = self._region[0] * viewer._width;
            var maxX = self._region[2] * viewer._width;
            var minY = self._region[1] * viewer._height;
            var maxY = self._region[3] * viewer._height;
            if (x < minX || x > maxX || y < minY || y > maxY) {
                self._alpha = self.passiveAlpha;
                self._selection = 0;
                return;
            }
            //this is for picking
            var id = viewer.getID(x, y);
            if (id >= self.TOP && id <= self.BACK_LEFT) {
                self._alpha = self.activeAlpha;
                self._selection = id;
            }
            else {
                self._alpha = self.passiveAlpha;
                self._selection = 0;
            }
        }, true);
        self._drag = false;
        viewer._canvas.addEventListener('mousedown', function (event) {
            var startX = event.clientX;
            var startY = event.clientY;
            //get coordinates within canvas (with the right orientation)
            var r = viewer._canvas.getBoundingClientRect();
            var viewX = startX - r.left;
            var viewY = viewer._height - (startY - r.top);
            //this is for picking
            var id = viewer.getID(viewX, viewY);
            if (id >= self.TOP && id <= self.BACK_LEFT) {
                //change viewer navigation mode to be 'orbit'
                self._drag = true;
                self._originalNavigation = viewer.navigationMode;
                viewer.navigationMode = "orbit";
            }
        }, true);
        window.addEventListener('mouseup', function (event) {
            if (self._drag === true) {
                viewer.navigationMode = self._originalNavigation;
            }
            self._drag = false;
        }, true);
        this._initialized = true;
    };
    NavigationCube.prototype.onBeforeDraw = function () { };
    NavigationCube.prototype.onBeforePick = function (id) {
        if (id >= this.TOP && id <= this.BACK_LEFT) {
            var dir = vec3.create();
            var distance = this.viewer._distance;
            var diagonalRatio = 1.3;
            switch (id) {
                case this.TOP:
                    this.viewer.show('top');
                    return true;
                case this.BOTTOM:
                    this.viewer.show('bottom');
                    return true;
                case this.LEFT:
                    this.viewer.show('left');
                    return true;
                case this.RIGHT:
                    this.viewer.show('right');
                    return true;
                case this.FRONT:
                    this.viewer.show('front');
                    return true;
                case this.BACK:
                    this.viewer.show('back');
                    return true;
                case this.TOP_LEFT_FRONT:
                    dir = vec3.fromValues(-1, -1, 1);
                    distance *= diagonalRatio;
                    break;
                case this.TOP_RIGHT_FRONT:
                    dir = vec3.fromValues(1, -1, 1);
                    distance *= diagonalRatio;
                    break;
                case this.TOP_LEFT_BACK:
                    dir = vec3.fromValues(-1, 1, 1);
                    distance *= diagonalRatio;
                    break;
                case this.TOP_RIGHT_BACK:
                    dir = vec3.fromValues(1, 1, 1);
                    distance *= diagonalRatio;
                    break;
                case this.BOTTOM_LEFT_FRONT:
                    dir = vec3.fromValues(-1, -1, -1);
                    distance *= diagonalRatio;
                    break;
                case this.BOTTOM_RIGHT_FRONT:
                    dir = vec3.fromValues(1, -1, -1);
                    distance *= diagonalRatio;
                    break;
                case this.BOTTOM_LEFT_BACK:
                    dir = vec3.fromValues(-1, 1, -1);
                    distance *= diagonalRatio;
                    break;
                case this.BOTTOM_RIGHT_BACK:
                    dir = vec3.fromValues(1, 1, -1);
                    distance *= diagonalRatio;
                    break;
                case this.TOP_LEFT:
                    dir = vec3.fromValues(-1, 0, 1);
                    distance *= diagonalRatio;
                    break;
                case this.TOP_RIGHT:
                    dir = vec3.fromValues(1, 0, 1);
                    distance *= diagonalRatio;
                    break;
                case this.TOP_FRONT:
                    dir = vec3.fromValues(0, -1, 1);
                    distance *= diagonalRatio;
                    break;
                case this.TOP_BACK:
                    dir = vec3.fromValues(0, 1, 1);
                    distance *= diagonalRatio;
                    break;
                case this.BOTTOM_LEFT:
                    dir = vec3.fromValues(-1, 0, -1);
                    distance *= diagonalRatio;
                    break;
                case this.BOTTOM_RIGHT:
                    dir = vec3.fromValues(1, 0, -1);
                    break;
                case this.BOTTOM_FRONT:
                    dir = vec3.fromValues(0, -1, -1);
                    distance *= diagonalRatio;
                    break;
                case this.BOTTOM_BACK:
                    dir = vec3.fromValues(0, 1, -1);
                    distance *= diagonalRatio;
                    break;
                case this.FRONT_RIGHT:
                    dir = vec3.fromValues(1, -1, 0);
                    distance *= diagonalRatio;
                    break;
                case this.FRONT_LEFT:
                    dir = vec3.fromValues(-1, -1, 0);
                    distance *= diagonalRatio;
                    break;
                case this.BACK_RIGHT:
                    dir = vec3.fromValues(1, 1, 0);
                    distance *= diagonalRatio;
                    break;
                case this.BACK_LEFT:
                    dir = vec3.fromValues(-1, 1, 0);
                    distance *= diagonalRatio;
                    break;
                default:
                    break;
            }
            var o = this.viewer._origin;
            var heading = vec3.fromValues(0, 0, 1);
            var origin = vec3.fromValues(o[0], o[1], o[2]);
            dir = vec3.normalize(vec3.create(), dir);
            var shift = vec3.scale(vec3.create(), dir, distance);
            var camera = vec3.add(vec3.create(), origin, shift);
            //use look-at function to set up camera and target
            mat4.lookAt(this.viewer._mvMatrix, camera, origin, heading);
            return true;
        }
        return false;
    };
    NavigationCube.prototype.onAfterDraw = function () {
        var gl = this.setActive();
        //set uniform for colour coding to false
        gl.uniform1i(this._colourCodingUniformPointer, 0);
        this.draw();
        this.setInactive();
    };
    NavigationCube.prototype.onBeforeDrawId = function () { };
    NavigationCube.prototype.onAfterDrawId = function () {
        var gl = this.setActive();
        //set uniform for colour coding to false
        gl.uniform1i(this._colourCodingUniformPointer, 1);
        this.draw();
        this.setInactive();
    };
    //return false because this doesn't catch any ID event
    NavigationCube.prototype.onBeforeGetId = function (id) { return false; };
    NavigationCube.prototype.setActive = function () {
        var gl = this.viewer._gl;
        //set own shader
        gl.useProgram(this._shader);
        return gl;
    };
    NavigationCube.prototype.setInactive = function () {
        var gl = this.viewer._gl;
        //set viewer shader
        gl.useProgram(this.viewer._shaderProgram);
    };
    NavigationCube.prototype.draw = function () {
        if (!this._initialized)
            return;
        var gl = this.viewer._gl;
        //set navigation data from Viewer to this shader
        var pMatrix = mat4.create();
        var height = 1.0 / this.ratio;
        var width = height / this.viewer._height * this.viewer._width;
        var regionX = this.ratio * this.viewer._height / this.viewer._width * 2.0;
        var regionY = this.ratio * 2.0;
        //create orthogonal projection matrix
        switch (this.position) {
            case this.BOTTOM_RIGHT:
                mat4.ortho(pMatrix, 1.0 - width, //left
                1.0, //right
                -1.0, //bottom
                height - 1.0, //top
                -1, //near
                1); //far
                this._region = [1 - regionX, 0.0, 1.0, regionY];
                break;
            case this.BOTTOM_LEFT:
                mat4.ortho(pMatrix, -1.0, //left
                width - 1.0, //right
                -1.0, //bottom
                height - 1.0, //top
                -1, //near
                1); //far
                this._region = [0.0, 0.0, regionX, regionY];
                break;
            case this.TOP_LEFT:
                mat4.ortho(pMatrix, -1.0, //left
                width - 1.0, //right
                1.0 - height, //bottom
                1.0, //top
                -1, //near
                1); //far
                this._region = [0.0, 1.0 - regionY, regionX, 1.0];
                break;
            case this.TOP_RIGHT:
                mat4.ortho(pMatrix, 1.0 - width, //left
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
        var rotation = mat3.fromMat4(mat3
            .create(), this.viewer._mvMatrix);
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
        if (!cfEnabled)
            gl.enable(gl.CULL_FACE);
        //draw the cube as an element array
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
        if (!cfEnabled)
            gl.disable(gl.CULL_FACE);
    };
    NavigationCube.prototype._initShader = function () {
        var gl = this.viewer._gl;
        var viewer = this.viewer;
        var compile = function (shader, code) {
            gl.shaderSource(shader, code);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                viewer.error(gl.getShaderInfoLog(shader));
                return null;
            }
        };
        //fragment shader
        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        compile(fragmentShader, navigation_cube_shaders_1.CubeShaders.cube_fshader);
        //vertex shader (the more complicated one)
        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        compile(vertexShader, navigation_cube_shaders_1.CubeShaders.cube_vshader);
        //link program
        this._shader = gl.createProgram();
        gl.attachShader(this._shader, vertexShader);
        gl.attachShader(this._shader, fragmentShader);
        gl.linkProgram(this._shader);
        if (!gl.getProgramParameter(this._shader, gl.LINK_STATUS)) {
            viewer.error('Could not initialise shaders for a navigation cube plugin');
        }
    };
    NavigationCube.prototype.ids = function () {
        return new Float32Array([
            this.FRONT,
            this.FRONT,
            this.FRONT,
            this.FRONT,
            this.BACK,
            this.BACK,
            this.BACK,
            this.BACK,
            this.TOP,
            this.TOP,
            this.TOP,
            this.TOP,
            this.BOTTOM,
            this.BOTTOM,
            this.BOTTOM,
            this.BOTTOM,
            this.RIGHT,
            this.RIGHT,
            this.RIGHT,
            this.RIGHT,
            this.LEFT,
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
    };
    ;
    return NavigationCube;
}());
exports.NavigationCube = NavigationCube;
//# sourceMappingURL=navigation-cube.js.map