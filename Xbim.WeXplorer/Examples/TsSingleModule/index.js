"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var xbim_viewer_1 = require("../../Build/xbim-viewer");
var viewer = new xbim_viewer_1.Viewer('viewer');
viewer.load("/tests/data/SampleHouse.wexbim", "Model A");
var cube = new xbim_viewer_1.NavigationCube();
cube.ratio = 0.1;
cube.passiveAlpha = 1.0;
viewer.addPlugin(cube);
viewer.start();
//# sourceMappingURL=index.js.map