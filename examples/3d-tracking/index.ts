import { Viewer, Heatmap, InteractiveClippingPlane, ContinuousHeatmapChannel, ValueRange, ValueRangesHeatmapChannel, HeatmapSource, Icons, CameraType, ViewType, ClippingPlane, ProductType, IHeatmapChannel, ChannelType, } from '../..';
import { Icon } from '../../src/plugins/DataVisualization/Icons/icon';
import { IconsData } from './icons';

const viewer = new Viewer("viewer");
const heatmap = new Heatmap();
const icons = new Icons();
viewer.addPlugin(heatmap);
viewer.addPlugin(icons);

var plane = new InteractiveClippingPlane();
viewer.addPlugin(plane);

const sourceIcon = new Icon("Digger #1", "Tracking digger location along the bridge", null, IconsData.diggerIcon);

viewer.on('loaded', args => {
    try {
        
        viewer.camera = CameraType.PERSPECTIVE;
        clipModel();
        viewer.resetState(ProductType.IFCSPACE)
        viewer.show(ViewType.DEFAULT);

        const wcs = viewer.getCurrentWcs();
        var courses = viewer.getProductsOfType(ProductType.IFCCOURSE, 1);
        var centroids = courses.map(id => {
            const bb : Float32Array = viewer.getProductBoundingBox(id, 1);

            return [
                bb[0] - wcs[0] + (bb[3] / 2), 
                bb[1] - wcs[1] + (bb[4] / 2), 
                bb[2] - wcs[2] + (bb[5] / 2)
            ];
        });
        centroids = removeDuplicateXYPoints(centroids);
        sourceIcon.location = new Float32Array([centroids[0][0], centroids[0][1], centroids[0][2]])
        icons.addIcon(sourceIcon);

        let currentIndex = 0;
        let progress = 0;
        const speed = 50;
        const intervalTime = 2000; // this controls the rate of incoming changes to the digger location
        let direction = 1; 

        setInterval(function () {
            if (centroids.length < 2) return;
            let nextIndex = (currentIndex + direction + centroids.length) % centroids.length;
            if (progress >= 1) {
                progress = 0;
                currentIndex = nextIndex;
        
                if (currentIndex === 0 || currentIndex === centroids.length - 1) {
                    direction *= -1;
                }
        
                nextIndex = (currentIndex + direction + centroids.length) % centroids.length;
            }
            const nextCentroid = centroids[nextIndex];
            progress += speed;
            icons.moveIconTo(sourceIcon, new Float32Array([nextCentroid[0], nextCentroid[1], nextCentroid[2]]), speed);
        }, intervalTime);
        
    } catch (e) {

    }
});

viewer.on("pick", (arg) => {
    console.log(`Product id: ${arg.id}, model: ${arg.model}`)
});


viewer.loadAsync('/tests/data/v4/Viadotto Acerno.wexbim')
viewer.hoverPickEnabled = true;
viewer.adaptivePerformanceOn = false;
viewer.highlightingColour = [0, 0, 255, 255];
viewer.start();
window['viewer'] = viewer;

let clipModel = () => {
    var planes: ClippingPlane[] = [
        {
            direction: [1, 0, 0],
            location: [10000, 0, 0]
        },
        {
            direction: [0, 1, 0],
            location: [0, 10000, 0]
        },
        {
            direction: [0, 0, 1],
            location: [0, 0, 2000]
        },
        {
            direction: [-1, 0, 0],
            location: [-10000, 0, 0]
        },
        {
            direction: [0, -1, 0],
            location: [0, -10000, 0]
        },
        {
            direction: [0, 0, -1],
            location: [0, 0, -10000]
        }
    ];

    viewer.sectionBox.setToPlanes(planes);
}

document['clip'] = () => {
    plane.stopped = false;
};
document['hideClippingControl'] = () => {
    plane.stopped = true;
};
document['unclip'] = () => {
    viewer.unclip();
    plane.stopped = true;
};

window['clipBox'] = () => {
    var planes: ClippingPlane[] = [
        {
            direction: [1, 0, 0],
            location: [5000, 0, 0]
        },
        {
            direction: [0, 1, 0],
            location: [0, 2000, 0]
        },
        {
            direction: [0, 0, 1],
            location: [0, 0, 2100]
        },
        {
            direction: [-1, 0, 0],
            location: [-100, 0, 0]
        },
        {
            direction: [0, -1, 0],
            location: [0, -2000, 0]
        },
        {
            direction: [0, 0, -1],
            location: [0, 0, -1000]
        }
    ];

    viewer.sectionBox.setToPlanes(planes);
    viewer.zoomTo();
};

window['releaseClipBox'] = () => {
    clipModel();
    viewer.zoomTo();
};

function removeDuplicateXYPoints(centroids: number[][]): number[][] {
    const filteredCentroids: number[][] = [];
    const tolerance = 1;

    centroids.forEach(centroid => {
        const isUnique = filteredCentroids.every(existing => {
            const dx = Math.abs(centroid[0] - existing[0]);
            const dy = Math.abs(centroid[1] - existing[1]);
            return dx > tolerance || dy > tolerance; // Check if the point is outside the tolerance
        });

        if (isUnique) {
            filteredCentroids.push(centroid);
        }
    });

    return filteredCentroids;
}