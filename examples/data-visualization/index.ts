import { Viewer, Heatmap, InteractiveClippingPlane, ConstantColorChannel, ContinuousHeatmapChannel, ValueRange, ValueRangesHeatmapChannel, HeatmapSource, Icons, CameraType, ViewType, ClippingPlane, LoaderOverlay, ProductType, IHeatmapChannel, ChannelType, RenderingMode, DiscreteHeatmapChannel, State, } from '../..';
import { Icon } from '../../src/plugins/DataVisualization/Icons/icon';
import { IconsData } from './icons';


const viewer = new Viewer("viewer");
const heatmap = new Heatmap();
const icons = new Icons();
const loading = new LoaderOverlay();
viewer.addPlugin(loading);
viewer.addPlugin(heatmap);
viewer.addPlugin(icons);
loading.show();

// var plane = new InteractiveClippingPlane();
// viewer.addPlugin(plane);

const refreshInterval = 2000;

const temperatureChannelId = "room_temp";
const humidityChannelId = "room_humidity";
const energyChannelId = "room_energy";
const presenceChannelId = "room_occupancy";
const alertChannelId = "element_alert";

const sources: {[id: string]: HeatmapSource[] } = {};
const vizIcons: {[id: string]: Icon[]} = {};

function createHeatMapSourceAndIcons(products: {id: number, model: number}[][], channelId: string, channelLabel: string, iconData: string = IconsData.defaultIcon, displayValue = false) {
    sources[channelId] =  products.map((e, i) => new HeatmapSource(`${channelLabel} ${i+1}`, e, channelId, null) );


    vizIcons[channelId] =  products.map((e, i) => new Icon(`Sensor ${i+1}`, `${channelLabel} sensor ${i+1}`, "", e, iconData, null, null, null, () => { 
                 viewer.zoomTo(e, 1) }, displayValue)); 
}


