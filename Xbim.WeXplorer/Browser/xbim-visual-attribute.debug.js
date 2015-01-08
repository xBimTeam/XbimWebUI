function xVisualAttribute(values) {

    this.name = "";
    this.description = "";
    this.value = "";
    this.propertySet = "";
    this.category = "";
    this.issues = [];

    if (typeof (values) == 'object') {
        for (var a in values) {
            this[a] = values[a];
        }
    }
};
