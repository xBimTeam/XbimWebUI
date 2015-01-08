function xVisualProperty(values) {
    this.name = "";
    this.value = "";
    this.id = "";

    if (typeof (values) == 'object') {
        for (var a in values) {
            this[a] = values[a];
        }
    }
};

