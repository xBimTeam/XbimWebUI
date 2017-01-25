"use strict";
var xAttributeDictionary = (function () {
    function xAttributeDictionary(lang, culture) {
        var dictionaries = [
            {
                lang: 'cs',
                culture: 'cz',
                terms: {
                    AssetDescription: "Popis",
                    AssetInstallationDate: "Datum instalace",
                    AssetName: "Název",
                    AssetSerialNumber: "Sériové číslo",
                    AssetTypeCategory: "Kategorie",
                    AssetTypeColorCode: "Kód barvy",
                    AssetTypeDescription: "Popis",
                    AssetTypeFeaturesDescription: "Popis vlastností",
                    AssetTypeGradeDescription: "Popis kvality",
                    AssetTypeMaterialDescription: "Popis materiálu",
                    AssetTypeName: "Název",
                    AssetTypeShapeDescription: "Popis tvaru",
                    AssetTypeSizeDescription: "Popis velikosti",
                    AssetWarrantyStartDate: "Začátek záruky",
                    AttributeCategory: "Kategorie",
                    AttributeDescription: "Popis",
                    AttributeName: "Název",
                    FacilityCategory: "Kategorie",
                    FacilityDefaultAreaUnit: "Předdefinovaná jednotka plochy",
                    FacilityDefaultLinearUnit: "Předdefinovaná jednotka délky",
                    FacilityDefaultVolumeUnit: "Předdefinovaná jednotka objemu",
                    FacilityDeliverablePhaseName: "Název fáze výsledku",
                    FacilityDescription: "Popis nemovitosti",
                    FacilityName: "Název",
                    FloorCategory: "Kategorie",
                    FloorDescription: "Popis",
                    FloorName: "Název",
                    ProjectDescription: "Popis projektu",
                    ProjectName: "Název projektu",
                    SiteDescription: "Popis stavby",
                    SpaceCategory: "Kategorie místnosti",
                    SpaceDescription: "Popis místnosti",
                    SpaceName: "Název místnosti",
                    SpaceSignageName: "Space Signage Name",
                    StringValue: "String Value",
                    SystemCategory: "System Category",
                    SystemDescription: "System Description",
                    SystemName: "System Name",
                    UnitName: "Unit Name",
                    ZoneCategory: "Zone Category",
                    ZoneDescription: "Zone Description",
                    ZoneName: "Zone Name",
                    externalID: "External ID",
                    externalIDReference: "External ID Reference",
                    propertySetName: "Property Set",
                    True: "Ano",
                    False: "Ne"
                }
            },
            {
                lang: 'en',
                culture: 'uk',
                terms: {
                    AssetDescription: "Asset Description",
                    AssetInstallationDate: "Asset Installation Date",
                    AssetName: "Asset Name",
                    AssetSerialNumber: "Asset Serial Number",
                    AssetTypeCategory: "Asset Type Category",
                    AssetTypeColorCode: "Asset Type Color Code",
                    AssetTypeDescription: "Asset Type Description",
                    AssetTypeFeaturesDescription: "Asset Type Features Description",
                    AssetTypeGradeDescription: "Asset Type Grade Description",
                    AssetTypeMaterialDescription: "Asset Type Material Description",
                    AssetTypeName: "Asset Type Name",
                    AssetTypeShapeDescription: "Asset Type Shape Description",
                    AssetTypeSizeDescription: "Asset Type Size Description",
                    AssetWarrantyStartDate: "Asset Warranty Start Date",
                    AttributeCategory: "Attribute Category",
                    AttributeDescription: "Attribute Description",
                    AttributeName: "Attribute Name",
                    FacilityCategory: "Facility Category",
                    FacilityDefaultAreaUnit: "Facility Default Area Unit",
                    FacilityDefaultLinearUnit: "Facility Default Linear Unit",
                    FacilityDefaultVolumeUnit: "Facility Default Volume Unit",
                    FacilityDeliverablePhaseName: "Facility Deliverable Phase Name",
                    FacilityDescription: "Facility Description",
                    FacilityName: "Facility Name",
                    FloorCategory: "Floor Category",
                    FloorDescription: "Floor Description",
                    FloorName: "Floor Name",
                    ProjectDescription: "Project Description",
                    ProjectName: "Project Name",
                    SiteDescription: "Site Description",
                    SpaceCategory: "Space Category",
                    SpaceDescription: "Space Description",
                    SpaceName: "Space Name",
                    SpaceSignageName: "Space Signage Name",
                    StringValue: "String Value",
                    SystemCategory: "System Category",
                    SystemDescription: "System Description",
                    SystemName: "System Name",
                    UnitName: "Unit Name",
                    ZoneCategory: "Zone Category",
                    ZoneDescription: "Zone Description",
                    ZoneName: "Zone Name",
                    externalID: "External ID",
                    externalIDReference: "External ID Reference",
                    propertySetName: "Property Set",
                    True: "True",
                    False: "False"
                }
            }
        ];
        var def = dictionaries.filter(function (e) { return e.lang == 'en' && e.culture == 'uk'; })[0].terms;
        if (typeof (lang) == 'undefined' && typeof (culture) == 'undefined')
            return def;
        //try to find the best fit
        var candidates = dictionaries.filter(function (e) { return e.lang == lang; });
        //return default dictionary
        if (candidates.length == 0)
            return def;
        //return language match
        if (candidates.length == 1 || typeof (culture) == 'undefined')
            return candidates[0].terms;
        var candidates2 = candidates.filter(function (e) { return e.culture == culture; });
        //return culture match
        if (candidates2.length == 1)
            return candidates2[0].terms;
        else
            return candidates[0].terms;
    }
    return xAttributeDictionary;
}());
exports.xAttributeDictionary = xAttributeDictionary;
//# sourceMappingURL=xbim-attribute-dictionary.js.map