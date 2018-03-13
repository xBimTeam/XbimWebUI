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
} ();


var viewer = new Viewer("xBIM-viewer");
var types = ProductType;
var states = State;

//make these global for the page
window['viewer'] = viewer;
window['types'] = types;
window['states'] = states;
window['RenderingMode'] = RenderingMode;
window['ViewType'] = ViewType;
window['product'] = Product;

viewer.background = [0, 0, 0, 0];
viewer.on("error", function (arg) {
    var container = viewer.canvas.parentNode;
    if (container) {
        //preppend error report
        container.innerHTML = "<pre style='color:red;'>" + arg.message + "</pre>" + container.innerHTML;
    }
});
var model = "";
if (typeof (QueryString["model"]) == "undefined") model = "/tests/data/SampleHouse.wexbim";
else model = "/tests/data/" + QueryString["model"] + ".wexbim";
viewer.show(ViewType.BACK);
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

// viewer.on("loaded", () => {
    // let image = viewer.getCurrentImageHtml(2000, 1000);
    // image.style.width = '100%';
    // let initialImage = document.getElementById("initialSnapshot");
    // initialImage.appendChild(image);
    // viewer.startRotation();
// });

var span = document.getElementById("fpt");
if (span) {
    span.innerHTML = "0";
}

var versionSpan = document.getElementById("webglVersion");
versionSpan.innerHTML = viewer.glVersion;

//viewer.load(model, "base");
viewer.loadAsync(model, "base");
viewer.start();

var cube = new NavigationCube();
cube.ratio = 0.05;
viewer.addPlugin(cube);

viewer.defineStyle(0, [255, 0, 0, 255]);  //red
viewer.defineStyle(1, [0, 0, 255, 100]);  //semitransparent blue
viewer.defineStyle(2, [255, 255, 255, 255]); //white
document['makeWallsRed'] = function () {
    viewer.setStyle(0, types.IFCWALLSTANDARDCASE);
    viewer.setStyle(0, types.IFCCURTAINWALL);
    viewer.setStyle(0, types.IFCWALL);
}
document['selectAllWalls'] = function () {
    viewer.setState(State.HIGHLIGHTED, types.IFCWALLSTANDARDCASE);
    viewer.setState(State.HIGHLIGHTED, types.IFCCURTAINWALL);
    viewer.setState(State.HIGHLIGHTED, types.IFCWALL);
}
document['hideWalls'] = function () {
    viewer.setState(State.HIDDEN, types.IFCWALLSTANDARDCASE);
    viewer.setState(State.HIDDEN, types.IFCCURTAINWALL);
    viewer.setState(State.HIDDEN, types.IFCWALL);
}
document['resetWalls'] = function () {
    viewer.setState(State.UNDEFINED, types.IFCWALLSTANDARDCASE);
    viewer.setState(State.UNDEFINED, types.IFCCURTAINWALL);
    viewer.setState(State.UNDEFINED, types.IFCWALL);
}

document['clip'] = function () {
    viewer.setClippingPlaneA([0, 0, -1, 2000]);
    viewer.setClippingPlaneB([0, 0, 1, 100]);
}  
document['unclip'] = function () {
    viewer.unclip();
}
document['takeSnapshot'] = function () {
    viewer.removePlugin(cube);
    var img = viewer.getCurrentImageDataUrl();
    var place = document.getElementById("snapshot");
    place.innerHTML = "<img style='width:100%;' src=" + img + ">";
    viewer.addPlugin(cube);
}  

viewer.on("pick", function (args) {
    viewer.stopRotation();
    var id = args.id;
    var radios = document.getElementsByName("radioHiding");
    for (var i in radios) {
        if (radios.hasOwnProperty(i)) {
            var radio = radios[i];
            if (radio.checked) {
                var val = radio.value;
                if (val === "noHiding") return;
                if (val === "hideOne") viewer.setState(State.HIDDEN, [id]);
                if (val === "hideType") {
                    var type = viewer.getProductType(id);
                    viewer.setState(State.HIDDEN, type);
                }
                break;
            }
        }
    }

    //viewer.zoomTo(id);
});


