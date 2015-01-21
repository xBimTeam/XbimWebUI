/**
* Visual model containing entity data
* 
* @name xVisualEntity
* @constructor
* @classdesc Visual model containing entity data
* @param {object} [values] - Object which can be used to initialize content of the object. It can be also used to create shallow copy of the object.
*/
function xVisualEntity(values) {
    /** @member {string} xVisualEntity#id - ID extracted from object attributes*/
    this.id = "";
    /** @member {string} xVisualEntity#type - type of the object like asset, assettype, floor, facility, assembly and others. It is always one lower case word.*/
    this.type = "";
    /** @member {string} xVisualEntity#name - Name extracted from object attributes*/
    this.name = "";
    /** @member {string} xVisualEntity#description - Description extracted from attributes*/
    this.description = "";
    /** @member {xVisualAttribute[]} xVisualEntity#attributes */
    this.attributes = [];
    /** @member {xVisualProperty[]} xVisualEntity#properties */
    this.properties = [];
    /** @member {xVisualEntity[]} xVisualEntity#documents */
    this.documents = [];
    /** @member {xVisualEntity[]} xVisualEntity#issues */
    this.issues = [];
    /** @member {xVisualAssignmentSet[]} xVisualEntity#assignments - An array of {@link xVisualAsignmentSet visual assignment sets} */
    this.assignments = [];
    /** @member {xVisualEntity[]} xVisualEntity#children - this can be used to build hierarchical structures like facility -> floors -> spaces -> assets */
    this.children = []; 
    /** @member {xVisualEntity[]} xVisualEntity#warranties - this is applicable for asset type only. */
    this.warranties = []; 

    this.isKey = false; //indicates if this is only a key for the actual entity

    if (typeof (values) == 'object') {
        for (var a in values) {
            this[a] = values[a];
        }
    }
};
