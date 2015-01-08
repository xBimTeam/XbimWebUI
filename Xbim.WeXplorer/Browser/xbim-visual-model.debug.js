function xVisualModel(values) {
    this.spatialModel = [];
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
