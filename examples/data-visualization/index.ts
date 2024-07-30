import { Viewer, NavigationCube, Heatmap, ContinuousHeatmapChannel, HeatmapSource, Icons, CameraType, ViewType, IHeatmapChannel, ClippingPlane, ProductType, } from '../..';
import { Icon } from '../../src/plugins/DataVisualization/Icons/icon';
import { Grid } from '../../src/plugins/Grid/grid';
import { IconsData } from './icons';

const viewer = new Viewer("viewer");
const cube = new NavigationCube();
const grid = new Grid();
const heatmap = new Heatmap();
const icons = new Icons();
cube.ratio = 0.05;
cube.stopped = false;
cube.passiveAlpha = 1.0;
cube.trueNorth = 0;
viewer.addPlugin(grid);
viewer.addPlugin(cube);
viewer.addPlugin(heatmap);
viewer.addPlugin(icons);

const tempChannelId = "room_temp";
const humidityChannelId = "room_humidity";

const temperatureSource = new HeatmapSource("Temp sensor", 1, 152, tempChannelId, 1);
const humiditySource = new HeatmapSource("Humidity sensor", 1, 152, humidityChannelId, 10);
const sourceIcon = new Icon("Room 1 Sensor", "Temprature sensor", 1, 152, IconsData.errorIcon);

let selectedChannel: ContinuousHeatmapChannel;
const tempChannel = new ContinuousHeatmapChannel
(tempChannelId, "double", "Temprature", "Temperature of Rooms", "temprature", "°F", 0, 150, ["#142ce2","#fff200","#FF0000"]);
const humidityChannel = new ContinuousHeatmapChannel
(humidityChannelId, "double", "Humidity", "Humidity of Rooms", "temprature", "%", 0, 100, ["#1ac603", "#f96c00"]);
selectedChannel = tempChannel;

heatmap.addChannel(tempChannel);
heatmap.addChannel(humidityChannel);

viewer.on('loaded', args => {
    try {
        
        viewer.camera = CameraType.PERSPECTIVE;
        clipBox();
        viewer.resetState(ProductType.IFCSPACE)
        viewer.show(ViewType.DEFAULT);

        heatmap.addSource(temperatureSource);
        heatmap.addSource(humiditySource);

        icons.addIcon(sourceIcon);
        icons.addIcon(new Icon("Temp. Sensor 2", "Temprature sensor", 1, 617, IconsData.successIcon));
        icons.addIcon(new Icon("Temp. Sensor 3", "Temprature sensor", 1, 447, IconsData.successIcon));

        heatmap.renderChannel(selectedChannel.channelId);

        setInterval(function(){
            if(selectedChannel.channelId === tempChannelId){
                temperatureSource.value = getRandomInt(150);
                heatmap.renderSource(temperatureSource.id);
                sourceIcon.description = `Room ${selectedChannel.name}: ${temperatureSource.value}${selectedChannel.unit}`;
            }
            else{
                humiditySource.value = getRandomInt(100);
                heatmap.renderSource(humiditySource.id);
                sourceIcon.description = `Room ${selectedChannel.name}: ${humiditySource.value}${selectedChannel.unit}`;
            }
        }, 2000);

    } catch (e) {

    }
});

viewer.on("pick", (arg) => {
    if (arg.id) {
        console.log(`Selected id: ${arg.id} model ${arg.model} xyz ${arg.xyz}`);
    }
});

const channelsDropdown = document.getElementById('channels') as HTMLSelectElement;
channelsDropdown.addEventListener('change', handleDropdownChange);

heatmap.channels.forEach(obj => {
    const option = document.createElement('option');
    option.value = obj.name;
    option.textContent = obj.description;
    channelsDropdown.appendChild(option);
});

setSelectedChannel();

viewer.loadAsync('/tests/data/SampleHouse.wexbim')
viewer.hoverPickEnabled = true;
viewer.adaptivePerformanceOn = false;
viewer.highlightingColour=[0,0,255,255];
viewer.start();
window['viewer'] = viewer;


function setSelectedChannel() {
    var colors = selectedChannel.colorGradient;
    const gradientElement = document.getElementById('gradient')!;
    const gradientStartElement = document.getElementById('start-grad')!;
    const gradientEndElement = document.getElementById('end-grad')!;
    gradientStartElement.textContent = `${selectedChannel.min}${selectedChannel.unit}`;
    gradientEndElement.textContent = `${selectedChannel.max}${selectedChannel.unit}`;

    const numColors = colors.length;
    const stops = colors.map((color, index) => {
        const position = (index / (numColors - 1)) * 100;
        return { color, position: `${position}%` };
    });
    const gradientString = stops.map(stop => `${stop.color} ${stop.position}`).join(', ');
    gradientElement.style.background = `linear-gradient(90deg, ${gradientString})`;
}

function handleDropdownChange() {
    const selectedChannelName = channelsDropdown.value;
    switch(selectedChannelName){
        case 'Humidity':{
            selectedChannel = humidityChannel;
            setSelectedChannel();
            return;
        }
        case 'Temprature':{
            selectedChannel = tempChannel;
            setSelectedChannel();
            return;
        }
    }
}

function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}


let clipBox = () => {
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
