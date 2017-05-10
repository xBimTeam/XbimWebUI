import { xVisualEntity } from './visual-entity';
import { VisualModel } from './visual-model';
import { AttributeDictionary } from './attribute-dictionary';
import { xVisualAssignmentSet } from './visual-assignment-set';
import { xVisualAttribute } from './visual-attribute';
import { xVisualProperty } from './visual-property';

export class CobieUtils {

    constructor(lang, culture) {
        this._dictionary = new AttributeDictionary(lang, culture);
    }

    private _dictionary: AttributeDictionary;

    public settings = {
        decimalPlaces: 4
    };

    getVisualEntity(entity, type) {
        if (!entity || !type) throw 'entity must be defined';
        var id = entity.externalID || entity.externalIDReference;
        var name = '';
        var description = '';
        for (var a in entity) {
            if (!entity.hasOwnProperty(a)) {
                continue;
            }
            if (a.toLowerCase() === (type + 'name').toLowerCase())
                name = entity[a];
            if (a.toLowerCase() === (type + 'description').toLowerCase())
                description = entity[a];
            if (name.length !== 0 && description.length !== 0)
                break;
        }

        return new xVisualEntity({
            id: id,
            type: type,
            name: name,
            description: description,
            attributes: this.getAttributes(entity),
            properties: this.getProperties(entity),
            assignments: this.getAssignments(entity, type),
            documents: this.getDocuments(entity, type),
            issues: this.getIssues(entity)
        });
    }

    getVisualModel(data) {
        if (!data) throw 'data must be defined';

        var types = this.getAssetTypes(data);
        var facility = this.getSpatialStructure(data, types);
        return new VisualModel({
            facility: facility,
            zones: this.getZones(data, facility),
            systems: this.getSystems(data, types),
            assetTypes: types,
            contacts: this.getContacts(data)
        });
    }

    getContacts(data) {
        if (!data) throw 'data must be defined';
        var result = [];

        var contacts = data.Contacts;
        if (contacts) contacts = contacts.Contact;
        if (!contacts) return result;

        contacts.forEach(function(contact) {
                var vContact = this.getVisualEntity(contact, 'contact');
                result.push(vContact);
            },
            this);

        return result;
    }

    getSpatialStructure(data, types) {
        if (!data) throw 'data must be defined';

        var facility = this.getVisualEntity(data, 'facility');

        var floors = data.Floors;
        if (!floors)
            return [facility];
        floors = floors.Floor;
        if (!floors || floors.length == 0)
            return [facility];

        floors.forEach(function(floor) {
                var vFloor = this.getVisualEntity(floor, 'floor');
                facility.children.push(vFloor);

                var spaces = floor.Spaces;
                if (!spaces) return;
                spaces = spaces.Space;
                if (!spaces) return;

                spaces.forEach(function(space) {
                        var vSpace = this.getVisualEntity(space, 'space');
                        vFloor.children.push(vSpace);
                    },
                    this);
            },
            this);

        //add asset types and assets to spaces 
        types = types ? types : this.getAssetTypes(data);
        types.forEach(function(type) {
                type.children.forEach(function(instance) {
                        //check assignments
                        var assignmentSet = instance.assignments.filter(function(e) { return e.id === 'Space' })[0];
                        if (!assignmentSet) return;
                        var key = assignmentSet.assignments[0];
                        if (!key) return;

                        var spaceProp = key.properties.filter(function(e) { return e.id === 'SpaceName' })[0];
                        var floorProp = key.properties.filter(function(e) { return e.id === 'FloorName' })[0];
                        if (!floorProp || !spaceProp) return;

                        var spaceName = spaceProp.value;
                        var floorName = floorProp.value;

                        var floor = facility.children.filter(function(e) { return e.name === floorName; })[0];
                        if (!floor) return;

                        var space = floor.children.filter(function(e) { return e.name === spaceName })[0];
                        if (!space) return;

                        space.children.push(instance);
                        assignmentSet.assignments[0] = space;
                    },
                    this);
            },
            this);

        //facility is a root element of the tree spatial structure
        return [facility];
    }

