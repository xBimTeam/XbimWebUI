import { xVisualEntity } from './visual-entity';

/**
* @name xVisualAssignmentSet
* @constructor
* @classdesc Visual model describing named sets of assignments
*/
export class xVisualAssignmentSet{
    /** @member {string} xVisualAssignmentSet#name */
    public name: string = '';
    /** @member {string} xVisualAssignmentSet#id */
    public id: string = '';
    /** @member {xVisualEntity[]} xVisualAssignmentSet#assignments */
    public assignments: xVisualEntity[] = [];
};