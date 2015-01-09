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
