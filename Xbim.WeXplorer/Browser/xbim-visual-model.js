"use strict";
var xVisualModel = (function () {
    /**
    * Visual model containing preprocessed COBie data in more uniform form usable for templating and rendering
    *
    * @name xVisualModel
    * @constructor
    * @classdesc Visual model containing preprocessed COBie data in more uniform form usable for templating and rendering
    * @param {object} [values] - Object which can be used to initialize content of the object. It can be also used to create shallow copy of the object.
    */
    function xVisualModel(values) {
        /** @member {xVisualEntity[]} xVisualModel#facility - An array of facilities. There is always one faclity but it is convenient to have all
        * members of xVisualModel to be an array so they can be accessed in an uniform way.
        */
        this.facility = [];
        /** @member {xVisualEntity[]} xVisualModel#zones - An array of zones defined in COBie model. They contain spaces as their children. */
        this.zones = [];
        /** @member {xVisualEntity[]} xVisualModel#systems - An array of systems */
        this.systems = [];
        /** @member {xVisualEntity[]} xVisualModel#contacts - An array of all contacts used in the COBie model*/
        this.contacts = [];
        /** @member {xVisualEntity[]} xVisualModel#assetTypes - An array of all asset types. These contain assets as their children */
        this.assetTypes = [];
        if (typeof (values) == 'object') {
            for (var a in values) {
                this[a] = values[a];
            }
        }
    }
    xVisualModel.prototype.getEntity = function (id) {
        if (typeof (id) == 'undefined' || id == null)
            return null;
        id = id.toString();
        var get = function (collection, id) {
            for (var i = 0; i < collection.length; i++) {
                var entity = collection[i];
                if (entity.id == id)
                    return entity;
                var result = get(entity.children, id);
                if (result)
                    return result;
            }
            return null;
        };
        for (var i in this) {
            if (typeof (this[i]) == 'function')
                continue;
            var result = get(this[i], id);
            if (result)
                return result;
        }
        return null;
    };
    return xVisualModel;
}());
exports.xVisualModel = xVisualModel;
//# sourceMappingURL=xbim-visual-model.js.map