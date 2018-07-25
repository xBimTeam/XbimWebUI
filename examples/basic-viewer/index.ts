import {Viewer, Product, State, ViewType, RenderingMode, ProductType, NavigationCube} from '../..';

var viewer = new Viewer("viewer");
var progress = document.getElementById("progress")
viewer.loadAsync("/tests/data/LakesideRestaurant.wexbim", null, null, (msg) => {
    progress.innerHTML = `${msg.message}, done:${msg.percent}%`;
});
viewer.start();

viewer.on('pointerdown', args => {
    console.log(args);
})