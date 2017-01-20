import { xVisualProperty } from './xbim-visual-property';
import { xVisualAttribute } from './xbim-visual-attribute';
import { xVisualAssignmentSet } from './xbim-visual-assignment-set';

export class xVisualEntity {

    /**
    * Visual model containing entity data
    * 
    * @name xVisualEntity
    * @constructor
    * @classdesc Visual model containing entity data
    * @param {object} [values] - Object which can be used to initialize content of the object. It can be also used to create shallow copy of the object.
    */
    constructor(values: any) {
        if (typeof (values) == 'object') {
            for (var a in values) {
                this[a] = values[a];
            }
        }
    }

    /** @member {string} xVisualEntity#id - ID extracted from object attributes*/
    public id: string = '';
    /** @member {string} xVisualEntity#type - type of the object like asset, assettype, floor, facility, assembly and others. It is always one lower case word.*/
    public type: string = '';
    /** @member {string} xVisualEntity#name - Name extracted from object attributes*/
    public name: string = '';
    /** @member {string} xVisualEntity#description - Description extracted from attributes*/
    public description: string = '';
    /** @member {xVisualAttribute[]} xVisualEntity#attributes */
    public attributes: xVisualAttribute[] = [];
    /** @member {xVisualProperty[]} xVisualEntity#properties */
    public properties: xVisualProperty[] = [];
    /** @member {xVisualEntity[]} xVisualEntity#documents */
    public documents: xVisualEntity[] = [];
    /** @member {xVisualEntity[]} xVisualEntity#issues */
    public issues: xVisualEntity[] = [];
    /** @member {xVisualAssignmentSet[]} xVisualEntity#assignments - An array of {@link xVisualAsignmentSet visual assignment sets} */
    public assignments: xVisualAssignmentSet[] = [];
    /** @member {xVisualEntity[]} xVisualEntity#children - this can be used to build hierarchical structures like facility -> floors -> spaces -> assets */
    public children: xVisualEntity[] = [];
    /** @member {xVisualEntity[]} xVisualEntity#warranties - this is applicable for asset type only. */
    public warranties: xVisualEntity[] = [];
    
    public isKey: boolean = false; //indicates if this is only a key for the actual entity
}
