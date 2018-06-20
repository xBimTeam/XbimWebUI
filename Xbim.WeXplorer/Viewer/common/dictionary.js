"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Dictionary = /** @class */ (function () {
    function Dictionary(keyMaker) {
        this._internal = {};
        this._count = 0;
        if (keyMaker) {
            this._getKey = keyMaker;
        }
        else {
            this._getKey = function (k) { return k.toString(); };
        }
    }
    Dictionary.prototype.Set = function (key, value) {
        var index = this._getKey(key);
        var exist = this._internal[index];
        if (!exist) {
            this._count++;
        }
        this._internal[index] = value;
    };
    Dictionary.prototype.Add = function (key, value) {
        var index = this._getKey(key);
        var exist = this._internal[index];
        if (exist)
            throw new Error("This key exists already: " + index);
        this._internal[index] = value;
        this._count++;
    };
    Dictionary.prototype.TryGet = function (key, refResult) {
        var index = this._getKey(key);
        var exist = this._internal[index];
        if (exist) {
            refResult[0] = exist;
            return true;
        }
        refResult[0] = null;
        return false;
    };
    Dictionary.prototype.Remove = function (key) {
        var index = this._getKey(key);
        var exist = this._internal[index];
        if (exist) {
            delete this._internal[index];
            this._count--;
            return true;
        }
        return false;
    };
    Object.defineProperty(Dictionary.prototype, "Count", {
        get: function () {
            return this._count;
        },
        enumerable: true,
        configurable: true
    });
    Dictionary.prototype.Where = function (condition) {
        var _this = this;
        var result = new Array();
        Object.keys(this._internal).forEach(function (key) {
            var value = _this._internal[key];
            if (condition(value)) {
                result.push(value);
            }
        });
        return result;
    };
    Dictionary.prototype.ForEach = function (action) {
        var _this = this;
        Object.keys(this._internal).forEach(function (key) {
            var value = _this._internal[key];
            action(value);
        });
    };
    return Dictionary;
}());
exports.Dictionary = Dictionary;
//# sourceMappingURL=dictionary.js.map