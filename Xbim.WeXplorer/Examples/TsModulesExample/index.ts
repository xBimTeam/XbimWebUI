import { Viewer, RenderingMode, ViewerSession } from "../../Viewer/viewer";
import { State } from "../../Viewer/state";
import { ProductType } from "../../Viewer/product-type";
import { NavigationCube } from "../../Viewer/plugins/NavigationCube/navigation-cube";

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
        } else if (typeof queryString[pair[0]] === "string") {
            var arr = [queryString[pair[0]], pair[1]];
            queryString[pair[0]] = arr;
            // If third or later entry with this name
        } else {
            queryString[pair[0]].push(pair[1]);
        }
    }
    return queryString;
}();


var viewer = new Viewer("xBIM-viewer");
var types = ProductType;
var states = State;
var session = new ViewerSession(viewer);

//make these global for the page
document['viewer'] = viewer;
document['types'] = types;
document['states'] = states;
document['RenderingMode'] = RenderingMode;
window['session'] = session;

viewer.background = [0, 0, 0, 0];
viewer.on("error", function (arg) {
    var container = viewer._canvas.parentNode as HTMLElement;
    if (container) {
        //preppend error report
        container.innerHTML = "<pre style='color:red;'>" + arg.message + "</pre>" + container.innerHTML;
    }
});
var model = "";
var modelId = -1;
if (typeof (QueryString["model"]) == "undefined") model = "/tests/data/SampleHouse.wexbim";
else model = "/tests/data/" + QueryString["model"] + ".wexbim";
viewer.show("back");
viewer.on("pick", function (arg) {
    var span = document.getElementById("coords");
    if (span) {
        span.innerHTML = `Product id: ${arg.id}, model: ${arg.model}`;
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
var span = document.getElementById("fpt") as HTMLElement;
if (span) {
    span.innerHTML = "0";
}
//viewer.load(model, "base");
viewer.load(model, "base");
viewer.start();

viewer.defineStyle(0, [255, 0, 0, 255]);  //red
viewer.defineStyle(1, [0, 0, 255, 100]);  //semitransparent blue
viewer.defineStyle(2, [255, 255, 255, 255]); //white

document['makeWallsRed'] = function () {
    viewer.setStyle(0, types.IFCWALLSTANDARDCASE);
    viewer.setStyle(0, types.IFCCURTAINWALL);
    viewer.setStyle(0, types.IFCWALL);
}
document['selectAllWalls'] = function () {
    session.selectType([types.IFCWALLSTANDARDCASE, types.IFCCURTAINWALL, types.IFCWALL], true);
}
document['hideWalls'] = function () {
    session.hideType([types.IFCWALLSTANDARDCASE, types.IFCCURTAINWALL, types.IFCWALL]);
}
document['resetWalls'] = function () {
    viewer.setState(State.UNDEFINED, types.IFCWALLSTANDARDCASE);
    viewer.setState(State.UNDEFINED, types.IFCCURTAINWALL);
    viewer.setState(State.UNDEFINED, types.IFCWALL);
}

document['clip'] = function () {
    viewer.clippingPlaneA = [0, 0, -1, 2000];
    viewer.clippingPlaneB = [0, 0, 1, 100];
}
document['unclip'] = function () {
    viewer.clippingPlaneA = null;
    viewer.clippingPlaneB = null;
}

document['showSpaces'] = function () {
    session.showType(ProductType.IFCSPACE);
}

document['showAll'] = function () {
    session.show(session.hidden);
}

document['clearSelection'] = function () {
    session.select([], true);
}

document['hideSpaces'] = function () {
    session.hideType(ProductType.IFCSPACE);
}

document['Redo'] = function () {
    if (session.canRedo) {
        session.redo();
    } else {
        console.log('Nothing to redo.');
    }
}

document['Undo'] = function () {
    if (session.canUndo) {
        session.undo();
    } else {
        console.log('Nothing to undo.');
    }
}

viewer.on("pick", function (args) {
    var id = args.id;
    var modelId = args.model;
    var radios = document.getElementsByName("radioHiding");
    for (var i in radios) {
        if (radios.hasOwnProperty(i)) {
            var radio = radios[i] as HTMLInputElement;
            if (radio.checked) {
                var val = radio.value;
                if (val === "noHiding") return;
                if (val === "hideOne") {
                    session.hide([{ id, modelId }]);
                }
                if (val === "selectOne") {
                    session.select([{ id, modelId }], true);
                }
                if (val === "addToSelection") {
                    session.select([{ id, modelId }], false);
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

var cube = new NavigationCube();
viewer.addPlugin(cube);

session.on('show', (ids) => { console.log('Show: ' + ids.map(i => i.id).toString()) });
session.on('hide', (ids) => { console.log('Hide: ' + ids.map(i => i.id).toString()) });
session.on('selection', (ids) => { console.log('Selection: ' + ids.map(i => i.id).toString()) });
