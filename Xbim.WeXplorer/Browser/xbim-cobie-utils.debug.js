function xCobieUtils(lang, culture) {
    this._dictionary = new xAttributeDictionary(lang, culture);
};

xCobieUtils.prototype.settings = {
    decimalPlaces: 4
};

xCobieUtils.prototype.getVisualEntity = function (entity, type) {
    if (!entity || !type) throw 'entity must be defined';
    var id = entity.externalID || entity.externalIDReference;
    var name = "";
    var description = "";
    for (var a in entity) {
        if (a.toLowerCase() == (type + 'name').toLowerCase())
            name = entity[a];
        if (a.toLowerCase() == (type + 'description').toLowerCase())
            description = entity[a];
        if (name.length != 0 && description.length != 0)
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
};

xCobieUtils.prototype.getVisualModel = function (data) {
    if (!data) throw 'data must be defined';

    var types = this.getAssetTypes(data);
    var facility = this.getSpatialStructure(data, types);
    return new xVisualModel({
        facility: facility,
        zones: this.getZones(data, facility),
        systems: this.getSystems(data, types),
        assetTypes: types,
        contacts: this.getContacts(data)
    });
};

xCobieUtils.prototype.getContacts = function (data) {
    if (!data) throw 'data must be defined';
    var result = [];

    var contacts = data.Contacts;
    if (contacts) contacts = contacts.Contact;
    if (!contacts) return result;

    for (var i = 0; i < contacts.length; i++) {
        var contact = contacts[i];
        var vContact = this.getVisualEntity(contact, 'contact');
        result.push(vContact);
    }

    return result;
};

xCobieUtils.prototype.getSpatialStructure = function (data, types) {
    if (!data) throw 'data must be defined';

    var facility = this.getVisualEntity(data, 'facility');

    var floors = data.Floors;
    if (!floors)
        return [facility];
    floors = floors.Floor;
    if (!floors || floors.length == 0)
        return [facility];

    for (var i in floors) {
        var floor = floors[i];
        var vFloor = this.getVisualEntity(floor, 'floor');
        facility.children.push(vFloor);

        var spaces = floor.Spaces;
        if (!spaces) continue;
        spaces = spaces.Space;
        if (!spaces) continue;

        for (var s in spaces) {
            var space = spaces[s];
            var vSpace = this.getVisualEntity(space, 'space');
            vFloor.children.push(vSpace);
        }
    }

    //add asset types and assets to spaces 
    types = types ? types : this.getAssetTypes(data);
    for (var t in types) {
        var type = types[t];
        for (var i in type.children) {
            var instance = type.children[i];

            //check assignments
            var assignmentSet = instance.assignments.filter(function (e) { return e.id == 'Space' })[0];
            if (!assignmentSet) continue;
            key = assignmentSet.assignments[0];
            if (!key) continue;

            var spaceProp = key.properties.filter(function (e) { return e.id == 'SpaceName' })[0];
            var floorProp = key.properties.filter(function (e) { return e.id == 'FloorName' })[0];
            if (!floorProp || !spaceProp) continue;

            var spaceName = spaceProp.value;
            var floorName = floorProp.value;

            var floor = facility.children.filter(function (e) { return e.name == floorName; })[0];
            if (!floor) continue;

            var space = floor.children.filter(function (e) { return e.name == spaceName })[0];
            if (!space) continue;
            
            space.children.push(instance);
            assignmentSet.assignments[0] = space;
        }
    }

    //facility is a root element of the tree spatial structure
    return [facility];
};

xCobieUtils.prototype.getZones = function (data, facility) {
    if (!data) throw 'data must be defined';
    var result = [];

    var zones = data.Zones;
    if (!zones) return result;
    zones = zones.Zone;
    if (!zones) return result;

    for (var z in zones) {
        var zone = zones[z];
        var vZone = this.getVisualEntity(zone, 'zone');
        result.push(vZone);
    }

    //add spaces as a children of zones
    for (var i = 0; i < facility.length; i++) { //facilities (always 1)
        var f = facility[i];
        for (var j = 0; j < f.children.length; j++) { //floors
            var floor = f.children[j];
            for (var k = 0; k < floor.children.length; k++) { //spaces
                var space = floor.children[k];
                var assignmentSet = space.assignments.filter(function (e) { return e.id == 'Zone'; })[0];
                if (!assignmentSet) continue;
                key = assignmentSet.assignments[0];
                if (!key) continue;
                if (!key.id) continue;

                var zone = result.filter(function (e) { return e.id == key.id; })[0];
                if (zone) {
                    //add space to visual children
                    zone.children.push(space);
                    //replace key with actual object
                    assignmentSet.assignments[0] = zone;
                }
            }
        }
    }

    return result;
};

xCobieUtils.prototype.getSystems = function (data, types) {
    if (!data) throw 'data must be defined';
    var result = [];

    var systems = data.Systems;
    if (!systems) return result;
    systems = systems.System;
    if (!systems) return result;

    for (var s in systems) {
        var system = systems[s];
        var vSystem = this.getVisualEntity(system, 'system');
        result.push(vSystem);
    }

    //add asset types and assets to spaces 
    types = types ? types : this.getAssetTypes(data);
    for (var t in types) {
        var type = types[t];
        for (var i in type.children) {
            var instance = type.children[i];

            //check assignments
            var assignmentSet = instance.assignments.filter(function (e) { return e.id == 'System' })[0];
            if (!assignmentSet) continue;
            key = assignmentSet.assignments[0];
            if (!key) continue;

            if (!key.id) continue;
            var system = result.filter(function (e) { return e.id == key.id; })[0];
            if (system) {
                //add instance to system's visual children
                system.children.push(instance);
                //replace key with actual object
                assignmentSet.assignments[0] = system;
            }
        }
    }

    return result;
};


xCobieUtils.prototype.getAssetTypes = function (data) {
    if (!data) throw 'data must be defined';
    var result = [];
    var tr = this.getTranslator();

    var types = data.AssetTypes;
    if (!types) return result;
    types = types.AssetType;
    if (!types) return result;

    for (var t in types) {
        var type = types[t];
        var vType = this.getVisualEntity(type, 'assettype');
        result.push(vType);

        //process instances of type
        var instances = type.Assets;
        if (!instances) continue;
        instances = instances.Asset;
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
};

xCobieUtils.prototype.getProperties = function (entity) {
    if (!entity) throw 'entity must be defined';
    var tr = this.getTranslator();
    var result = [];

    for (var a in entity) {
        var attr = entity[a];
        var valStr = this.getValueString(attr);

        //it is an object not an attribute
        if (!valStr) continue;

        var nameStr = tr(a);
        result.push(new xVisualProperty({ name: nameStr, value: valStr, id: a }));
    }
    return result;
};


xCobieUtils.prototype.getAttributes = function (entity) {
    if (!entity) throw 'entity must be defined';

    var result = [];
    var attributes = null;
    for (var a in entity) {
        if (entity[a].Attribute) {
            attributes = entity[a].Attribute;
            break;
        }
    }
    if (!attributes) return result;
    for (var a in attributes) {
        var attribute = attributes[a];

        result.push(new xVisualAttribute({
            name: attribute.AttributeName,
            description: attribute.AttributeDescription,
            value: this.getValueString(attribute.AttributeValue),
            propertySet: attribute.propertySetName,
            category: attribute.AttributeCategory,
            issues: attribute.AttributeIssues ? this.getAttributes(attribute.AttributeIssues) : []
        }));
    }
    return result;
};

xCobieUtils.prototype.getAssignments = function (entity, type) {
    if (!entity || !type) throw 'entity and type must be defined';
    var tr = this.getTranslator();
    var result = [];

    for (var attr in entity) {
        var collection = new xVisualAssignmentSet();
        //assignment collection
        var r = new RegExp('^(' + type + ')(.*)(assignments)$', 'i');
        if (r.test(attr)) {
            collection.id = attr.replace(r, '$2');
            collection.name = tr(collection.id + 's');
            for (var a in entity[attr]) {
                var assignmentSet = entity[attr][a]
                var name = a.replace('Assignment', '').toLowerCase();
                for (var a in assignmentSet) {
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

        if (collection.assignments.length != 0) {
            result.push(collection);
        }
    }

    return result;
};

xCobieUtils.prototype.getDocuments = function (entity, type) {
    if (!entity || !type) throw 'entity and type must be defined';
    var result = [];

    for (var attr in entity) {
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
};

xCobieUtils.prototype.getIssues = function (entity) {
    if (!entity) throw 'entity and type must be defined';
    var result = [];

    for (var attr in entity) {
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
};

xCobieUtils.prototype.setLanguage = function (lang, culture) {
    this._dictionary = new xAttributeDictionary(lang, culture);
};

xCobieUtils.prototype.getValueString = function (value) {
    if (typeof(value) == 'undefined' || value == null)
        return '';
    var tr = this.getTranslator();

    //this of for attributes
    if (value.Item) value = value.Item;

    var baseVal = "";

    if (typeof (value) == 'string') baseVal = value;
    if (value.BooleanValue) baseVal = value.BooleanValue ? tr('True') : tr('False');
    if (value.StringValue) baseVal = value.StringValue;
    if (typeof (value.DecimalValue) != 'undefined') baseVal = value.DecimalValue.toFixed(this.settings.decimalPlaces).toString();
    if (typeof (value.IntegerValue) != 'undefined') baseVal = value.IntegerValue.toString();

    if (value.UnitName) baseVal += ' ' + value.UnitName;

    return baseVal.length > 0 ? baseVal : '';
};

xCobieUtils.prototype.getTranslator = function () {
    var self = this;
    return function (term) {
        return self._dictionary[term] ? self._dictionary[term] : term.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
    };
};