function xVisualEntity(values) {
    this.id = "";
    this.type = "";
    this.name = "";
    this.description = "";
    this.attributes = [];
    this.properties = [];
    this.documents = [];
    this.issues = [];
    this.assignments = [];
    this.children = []; //for tree hierarchies only (spatial structure, asset types)
    this.warranties = []; //for asset type only

    if (typeof (values) == 'object') {
        for (var a in values) {
            this[a] = values[a];
        }
    }
};
