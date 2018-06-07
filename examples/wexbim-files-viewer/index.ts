import { Viewer, Product, State, ViewType, RenderingMode, ProductType, NavigationCube } from '../../xbim-viewer';

var models = [];

var viewer = new Viewer("xBIM-viewer");
viewer.background = [255, 255, 255];
viewer.on("error", function (arg) {
    var container = viewer.canvas.parentNode as HTMLElement;
    if (container) {
        //preppend error report
        container.innerHTML = "<pre style='color:red;'>" + arg.message + "</pre>" + container.innerHTML;
    }
});
viewer.on("pick", function (arg) {
    var span = document.getElementById("id") as HTMLElement;
    if (span) {
        if (arg.id) {
            span.innerHTML = arg.id.toString();
        } else {
            span.innerHTML = "";
        }
    }
});
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
    if (!input.files) return;

    var file = input.files[0];
    if (!file) return;

    viewer.load(file, file.name);
    viewer.start();
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
