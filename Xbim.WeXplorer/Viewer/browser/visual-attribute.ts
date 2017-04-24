import { xVisualEntity } from './visual-entity';

export class xVisualAttribute {
    /**
    * @name xVisualAttribute
    * @constructor
    * @classdesc Visual model describing attribute of the object
    * @param {object} [values] - Object which can be used to initialize content of the object. It can be also used to create shallow copy of the object.
    */
    constructor(values) {
        if (typeof (values) == 'object') {
            for (var a in values) {
                this[a] = values[a];
            }
        }
    }

    /** @member {string} xVisualAttribute#name */
    public name: string = '';
    /** @member {string} xVisualAttribute#description */
    public description: string = '';
    /** @member {string} xVisualAttribute#value */
    public value: string = '';
    /** @member {string} xVisualAttribute#propertySet - original property set name from IFC file */
    public propertySet: string = '';
    /** @member {string} xVisualAttribute#category */
    public category: string = '';
    /** @member {xVisualEntity[]} xVisualAttribute#issues */
    public issues: xVisualEntity[] = [];
}
