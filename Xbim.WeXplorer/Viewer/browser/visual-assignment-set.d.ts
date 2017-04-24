import { xVisualEntity } from './visual-entity';
/**
* @name xVisualAssignmentSet
* @constructor
* @classdesc Visual model describing named sets of assignments
*/
export declare class xVisualAssignmentSet {
    /** @member {string} xVisualAssignmentSet#name */
    name: string;
    /** @member {string} xVisualAssignmentSet#id */
    id: string;
    /** @member {xVisualEntity[]} xVisualAssignmentSet#assignments */
    assignments: xVisualEntity[];
}
