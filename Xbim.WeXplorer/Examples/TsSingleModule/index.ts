import { Viewer, NavigationCube } from "../../Build/xbim-viewer";

var viewer = new Viewer('viewer');
viewer.load("/tests/data/SampleHouse.wexbim", "Model A");

viewer.on("loaded", function () {
    console.log("Viewer data loaded");
});

var cube = new NavigationCube();
cube.ratio = 0.1;
cube.passiveAlpha = 1.0;

viewer.addPlugin(cube);
viewer.start();

