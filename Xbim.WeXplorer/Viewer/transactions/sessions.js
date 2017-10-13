"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This class can be used to implement undo/redo functionality. The only requirement is
 * that every undoable action has to be performed using 'Do()' function and has to provide
 * its 'undo' counterpart so session can perform undo and redo operations as necessary.
 */
var Session = (function () {
    function Session() {
        // Array of undo redo actions
        this._do = [];
        this._undo = [];
        this._position = -1;
    }
    /**
     * This function will add 'do' and 'undo' action to the session and will
     * perform the 'do' action. This can consume any action.
     * @param doAction Action to do
     * @param undoAction Action to undo
     */
    Session.prototype.Do = function (doAction, undoAction) {
        //check if this is a do after undo. Shrink the stact in that case
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
    };
    Session.prototype.Undo = function () {
        if (!this.CanUndo) {
            return;
        }
        var action = this._undo[this._position--];
        action();
    };
    Session.prototype.Redo = function () {
        if (!this.CanRedo) {
            return;
        }
        var action = this._undo[++this._position];
        action();
    };
    Object.defineProperty(Session.prototype, "CanUndo", {
        get: function () {
            return this._position >= 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Session.prototype, "CanRedo", {
        get: function () {
            return this._position < this._do.length - 1;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Session.prototype, "Length", {
        get: function () {
            return this._do.length;
        },
        enumerable: true,
        configurable: true
    });
    return Session;
}());
exports.Session = Session;
//# sourceMappingURL=sessions.js.map