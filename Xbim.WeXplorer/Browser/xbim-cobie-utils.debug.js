function xCobieUtils() {
    this._dictionary = new xAttributeDictionary();
};

xCobieUtils.prototype.settings = {
    decimalPlaces: 4
};

xCobieUtils.prototype.getVisualEntity = function (entity, type) {
    if (!entity || !type) throw 'entity must be defined';
    var id = entity.externalID;
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
        assignments: this.getAssignments(entity, type)
    });
};

xCobieUtils.prototype.getVisualModel = function (data) {
    if (!data) throw 'data must be defined';

    var types = this.getAssetTypes(data);
    return new xVisualModel({
        spatialModel: this.getSpatialStructure(data, types),
        zones: this.getZones(data),
        systems: this.getSystems(data),
        assetTypes: types,
        contacts: []
    });
};

xCobieUtils.prototype.getSpatialStructure = function (data, types) {
    if (!data) throw 'data must be defined';

    var facility = this.getVisualEntity(data, 'facility');

    var floors = data.Floors;
    if (!floors)
        return facility;
    floors = floors.Floor;
    if (!floors || floors.length == 0)
        return facility;

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
            var spaceAssignment = instance.assignments.filter(function (e) { return e.type == 'space' })[0];
            if (!spaceAssignment) continue;

            var spaceProp = spaceAssignment.properties.filter(function (e) { return e.id == 'SpaceName' })[0];
            var floorProp = spaceAssignment.properties.filter(function (e) { return e.id == 'FloorName' })[0];
            if (!floorProp || !spaceProp) continue;

            var spaceName = spaceProp.value;
            var floorName = floorProp.value;

            var floor = facility.children.filter(function (e) { return e.name == floorName; })[0];
            if (!floor) continue;

            var space = floor.children.filter(function (e) { return e.name == spaceName })[0];
            if (!space) continue;
            
            space.children.push(instance);
        }
    }

    //facility is a root element of the tree spatial structure
    return facility;
};

xCobieUtils.prototype.getZones = function (data) {
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

    return result;
};

xCobieUtils.prototype.getSystems = function (data) {
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

    return result;
};


xCobieUtils.prototype.getAssetTypes = function (data) {
    if (!data) throw 'data must be defined';
    var result = [];

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

    var di = this.getTranslator();
    var result = [];
    var attributes = null;
    for (var a in entity) {
        if (a.indexOf('Attributes') != -1 && entity[a].Attribute) {
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
    var result = [];

    for (var attr in entity) {
        var r = new RegExp('^(' + type + ').*(assignments)$', 'i');
        if (r.test(attr)) {
            for (var a in entity[attr]) {
                var assignmentSet = entity[attr][a]
                var name = a.replace('Assignment', '').toLowerCase();
                for (var a in assignmentSet) {
                    var assignment = assignmentSet[a];
                    var vAssignment = this.getVisualEntity(assignment, name);
                    result.push(vAssignment);
                }
            }
        }
    }

    return result;
};

xCobieUtils.prototype.setLanguage = function (lang, culture) {
    this._dictionary = new xAttributeDictionary(lang, culture);
};

xCobieUtils.prototype.getValueString = function (value) {
    var tr = this._dictionary.get;
    if (!value) throw 'Object must be defined';

    //this of for attributes
    if (value.Item) value = value.Item;

    var baseVal = "";

    if (typeof (value) == 'string') baseVal = value;
    if (value.BooleanValue) baseVal = value.BooleanValue ? tr('True') : tr('False');
    if (value.StringValue) baseVal = value.StringValue;
    if (typeof (value.DecimalValue) != 'undefined') baseVal = value.DecimalValue.toFixed(this.settings.decimalPlaces).toString();
    if (typeof (value.IntegerValue) != 'undefined') baseVal = value.IntegerValue.toString();

    if (value.UnitName) baseVal += ' ' + value.UnitName;

    return baseVal.length > 0 ? baseVal : null;
};

xCobieUtils.prototype.getTranslator = function () {
    return this._dictionary.get;
};