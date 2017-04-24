import { xVisualProperty } from './visual-property';
import { xVisualAttribute } from './visual-attribute';
import { xVisualAssignmentSet } from './visual-assignment-set';
export declare class xVisualEntity {
    /**
    * Visual model containing entity data
    *
    * @name xVisualEntity
    * @constructor
    * @classdesc Visual model containing entity data
    * @param {object} [values] - Object which can be used to initialize content of the object. It can be also used to create shallow copy of the object.
    */
    constructor(values: any);
    /** @member {string} xVisualEntity#id - ID extracted from object attributes*/
    id: string;
    /** @member {string} xVisualEntity#type - type of the object like asset, assettype, floor, facility, assembly and others. It is always one lower case word.*/
    type: string;
    /** @member {string} xVisualEntity#name - Name extracted from object attributes*/
    name: string;
    /** @member {string} xVisualEntity#description - Description extracted from attributes*/
    description: string;
    /** @member {xVisualAttribute[]} xVisualEntity#attributes */
    attributes: xVisualAttribute[];
    /** @member {xVisualProperty[]} xVisualEntity#properties */
    properties: xVisualProperty[];
    /** @member {xVisualEntity[]} xVisualEntity#documents */
    documents: xVisualEntity[];
    /** @member {xVisualEntity[]} xVisualEntity#issues */
    issues: xVisualEntity[];
    /** @member {xVisualAssignmentSet[]} xVisualEntity#assignments - An array of {@link xVisualAsignmentSet visual assignment sets} */
    assignments: xVisualAssignmentSet[];
    /** @member {xVisualEntity[]} xVisualEntity#children - this can be used to build hierarchical structures like facility -> floors -> spaces -> assets */
    children: xVisualEntity[];
    /** @member {xVisualEntity[]} xVisualEntity#warranties - this is applicable for asset type only. */
    warranties: xVisualEntity[];
    isKey: boolean;
}
