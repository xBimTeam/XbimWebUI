"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
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
 * @name ViewerSession
 * @constructor
 * @classdesc This class allows to manage state of selection and visibility in undo/redo session
 *
 * @param {Viewer} viewer viewer to operate on
 */
var ViewerSession = /** @class */ (function (_super) {
    __extends(ViewerSession, _super);
    function ViewerSession(viewer) {
        var _this = _super.call(this) || this;
        _this.viewer = viewer;
        _this._selection = {};
        _this._hidden = {};
        //public setState(state: State, target: number | number[], modelId?: number) {
        //    if (typeof (modelId) === 'undefined') {
        //        modelId = 0;
        //    }
        //    var stateName = State[state];
        //    var old = this.viewer.getModelState(modelId);
        //    var doAction = () => {
        //        this.viewer.setState(state, target, modelId);
        //    };
        //    var undoAction = () => {
        //        this.viewer.restoreModelState(modelId, old);
        //    };
        //    super.do(doAction, undoAction);
        //}
        //public setStyle(style: number, target: number | number[], modelId?: number) {
        //    if (typeof (modelId) === 'undefined') {
        //        modelId = 0;
        //    }
        //    var old = this.viewer.getModelState(modelId);
        //    var doAction = () => {
        //        this.viewer.setStyle(style, target, modelId);
        //    };
        //    var undoAction = () => {
        //        this.viewer.restoreModelState(modelId, old);
        //    };
        //    super.do(doAction, undoAction);
        //}
        _this.currentZoom = null;
        return _this;
    }
    Object.defineProperty(ViewerSession.prototype, "selection", {
        /**
         * Current selection as a read-only list of product and model ids
         * @member {Array<{ id: number, modelId: number }>} ViewerSession#selection
         */
        get: function () {
            var _this = this;
            var result = [];
            Object.getOwnPropertyNames(this._selection).forEach(function (name) {
                var modelId = parseInt(name);
                Object.getOwnPropertyNames(_this._selection[modelId]).forEach(function (idString) {
                    var id = parseInt(idString);
                    // get actual current state
                    var state = _this.viewer.getState(id, modelId);
                    if (state != viewer_1.State.HIGHLIGHTED) {
                        delete _this._selection[name][idString];
                    }
                    else {
                        result.push({ id: id, modelId: modelId });
                    }
                });
            });
            return result;
        },
        enumerable: true,
        configurable: true
    });
    ViewerSession.prototype.getSelectionClone = function () {
        var _this = this;
        var result = {};
        Object.getOwnPropertyNames(this._selection).forEach(function (name) {
            var modelId = parseInt(name);
            if (!result[modelId]) {
                result[modelId] = {};
            }
            Object.getOwnPropertyNames(_this._selection[modelId]).forEach(function (idString) {
                var id = parseInt(idString);
                result[modelId][id] = _this._selection[modelId][id];
            });
        });
        return result;
    };
    ViewerSession.prototype.getProductsOfType = function (type) {
        var _this = this;
        var result = [];
        if (Array.isArray(type)) {
            type.forEach(function (typeId) {
                _this.viewer.ModelIds.forEach(function (modelId) {
                    _this.viewer.getProductsOfType(typeId, modelId).forEach(function (id) {
                        result.push({ id: id, modelId: modelId });
                    });
                });
            });
        }
        else {
            this.viewer.ModelIds.forEach(function (modelId) {
                _this.viewer.getProductsOfType(type, modelId).forEach(function (id) {
                    result.push({ id: id, modelId: modelId });
                });
            });
        }
        return result;
    };
    /**
    * Selects all instances of the specified type or types
    * @function ViewerSession.selectType
    * @param {ProductType | ProductType[]} type - Type or array of types
    * @param {boolean} clear - Defines wether the selection should be cleared or added
    */
    ViewerSession.prototype.selectType = function (type, clear) {
        var ids = this.getProductsOfType(type);
        this.select(ids, clear);
    };
    /**
    * Selects all instances defined as a list of objects containing id and modelId
    * @function ViewerSession.select
    * @param {Array<{ id: number, modelId: number }>} products - Product and model IDs
    * @param {boolean} clear - Defines wether the selection should be cleared or added
    * @fires ViewerSession#selection
    */
    ViewerSession.prototype.select = function (products, clear) {
        var _this = this;
        // copy current selection
        var oldSelection = this.getSelectionClone();
        var newSelection = clear ? {} : this.getSelectionClone();
        products.forEach(function (product) {
            var id = product.id;
            var modelId = product.modelId;
            var state = _this.viewer.getState(id, modelId);
            if (!newSelection[modelId]) {
                newSelection[modelId] = {};
            }
            if (!newSelection[modelId][id]) {
                newSelection[modelId][id] = state;
            }
        });
        var doAction = function () {
            Object.getOwnPropertyNames(oldSelection).forEach(function (name) {
                var modelId = parseInt(name);
                Object.getOwnPropertyNames(oldSelection[modelId]).forEach(function (idString) {
                    var id = parseInt(idString);
                    var state = oldSelection[modelId][id];
                    if (!newSelection[modelId] || !newSelection[modelId][id]) {
                        _this.viewer.setState(state, [id], modelId);
                    }
                });
            });
            Object.getOwnPropertyNames(newSelection).forEach(function (name) {
                var modelId = parseInt(name);
                Object.getOwnPropertyNames(newSelection[modelId]).forEach(function (idString) {
                    var id = parseInt(idString);
                    _this.viewer.setState(viewer_1.State.HIGHLIGHTED, [id], modelId);
                });
            });
            _this._selection = newSelection;
            /**
             * Occurs when selection changes
             *
             * @event VieweSession.selection
             * @type {object}
             * @param {Number} id - product ID
             * @param {Number} modelId - model ID
             *
            */
            _super.prototype.fire.call(_this, 'selection', _this.selection);
        };
        var undoAction = function () {
            Object.getOwnPropertyNames(newSelection).forEach(function (name) {
                var modelId = parseInt(name);
                Object.getOwnPropertyNames(newSelection[modelId]).forEach(function (idString) {
                    var id = parseInt(idString);
                    var state = newSelection[modelId][id];
                    if (!oldSelection[modelId] || !oldSelection[modelId][id]) {
                        _this.viewer.setState(state, [id], modelId);
                    }
                });
            });
            Object.getOwnPropertyNames(oldSelection).forEach(function (name) {
                var modelId = parseInt(name);
                Object.getOwnPropertyNames(oldSelection[modelId]).forEach(function (idString) {
                    var id = parseInt(idString);
                    _this.viewer.setState(viewer_1.State.HIGHLIGHTED, [id], modelId);
                });
            });
            _this._selection = oldSelection;
            _super.prototype.fire.call(_this, 'selection', _this.selection);
        };
        _super.prototype.do.call(this, doAction, undoAction);
    };
    Object.defineProperty(ViewerSession.prototype, "hidden", {
        /**
        * Current hidden products as a read-only list of product and model ids
        * @member {Array<{ id: number, modelId: number }>} ViewerSession#hidden
        */
        get: function () {
            var _this = this;
            var result = [];
            Object.getOwnPropertyNames(this._hidden).forEach(function (name) {
                var modelId = parseInt(name);
                Object.getOwnPropertyNames(_this._hidden[modelId]).forEach(function (idString) {
                    var id = parseInt(idString);
                    // get actual current state
                    var state = _this.viewer.getState(id, modelId);
                    if (state != viewer_1.State.HIDDEN) {
                        delete _this._hidden[name][idString];
                    }
                    else {
                        result.push({ id: id, modelId: modelId });
                    }
                });
            });
            return result;
        },
        enumerable: true,
        configurable: true
    });
    /**
    * Hides all instances of the specified type or types
    * @function ViewerSession.hideType
    * @param {ProductType | ProductType[]} type - Type or array of types
    * @param {boolean} clear - Defines wether the selection should be cleared or added
    * @fires ViewerSession#hide
    */
    ViewerSession.prototype.hideType = function (type) {
        var ids = this.getProductsOfType(type);
        this.hide(ids);
    };
    /**
    * Hides all instances defined as a list of objects containing id and modelId
    * @function ViewerSession.hide
    * @param {Array<{ id: number, modelId: number }>} products - Product and model IDs
    * @fires ViewerSession#hide
    */
    ViewerSession.prototype.hide = function (products) {
        var _this = this;
        var toHide = [];
        products.forEach(function (product) {
            var id = product.id;
            var modelId = product.modelId;
            var state = _this.viewer.getState(id, modelId);
            if (!_this._hidden[modelId]) {
                _this._hidden[modelId] = {};
            }
            // ignore already hidden and highlighted
            if (state == viewer_1.State.HIDDEN || state == viewer_1.State.HIGHLIGHTED) {
                return;
            }
            var p = Object.assign({ state: state }, product);
            toHide.push(p);
        });
        var doAction = function () {
            toHide.forEach(function (product) {
                var id = product.id;
                var modelId = product.modelId;
                var state = product.state;
                _this._hidden[modelId][id] = state;
                _this.viewer.setState(viewer_1.State.HIDDEN, [id], modelId);
            });
            /**
             * Occurs when selection changes
             *
             * @event VieweSession#hide
             * @type {object[]}
             * @param {Number} id - product ID
             * @param {Number} modelId - model ID
             *
            */
            _super.prototype.fire.call(_this, 'hide', toHide.slice(0));
        };
        var undoAction = function () {
            toHide.forEach(function (product) {
                var id = product.id;
                var modelId = product.modelId;
                var state = product.state;
                _this.viewer.setState(state, [id], modelId);
                delete _this._hidden[modelId][id];
            });
            _super.prototype.fire.call(_this, 'show', toHide.slice(0));
        };
        _super.prototype.do.call(this, doAction, undoAction);
    };
    /**
    * Shows all instances of the specified type or types
    * @function ViewerSession.showType
    * @param {ProductType | ProductType[]} type - Type or array of types
    * @param {boolean} clear - Defines wether the selection should be cleared or added
    * @fires ViewerSession#show
    */
    ViewerSession.prototype.showType = function (type) {
        var ids = this.getProductsOfType(type);
        this.show(ids);
    };
    /**
    * Shows all instances defined as a list of objects containing id and modelId
    * @function ViewerSession.show
    * @param {Array<{ id: number, modelId: number }>} products - Product and model IDs
    * @fires ViewerSession#show
    */
    ViewerSession.prototype.show = function (products) {
        var _this = this;
        // copy current hidden object
        var toShow = [];
        // filter only to products which are not visible
        products.forEach(function (product) {
            var id = product.id;
            var modelId = product.modelId;
            if (!_this._hidden[modelId]) {
                _this._hidden[modelId] = {};
            }
            var state = _this.viewer.getState(id, modelId);
            if (state != viewer_1.State.HIDDEN) {
                return;
            }
            var pastState = _this._hidden[modelId][id];
            if (pastState)
                state = pastState;
            if (state === viewer_1.State.HIDDEN) {
                state = viewer_1.State.UNDEFINED;
            }
            toShow.push(Object.assign({ state: state }, product));
        });
        var doAction = function () {
            toShow.forEach(function (product) {
                var id = product.id;
                var modelId = product.modelId;
                var state = product.state;
                delete _this._hidden[modelId][id];
                _this.viewer.setState(state, [id], modelId);
            });
            /**
            * Occurs when selection changes
            *
            * @event VieweSession#show
            * @type {object[]}
            * @param {Number} id - product ID
            * @param {Number} modelId - model ID
            *
           */
            _super.prototype.fire.call(_this, 'show', toShow);
        };
        var undoAction = function () {
            toShow.forEach(function (product) {
                var id = product.id;
                var modelId = product.modelId;
                _this._hidden[modelId][id] = _this.viewer.getState(id, modelId);
                _this.viewer.setState(viewer_1.State.HIDDEN, [id], modelId);
            });
            _super.prototype.fire.call(_this, 'hide', toShow);
        };
        _super.prototype.do.call(this, doAction, undoAction);
    };
    /**
   * Clips the model
   * @function ViewerSession.clip
   * @param {number[]} [point] - Point of clipping
   * @param {number[]} [normal] - Normal to the clipping plane
   * @fires ViewerSession#clip
   */
    ViewerSession.prototype.clip = function (point, normal) {
        var _this = this;
        var plane = this.viewer.clippingPlaneA.slice(0);
        var doAction = function () {
            _this.viewer.clip(point, normal);
            _super.prototype.fire.call(_this, 'clip', _this.viewer.clippingPlaneA.slice(0));
        };
        var undoAction = function () {
            _this.viewer.clippingPlaneA = plane;
            _super.prototype.fire.call(_this, 'clip', plane);
        };
        _super.prototype.do.call(this, doAction, undoAction);
    };
    /**
    * Unclips the model
    * @function ViewerSession.unclip
    * @fires ViewerSession#clip
    */
    ViewerSession.prototype.unclip = function () {
        var _this = this;
        var plane = this.viewer.clippingPlaneA.slice(0);
        var doAction = function () {
            _this.viewer.unclip();
            _super.prototype.fire.call(_this, 'clip', _this.viewer.clippingPlaneA.slice(0));
        };
        var undoAction = function () {
            _this.viewer.clippingPlaneA = plane;
            _super.prototype.fire.call(_this, 'clip', _this.viewer.clippingPlaneA.slice(0));
        };
        _super.prototype.do.call(this, doAction, undoAction);
    };
    /**
    * Zooms to specified product or to full extent if no argument is provided
    * @function ViewerSession.zoom
    * @param {number} [id] - Product ID
    * @param {number} [modelId] - Model ID
    * @fires ViewerSession#zoom
    */
    ViewerSession.prototype.zoomTo = function (id, modelId) {
        var _this = this;
        var oldMv = new Float32Array(this.viewer.mvMatrix);
        var oldZoom = this.currentZoom != null ? Object.assign({}, this.currentZoom) : null;
        var newZoom = id != null ? { id: id, modelId: modelId } : null;
        var doAction = function () {
            _this.viewer.zoomTo(id, modelId);
            _this.currentZoom = newZoom;
            _super.prototype.fire.call(_this, 'zoom', newZoom);
        };
        var undoAction = function () {
            _this.viewer.mvMatrix = oldMv;
            _this.currentZoom = oldZoom;
            _super.prototype.fire.call(_this, 'zoom', oldZoom);
        };
        _super.prototype.do.call(this, doAction, undoAction);
    };
    //public setCameraPosition(coordinates: number[]) {
    //    var oldMv = new Float32Array(this.viewer.mvMatrix);
    //    var doAction = () => {
    //        this.viewer.setCameraPosition(coordinates);
    //    };
    //    var undoAction = () => {
    //        this.viewer.mvMatrix = oldMv;
    //    };
    //    super.do(doAction, undoAction);
    //}
    //public setCameraTarget(prodId?: number, modelId?: number) {
    //    var oldDistance = this.viewer._distance;
    //    var oldOrigin = this.viewer._origin.slice(0);
    //    var doAction = () => {
    //        this.viewer.setCameraTarget(prodId, modelId);
    //    };
    //    var undoAction = () => {
    //        this.viewer._origin = oldOrigin;
    //        this.viewer._distance = oldDistance;
    //    };
    //    super.do(doAction, undoAction);
    //}
    /**
    * Stops one model
    * @function ViewerSession.stopModel
    * @param {number} [id] - Model ID
    * @fires ViewerSession#modelsChanged
    */
    ViewerSession.prototype.stopModel = function (id) {
        var _this = this;
        var doAction = function () {
            _this.viewer.stop(id);
            _super.prototype.fire.call(_this, 'modelsChanged', _this.viewer.ModelIdsOn);
        };
        var undoAction = function () {
            _this.viewer.start(id);
            _super.prototype.fire.call(_this, 'modelsChanged', _this.viewer.ModelIdsOn);
        };
        _super.prototype.do.call(this, doAction, undoAction);
    };
    /**
    * Starts one model
    * @function ViewerSession.stopModel
    * @param {number} [id] - Model ID
    * @fires ViewerSession#modelsChanged
    */
    ViewerSession.prototype.startModel = function (id) {
        var _this = this;
        var doAction = function () {
            _this.viewer.start(id);
            _super.prototype.fire.call(_this, 'modelsChanged', _this.viewer.ModelIdsOn);
        };
        var undoAction = function () {
            _this.viewer.stop(id);
            _super.prototype.fire.call(_this, 'modelsChanged', _this.viewer.ModelIdsOn);
        };
        _super.prototype.do.call(this, doAction, undoAction);
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