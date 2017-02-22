declare namespace Xbim.Viewer.Plugins {
    class NavigationHome implements IPlugin {
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
        constructor(image?: HTMLImageElement);
        private _image;
        private _viewer;
        /**
        * Size of the the home button relative to the size of viewer canvas. This has to be a positive number between [0,1] Default value is 0.2.
        * @member {Number} xNavigationHome#ratio
        */
        ratio: number;
        /**
        * Position of the the home button relative to the size of viewer canvas. This has to be a positive number between [0,1] Default value is 0.05.
        * @member {Number} xNavigationHome#placementX
        */
        placementX: number;
        /**
        * Position of the the home button relative to the size of viewer canvas. This has to be a positive number between [0,1] Default value is 0.05.
        * @member {Number} xNavigationHome#placementY
        */
        placementY: number;
        /**
        * Navigation home button has two transparency states. One is when user hovers over the cube and the second when the cursor is anywhere else.
        * This is for the hovering shate and it should be a positive number between [0,1]. If the value is less than 1 cube will be semitransparent
        * when user hovers over. Default value is 1.0.
        * @member {Number} xNavigationHome#activeAlpha
        */
        activeAlpha: number;
        /**
        * Navigation home button has two transparency states. One is when user hovers over the cube and the second when the cursor is anywhere else.
        * This is for the non-hovering shate and it should be a positive number between [0,1]. If the value is less than 1 cube will be semitransparent
        * when user is not hovering over. Default value is 0.3.
        * @member {Number} xNavigationHome#passiveAlpha
        */
        passiveAlpha: number;
        /**
        * Distance to be used for a home view. If null, default viewer distance for a full extent mode is used. Default value: null
        * @member {Number} xNavigationHome#distance
        */
        distance: number;
        /**
        * View direction to be used for a home view. Default value: [1, 1, -1]
        * @member {Number} xNavigationHome#viewDirection
        */
        viewDirection: number[];
        init(xviewer: Viewer): void;
        private _adjust();
        onBeforeDraw(): void;
        onBeforePick(id: number): boolean;
        onAfterDraw(): void;
        onBeforeDrawId(): void;
        onAfterDrawId(): void;
        onBeforeGetId(id: number): boolean;
        draw(): void;
    }
}
