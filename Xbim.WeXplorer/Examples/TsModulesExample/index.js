"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var viewer_1 = require("../../Viewer/viewer");
var state_1 = require("../../Viewer/state");
var product_type_1 = require("../../Viewer/product-type");
var navigation_cube_1 = require("../../Viewer/plugins/NavigationCube/navigation-cube");
var QueryString = function () {
    // This function is anonymous, is executed immediately and 
    // the return value is assigned to QueryString!
    var queryString = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        // If first entry with this name
        if (typeof queryString[pair[0]] === "undefined") {
            queryString[pair[0]] = pair[1];
            // If second entry with this name
        }
        else if (typeof queryString[pair[0]] === "string") {
            var arr = [queryString[pair[0]], pair[1]];
            queryString[pair[0]] = arr;
            // If third or later entry with this name
        }
        else {
            queryString[pair[0]].push(pair[1]);
        }
    }
    return queryString;
}();
var viewer = new viewer_1.Viewer("xBIM-viewer");
var types = product_type_1.ProductType;
var states = state_1.State;
var session = new viewer_1.ViewerSession(viewer);
//make these global for the page
document['viewer'] = viewer;
document['types'] = types;
document['states'] = states;
document['RenderingMode'] = viewer_1.RenderingMode;
window['session'] = session;
viewer.background = [0, 0, 0, 0];
viewer.on("error", function (arg) {
    var container = viewer._canvas.parentNode;
    if (container) {
        //preppend error report
        container.innerHTML = "<pre style='color:red;'>" + arg.message + "</pre>" + container.innerHTML;
    }
});
var model = "";
var modelId = -1;
if (typeof (QueryString["model"]) == "undefined")
    model = "/tests/data/SampleHouse.wexbim";
else
    model = "/tests/data/" + QueryString["model"] + ".wexbim";
viewer.show("back");
viewer.on("pick", function (arg) {
    var span = document.getElementById("coords");
    if (span) {
        span.innerHTML = "Product id: " + arg.id + ", model: " + arg.model;
    }
});
viewer.on("mouseDown", function (arg) {
    viewer.setCameraTarget(arg.id);
});
viewer.on("fps", function (fps) {
    var span = document.getElementById("fps");
    if (span) {
        span.innerHTML = fps;
    }
});
viewer.on('loaded', function (args) {
    modelId = args.id;
});
var span = document.getElementById("fpt");
if (span) {
    span.innerHTML = "0";
}
//viewer.load(model, "base");
viewer.load(model, "base");
viewer.start();
viewer.defineStyle(0, [255, 0, 0, 255]); //red
viewer.defineStyle(1, [0, 0, 255, 100]); //semitransparent blue
viewer.defineStyle(2, [255, 255, 255, 255]); //white
document['makeWallsRed'] = function () {
    viewer.setStyle(0, types.IFCWALLSTANDARDCASE);
    viewer.setStyle(0, types.IFCCURTAINWALL);
    viewer.setStyle(0, types.IFCWALL);
};
document['selectAllWalls'] = function () {
    session.selectType([types.IFCWALLSTANDARDCASE, types.IFCCURTAINWALL, types.IFCWALL], true);
};
document['hideWalls'] = function () {
    session.hideType([types.IFCWALLSTANDARDCASE, types.IFCCURTAINWALL, types.IFCWALL]);
};
document['resetWalls'] = function () {
    viewer.setState(state_1.State.UNDEFINED, types.IFCWALLSTANDARDCASE);
    viewer.setState(state_1.State.UNDEFINED, types.IFCCURTAINWALL);
    viewer.setState(state_1.State.UNDEFINED, types.IFCWALL);
};
document['clip'] = function () {
    viewer.clippingPlaneA = [0, 0, -1, 2000];
    viewer.clippingPlaneB = [0, 0, 1, 100];
};
document['unclip'] = function () {
    viewer.clippingPlaneA = null;
    viewer.clippingPlaneB = null;
};
document['showSpaces'] = function () {
    session.showType(product_type_1.ProductType.IFCSPACE);
};
document['showAll'] = function () {
    session.show(session.hidden);
};
document['clearSelection'] = function () {
    session.select([], true);
};
document['hideSpaces'] = function () {
    session.hideType(product_type_1.ProductType.IFCSPACE);
};
document['Redo'] = function () {
    if (session.canRedo) {
        session.redo();
    }
    else {
        console.log('Nothing to redo.');
    }
};
document['Undo'] = function () {
    if (session.canUndo) {
        session.undo();
    }
    else {
        console.log('Nothing to undo.');
    }
};
viewer.on("pick", function (args) {
    var id = args.id;
    var modelId = args.model;
    var radios = document.getElementsByName("radioHiding");
    for (var i in radios) {
        if (radios.hasOwnProperty(i)) {
            var radio = radios[i];
            if (radio.checked) {
                var val = radio.value;
                if (val === "noHiding")
                    return;
                if (val === "hideOne") {
                    session.hide([{ id: id, modelId: modelId }]);
                }
                if (val === "selectOne") {
                    session.select([{ id: id, modelId: modelId }], true);
                }
                if (val === "addToSelection") {
                    session.select([{ id: id, modelId: modelId }], false);
                }
                if (val === "hideType") {
                    var type = viewer.getProductType(id);
                    session.hideType(type);
                }
                if (val === "selectType") {
                    var type = viewer.getProductType(id);
                    session.selectType(type, true);
                }
                break;
            }
        }
    }
    //viewer.zoomTo(id);
});
//var mode = "addToSelection";
//viewer.on("pick", function (args) {
//    var id = args.id;
//    var modelId = args.model;
//    if (mode === "hideOne") {
//        // this will hide single product. Use session.show([{ id, modelId }]) to show a single product
//        session.hide([{ id, modelId }]);
//    }
//    if (mode === "selectOne") {
//        // true will clear current selection and only select defined products
//        session.select([{ id, modelId }], true);
//    }
//    if (mode === "addToSelection") {
//        // false will keep current selection and will add to it
//        session.select([{ id, modelId }], false);
//    }
//    if (mode === "hideType") {
//        var type = viewer.getProductType(id, modelId);
//        session.hideType(type);
//    }
//    if (mode === "selectType") {
//        var type = viewer.getProductType(id, modelId);
//        // true will replace current selection. False would add to current selection
//        session.selectType(type, true);
//    }
//});
var cube = new navigation_cube_1.NavigationCube();
viewer.addPlugin(cube);
session.on('show', function (ids) { console.log('Show: ' + ids.map(function (i) { return i.id; }).toString()); });
session.on('hide', function (ids) { console.log('Hide: ' + ids.map(function (i) { return i.id; }).toString()); });
session.on('selection', function (ids) { console.log('Selection: ' + ids.map(function (i) { return i.id; }).toString()); });
//# sourceMappingURL=index.js.map