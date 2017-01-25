import { xVisualEntity } from './xbim-visual-entity';
export declare class xVisualAttribute {
    /**
    * @name xVisualAttribute
    * @constructor
    * @classdesc Visual model describing attribute of the object
    * @param {object} [values] - Object which can be used to initialize content of the object. It can be also used to create shallow copy of the object.
    */
    constructor(values: any);
    /** @member {string} xVisualAttribute#name */
    name: string;
    /** @member {string} xVisualAttribute#description */
    description: string;
    /** @member {string} xVisualAttribute#value */
    value: string;
    /** @member {string} xVisualAttribute#propertySet - original property set name from IFC file */
    propertySet: string;
    /** @member {string} xVisualAttribute#category */
    category: string;
    /** @member {xVisualEntity[]} xVisualAttribute#issues */
    issues: xVisualEntity[];
}
