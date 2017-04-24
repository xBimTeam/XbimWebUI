import { xVisualEntity } from './visual-entity';
import { VisualModel } from './visual-model';
import { AttributeDictionary } from './attribute-dictionary';
import { xVisualAssignmentSet } from './visual-assignment-set';
import { xVisualAttribute } from './visual-attribute';
import { xVisualProperty } from './visual-property';

export class CobieUkUtils {
    constructor(lang, culture) {
        this._dictionary = new AttributeDictionary(lang, culture);
    }

    private _dictionary: AttributeDictionary;
    private _contacts: any[] = [];

    public settings = {
        decimalPlaces: 4
    };

    getVisualEntity(entity, type) {
        if (!entity || !type) throw 'entity must be defined';
        return new xVisualEntity({
            id: entity.ExternalId,
            type: type,
            name: this
                .getValidationStatus(entity) +
                entity.Name, //prepend validation status. This will make it easier for later.
            description: entity.Description,
            attributes: this.getAttributes(entity),
            properties: this.getProperties(entity),
            assignments: this.getAssignments(entity, type),
            documents: this.getDocuments(entity, type),
            issues: this.getIssues(entity)
        });
    }

    getValidationStatus(entity) {
        if (entity.Categories == null) return '';

        for (var i = 0; i < entity.Categories.length; i++) {
            var category = entity.Categories[i];
            if (typeof (category.Code) !== 'undefined' && category.Code.toLowerCase() === 'failed')
                return '[F] ';
            if (typeof (category.Code) !== 'undefined' && category.Code.toLowerCase() === 'passed')
                return '[T] ';
        }
        return '';
    }

    getVisualModel(data) {
        if (!data) throw 'data must be defined';

        //contacts are used very often as a references in assignments
        //so it is good to have them in the wide scope for processing
        this._contacts = this.getContacts(data);

        var types = this.getAssetTypes(data);
        //this will also add assets to spaces where they should be
        var facility = this.getSpatialStructure(data, types);
        return new VisualModel({
            facility: facility,
            zones: this.getZones(data, facility),
            systems: this.getSystems(data, types),
            assetTypes: types,
            contacts: this._contacts
        });
    }

    getContacts(data) {
        if (!data) throw 'data must be defined';
        var result = [];
        var contacts = data.Contacts;
        if (!contacts) return result;

        for (var i = 0; i < contacts.length; i++) {
            var vContact = this.getVisualEntity(contacts[i], 'contact');
            result.push(vContact);
        }

        return result;
    }

    getSpatialStructure(data, types) {
        if (!data) throw 'data must be defined';
        if (!types) throw 'types must be defined';

        var facility = this.getVisualEntity(data, 'facility');

        var floors: xVisualEntity[] = data.Floors;
        if (!floors || floors.length == 0)
            return [facility];

        for (var i in floors) {
            var floor = floors[i];
            var vFloor = this.getVisualEntity(floor, 'floor');
            facility.children.push(vFloor);

            var spaces: xVisualEntity[] = floor['Spaces'];
            if (!spaces) continue;

            for (var s in spaces) {
                var space = spaces[s];
                var vSpace = this.getVisualEntity(space, 'space');
                vFloor.children.push(vSpace);
            }
        }

        //add asset types and assets to spaces 
        for (var t in types) {
            var type = types[t];
            for (var i in type.children) {
                var instance = type.children[i];

                //check assignments
                var assignmentSet = instance.assignments.filter(function(e) { return e.id == 'Space' })[0];
                if (!assignmentSet) continue;
                var key = assignmentSet.assignments[0];
                if (!key) continue;

                var spaceProp = key.properties.filter(function(e) { return e.id == 'Name' })[0];
                if (!spaceProp) continue;

                var spaceName = spaceProp.value.split(',')[0];

                for (var j = 0; j < facility.children.length; j++) {
                    var floor = facility.children[j];

                    var space = floor.children.filter(function(e) { return e.name == spaceName })[0];
                    if (!space) continue;

                    space.children.push(instance);
                    assignmentSet.assignments[0] = space;
                    break;;
                }


            }
        }

        //facility is a root element of the tree spatial structure
        return [facility];
    }

