import { xVisualEntity } from './visual-entity';
import { VisualModel } from './visual-model';
export declare class CobieUkUtils {
    constructor(lang: any, culture: any);
    private _dictionary;
    private _contacts;
    settings: {
        decimalPlaces: number;
    };
    getVisualEntity(entity: any, type: any): xVisualEntity;
    getValidationStatus(entity: any): "" | "[F] " | "[T] ";
    getVisualModel(data: any): VisualModel;
    getContacts(data: any): any[];
    getSpatialStructure(data: any, types: any): xVisualEntity[];
    getZones(data: any, facility: any): any[];
    getSystems(data: any, types: any): any[];
    getAssetTypes(data: any): any[];
    getProperties(entity: any): any[];
    getCategoryProperties(entity: any): any[];
    getAttributes(entity: any): any[];
    getAssignments(entity: any, type: any): any[];
    findContact(email: any): any;
    getDocuments(entity: any, type: any): any[];
    getIssues(entity: any): any[];
    setLanguage(lang: any, culture: any): void;
    getValueString(value: any): any;
    getTranslator(): (term: any) => any;
}
