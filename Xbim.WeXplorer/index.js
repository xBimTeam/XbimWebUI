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
var viewer = new Xbim.Viewer.Viewer("xBIM-viewer");
viewer.background = [0, 0, 0, 0];
viewer.on("error", function (arg) {
    var container = viewer._canvas.parentNode;
    if (container) {
        //preppend error report
        container.innerHTML = "<pre style='color:red;'>" + arg.message + "</pre>" + container.innerHTML;
    }
});
var model = "";
if (typeof (QueryString["model"]) == "undefined")
    model = "tests/data/SampleHouse.wexbim";
else
    model = "tests/data/" + QueryString["model"] + ".wexbim";
viewer.show("back");
viewer.on("pick", function (arg) {
    var span = document.getElementById("coords");
    if (span) {
        span.innerHTML = arg.id;
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
var span = document.getElementById("fpt");
if (span) {
    span.innerHTML = "0";
}
viewer.load(model, "base");
viewer.start();
var types = Xbim.Viewer.ProductType;
var states = Xbim.Viewer.State;
viewer.defineStyle(0, [255, 0, 0, 255]); //red
viewer.defineStyle(1, [0, 0, 255, 100]); //semitransparent blue
viewer.defineStyle(2, [255, 255, 255, 255]); //white
var makeWallsRed = function () {
    viewer.setStyle(0, types.IFCWALLSTANDARDCASE);
    viewer.setStyle(0, types.IFCCURTAINWALL);
    viewer.setStyle(0, types.IFCWALL);
};
var selectAllWalls = function () {
    viewer.setState(states.HIGHLIGHTED, types.IFCWALLSTANDARDCASE);
    viewer.setState(states.HIGHLIGHTED, types.IFCCURTAINWALL);
    viewer.setState(states.HIGHLIGHTED, types.IFCWALL);
};
var hideWalls = function () {
    viewer.setState(states.HIDDEN, types.IFCWALLSTANDARDCASE);
    viewer.setState(states.HIDDEN, types.IFCCURTAINWALL);
    viewer.setState(states.HIDDEN, types.IFCWALL);
};
var resetWalls = function () {
    viewer.setState(states.UNDEFINED, types.IFCWALLSTANDARDCASE);
    viewer.setState(states.UNDEFINED, types.IFCCURTAINWALL);
    viewer.setState(states.UNDEFINED, types.IFCWALL);
};
var clip = function () {
    viewer.clippingPlaneA = [0, 0, -1, 2000];
    viewer.clippingPlaneB = [0, 0, 1, 100];
};
var unclip = function () {
    viewer.clippingPlaneA = null;
    viewer.clippingPlaneB = null;
};
viewer.on("pick", function (args) {
    var id = args.id;
    var radios = document.getElementsByName("radioHiding");
    for (var i in radios) {
        if (radios.hasOwnProperty(i)) {
            var radio = radios[i];
            if (radio.checked) {
                var val = radio.value;
                if (val === "noHiding")
                    return;
                if (val === "hideOne")
                    viewer.setState(states.HIDDEN, [id]);
                if (val === "hideType") {
                    var type = viewer.getProductType(id);
                    viewer.setState(states.HIDDEN, type);
                }
                break;
            }
        }
    }
    //viewer.zoomTo(id);
});
var cube = new Xbim.Viewer.Plugins.NavigationCube();
viewer.addPlugin(cube);
//# sourceMappingURL=index.js.map