    getZones(data, facility) {
        if (!data) throw 'data must be defined';
        var result = [];

        var zones = data.Zones;
        if (!zones) return result;
        zones = zones.Zone;
        if (!zones) return result;

        zones.forEach(function(zone) {
                var vZone = this.getVisualEntity(zone, 'zone');
                result.push(vZone);
            },
            this);

        //add spaces as a children of zones
        facility.forEach(function(f) { //facilities (always 1)
                f.children.forEach(function(floor) { //floors
                        floor.children.forEach(function(space) { //floors
                                var assignmentSet = space.assignments
                                    .filter(function(e) { return e.id === 'Zone'; })[0];
                                if (!assignmentSet) return;
                                var key = assignmentSet.assignments[0];
                                if (!key) return;
                                if (!key.id) return;

                                var zone = result.filter(function(e) { return e.id === key.id; })[0];
                                if (zone) {
                                    //add space to visual children
                                    zone.children.push(space);
                                    //replace key with actual object
                                    assignmentSet.assignments[0] = zone;
                                }
                            },
                            this);
                    },
                    this);
            },
            this);

        return result;
    }

    getSystems(data, types) {
        if (!data) throw 'data must be defined';
        var result = [];

        var systems = data.Systems;
        if (!systems) return result;
        systems = systems.System;
        if (!systems) return result;

        systems.forEach(function(system) {
                var vSystem = this.getVisualEntity(system, 'system');
                result.push(vSystem);
            },
            this);

        //add asset types and assets to spaces 
        types = types ? types : this.getAssetTypes(data);
        types.forEach(function(type) {
                type.children.forEach(function(instance) {
                        //check assignments
                        var assignmentSet = instance.assignments.filter(function(e) { return e.id === 'System' })[0];
                        if (!assignmentSet) return;
                        var key = assignmentSet.assignments[0];
                        if (!key) return;

                        if (!key.id) return;
                        var system = result.filter(function(e) { return e.id === key.id; })[0];
                        if (system) {
                            //add instance to system's visual children
                            system.children.push(instance);
                            //replace key with actual object
                            assignmentSet.assignments[0] = system;
                        }
                    },
                    this);
            },
            this);

        return result;
    }

    getAssetTypes(data) {
        if (!data) throw 'data must be defined';
        var result = [];
        var tr = this.getTranslator();

        var types = data.AssetTypes;
        if (!types) return result;
        types = types.AssetType;
        if (!types) return result;

        types.forEach(function(type) {
                var vType = this.getVisualEntity(type, 'assettype');
                result.push(vType);

                //process instances of type
                var instances = type.Assets;
                if (!instances) return;
                instances = instances.Asset;
                if (!instances) return;
                instances.forEach(function(instance) {
                        var vInstance = this.getVisualEntity(instance, 'asset');
                        vType.children.push(vInstance);

                        //add assignment to the type
                        var assignment = new xVisualAssignmentSet();
                        assignment.id = 'AssetType';
                        assignment.name = tr(assignment.id);
                        assignment.assignments.push(vType);
                        vInstance.assignments.push(assignment);
                    },
                    this);
            },
            this);

        return result;
    }

    getProperties(entity) {
        if (!entity) throw 'entity must be defined';
        var tr = this.getTranslator();
        var result = [];

        for (var a in entity) {
            if (!entity.hasOwnProperty(a)) {
                continue;
            }
            var attr = entity[a];
            var valStr = this.getValueString(attr);

            //it is an object not an attribute
            if (!valStr) continue;

            var nameStr = tr(a);
            result.push(new xVisualProperty({ name: nameStr, value: valStr, id: a }));
        };
        return result;
    }

    getAttributes(entity) {
        if (!entity) throw 'entity must be defined';

        var result = [];
        var attributes = null;
        for (var a in entity) {
            if (!entity.hasOwnProperty(a)) {
                continue;
            }
            if (entity[a].Attribute) {
                attributes = entity[a].Attribute;
                break;
            }
        }
        if (!attributes) return result;
        attributes.forEach(function(attribute) {
                result.push(new xVisualAttribute({
                    name: attribute.AttributeName,
                    description: attribute.AttributeDescription,
                    value: this.getValueString(attribute.AttributeValue),
                    propertySet: attribute.propertySetName,
                    category: attribute.AttributeCategory,
                    issues: attribute.AttributeIssues ? this.getAttributes(attribute.AttributeIssues) : []
                }));
            },
            this);
        return result;
    }

