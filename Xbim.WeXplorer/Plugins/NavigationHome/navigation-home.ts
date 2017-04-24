import { IPlugin, Viewer } from "../../Viewer/viewer";
import { HomeTextures } from "./navigation-home-textures";

export class NavigationHome implements IPlugin {

    /**
     * This is constructor of the Home plugin for {@link Viewer xBIM Viewer}. It gets optional Image object as an argument. If no image
     * is specified there is a default one (which is not very prety). 
     * @name xNavigationHome
     * @constructor
     * @classdesc This is a plugin for Viewer which renders interactive home button. It is customizable in terms of alpha 
     * behaviour and its position on the viewer canvas as well as definition of the distance and view direction. Use of plugin:
     *  
     *     var home = new xNavigationHome();
     *     viewer.addPlugin(home);
     * 
     *
     * @param {Image} [image = null] - optional image to be used for a button.
    */
    constructor(image?: HTMLImageElement) {
        //private variables
        this._image = image;
    }

    private _image: HTMLImageElement;
    private _viewer: Viewer;
    /**
    * Size of the the home button relative to the size of viewer canvas. This has to be a positive number between [0,1] Default value is 0.2. 
    * @member {Number} xNavigationHome#ratio
    */
    public ratio: number = 0.2;
    /**
    * Position of the the home button relative to the size of viewer canvas. This has to be a positive number between [0,1] Default value is 0.05. 
    * @member {Number} xNavigationHome#placementX
    */
    public placementX: number = 0.05;

    /**
    * Position of the the home button relative to the size of viewer canvas. This has to be a positive number between [0,1] Default value is 0.05. 
    * @member {Number} xNavigationHome#placementY
    */
    public placementY: number = 0.05;

    /**
    * Navigation home button has two transparency states. One is when user hovers over the cube and the second when the cursor is anywhere else.
    * This is for the hovering shate and it should be a positive number between [0,1]. If the value is less than 1 cube will be semitransparent 
    * when user hovers over. Default value is 1.0. 
    * @member {Number} xNavigationHome#activeAlpha
    */
    public activeAlpha: number = 1.0;

    /**
    * Navigation home button has two transparency states. One is when user hovers over the cube and the second when the cursor is anywhere else.
    * This is for the non-hovering shate and it should be a positive number between [0,1]. If the value is less than 1 cube will be semitransparent 
    * when user is not hovering over. Default value is 0.3. 
    * @member {Number} xNavigationHome#passiveAlpha
    */
    public passiveAlpha: number = 0.3;

    /**
    * Distance to be used for a home view. If null, default viewer distance for a full extent mode is used. Default value: null
    * @member {Number} xNavigationHome#distance
    */
    public distance: number = null;

    /**
    * View direction to be used for a home view. Default value: [1, 1, -1]
    * @member {Number} xNavigationHome#viewDirection
    */
    public viewDirection: number[] = [1, 1, -1];

    public init(xviewer: Viewer) {
        this._viewer = xviewer;
        var self = this;

        if (typeof (this._image) === "undefined") {
            //add HTML UI to viewer port
            var data = HomeTextures["en"];

            var image = new Image();
            self._image = image;
            image.addEventListener("load",
                function () {
                    self._adjust();
                });
            image.src = data;
        } else {
            self._adjust();
        }

        //add image to document
        document.documentElement.appendChild(this._image);

        //add click event listener
        self._image.addEventListener("click",
            function () {
                var viewer = self._viewer;
                //set target to full extent
                viewer.setCameraTarget();
                var origin = viewer._origin;
                var distance = self.distance != null ? self.distance : viewer._distance;

                var normDirection = vec3.normalize(vec3.create(), self.viewDirection);
                var position = vec3.scale(vec3.create(), normDirection, -1.0 * distance);

                viewer.setCameraPosition(Array.prototype.slice.call(position));
            });

        //set active state styling
        self._image.addEventListener("mouseover",
            function () {
                self._image.style.opacity = self.activeAlpha.toString(); //For real browsers;
                self._image.style.filter = "alpha(opacity=" + Math.round(self.activeAlpha * 100.0) + ")"; //For IE;
            });

        //set passive state styling
        self._image.addEventListener("mouseleave",
            function () {
                self._image.style.opacity = self.passiveAlpha.toString(); //For real browsers;
                self._image.style.filter = "alpha(opacity=" + Math.round(self.passiveAlpha * 100.0) + ")"; //For IE;
            });

        //set initial styling
        self._image.style.opacity = this.passiveAlpha.toString(); //For real browsers;
        self._image.style.filter = "alpha(opacity=" + Math.round(this.passiveAlpha * 100.0) + ")"; //For IE;
    }

    private _adjust() {
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

    }

    public onBeforeDraw() { }

    public onBeforePick(id: number) { return false; }

    public onAfterDraw() { this._adjust(); }

    public onBeforeDrawId() { }

    public onAfterDrawId() { }

    public onBeforeGetId(id: number) { return false; }

    public draw() { }
}
