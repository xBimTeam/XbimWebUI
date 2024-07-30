import { Viewer, ViewType, NavigationCube, ViewerInteractionEvent, ClippingPlane, ProductType, State } from '../..';
import { CameraType } from '../../src/camera';
import { Grid } from '../../src/plugins/Grid/grid';

const viewer = new Viewer("viewer");
const cube = new NavigationCube();
const grid = new Grid();
cube.ratio = 0.05;
cube.stopped = false;
cube.passiveAlpha = 1.0;
cube.trueNorth = 0;
viewer.addPlugin(grid);
viewer.addPlugin(cube);

let selected: ViewerInteractionEvent | undefined;
let selectedTask = -1;

// dictionary of tasks - typically from your data store.
let taskList : {} = {}
let taskNo = 0;

viewer.loadAsync('/tests/data/LakesideRestaurant.wexbim')

viewer.hoverPickEnabled = true;
viewer.adaptivePerformanceOn = false;
viewer.highlightingColour=[0,0,255,255];
viewer.start();

viewer.on('loaded', args => {
    try {
        viewer.camera = CameraType.PERSPECTIVE;
        clipBox();
        viewer.show(ViewType.DEFAULT);
        // kick off annotation rendering each frame 
        window.requestAnimationFrame(() => renderAnnotationLayer());
    } catch (e) {

    }
});

viewer.on('pick', args => {

    // Add a 'task' with 3D pin at the XYZ whenever we pick
    const id = ++taskNo;

    // store the pick (for the xyz)
    taskList[id] = args;
    
    let annotations = document.getElementById('annotation');
    if(annotations){
        // Create a new pin representing a task. 
        let templatePin = <HTMLElement>annotations?.getElementsByClassName('pin')[0];
        let newPin = <HTMLElement>templatePin.cloneNode(true);
        newPin.id = "pin" + id;
        newPin.onclick = (e) => { showdetails(id);  };
        newPin.title = 'Task #' + id;
        annotations.appendChild(newPin);

        showdetails(id);
        updateTaskCount();
    } 
});

window['viewer'] = viewer;

window['clipBox'] = () => {
    clipBox();
};


window['releaseClipBox'] = () => {
    viewer.sectionBox.clear();
    viewer.zoomTo();
};

window['picklist'] = taskList;

let clipBox = () => {
    var planes: ClippingPlane[] = [
        {
            direction: [1, 0, 0],
            location: [16000, 0, 0]
        },
        {
            direction: [0, 1, 0],
            location: [0, 46000, 0]
        },
        {
            direction: [0, 0, 1],
            location: [0, 0, 2200]
        },
        {
            direction: [-1, 0, 0],
            location: [-23000, 0, 0]
        },
        {
            direction: [0, -1, 0],
            location: [0, -13000, 0]
        },
        {
            direction: [0, 0, -1],
            location: [0, 0, -1000]
        }
    ];

    viewer.sectionBox.setToPlanes(planes);
    viewer.zoomTo();
}

let renderAnnotationLayer = () => {
    const annotations = document.getElementById('annotation');
    const canvas = document.getElementById('viewer');
    const floatdetails = document.getElementById('floatdetails');

    const pinheight = 32;
    const pinwidth = 24/2;
    
    if(annotations && floatdetails && canvas) {

        // Keep annotation layer in sync with canvas
        annotations.style.width = canvas.clientWidth + 'px';
        annotations.style.height = canvas.clientHeight + 'px';

        Object.getOwnPropertyNames(taskList).forEach(k =>{
            // display each pin
            let pinLabel = document.getElementById('pin' + k);
            const pin: ViewerInteractionEvent = taskList[k];
            if(pinLabel && pin && pin.xyz){

                // Get the canvas XY pixel coords from the clicked xyz in WCS
                const position = viewer.getHtmlCoordinatesOfVector(pin.xyz);

                if(position.length == 2) {
                    
                    const posLeft = (position[0]- pinwidth);
                    const posTop =(position[1] - pinheight);
           
                    pinLabel.style.display= 'block';
                    pinLabel.style.left = posLeft + 'px';
                    pinLabel.style.top = posTop + 'px';
                } 
            } else {
                // pin deleted
                if(pinLabel)
                    pinLabel.style.display = 'none';
            }
        });

        if(selected) {
            // if a task is selected, display info panel
            const position = viewer.getHtmlCoordinatesOfVector(selected.xyz);

            if(position.length == 2) {

                const posLeft = (position[0]) +(-floatdetails.clientWidth / 2) + 10;
                const posTop =(position[1]) - (floatdetails.clientHeight + 48);

                floatdetails.style.display= 'block';
                floatdetails.style.left = posLeft + 'px';
                floatdetails.style.top = posTop + 'px';              
            } 
        } else {
            if (floatdetails.style.display !== 'none') {
                floatdetails.style.display = 'none';
            }
        }
    }
    
    // Fire on next frame
    window.requestAnimationFrame(() => renderAnnotationLayer());
}

let showdetails = (id: number) => {
    const showDetails: ViewerInteractionEvent = taskList[id];

    let floatdetails = document.getElementById('floatdetails');
    if(floatdetails){

        const prod: ProductType = viewer.getProductType(showDetails.id, showDetails.model);
        const content = floatdetails.getElementsByClassName("content")[0];
        const title = floatdetails.getElementsByClassName("title")[0];
        content.textContent = "Issue identified with " + ProductType[prod].replace("IFC", "") + " [" + showDetails.id +"]";
        title.textContent = "Non Conformance Report " + id 

        //viewer.zoomTo(showDetails.id, showDetails.model, true);

        selected = showDetails;
        selectedTask = id;
    }
}

document['deleteItem']  = () => {
    const sure = confirm('Are you sure you want to delete Task ' + selectedTask);

    if(sure){

        const toRemove = selectedTask;
        selected = undefined;
        selectedTask = -1;
        if(toRemove > 0) {
            taskList[toRemove] = undefined;
        }
    }
}

document['closeItem']  = () => {
    
    selected = undefined;
    selectedTask = -1;
    
}


function updateTaskCount() {
    let tasks = document.getElementById('tasks');
    if(tasks) {
        tasks.innerText = taskNo + " tasks";
    }
}

