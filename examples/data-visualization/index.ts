import { Viewer, Heatmap, InteractiveClippingPlane, ConstantColorChannel, ContinuousHeatmapChannel, ValueRange, ValueRangesHeatmapChannel, HeatmapSource, Icons, CameraType, ViewType, ClippingPlane, ProductType, IHeatmapChannel, ChannelType, RenderingMode, DiscreteHeatmapChannel, } from '../..';
import { Icon } from '../../src/plugins/DataVisualization/Icons/icon';
import { IconsData } from './icons';


const viewer = new Viewer("viewer");
const heatmap = new Heatmap();
const icons = new Icons();

viewer.addPlugin(heatmap);
viewer.addPlugin(icons);

// var plane = new InteractiveClippingPlane();
// viewer.addPlugin(plane);

const refreshInterval = 2000;

const tempChannelId = "room_temp";
const humidityChannelId = "room_humidity";
const energyChannelId = "room_energy";
const occChannelId = "room_occupancy";

const space1 = { id: 152, model: 1 };
const space2 = { id: 447, model: 1 };
const space3 = { id: 617, model: 1 };

const zone1 = [space1, space2];
const zone2 = [space3];

// We re-use the icons across four different Channels (IoT sensor streams - Temp, Humidity, Energy, Occupancy)
const zone1Icon = new Icon("Rooms 1 and 2 Sensor", "Temperature sensor", "22°C", zone1, IconsData.errorIcon, null, null, null, () => { 
    viewer.zoomTo(zone1, 1) });

const zone2Icon = new Icon("Room 3 Sensor", "Temperature sensor", "23°C", zone2, IconsData.successIcon);

const energySources = [
    new HeatmapSource("Energy sensor 1", zone1, energyChannelId, 20),
    new HeatmapSource("Energy sensor 2", zone2, energyChannelId, 10),
];
const temperatureSources = [
    new HeatmapSource("Temp sensor 1", zone1, tempChannelId, 22),
    new HeatmapSource("Temp sensor 2", zone2, tempChannelId, 15)
];
const humiditySources = [
    new HeatmapSource("Humidity sensor 1", zone1, humidityChannelId, 10),
    new HeatmapSource("Humidity sensor 2", zone2, humidityChannelId, 90)
];

const occupancySources = [
    new HeatmapSource("Occupancy sensor 1", zone1, occChannelId, "Occupied"),
    new HeatmapSource("Occupancy sensor 2", zone2, occChannelId, "Occupied"),
];
    
const sources = [...energySources, ...temperatureSources, ...humiditySources, ...occupancySources];
const vizIcons = [zone1Icon, zone2Icon];

// Value Ranges have 'buckets' of numeric values
const tempChannel = new ValueRangesHeatmapChannel
(tempChannelId, "double", "Temperature", "Temperature of Rooms", "temperature", "°C", [
    new ValueRange(-Infinity, 5, "#00d4ff", "Very Cold", 2),
    new ValueRange(5, 17, "#3d00f7", "Cold", 1),
    new ValueRange(17, 25, "#53b304", "OK", 0),
    new ValueRange(25, 32, "#ff9999", "Hot", 1),
    new ValueRange(32, Infinity, "#ff0000", "Very Hot", 2)
]);

// Continuous Ranges have equally distributed colour transitions
const humidityChannel = new ContinuousHeatmapChannel
(humidityChannelId, "double", "Humidity", "Humidity of Rooms", "humidity", "%", 0, 100, ["#ffffff", "#00ff00", "#0000ff"]);

// A simple single-color map
const energyChannel = new ConstantColorChannel
(energyChannelId, "double", "Energy", "Energy Consumption", "energy", "kW", "#1ac603");

// Discrete channels have buckets based on a string value (such as status)
const occupancyChannel = new DiscreteHeatmapChannel
(occChannelId, "string", "Occupancy", "Room Occupancy", "occupancy", "", {
    "Occupied": "#ff0000",
    "Vacant": "#00ff00"
});

