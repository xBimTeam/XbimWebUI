"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var xVisualAttribute = (function () {
    /**
    * @name xVisualAttribute
    * @constructor
    * @classdesc Visual model describing attribute of the object
    * @param {object} [values] - Object which can be used to initialize content of the object. It can be also used to create shallow copy of the object.
    */
    function xVisualAttribute(values) {
        /** @member {string} xVisualAttribute#name */
        this.name = '';
        /** @member {string} xVisualAttribute#description */
        this.description = '';
        /** @member {string} xVisualAttribute#value */
        this.value = '';
        /** @member {string} xVisualAttribute#propertySet - original property set name from IFC file */
        this.propertySet = '';
        /** @member {string} xVisualAttribute#category */
        this.category = '';
        /** @member {xVisualEntity[]} xVisualAttribute#issues */
        this.issues = [];
        if (typeof (values) == 'object') {
            for (var a in values) {
                this[a] = values[a];
            }
        }
    }
    return xVisualAttribute;
}());
exports.xVisualAttribute = xVisualAttribute;
//# sourceMappingURL=xbim-visual-attribute.js.map