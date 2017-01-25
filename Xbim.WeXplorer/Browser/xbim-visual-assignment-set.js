"use strict";
/**
* @name xVisualAssignmentSet
* @constructor
* @classdesc Visual model describing named sets of assignments
*/
var xVisualAssignmentSet = (function () {
    function xVisualAssignmentSet() {
        /** @member {string} xVisualAssignmentSet#name */
        this.name = '';
        /** @member {string} xVisualAssignmentSet#id */
        this.id = '';
        /** @member {xVisualEntity[]} xVisualAssignmentSet#assignments */
        this.assignments = [];
    }
    return xVisualAssignmentSet;
}());
exports.xVisualAssignmentSet = xVisualAssignmentSet;
;
//# sourceMappingURL=xbim-visual-assignment-set.js.map