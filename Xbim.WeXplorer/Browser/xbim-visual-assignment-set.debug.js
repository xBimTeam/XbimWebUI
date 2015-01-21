/**
* @name xVisualAssignmentSet
* @constructor
* @classdesc Visual model describing named sets of assignments
*/
function xVisualAssignmentSet() {
    /** @member {string} xVisualAssignmentSet#name */
    this.name = "";
    /** @member {string} xVisualAssignmentSet#id */
    this.id = "";
    /** @member {xVisualEntity[]} xVisualAssignmentSet#assignments */
    this.assignments = [];
};