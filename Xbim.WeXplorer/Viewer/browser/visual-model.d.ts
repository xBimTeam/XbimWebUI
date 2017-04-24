import { xVisualEntity } from './visual-entity';
export declare class VisualModel {
    /**
    * Visual model containing preprocessed COBie data in more uniform form usable for templating and rendering
    *
    * @name xVisualModel
    * @constructor
    * @classdesc Visual model containing preprocessed COBie data in more uniform form usable for templating and rendering
    * @param {object} [values] - Object which can be used to initialize content of the object. It can be also used to create shallow copy of the object.
    */
    constructor(values: any);
    /** @member {xVisualEntity[]} xVisualModel#facility - An array of facilities. There is always one faclity but it is convenient to have all
    * members of xVisualModel to be an array so they can be accessed in an uniform way.
    */
    facility: xVisualEntity[];
    /** @member {xVisualEntity[]} xVisualModel#zones - An array of zones defined in COBie model. They contain spaces as their children. */
    zones: xVisualEntity[];
    /** @member {xVisualEntity[]} xVisualModel#systems - An array of systems */
    systems: xVisualEntity[];
    /** @member {xVisualEntity[]} xVisualModel#contacts - An array of all contacts used in the COBie model*/
    contacts: xVisualEntity[];
    /** @member {xVisualEntity[]} xVisualModel#assetTypes - An array of all asset types. These contain assets as their children */
    assetTypes: xVisualEntity[];
    getEntity(id: any): any;
}
