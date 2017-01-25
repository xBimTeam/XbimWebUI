"use strict";
var xVisualProperty = (function () {
    /**
    * @name xVisualProperty
    * @constructor
    * @classdesc Visual model describing property of the object
    * @param {object} [values] - Object which can be used to initialize content of the object. It can be also used to create shallow copy of the object.
    */
    function xVisualProperty(values) {
        /** @member {string} xVisualProperty#name - name might be translated if you specify a language and culture in {@link xBrowser xBrowser} constructor */
        this.name = '';
        /** @member {string} xVisualProperty#value - string containing eventually units*/
        this.value = '';
        /** @member {string} xVisualProperty#id - original name from COBie before any transformation*/
        this.id = '';
        if (typeof (values) == 'object') {
            for (var a in values) {
                this[a] = values[a];
            }
        }
    }
    return xVisualProperty;
}());
exports.xVisualProperty = xVisualProperty;
//# sourceMappingURL=xbim-visual-property.js.map