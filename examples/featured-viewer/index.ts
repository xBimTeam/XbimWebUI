import { Viewer, Product, State, ViewType, RenderingMode, ProductType, NavigationCube, Grid, EasingType } from '../..';
import { CameraType } from '../../src/camera';
import { Viewpoint } from '../../src/bcf/viewpoint';
import { vec3, mat4 } from 'gl-matrix';
import { PerformanceRating } from '../../src/performance-rating';
import { ClippingPlane } from '../../src/bcf';
import { LoaderOverlay } from '../../src/plugins/LoaderOverlay/loader-overlay';

// tslint:disable-next-line: only-arrow-functions
var QueryString = function() {
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
var overlay = new LoaderOverlay();
viewer.addPlugin(overlay);
overlay.show();

viewer.cameraProperties.fov = 53;
var types = ProductType;
var states = State;

window['allTypes'] = Object.getOwnPropertyNames(types).filter(n => !isNaN(Number(n))).map(id => parseInt(id, 10));

//make these global for the page
window['viewer'] = viewer;
window['types'] = types;
window['states'] = states;
window['RenderingMode'] = RenderingMode;
window['ViewType'] = ViewType;
window['product'] = Product;
window['CameraType'] = CameraType;
window['PerformanceRating'] = PerformanceRating;
window['EasingType'] = EasingType;
window['overlay'] = overlay;
window['Viewpoint'] = Viewpoint;

viewer.background = [0, 0, 0, 0];
viewer.on("error", (arg) => {
    var container = viewer.canvas.parentNode as HTMLElement;
    if (container) {
        //preppend error report
        container.innerHTML = "<pre style='color:red;'>" + arg.message + "</pre>" + container.innerHTML;
    }
});
var modelId = QueryString["model"];
var model = "";
if (typeof (modelId) == "undefined") {
    model = "/tests/data/SampleHouse.wexbim";
} else {
    model = "/tests/data/" + modelId + ".wexbim";
}
if (modelId != null && modelId === 'v4') {
    model = modelId;
}

viewer.on("pick", (arg) => {
    var span = document.getElementById("ids");
    span.innerHTML = `Product id: ${arg.id}, model: ${arg.model}`;

    if (arg && arg.xyz) {
        var span = document.getElementById("coords");
        const c = arg.xyz;
        span.innerHTML = `Click in 3D: [${c[0].toFixed(2)}, ${c[1].toFixed(2)}, ${c[2].toFixed(2)}]`;
    }

    var state = viewer.getState(arg.id, arg.model);
    if (state === State.HIGHLIGHTED) {
        viewer.removeState(State.HIGHLIGHTED, [arg.id], arg.model);
    } else {
        viewer.addState(State.HIGHLIGHTED, [arg.id], arg.model);
    }
});

viewer.on("dblclick", (arg) => {
    viewer.addState(State.HIDDEN, [arg.id], arg.model);
});
viewer.on("fps", (fps) => {
    var span = document.getElementById("fps") as HTMLSpanElement;
    if (span) {
        span.innerText = `${fps}, performance: ${PerformanceRating[viewer.performance]}`;
    }
});

viewer.on("pointerlockchange", (arg) => {
    console.log('canvas Pointer lock change', arg);
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

var progress = document.getElementById("progress");

viewer.on('loaded', () => {
    viewer.start();
    overlay.hide();
    viewer.show(ViewType.DEFAULT, undefined, undefined, false);
});


viewer.load(model, "base", null, (msg) => {
    progress.innerHTML = `${msg.message} [${msg.percent}%]`;
});


var grid = new Grid();
grid.zFactor = 20;
grid.colour = [0, 0, 0, 0.8];
viewer.addPlugin(grid);

var cube = new NavigationCube();
cube.ratio = 0.05;
cube.passiveAlpha = cube.activeAlpha = 1.0;
cube.minSize = 150;
viewer.addPlugin(cube);

viewer.defineStyle(0, [255, 0, 0, 255]);  //red
viewer.defineStyle(1, [0, 0, 255, 100]);  //semitransparent blue
viewer.defineStyle(2, [255, 255, 255, 255]); //white

viewer.highlightingColour = [255, 173, 33, 200];
document['makeWallsRed'] = () => {
    viewer.setStyle(0, types.IFCWALLSTANDARDCASE);
    viewer.setStyle(0, types.IFCCURTAINWALL);
    viewer.setStyle(0, types.IFCWALL);
};
document['selectAllWalls'] = () => {
    viewer.addState(State.HIGHLIGHTED, types.IFCWALLSTANDARDCASE);
    viewer.addState(State.HIGHLIGHTED, types.IFCCURTAINWALL);
    viewer.addState(State.HIGHLIGHTED, types.IFCWALL);
};
document['hideWalls'] = () => {
    viewer.addState(State.HIDDEN, types.IFCWALLSTANDARDCASE);
    viewer.addState(State.HIDDEN, types.IFCCURTAINWALL);
    viewer.addState(State.HIDDEN, types.IFCWALL);
};
document['resetWalls'] = () => {
    viewer.resetState(types.IFCWALLSTANDARDCASE);
    viewer.resetState(types.IFCCURTAINWALL);
    viewer.resetState(types.IFCWALL);
};

document['clip'] = () => {
    viewer.setClippingPlaneA([0, 0, -1, 2000]);
    viewer.setClippingPlaneB([0, 0, 1, 100]);
};
document['unclip'] = () => {
    viewer.unclip();
};
document['stopCube'] = () => {
    cube.stopped = true;
};
document['startCube'] = () => {
    cube.stopped = false;
};
document['stopGrid'] = () => {
    grid.stopped = true;
};
document['startGrid'] = () => {
    grid.stopped = false;
};
document['takeSnapshot'] = () => {
    cube.stopped = true;
    
    
    const view = Viewpoint.GetViewpoint(viewer, null);
    
    var img = document.createElement('img');
    img.src = 'data:image/png;base64,' + view.snapshot.snapshot_data;
    img.style.width = "100%";
    img.style.cursor = "pointer";

    var place = document.getElementById("snapshot");
    place.innerHTML = "";
    place.appendChild(img);
    
    img.onclick = () => {
        Viewpoint.SetViewpoint(viewer, view, null, 1000);
        place.innerHTML = "";
    };

    cube.stopped = false;
};

document['updateGamma'] = (evt: Event) => {
    const input = evt.target as HTMLInputElement;
    const value = parseFloat(input.value);
    viewer.gamma = value;
};

document['updateContrast'] = (evt: Event) => {
    const input = evt.target as HTMLInputElement;
    const value = parseFloat(input.value);
    viewer.contrast = value;
};

document['updateBrightness'] = (evt: Event) => {
    const input = evt.target as HTMLInputElement;
    const value = parseFloat(input.value);
    viewer.brightness = value;
};

document['zoomToSelection'] = () => {
    const elements = viewer.getProductsWithState(State.HIGHLIGHTED);
    viewer.zoomTo(elements);
};

viewer.on("pick", (args) => {
    viewer.stopRotation();
    var id = args.id;
    var radios = document.getElementsByName("radioHiding");
    for (var i in radios) {
        if (radios.hasOwnProperty(i)) {
            var radio = radios[i] as HTMLInputElement;
            if (radio.checked) {
                var val = radio.value;
                if (val === "noHiding") {
                    return;
                }
                if (val === "hideOne") {
                    viewer.addState(State.HIDDEN, [id]);
                }
                if (val === "hideType") {
                    var type = viewer.getProductType(id);
                    viewer.addState(State.HIDDEN, type);
                }
                break;
            }
        }
    }

    //viewer.zoomTo(id);
});

window['clipBox'] = () => {
    var planes: ClippingPlane[] = [
        {
            direction: [1,0,0],
            location: [3000, 0, 0]
        },
        {
            direction: [0,1,0],
            location: [0, 2000, 0]
        },
        {
            direction: [0,0,1],
            location: [0,0,1000]
        },
        {
            direction: [-1,0,0],
            location: [-3000, 0, 0]
        },
        {
            direction: [0,-1,0],
            location: [0, -2000, 0]
        },
        {
            direction: [0,0,-1],
            location: [0,0,-1000]
        }
    ];

    viewer.sectionBox.setToPlanes(planes);
    viewer.zoomTo();
};

window['releaseClipBox'] = () => {
    viewer.sectionBox.clear();
    viewer.zoomTo();
};

// restore init script if any is saved
var script = localStorage.getItem('initScript-' + modelId);
var scriptArea = document.getElementById('initScript') as HTMLTextAreaElement;
if (script) {
    scriptArea.value = script;
    viewer.on('loaded', () => {
        eval(script);
    });
}

// persist script before loads
window.addEventListener("beforeunload", (event) => {
    localStorage.setItem('initScript-' + modelId, scriptArea.value);
});