    getAssignments(entity, type) {
        if (!entity || !type) throw 'entity and type must be defined';
        var tr = this.getTranslator();
        var result = [];

        for (var attr in entity) {
            if (!entity.hasOwnProperty(attr)) {
                continue;
            }
            var collection = new xVisualAssignmentSet();
            //assignment collection
            var r = new RegExp('^(' + type + ')(.*)(assignments)$', 'i');
            if (r.test(attr)) {
                collection.id = attr.replace(r, '$2');
                collection.name = tr(collection.id + 's');
                for (var a in entity[attr]) {
                    if (!entity[attr].hasOwnProperty(a)) {
                        continue;
                    }
                    var assignmentSet = entity[attr][a];
                    var name = a.replace('Assignment', '').toLowerCase();
                    for (var a in assignmentSet) {
                        if (!assignmentSet.hasOwnProperty(a)) {
                            continue;
                        }
                        var assignment = assignmentSet[a];
                        var vAssignment = this.getVisualEntity(assignment, name);
                        vAssignment.isKey = true;
                        collection.assignments.push(vAssignment);
                    }
                }
            }
            //single assignment
            r = new RegExp('(.*)(assignment)$', 'i');
            if (r.test(attr)) {
                collection.id = attr.replace(r, '$1');
                collection.name = tr(collection.id);
                var vEntity = this.getVisualEntity(entity[attr], collection.id.toLowerCase());
                collection.assignments.push(vEntity);
            }

            if (collection.assignments.length !== 0) {
                result.push(collection);
            }
        }

        return result;
    }

    getDocuments(entity, type) {
        if (!entity || !type) throw 'entity and type must be defined';
        var result = [];

        for (var attr in entity) {
            if (!entity.hasOwnProperty(attr)) {
                continue;
            }
            var r = new RegExp('^(' + type + ')(documents)$', 'i');
            if (r.test(attr)) {
                var documents = entity[attr].Document
                if (!documents) continue;
                for (var i = 0; i < documents.length; i++) {
                    var doc = documents[i]
                    var vDoc = this.getVisualEntity(doc, 'document')
                    result.push(vDoc);
                }
            }
        }

        return result;
    }

    getIssues(entity) {
        if (!entity) throw 'entity and type must be defined';
        var result = [];

        for (var attr in entity) {
            if (!entity.hasOwnProperty(attr)) {
                continue;
            }
            if (entity[attr].Issue) {
                var issues = entity[attr].Issue
                for (var i = 0; i < issues.length; i++) {
                    var issue = issues[i]
                    var vIssue = this.getVisualEntity(issue, 'issue')
                    result.push(vIssue);
                }
            }
        }

        return result;
    }

    setLanguage(lang, culture) {
        this._dictionary = new AttributeDictionary(lang, culture);
    }

    getValueString(value) {
        if (typeof (value) == 'undefined' || value == null)
            return '';
        var tr = this.getTranslator();

        //this of for attributes prior to serialization enhancements
        if (typeof (value.Item) !== 'undefined') value = value.Item;

        //this is for different kinds of attributes using latest serializer implementation
        if (typeof (value.AttributeBooleanValue) !== 'undefined') value = value.AttributeBooleanValue;
        if (typeof (value.AttributeDateValue) !== 'undefined') value = value.AttributeDateValue;
        if (typeof (value.AttributeDateTimeValue) !== 'undefined') value = value.AttributeDateTimeValue;
        if (typeof (value.AttributeDecimalValue) !== 'undefined') value = value.AttributeDecimalValue;
        if (typeof (value.AttributeIntegerValue) !== 'undefined') value = value.AttributeIntegerValue;
        if (typeof (value.AttributeMonetaryValue) !== 'undefined') value = value.AttributeMonetaryValue;
        if (typeof (value.AttributeStringValue) !== 'undefined') value = value.AttributeStringValue;
        if (typeof (value.AttributeTimeValue) !== 'undefined') value = value.AttributeTimeValue;


        var baseVal = '';
        if (typeof (value) == 'string') baseVal = value;
        if (typeof (value.BooleanValue) !== 'undefined') baseVal = value.BooleanValue ? tr('True') : tr('False');
        if (typeof (value.StringValue) !== 'undefined') baseVal = value.StringValue;
        if (typeof (value.DecimalValue) !== 'undefined')
            baseVal = value.DecimalValue.toFixed(this.settings.decimalPlaces).toString();
        if (typeof (value.IntegerValue) !== 'undefined') baseVal = value.IntegerValue.toString();

        if (value.UnitName) baseVal += ' ' + value.UnitName;

        return baseVal.length > 0 ? baseVal : '';
    }

    getTranslator() {
        var self = this;
        return function(term) {
            return self._dictionary[term] ? self._dictionary[term] : term.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
        };
    }
}