let selectedChannel: IHeatmapChannel = tempChannel;

heatmap.addChannel(tempChannel);
heatmap.addChannel(humidityChannel);
heatmap.addChannel(energyChannel);
heatmap.addChannel(occupancyChannel);

function updateVisualization() {
    var sources = getSources(selectedChannel);
    for(var i = 0 ; i < vizIcons.length; i++) {
        var icon = vizIcons[i];
        var source = sources[i];
        heatmap.renderSource(source.id);
        updateIcon(icon, selectedChannel, source);
    }
}

viewer.on('loaded', args => {
    try {
        
        viewer.camera = CameraType.PERSPECTIVE;
        viewer.resetState(ProductType.IFCSPACE)
        viewer.show(ViewType.DEFAULT);
        viewer.renderingMode = RenderingMode.XRAY_ULTRA;

        sources.map(s => heatmap.addSource(s));
        vizIcons.map(i => icons.addIcon(i));

        heatmap.renderChannel(selectedChannel.channelId);


        updateVisualization();
        setInterval(function(){
            updateVisualization();
        }, refreshInterval);

    } catch (e) {

    }
});

viewer.on("pick", (arg) => {
    console.log(`Product id: ${arg.id}, model: ${arg.model}`)
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
viewer.adaptivePerformanceOn = true;
viewer.highlightingColour = [0, 0, 255, 255];
viewer.start();
window['viewer'] = viewer;


function getSources(selectedChannel: IHeatmapChannel) : HeatmapSource[] {
    switch(selectedChannel.channelId) {
        case tempChannelId:
            return temperatureSources.map(s => { s.value = ((getRandomInt(500)-100)/10).toString();  return s;});
            
        case humidityChannelId:
            return humiditySources.map(s => { s.value = getRandomInt(100).toString();  return s;});

        case energyChannelId:
            return energySources.map(s => { s.value = (getRandomInt(5000)/1000).toString();  return s;});

        case occChannelId:
            return occupancySources.map(s => { s.value = (getRandomInt(2) % 2) == 0 ? "Vacant" : "Occupied";  return s;});
            
        default:
            return temperatureSources;
    }
}

function updateIcon(icon: Icon, channel: IHeatmapChannel, source: HeatmapSource) {
    if(icon == null) return;
    icon.description = `<b>Room</b> ${channel.name}: ${source.value}<sup>${channel.unit}</super>`;
    icon.overlayValue = `${source.value}<sup>${channel.unit}</sup>`;
    icon.valueReadout = `${source.value}${channel.unit}`;
}


function setSelectedChannel() {
    if(selectedChannel.channelType === ChannelType.Continuous){
        const rangesElement = document.getElementById('ranges')!;
        rangesElement.style.display = "none";
        const continous = selectedChannel as ContinuousHeatmapChannel;
        const colors = continous.colorGradient;
        const gradientElement = document.getElementById('gradient')!;
        const gradientParentElement = document.getElementById('gradient-parent')!;
        gradientParentElement.style.display = "flex";

        const gradientStartElement = document.getElementById('start-grad')!;
        const gradientEndElement = document.getElementById('end-grad')!;
        gradientStartElement.textContent = `${continous.min}${selectedChannel.unit}`;
        gradientEndElement.textContent = `${continous.max}${selectedChannel.unit}`;

        const numColors = colors.length;
        const stops = colors.map((color, index) => {
            const position = (index / (numColors - 1)) * 100;
            return { color, position: `${position}%` };
        });
        const gradientString = stops.map(stop => `${stop.color} ${stop.position}`).join(', ');
        gradientElement.style.background = `linear-gradient(90deg, ${gradientString})`;
    }
    else if(selectedChannel.channelType === ChannelType.ValueRanges){
        const gradientElement = document.getElementById('gradient-parent')!;
        gradientElement.style.display = "none";
        const valueRanges = selectedChannel as ValueRangesHeatmapChannel;

        const container = document.getElementById('ranges')!;
        container.style.display = "flex";
        container.innerHTML  = "";
        valueRanges.valueRanges.forEach(range => {
            const rangeDiv = document.createElement('div');
            rangeDiv.style.backgroundColor = range.color;
            rangeDiv.innerHTML = `<span>${range.label}</span><span style="font-size: smaller">(${range.min === -Infinity ? '-∞' : range.min}${valueRanges.unit} - ${range.max === Infinity ? '∞' : range.max}${valueRanges.unit})</span>`;
            container.appendChild(rangeDiv);
        });

    } else if(selectedChannel.channelType === ChannelType.Constant){
        const gradientElement = document.getElementById('gradient-parent')!;
        gradientElement.style.display = "none";
        const container = document.getElementById('ranges')!;
        container.style.display = "none";
    }
}

function handleDropdownChange() {
    const selectedChannelName = channelsDropdown.value;
    switch(selectedChannelName){
        case 'Humidity':{
            selectedChannel = humidityChannel;
            setSelectedChannel();
            return;
        }
        case 'Temperature':{
            selectedChannel = tempChannel;
            setSelectedChannel();
            return;
        }
        case 'Energy':{
            selectedChannel = energyChannel;
            setSelectedChannel();
            return;
        }
        case 'Occupancy':{
            selectedChannel = occupancyChannel;
            setSelectedChannel();
            return;
        }
    }
}

function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}


// let clipModel = () => {
//     var planes: ClippingPlane[] = [
//         {
//             direction: [1, 0, 0],
//             location: [10000, 0, 0]
//         },
//         {
//             direction: [0, 1, 0],
//             location: [0, 10000, 0]
//         },
//         {
//             direction: [0, 0, 1],
//             location: [0, 0, 2000]
//         },
//         {
//             direction: [-1, 0, 0],
//             location: [-10000, 0, 0]
//         },
//         {
//             direction: [0, -1, 0],
//             location: [0, -10000, 0]
//         },
//         {
//             direction: [0, 0, -1],
//             location: [0, 0, -10000]
//         }
//     ];

//     viewer.sectionBox.setToPlanes(planes);
// }

// document['clip'] = () => {
//     plane.stopped = false;
// };
// document['hideClippingControl'] = () => {
//     plane.stopped = true;
// };
// document['unclip'] = () => {
//     viewer.unclip();
//     plane.stopped = true;
// };

// window['clipBox'] = () => {
//     var planes: ClippingPlane[] = [
//         {
//             direction: [1, 0, 0],
//             location: [5000, 0, 0]
//         },
//         {
//             direction: [0, 1, 0],
//             location: [0, 2000, 0]
//         },
//         {
//             direction: [0, 0, 1],
//             location: [0, 0, 2100]
//         },
//         {
//             direction: [-1, 0, 0],
//             location: [-100, 0, 0]
//         },
//         {
//             direction: [0, -1, 0],
//             location: [0, -2000, 0]
//         },
//         {
//             direction: [0, 0, -1],
//             location: [0, 0, -1000]
//         }
//     ];

//     viewer.sectionBox.setToPlanes(planes);
//     viewer.zoomTo();
// };

// window['releaseClipBox'] = () => {
//     clipModel();
//     viewer.zoomTo();
// };

window['toggleValues'] = () => {
    vizIcons?.forEach(icon => {

        icon.isValueDisplayed = !icon.isValueDisplayed;
           
    });
    updateVisualization();
}

window['deleteIcon'] = () => {
    if(vizIcons.length > 0){
        var icon = vizIcons[0]
        vizIcons.splice(0, 1);
        icons.removeIcon(icon);

        switch(selectedChannel.channelId) {
            case tempChannelId:
                temperatureSources.splice(0, 1);
                break;
                
            case humidityChannelId:
                humiditySources.splice(0, 1);

            case energyChannelId:
                energySources.splice(0,1);

            case occChannelId:
                occupancySources.splice(0, 1);
                
            default:
        }
        
    }
}


