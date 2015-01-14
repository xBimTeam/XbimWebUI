function xVisualModel(values) {
    this.facility = [];
    this.zones = [];
    this.systems = [];
    this.contacts = [];
    this.assetTypes = [];

    if (typeof (values) == 'object') {
        for (var a in values) {
            this[a] = values[a];
        }
    }
};

xVisualModel.prototype.getEntity = function (id) {
    if (typeof (id) == 'undefined') return null;
    id = id.toString();

    var get = function (collection, id) {
        for (var i = 0; i < collection.length; i++) {
            var entity = collection[i];
            if (entity.id == id) return entity;
            var result = get(entity.children, id);
            if (result) return result;
        }
        return null;
    };

    for (var i in this) {
        if (typeof (this[i]) == 'function') continue;
        var result = get(this[i], id);
        if (result) return result;
    }
    return null;
};