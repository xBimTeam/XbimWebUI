"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var viewer_1 = require("../viewer");
var session_1 = require("./session");
/**
 * This class is a convenience wrapper around the viewer which provides
 * undo/redo operations for all viewer functions
 */
var ViewerSession = /** @class */ (function (_super) {
    __extends(ViewerSession, _super);
    function ViewerSession(viewer) {
        var _this = _super.call(this) || this;
        _this.viewer = viewer;
        return _this;
    }
    ViewerSession.prototype.clip = function (point, normal) {
        var _this = this;
        var plane = this.viewer.clippingPlaneA.slice(0);
        var doAction = function () {
            _this.viewer.clip(point, normal);
        };
        var undoAction = function () {
            _this.viewer.clippingPlaneA = plane;
        };
        _super.prototype.Do.call(this, doAction, undoAction);
    };
    ViewerSession.prototype.unclip = function () {
        var _this = this;
        var plane = this.viewer.clippingPlaneA.slice(0);
        var doAction = function () {
            _this.viewer.unclip();
        };
        var undoAction = function () {
            _this.viewer.clippingPlaneA = plane;
        };
        _super.prototype.Do.call(this, doAction, undoAction);
    };
    ViewerSession.prototype.setState = function (state, target, modelId) {
        var _this = this;
        if (typeof (modelId) === 'undefined') {
            modelId = 0;
        }
        var stateName = viewer_1.State[state];
        var old = this.viewer.getModelState(modelId);
        var doAction = function () {
            _this.viewer.setState(state, target, modelId);
        };
        var undoAction = function () {
            _this.viewer.restoreModelState(modelId, old);
        };
        _super.prototype.Do.call(this, doAction, undoAction);
    };
    ViewerSession.prototype.setStyle = function (style, target, modelId) {
        var _this = this;
        if (typeof (modelId) === 'undefined') {
            modelId = 0;
        }
        var old = this.viewer.getModelState(modelId);
        var doAction = function () {
            _this.viewer.setStyle(style, target, modelId);
        };
        var undoAction = function () {
            _this.viewer.restoreModelState(modelId, old);
        };
        _super.prototype.Do.call(this, doAction, undoAction);
    };
    ViewerSession.prototype.zoomTo = function (id, model) {
        var _this = this;
        var oldMv = new Float32Array(this.viewer.mvMatrix);
        var doAction = function () {
            _this.viewer.zoomTo(id, model);
        };
        var undoAction = function () {
            _this.viewer.mvMatrix = oldMv;
        };
        _super.prototype.Do.call(this, doAction, undoAction);
    };
    ViewerSession.prototype.setCameraPosition = function (coordinates) {
        var _this = this;
        var oldMv = new Float32Array(this.viewer.mvMatrix);
        var doAction = function () {
            _this.viewer.setCameraPosition(coordinates);
        };
        var undoAction = function () {
            _this.viewer.mvMatrix = oldMv;
        };
        _super.prototype.Do.call(this, doAction, undoAction);
    };
    ViewerSession.prototype.setCameraTarget = function (prodId, modelId) {
        var _this = this;
        var oldDistance = this.viewer._distance;
        var oldOrigin = this.viewer._origin.slice(0);
        var doAction = function () {
            _this.viewer.setCameraTarget(prodId, modelId);
        };
        var undoAction = function () {
            _this.viewer._origin = oldOrigin;
            _this.viewer._distance = oldDistance;
        };
        _super.prototype.Do.call(this, doAction, undoAction);
    };
    ViewerSession.prototype.stopModel = function (id) {
        var _this = this;
        var doAction = function () {
            _this.viewer.stop(id);
        };
        var undoAction = function () {
            _this.viewer.start(id);
        };
        _super.prototype.Do.call(this, doAction, undoAction);
    };
    ViewerSession.prototype.startModel = function (id) {
        var _this = this;
        var doAction = function () {
            _this.viewer.start(id);
        };
        var undoAction = function () {
            _this.viewer.stop(id);
        };
        _super.prototype.Do.call(this, doAction, undoAction);
    };
    return ViewerSession;
}(session_1.Session));
exports.ViewerSession = ViewerSession;
var Snapshot = /** @class */ (function () {
    function Snapshot(viewer) {
        var _this = this;
        this.viewer = viewer;
        this.states = {};
        //camera view
        this.mvMatrix = new Float32Array(viewer.mvMatrix);
        //models state
        var ids = viewer.ModelIds;
        ids.forEach(function (id, i, a) {
            _this.states[id] = viewer.getModelState(id);
        });
        //clipping planes
        this.clippingPlaneA = viewer.clippingPlaneA.slice(0);
        this.clippingPlaneB = viewer.clippingPlaneB.slice(0);
        //models stopped and active
        this.modelsOn = viewer.ModelIdsOn;
        this.modelsOff = viewer.ModelIdsOff;
    }
    Snapshot.prototype.Restore = function () {
        var v = this.viewer;
        //camera view
        v.mvMatrix = this.mvMatrix;
        //models state
        for (var id in this.states) {
            var modelId = new Number(id).valueOf();
            var state = this.states[id];
            v.restoreModelState(modelId, state);
        }
        //clipping planes
        v.clippingPlaneA = this.clippingPlaneA;
        v.clippingPlaneB = this.clippingPlaneB;
        //models stopped and active
        this.modelsOn.forEach(function (id) { v.start(id); });
        this.modelsOff.forEach(function (id) { v.stop(id); });
    };
    return Snapshot;
}());
//# sourceMappingURL=viewer-session.js.map