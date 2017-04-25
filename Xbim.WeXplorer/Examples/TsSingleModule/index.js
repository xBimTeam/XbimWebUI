"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var xbim_viewer_1 = require("../../Build/xbim-viewer");
var viewer = new xbim_viewer_1.Viewer('viewer');
viewer.on('loaded', function () {
    viewer.start();
});
viewer.load("/tests/data/SampleHouse.wexbim", "Model A");
//# sourceMappingURL=index.js.map