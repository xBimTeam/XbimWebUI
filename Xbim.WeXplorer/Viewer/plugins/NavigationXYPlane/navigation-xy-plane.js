"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mat4_1 = require("../../matrix/mat4");
var vec3_1 = require("../../matrix/vec3");
var NavigationXYPlane = /** @class */ (function () {
    function NavigationXYPlane() {
        /**
         * Use this boolean switch to activate and deactivate the plugin. This will supposingly be bound to
         * some user interaction (like a button in the toolbar).
         * @member {boolean} NavigationXYPlane#isActive
         * */
        this._isActive = false;
        /**
         * When a vertical angle from horizontal plane is bigger than this, default navigation is used.
         * The default is 60 degrees. Applies for both up and down looking angles.
         * @member {number} NavigationXYPlane#bowLimit
         * */
        this._bowLimit = 60.0;
        /**
         * By default this is 1.0. Make this bigger to speed the movement up or make it smaller to slow it down
         * @member {number} NavigationXYPlane#speedFactor
         * */
        this._speedFactor = 1.0;
    }
    // called by the viewer when plugin is added
    NavigationXYPlane.prototype.init = function (viewer) {
        // patch the internal implementation (keep binding to the original object)
        this._originalNavigate = viewer['navigate'].bind(viewer);
        viewer['navigate'] = this.navigate.bind(this);
        // keep the reference for the navigation
        this._viewer = viewer;
    };
    Object.defineProperty(NavigationXYPlane.prototype, "isActive", {
        get: function () { return this._isActive; },
        set: function (value) { this._isActive = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NavigationXYPlane.prototype, "bowLimit", {
        get: function () { return this._bowLimit; },
        set: function (value) { this._bowLimit = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NavigationXYPlane.prototype, "speedFactor", {
        get: function () { return this._speedFactor; },
        set: function (value) { this._speedFactor = value; },
        enumerable: true,
        configurable: true
    });
    NavigationXYPlane.prototype.navigate = function (type, deltaX, deltaY) {
        // this is not active or it is not a zoom operation so call the original implementation
        if (!this.isActive || type !== 'zoom') {
            this._originalNavigate(type, deltaX, deltaY);
            return;
        }
        // transform [0,0,1] direction from view space to model space
        var pMatrix = this._viewer['_pMatrix'];
        var mvMatrix = this._viewer.mvMatrix;
        var transform = mat4_1.mat4.multiply(mat4_1.mat4.create(), pMatrix, mvMatrix);
        var inv = mat4_1.mat4.invert(mat4_1.mat4.create(), transform);
        // direction in model space
        var dir = vec3_1.vec3.transformMat4(vec3_1.vec3.create(), vec3_1.vec3.fromValues(0, 0, 1), inv);
        // calculate bow angle
        var xy = Math.sqrt(dir[0] * dir[0] + dir[1] * dir[1]);
        var z = Math.abs(dir[2]);
        // check for singularity
        var bow = 0.0;
        if (xy < 1e-5) {
            bow = Math.PI / 2.0;
        }
        else {
            bow = Math.atan(z / xy);
        }
        // if the view direction is more than BowLimit from the horizontal view,
        // navigate as usual.
        if (bow > this.bowLimit * Math.PI / 180) {
            this._originalNavigate(type, deltaX, deltaY);
            return;
        }
        // project to XY plane in model space and normalize;
        dir[2] = 0;
        dir = vec3_1.vec3.normalize(vec3_1.vec3.create(), dir);
        // scale by the factor and navigation
        var meter = this._viewer['_handles'][0].model.meter;
        var sign = (deltaY >= 0 ? 1 : -1) * (deltaX >= 0 ? 1 : -1);
        var factor = this.speedFactor * meter * sign;
        dir = vec3_1.vec3.scale(vec3_1.vec3.create(), dir, factor);
        // set the actual model view matrix for rendering
        this._viewer.mvMatrix = mat4_1.mat4.translate(mat4_1.mat4.create(), mvMatrix, dir);
    };
    NavigationXYPlane.prototype.onBeforeDraw = function () {
    };
    NavigationXYPlane.prototype.onAfterDraw = function () {
    };
    NavigationXYPlane.prototype.onBeforeDrawId = function () {
    };
    NavigationXYPlane.prototype.onAfterDrawId = function () {
    };
    NavigationXYPlane.prototype.onBeforeGetId = function (id) {
        return false;
    };
    NavigationXYPlane.prototype.onBeforePick = function (id) {
        return false;
    };
    return NavigationXYPlane;
}());
exports.NavigationXYPlane = NavigationXYPlane;
//# sourceMappingURL=navigation-xy-plane.js.map