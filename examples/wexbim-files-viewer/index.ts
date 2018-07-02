import { Viewer, Product, State, ViewType, RenderingMode, ProductType, NavigationCube } from '../../xbim-viewer';
import { Grid } from '../../src/plugins/Grid/grid';

var models = [];

var viewer = new Viewer("xBIM-viewer");
viewer.background = [0, 0, 0, 0];

var grid = new Grid();
viewer.addPlugin(grid);

viewer.on("error", function (arg) {
    var container = viewer.canvas.parentNode as HTMLElement;
    if (container) {
        //preppend error report
        container.innerHTML = "<pre style='color:red;'>" + arg.message + "</pre>" + container.innerHTML;
    }
});
viewer.on("pick", function (arg) {
    if (arg.id) {
        console.log(`Selected id: ${arg.id}`);
    } 
}
);
viewer.on("loaded", function (evt) {
    models.push({ id: evt.model, name: evt.tag, stopped: false });
    refreshModelsPanel();
});
viewer.on("fps", function (fps) {
    var span = document.getElementById("fps");
    if (span) {
        span.innerHTML = fps.toString();
    }
});

let input = document.getElementById('input') as HTMLInputElement;
input.addEventListener('change', () => {
    if (!input.files || input.files.length === 0) return;

    for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        viewer.load(file, file.name);
        viewer.start();
    }

    input.value = null;
});

function refreshModelsPanel() {
    var html = "";
    models.forEach(function (m) {
        html += "<div> " + m.name + "&nbsp;";
        html += "<button onclick='unload(" + m.id + ")'> Unload </button>";
        if (m.stopped)
            html += " <button onclick='start(" + m.id + ")'> Start </button> ";
        else
            html += " <button onclick='stopModel(" + m.id + ")'> Stop </button> ";
        html += "</div>";
    });
    let modelsDiv = document.getElementById('models') as HTMLDivElement;
    modelsDiv.innerHTML = html;
}
function unload(id) {
    viewer.unload(id);
    models = models.filter(function (m) { return m.id !== id });
    refreshModelsPanel();
    viewer.draw();
}
function stop(id) {
    viewer.stop(id);
    var model = models.filter(function (m) { return m.id === id }).pop();
    model.stopped = true;
    refreshModelsPanel();
}

function start(id) {
    viewer.start(id);
    var model = models.filter(function (m) { return m.id === id }).pop();
    model.stopped = false;
    refreshModelsPanel();
}

window['unload'] = unload;
window['stopModel'] = stop;
window['start'] = start;

window['viewer'] = viewer;
window['states'] = State;
window['productType'] = ProductType;
