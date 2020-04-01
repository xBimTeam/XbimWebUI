import { Viewer, Product, State, ViewType, RenderingMode, ProductType, NavigationCube } from '../..';
import { Grid } from '../../src/plugins/Grid/grid';
import { vec3 } from 'gl-matrix';
import { Viewpoint } from '../../src/bcf';

var models = [];

var viewer = new Viewer("xBIM-viewer");
viewer.background = [0, 0, 0, 0];

var grid = new Grid();
grid.zFactor = 20;
viewer.addPlugin(grid);

var cube = new NavigationCube();
cube.ratio = 0.05;
cube.passiveAlpha = cube.activeAlpha = 0.85;
viewer.addPlugin(cube);


viewer.on("error", (arg) => {
    var container = viewer.canvas.parentNode as HTMLElement;
    if (container) {
        //preppend error report
        container.innerHTML = "<pre style='color:red;'>" + arg.message + "</pre>" + container.innerHTML;
    }
});
viewer.on("pick", (arg) => {
    if (arg.id) {
        console.log(`Selected id: ${arg.id} model ${arg.model}`);
        if (arg.xyz != null) {
            const wcs = viewer.getCurrentWcs();
            const point = vec3.add(vec3.create(), wcs, arg.xyz);
            console.log(point);
        }
    }
}
);
viewer.on("loaded", (evt) => {
    models.push({ id: evt.model, name: evt.tag, stopped: false });
    viewer.show(ViewType.DEFAULT, undefined, undefined, false);
    refreshModelsPanel();
});
viewer.on("fps", (fps) => {
    var span = document.getElementById("fps");
    if (span) {
        span.innerHTML = fps.toString();
    }
});

let input = document.getElementById('input') as HTMLInputElement;
input.addEventListener('change', () => {
    if (!input.files || input.files.length === 0) {
        return;
    }

    
    for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        viewer.load(file, file.name);
        viewer.start();
    }

    input.value = null;
});

function refreshModelsPanel() {
    var html = "<table>";
    models.forEach((m) => {
        html += "<tr>";
        html += `<td>${m.name}</td>`;
        html += "<td><button onclick='unload(" + m.id + ")'> Unload </button></td>";
        if (m.stopped) {
            html += "<td> <button onclick='start(" + m.id + ")'> Start </button> </td>";
        } else {
            html += "<td> <button onclick='stopModel(" + m.id + ")'> Stop </button> </td>";
        }
        html += "</tr>";
    });
    html += "</table>";
    let modelsDiv = document.getElementById('models') as HTMLDivElement;
    modelsDiv.innerHTML = html;
}
function unload(id: number) {
    viewer.unload(id);
    models = models.filter((m) => m.id !== id);
    refreshModelsPanel();
    viewer.draw();
}
function stop(id: number) {
    viewer.stop(id);
    var model = models.filter((m) => m.id === id).pop();
    model.stopped = true;
    refreshModelsPanel();
}

function start(id: number) {
    viewer.start(id);
    var model = models.filter((m) => m.id === id).pop();
    model.stopped = false;
    refreshModelsPanel();
}

window['unload'] = unload;
window['stopModel'] = stop;
window['start'] = start;

window['viewer'] = viewer;
window['states'] = State;
window['productType'] = ProductType;

window['Viewpoint'] = Viewpoint;