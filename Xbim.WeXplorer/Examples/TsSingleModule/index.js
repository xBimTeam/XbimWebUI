"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var viewer_1 = require("../../Viewer/viewer");
var viewer = new viewer_1.Viewer('viewer');
viewer.load("/tests/data/SampleHouse.wexbim", "Model A");
viewer.on("loaded", function () {
    console.log("Viewer data loaded");
});
var cube = new viewer_1.NavigationCube();
cube.ratio = 0.1;
cube.passiveAlpha = 1.0;
viewer.addPlugin(cube);
viewer.start();
//# sourceMappingURL=index.js.map