// Value Ranges have 'buckets' of numeric values
const temperatureChannel = new ValueRangesHeatmapChannel
(temperatureChannelId, "double", "Temperature", "Room Temperature", "temperature", "°C", [
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
(presenceChannelId, "string", "Occupancy", "Room Occupancy", "occupancy", "", {
    "Occupied": "#ff0000",
    "Vacant": "#00ff00"
});

const alertsChannel = new DiscreteHeatmapChannel
(alertChannelId, "string", "Alarm", "Asset Alarm", "alert", "", {
    "OK": "#4c00ff",
    "Warning": "#ffea00",
    "Alarm": "#ff3700"
});

let selectedChannel: IHeatmapChannel = temperatureChannel;

function updateVisualization() {
    var sources = getSources(selectedChannel);
    
    for(var i = 0 ; i < sources.length; i++) {
        var source = sources[i];
        var icon = vizIcons[source.channelId][i];
       
        heatmap.renderSource(source.id);
        updateIcon(icon, selectedChannel, source);
    }
}

viewer.on('loaded', args => {
    try {
        loading.hide();
        heatmap.addChannel(temperatureChannel);
        heatmap.addChannel(humidityChannel);
        heatmap.addChannel(energyChannel);
        heatmap.addChannel(occupancyChannel);
        heatmap.addChannel(alertsChannel);

        InitialiseChannels();

        var elements = viewer.getProductsOfType(ProductType.IFCFURNISHINGELEMENT).map(e =>  ({id: e, model: 1}));
        var spaces = viewer.getProductsOfType(ProductType.IFCSPACE).slice(0, 3).map(e =>  ({id: e, model: 1}));
        var zone1 = spaces.slice(0,2);
        var zone2 = spaces.slice(2,3);

        var spaceZones = [zone1, zone2];
        var individualElements = elements.map(e => [e])
        var individualSpaces = spaces.map(e => [e])
        
        createHeatMapSourceAndIcons(individualSpaces, temperatureChannelId, "Temperature sensor", IconsData.temperatureIcon, true);
        createHeatMapSourceAndIcons(individualSpaces, energyChannelId, "Energy sensor", IconsData.successIcon, true);
        createHeatMapSourceAndIcons(spaceZones, humidityChannelId, "Humidity sensor", IconsData.successIcon, true);
        createHeatMapSourceAndIcons(spaceZones, presenceChannelId, "Occupancy sensor", IconsData.defaultIcon, false);
        createHeatMapSourceAndIcons(individualElements, alertChannelId, "Alarm", IconsData.errorIcon, true);

        Object.keys(sources).map(k => sources[k].map(h => heatmap.addSource(h)));

        Object.keys(vizIcons).map(k => vizIcons[k].map(i => { icons.addIcon(i); i.isEnabled = false;}));   
        
        viewer.camera = CameraType.PERSPECTIVE;
        viewer.resetState(ProductType.IFCSPACE)
        viewer.show(ViewType.DEFAULT);
        viewer.renderingMode = RenderingMode.XRAY_ULTRA;

        heatmap.renderChannel(selectedChannel.channelId);
        setIconState(selectedChannel.channelId);
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

viewer.loadAsync('/tests/data/SampleHouse.wexbim')
viewer.hoverPickEnabled = true;
viewer.adaptivePerformanceOn = true;
viewer.highlightingColour = [0, 0, 255, 255];
viewer.start();
window['viewer'] = viewer;


function InitialiseChannels() {
    const channelsDropdown = document.getElementById('channels') as HTMLSelectElement;
    channelsDropdown.addEventListener('change', handleDropdownChange);

    heatmap.channels.forEach(obj => {
        const option = document.createElement('option');
        option.value = obj.name;
        option.textContent = obj.description;
        channelsDropdown.appendChild(option);
    });

    setSelectedChannel();

    
    function handleDropdownChange() {
        const selectedChannelName = channelsDropdown.value;
        setIconState(selectedChannel.channelId, false); // disable icons
        switch(selectedChannelName){
            case 'Humidity':{
                selectedChannel = humidityChannel;
                break;
            }
            case 'Temperature':{
                selectedChannel = temperatureChannel;
                break;
            }
            case 'Energy':{
                selectedChannel = energyChannel;
                break;
            }
            case 'Occupancy':{
                selectedChannel = occupancyChannel;
                break;
            }
            case 'Alarm':{
                selectedChannel = alertsChannel;
                break;
            }
        }
        setSelectedChannel();
    }
}

function getSources(selectedChannel: IHeatmapChannel) : HeatmapSource[] {
    switch(selectedChannel.channelId) {
        case temperatureChannelId:
            return sources[temperatureChannelId].map(s => { s.value = ((getRandomInt(500)-100)/10).toString();  return s;});
            
        case humidityChannelId:
            return sources[humidityChannelId].map(s => { s.value = getRandomInt(100).toString();  return s;});

        case energyChannelId:
            return sources[energyChannelId].map(s => { s.value = (getRandomInt(5000)/1000).toString();  return s;});

        case presenceChannelId:
            return sources[presenceChannelId].map(s => { s.value = (getRandomInt(2) % 2) == 0 ? "Vacant" : "Occupied";  return s;});

        case alertChannelId:
            return sources[alertChannelId].map(s => { s.value = (getRandomInt(2) % 2) == 0 ? "OK" : (getRandomInt(2) % 2) == 0 ?"Alarm" : "Warning";  return s;});
            
        default:
            return sources[temperatureChannelId].map(s => { s.value = ((getRandomInt(500)-100)/10).toString();  return s;});
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
    viewer.resetState(ProductType.IFCPRODUCT)
    // Enable icons for this channel
    setIconState(selectedChannel.channelId);

    
}

function setIconState(channelId: string, isEnabled: boolean = true) {
    if(channelId && Object.keys(vizIcons).length > 0) {
        vizIcons[channelId].forEach(icon =>{
            icon.isEnabled = isEnabled;
        });
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

    vizIcons[selectedChannel.channelId]?.forEach(icon => {

        icon.isValueDisplayed = !icon.isValueDisplayed;
           
    });
    updateVisualization();
}

window['deleteIcon'] = () => {
    var channelIcons = vizIcons[selectedChannel.channelId];

    if(channelIcons.length > 0){
        var icon = channelIcons[0]
        channelIcons.splice(0, 1);
        icons.removeIcon(icon);

        var source = sources[selectedChannel.channelId];
        source.splice(0, 1);
        // switch(selectedChannel.channelId) {
        //     case tempChannelId:
        //         sources[tempChannelId].splice(0, 1);
        //         break;
                
        //     case humidityChannelId:
        //         sources[humidityChannelId].splice(0, 1);

        //     case energyChannelId:
        //         sources[energyChannelId].splice(0,1);

        //     case occChannelId:
        //         sources[occChannelId].splice(0, 1);

        //     case alertChannelId:
        //         sources[occChannelId].splice(0, 1);
                
        //     default:
        // }
        
    }
}


