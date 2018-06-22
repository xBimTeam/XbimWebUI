"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This class can be used to implement undo/redo functionality. The only requirement is
 * that every undoable action has to be performed using 'Do()' function and has to provide
 * its 'undo' counterpart so session can perform undo and redo operations as necessary.
 */
var Session = /** @class */ (function () {
    function Session() {
        // Array of undo redo actions
        this._do = [];
        this._undo = [];
        this._position = -1;
        this._events = {};
    }
    /**
     * This function will add 'do' and 'undo' action to the session and will
     * perform the 'do' action. This can consume any action.
     * @param doAction Action to do
     * @param undoAction Action to undo
     */
    Session.prototype.do = function (doAction, undoAction) {
        //check if this is a do after undo. Shrink the stact in that is the case
        var shrink = this._do.length - this._position - 1;
        if (shrink > 0) {
            this._do.splice(this._position + 1);
            this._undo.splice(this._position + 1);
        }
        //add to list of actions
        this._do.push(doAction);
        this._undo.push(undoAction);
        this._position++;
        doAction();
        this.fire('do', this.getEventArgs());
    };
    Session.prototype.undo = function () {
        if (!this.canUndo) {
            return;
        }
        var action = this._undo[this._position--];
        action();
        this.fire('undo', this.getEventArgs());
    };
    Session.prototype.redo = function () {
        if (!this.canRedo) {
            return;
        }
        var action = this._do[++this._position];
        action();
        this.fire('redo', this.getEventArgs());
    };
    Object.defineProperty(Session.prototype, "canUndo", {
        get: function () {
            return this._position >= 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Session.prototype, "canRedo", {
        get: function () {
            return this._position < this._do.length - 1;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Session.prototype, "length", {
        get: function () {
            return this._do.length;
        },
        enumerable: true,
        configurable: true
    });
    Session.prototype.getEventArgs = function () {
        return { canUndo: this.canUndo, canRedo: this.canRedo, length: this.length };
    };
    //executes all handlers bound to event name
    Session.prototype.fire = function (eventName, args) {
        var handlers = this._events[eventName];
        if (!handlers) {
            return;
        }
        //call the callbacks
        handlers.slice().forEach(function (handler) {
            handler(args);
        });
    };
    /**
     * Use this method to register to events of the viewer like {@link Viewer#event:pick pick}, {@link Viewer#event:mouseDown mouseDown},
     * {@link Viewer#event:loaded loaded} and others. You can define arbitrary number
     * of event handlers for any event. You can remove handler by calling {@link Viewer#off off()} method.
     *
     * @function Viewer#on
     * @param {String} eventName - Name of the event you would like to listen to.
     * @param {Object} callback - Callback handler of the event which will consume arguments and perform any custom action.
    */
    Session.prototype.on = function (eventName, callback) {
        var events = this._events;
        if (!events[eventName]) {
            events[eventName] = new Array();
        }
        events[eventName].push(callback);
    };
    /**
    * Use this method to unregister handlers from events. You can add event handlers by calling the {@link Viewer#on on()} method.
    *
    * @function Viewer#off
    * @param {String} eventName - Name of the event
    * @param {Object} callback - Handler to be removed
    */
    Session.prototype.off = function (eventName, callback) {
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
    return Session;
}());
exports.Session = Session;
//# sourceMappingURL=session.js.map