    getZones(data, facility) {
        if (!data) throw 'data must be defined';
        if (!facility) throw 'data must be defined';
        var result = [];

        var zones = data.Zones;
        if (!zones) return result;

        for (var z in zones) {
            var zone = zones[z];
            var vZone = this.getVisualEntity(zone, 'zone');
            result.push(vZone);

            //add spaces as a children
            var keys = zone.Spaces;
            if (!keys || keys.length == 0) continue;

            for (var ki in keys) {
                var key = keys[ki];
                for (var i = 0; i < facility.length; i++) { //facilities (always 1)
                    var f = facility[i];
                    for (var j = 0; j < f.children.length; j++) { //floors
                        var floor = f.children[j];
                        for (var k = 0; k < floor.children.length; k++) { //spaces
                            var space = floor.children[k];
                            if (space.name != key.Name) continue;

                            //add space as a children
                            vZone.children.push(space);
                            //add zone to space as an assignment
                            var assignmentSet = space.assignments.filter(function(e) { return e.id == 'Zone'; })[0];
                            if (!assignmentSet) {
                                assignmentSet = new xVisualAssignmentSet();
                                assignmentSet.id = 'Zone';
                                assignmentSet.name = 'Zones';
                                space.assignments.push(assignmentSet);
                            }
                            assignmentSet.assignments.push(vZone);
                        }
                    }
                }
            }
        }

        return result;
    }

    getSystems(data, types) {
        if (!data) throw 'data must be defined';
        if (!types) throw 'types must be defined';
        var result = [];

        var systems = data.Systems;
        if (!systems) return result;

        var instances = [];
        for (var k = 0; k < types.length; k++) {
            var type = types[k];
            for (var c in type.children) {
                instances.push(type.children[c]);
            }
        }

        for (var s in systems) {
            var system = systems[s];
            var vSystem = this.getVisualEntity(system, 'system');
            result.push(vSystem);

            //add assets to systems 
            var componentKeys = system.Components;
            for (var j = 0; j < componentKeys.length; j++) {
                var key = componentKeys[j];
                var candidates = instances.filter(function(e) { return e.name == key.Name; });
                if (!candidates) continue;
                var instance = candidates[0];
                if (!instance) continue;

                //add asset to system
                vSystem.children.push(instance);
                //add system to asset assignments
                var assignmentSet = instance.assignments.filter(function(e) { return e.id == 'System'; })[0];
                if (!assignmentSet) {
                    assignmentSet = new xVisualAssignmentSet();
                    assignmentSet.id = 'System';
                    assignmentSet.Name = 'Systems';
                    instance.assignments.push(assignmentSet);
                }
                assignmentSet.assignments.push(vSystem);
            }
        }
        return result;
    }

    getAssetTypes(data) {
        if (!data) throw 'data must be defined';
        var result = [];
        var tr = this.getTranslator();

        var types = data.AssetTypes;
        if (!types) return result;

        for (var t in types) {
            var type = types[t];
            var vType = this.getVisualEntity(type, 'assettype');
            result.push(vType);

            //process instances of type
            var instances = type.Assets;
            if (!instances) continue;
            for (var i in instances) {
                var instance = instances[i];
                var vInstance = this.getVisualEntity(instance, 'asset');
                vType.children.push(vInstance);

                //add assignment to the type
                var assignment = new xVisualAssignmentSet();
                assignment.id = 'AssetType';
                assignment.name = tr(assignment.id);
                assignment.assignments.push(vType);
                vInstance.assignments.push(assignment);
            }
        }

        return result;
    }

    getProperties(entity) {
        if (!entity) throw 'entity must be defined';
        var tr = this.getTranslator();
        var result = [];

        for (var a in entity) {
            var attr = entity[a];
            var valStr = this.getValueString(attr);
            if (valStr) {
                var nameStr = tr(a);
                result.push(new xVisualProperty({ name: nameStr, value: valStr, id: a }));
            }
        }
        var catProperties = this.getCategoryProperties(entity);
        for (var i = 0; i < catProperties.length; i++) {
            result.push(catProperties[i]);
        }

        return result;
    }

    getCategoryProperties(entity) {
        var cats = entity.Categories;
        if (!cats) return [];

        var result = [];
        for (var i = 0; i < cats.length; i++) {
            var cat = cats[i];
            var valStr = cat.Code + cat.Description ? ': ' + cat.Description : '';
            result.push(new xVisualProperty({ name: cat.Classification || 'Free category', value: valStr, id: i }));
        }
        return [];
    }

    getAttributes(entity) {
        if (!entity) throw 'entity must be defined';

        var result = [];
        var attributes = entity.Attributes;
        if (!attributes) return result;

        for (var a in attributes) {
            var attribute = attributes[a];

            result.push(new xVisualAttribute({
                name: attribute.Name,
                description: attribute.Description,
                value: this.getValueString(attribute),
                propertySet: attribute.ExternalEntity,
                categories: this.getCategoryProperties(attribute),
                issues: attribute.Issues ? this.getIssues({ Issues: attribute.Issues }) : []
            }));
        }
        return result;
    }

