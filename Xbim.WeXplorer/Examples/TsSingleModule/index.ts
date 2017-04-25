import { Viewer } from "../../Build/xbim-viewer";

var viewer = new Viewer('viewer');
viewer.on('loaded', function () {
    viewer.start();
});
viewer.load("/tests/data/SampleHouse.wexbim", "Model A");

