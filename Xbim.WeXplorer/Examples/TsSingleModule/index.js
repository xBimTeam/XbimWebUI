"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var xbim_viewer_1 = require("../../xbim-viewer");
var viewer = new xbim_viewer_1.Viewer('viewer');
//viewer.load("/tests/data/SampleHouse.wexbim", "Model A");
//viewer.load("/tests/wexbim3/SampleHouse.wexbim", "Model A");
//viewer.load("/tests/wexbim3/SampleHouse4.wexbim", "Model A");
viewer.load("/tests/wexbim3/LakesideRestaurant.wexbim", "Model A");
viewer.on("loaded", function () {
    console.log("Viewer data loaded");
    viewer.setState(xbim_viewer_1.State.UNDEFINED, [0]);
    viewer.start();
    ////hide all except one window
    //for (let t in ProductType) {
    //    viewer.setState(State.HIDDEN, Number(ProductType[t]))
    //}
    //viewer.setState(State.UNDEFINED, ProductType.IFCWINDOW);
});
var cube = new xbim_viewer_1.NavigationCube();
cube.ratio = 0.1;
cube.passiveAlpha = 1.0;
viewer.addPlugin(cube);
viewer.on('pick', function (e) {
    document.getElementById('msg').innerHTML = e.id != null ? "Selected id: " + e.id : "";
});
//var div = document.createElement('div');
//div.style.position = "fixed";
//div.style.width = "150px";
//div.style.height = "200px";
//div.style.backgroundColor = "white";
//div.style.boxShadow = "0 0 10px gray";
//div.style.padding = "1em"
//div.style.display = "none";
//div.innerHTML = "Custom context menu";
//document.body.appendChild(div);
//
//
//viewer.on('contextMenu', (e: { event: MouseEvent, id: number }) => {
//    let x = e.event.clientX;
//    let y = e.event.clientY;
//
//    div.style.top = `${y}px`;
//    div.style.left = `${x}px`;
//    div.style.display = "block";
//});
//
//viewer.on('pick', () => {
//    div.style.display = "none";
//});
window["v"] = viewer;
//# sourceMappingURL=index.js.map