    getAssignments(entity, type) {
        if (!entity || !type) throw 'entity and type must be defined';
        var tr = this.getTranslator();
        var result = [];

        //assignment can either be an array of keys or a single embeded object
        for (var attrName in entity) {
            if (!entity.hasOwnProperty(attrName)) continue;
            var assignmentSet = new xVisualAssignmentSet();
            var attr = entity[attrName];

            //set of assignments (keys)
            if (attr instanceof Array && attr.length > 0 && typeof (attr[0].KeyType) !== 'undefined') {
                assignmentSet.id = attr[0].KeyType;
                assignmentSet.name = tr(attrName);
                for (var i = 0; i < attr.length; i++) {
                    //if it is a contact than add a contact if available
                    if (attr[i].KeyType === 'Contact') {
                        var contact = this.findContact(attr['Email']);
                        if (contact) {
                            assignmentSet.assignments.push(contact);
                            continue;
                        }
                    }

                    var vAssignment = this.getVisualEntity(attr[i], attr[i].KeyType.toLowerCase());
                    vAssignment.isKey = true;
                    assignmentSet.assignments.push(vAssignment);
                }
                result.push(assignmentSet);
                continue;
            }

            //single key assignment
            if (typeof (attr.KeyType) !== 'undefined') {
                assignmentSet.id = attr.KeyType;
                assignmentSet.name = tr(attrName);

                //add a contact if it is defined
                if (attr.KeyType === 'Contact' && this._contacts) {
                    var contact = this.findContact(attr.Email);
                    if (contact) {
                        assignmentSet.assignments.push(contact);
                        result.push(assignmentSet);
                        continue;
                    }
                }

                var vEntity = this.getVisualEntity(attr, attr.KeyType.toLowerCase());
                assignmentSet.assignments.push(vEntity);
                result.push(assignmentSet);
                continue;
            }

            //cope with objects that encapsulate set of information (like a warranty, site, space and eventually others)
            if (!(attr instanceof Array) && (attr instanceof Object)) {
                assignmentSet.id = attr.KeyType;
                assignmentSet.name = tr(attrName);
                var vEntity = this.getVisualEntity(attr, 'inner');
                assignmentSet.assignments.push(vEntity);
                result.push(assignmentSet);
                continue;
            }
        }

        return result;
    }

    findContact(email) {
        for (var i = 0; i < this._contacts.length; i++) {
            var contact = this._contacts[i];
            var emailProp = contact.properties.filter(function(e) { return e.name === 'Email'; })[0]
            if (emailProp && emailProp.value === email)
                return contact;
        }
    }

    getDocuments(entity, type) {
        if (!entity || !type) throw 'entity and type must be defined';
        var result = [];

        var documents = entity.Documents
        if (!documents) return result;
        for (var i = 0; i < documents.length; i++) {
            var doc = documents[i]
            var vDoc = this.getVisualEntity(doc, 'document')
            result.push(vDoc);
        }

        return result;
    }

    getIssues(entity) {
        if (!entity) throw 'entity and type must be defined';
        var result = [];

        var issues = entity.Issues
        if (!issues) return result;

        for (var i = 0; i < issues.length; i++) {
            var issue = issues[i]
            var vIssue = this.getVisualEntity(issue, 'issue')
            result.push(vIssue);
        }

        return result;
    }

    setLanguage(lang, culture) {
        this._dictionary = new AttributeDictionary(lang, culture);
    }

    getValueString(value) {
        if (typeof (value) == 'undefined' || value == null)
            return '';

        var units = value.Unit || '';

        //this is for different kinds of attributes using latest serializer implementation
        if (typeof (value.StringAttributeValue) !== 'undefined') return value.StringAttributeValue.Value || '';
        if (typeof (value.BooleanAttributeValue) !== 'undefined') return value.BooleanAttributeValue.Value || '';
        if (typeof (value.DateTimeAttributeValue) !== 'undefined') return value.DateTimeAttributeValue.Value || '';
        if (typeof (value.DecimalAttributeValue) !== 'undefined') {
            var number = value.DecimalAttributeValue.Value;
            if (number) {
                number = number.toFixed(this.settings.decimalPlaces);
                return number.toString() + ' ' + units;
            }
            return '';
        }
        if (typeof (value.IntegerAttributeValue) !== 'undefined') {
            var number = value.IntegerAttributeValue.Value;
            if (number) {
                return number.toString() + ' ' + units;
            }
            return '';
        }

        //return null for arrays and objects (which are both 'object')
        if (typeof (value) == 'object')
            return null;

        return value;
    }

    getTranslator() {
        var self = this;
        return function(term) {
            return self._dictionary[term] ? self._dictionary[term] : term.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
        };
    }
}
