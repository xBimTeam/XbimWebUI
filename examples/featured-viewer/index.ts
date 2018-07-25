import { Viewer, Product, State, ViewType, RenderingMode, ProductType, NavigationCube, Grid } from '../..';

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
viewer.perspectiveCamera.fov = 53;
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
    var container = viewer.canvas.parentNode as HTMLElement;
    if (container) {
        //preppend error report
        container.innerHTML = "<pre style='color:red;'>" + arg.message + "</pre>" + container.innerHTML;
    }
});
var modelId = QueryString["model"];
var model = "";
if (typeof (modelId) == "undefined") model = "/tests/data/SampleHouse.wexbim";
else model = "/tests/data/" + modelId + ".wexbim";
if (modelId != null && modelId === 'v4') {
    model = modelId;
}

viewer.show(ViewType.BACK);
viewer.on("pick", function (arg) {
    var span = document.getElementById("coords");
    if (span) {
        span.innerHTML = `Product id: ${arg.id}, model: ${arg.model}`;
    }
});
viewer.on("mousedown", function (arg) {
    viewer.setCameraTarget(arg.id);
});
viewer.on("fps", function (fps) {
    var span = document.getElementById("fps") as HTMLSpanElement;
    if (span) {
        span.innerText = fps.toString();
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

var versionSpan = document.getElementById("webglVersion") as HTMLSpanElement;
versionSpan.innerHTML = viewer.glVersion.toString();

var progress = document.getElementById("progress")

viewer.on('loaded', () => {
    viewer.start();
})


viewer.load(model, "base", null, (msg) => {
    progress.innerHTML = `${msg.message} [${msg.percent}%]`;
});

var cube = new NavigationCube();
cube.ratio = 0.05;
cube.passiveAlpha = cube.activeAlpha = 0.85;
viewer.addPlugin(cube);

var grid = new Grid();
grid.zFactor = 20;
grid.colour = [0, 0, 0, 0.8];
viewer.addPlugin(grid);

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
document['stopCube'] = function () {
    cube.stopped = true;
}
document['startCube'] = function () {
    cube.stopped = false;
}
document['stopGrid'] = function () {
    grid.stopped = true;
}
document['startGrid'] = function () {
    grid.stopped = false;
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
            var radio = radios[i] as HTMLInputElement;
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

// restore init script if any is saved
var script = localStorage.getItem('initScript-' + modelId);
var scriptArea = document.getElementById('initScript') as HTMLTextAreaElement;
if (script) {
    scriptArea.value = script;
    viewer.on('loaded', () => {
        eval(script);
    })
}

// persist script before loads
window.addEventListener("beforeunload", function (event) {
    localStorage.setItem('initScript-' + modelId, scriptArea.value);
});


