"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var navigation_home_textures_1 = require("./navigation-home-textures");
var vec3_1 = require("../../matrix/vec3");
var NavigationHome = (function () {
    /**
     * This is constructor of the Home plugin for {@link Viewer xBIM Viewer}. It gets optional Image object as an argument. If no image
     * is specified there is a default one (which is not very prety).
     * @name NavigationHome
     * @constructor
     * @classdesc This is a plugin for Viewer which renders interactive home button. It is customizable in terms of alpha
     * behaviour and its position on the viewer canvas as well as definition of the distance and view direction. Use of plugin:
     *
     *     var home = new NavigationHome();
     *     viewer.addPlugin(home);
     *
     *
     * @param {Image} [image = null] - optional image to be used for a button.
    */
    function NavigationHome(image) {
        /**
        * Size of the the home button relative to the size of viewer canvas. This has to be a positive number between [0,1] Default value is 0.2.
        * @member {Number} NavigationHome#ratio
        */
        this.ratio = 0.2;
        /**
        * Position of the the home button relative to the size of viewer canvas. This has to be a positive number between [0,1] Default value is 0.05.
        * @member {Number} NavigationHome#placementX
        */
        this.placementX = 0.05;
        /**
        * Position of the the home button relative to the size of viewer canvas. This has to be a positive number between [0,1] Default value is 0.05.
        * @member {Number} NavigationHome#placementY
        */
        this.placementY = 0.05;
        /**
        * Navigation home button has two transparency states. One is when user hovers over the cube and the second when the cursor is anywhere else.
        * This is for the hovering shate and it should be a positive number between [0,1]. If the value is less than 1 cube will be semitransparent
        * when user hovers over. Default value is 1.0.
        * @member {Number} NavigationHome#activeAlpha
        */
        this.activeAlpha = 1.0;
        /**
        * Navigation home button has two transparency states. One is when user hovers over the cube and the second when the cursor is anywhere else.
        * This is for the non-hovering shate and it should be a positive number between [0,1]. If the value is less than 1 cube will be semitransparent
        * when user is not hovering over. Default value is 0.3.
        * @member {Number} NavigationHome#passiveAlpha
        */
        this.passiveAlpha = 0.3;
        /**
        * Distance to be used for a home view. If null, default viewer distance for a full extent mode is used. Default value: null
        * @member {Number} NavigationHome#distance
        */
        this.distance = null;
        /**
        * View direction to be used for a home view. Default value: [1, 1, -1]
        * @member {Number} NavigationHome#viewDirection
        */
        this.viewDirection = [1, 1, -1];
        //private variables
        this._image = image;
    }
    NavigationHome.prototype.init = function (xviewer) {
        this._viewer = xviewer;
        var self = this;
        if (typeof (this._image) === "undefined") {
            //add HTML UI to viewer port
            var data = navigation_home_textures_1.HomeTextures["en"];
            var image = new Image();
            self._image = image;
            image.addEventListener("load", function () {
                self._adjust();
            });
            image.src = data;
        }
        else {
            self._adjust();
        }
        //add image to document
        document.documentElement.appendChild(this._image);
        //add click event listener
        self._image.addEventListener("click", function () {
            var viewer = self._viewer;
            //set target to full extent
            viewer.setCameraTarget();
            var origin = viewer._origin;
            var distance = self.distance != null ? self.distance : viewer._distance;
            var normDirection = vec3_1.vec3.normalize(vec3_1.vec3.create(), self.viewDirection);
            var position = vec3_1.vec3.scale(vec3_1.vec3.create(), normDirection, -1.0 * distance);
            viewer.setCameraPosition(Array.prototype.slice.call(position));
        });
        //set active state styling
        self._image.addEventListener("mouseover", function () {
            self._image.style.opacity = self.activeAlpha.toString(); //For real browsers;
            self._image.style.filter = "alpha(opacity=" + Math.round(self.activeAlpha * 100.0) + ")"; //For IE;
        });
        //set passive state styling
        self._image.addEventListener("mouseleave", function () {
            self._image.style.opacity = self.passiveAlpha.toString(); //For real browsers;
            self._image.style.filter = "alpha(opacity=" + Math.round(self.passiveAlpha * 100.0) + ")"; //For IE;
        });
        //set initial styling
        self._image.style.opacity = this.passiveAlpha.toString(); //For real browsers;
        self._image.style.filter = "alpha(opacity=" + Math.round(this.passiveAlpha * 100.0) + ")"; //For IE;
    };
    NavigationHome.prototype._adjust = function () {
        var canvas = this._viewer._canvas;
        function getOffsetRect(elem) {
            var box = elem.getBoundingClientRect();
            var body = document.body;
            var docElem = document.documentElement;
            var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
            var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
            var clientTop = docElem.clientTop || body.clientTop || 0;
            var clientLeft = docElem.clientLeft || body.clientLeft || 0;
            var top = Math.round(box.top + scrollTop - clientTop);
            var left = Math.round(box.left + scrollLeft - clientLeft);
            var width = Math.round(box.width);
            var height = Math.round(box.height);
            return { top: top, left: left, width: width, height: height };
        }
        //get position, width and height
        var rect = getOffsetRect(canvas);
        //set image size to what it should be (both relative to height so it is not destorted)
        this._image.style.width = Math.round(rect.height * this.ratio) + "px";
        this._image.style.height = Math.round(rect.height * this.ratio) + "px";
        //place image to the desired position
        this._image.style.position = "absolute";
        this._image.style.left = Math.round(rect.left + rect.width * this.placementX) + "px";
        this._image.style.top = Math.round(rect.top + rect.height * this.placementY) + "px";
    };
    NavigationHome.prototype.onBeforeDraw = function () { };
    NavigationHome.prototype.onBeforePick = function (id) { return false; };
    NavigationHome.prototype.onAfterDraw = function () { this._adjust(); };
    NavigationHome.prototype.onBeforeDrawId = function () { };
    NavigationHome.prototype.onAfterDrawId = function () { };
    NavigationHome.prototype.onBeforeGetId = function (id) { return false; };
    NavigationHome.prototype.draw = function () { };
    return NavigationHome;
}());
exports.NavigationHome = NavigationHome;
//# sourceMappingURL=navigation-home.js.map