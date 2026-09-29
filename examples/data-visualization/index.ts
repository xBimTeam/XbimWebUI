import { Viewer, Heatmap, InteractiveClippingPlane, ConstantColorChannel, ContinuousHeatmapChannel, ValueRange, ValueRangesHeatmapChannel, HeatmapSource, Icons, CameraType, ViewType, ClippingPlane, LoaderOverlay, ProductType, IHeatmapChannel, ChannelType, RenderingMode, DiscreteHeatmapChannel, State, } from '../..';
import { ClusterIcon, Icon } from '../../src/plugins/DataVisualization/Icons/icon';
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
const alarmChannelId = "element_alarm";
const alertClusteredChannelId = "element_clustered_alert";

const sources: {[id: string]: HeatmapSource[] } = {};
const vizIcons: {[id: string]: Icon[]} = {};

function createHeatMapSourceAndIcons(products: {id: number, model: number}[][], channelId: string, channelLabel: string, iconData: string = IconsData.defaultIcon, 
    displayValue = false, initialValue: any = 0, clusterable: boolean = false) {

    sources[channelId] =  products.map((e, i) => new HeatmapSource(`${channelLabel} ${i+1}`, e, channelId, initialValue) );

    vizIcons[channelId] =  products.map((e, i) => { 
        const name = `Sensor ${i+1}`;
        const description = `${channelLabel} sensor ${i+1}`;
        const onIconSelected = () => {
            viewer.zoomTo(e, 1)
        };
        return clusterable
            ? new ClusterIcon(name, description, initialValue.toString(), e, iconData, null, null, null, onIconSelected, displayValue, initialValue, channelId)
            : new Icon(name, description, initialValue.toString(), e, iconData, null, null, null, onIconSelected, displayValue, initialValue);
    }); 
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

const alarmChannel = new DiscreteHeatmapChannel
(alarmChannelId, "string", "Alarm", "Asset Alarm", "alarm", "", {
    "OK": "#038913",
    "Warning": "#ffea00",
    "Alarm": "#ff3700"
});

const alertsClusteredChannel = new DiscreteHeatmapChannel
(alertClusteredChannelId, "string", "ALERT", "Asset Alert - Clustered", "alert", "", {
    "OK": "#038913",
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
        heatmap.addChannel(alarmChannel);
        heatmap.addChannel(alertsClusteredChannel);

        InitialiseChannels();

        var elements = viewer.getProductsOfType(ProductType.IFCFURNISHINGELEMENT).map(e =>  ({id: e, model: 1}));
        var spaces = viewer.getProductsOfType(ProductType.IFCSPACE).slice(0, 3).map(e =>  ({id: e, model: 1}));
        var zone1 = spaces.slice(0,2);
        var zone2 = spaces.slice(2,3);

        var spaceZones = [zone1, zone2];
        var individualElements = elements.map(e => [e])
        var individualSpaces = spaces.map(e => [e])
        
        createHeatMapSourceAndIcons(individualSpaces, temperatureChannelId, "Temperature sensor", IconsData.temperatureIcon, true, 20, true);
        createHeatMapSourceAndIcons(individualSpaces, energyChannelId, "Energy sensor", IconsData.successIcon, true, 1.5);
        createHeatMapSourceAndIcons(individualSpaces, humidityChannelId, "Humidity sensor", IconsData.successIcon, true, 50, true);
        createHeatMapSourceAndIcons(spaceZones, presenceChannelId, "Occupancy sensor", IconsData.defaultIcon, false, "Vacant");
        createHeatMapSourceAndIcons(individualElements, alarmChannelId, "Alarm", IconsData.errorIcon, true, "OK", false);
        createHeatMapSourceAndIcons(individualElements, alertClusteredChannelId, "Alert", IconsData.errorIcon, true, "OK", true);

        Object.keys(sources).map(k => 
            sources[k].map(h => 
                heatmap.addSource(h)));

        Object.keys(vizIcons).map(k => 
            vizIcons[k].map(i => { 
                i.isEnabled = false;
                icons.addIcon(i); 
            }));   
        
        viewer.camera = CameraType.PERSPECTIVE;
        viewer.resetState(ProductType.IFCSPACE)
        viewer.show(ViewType.DEFAULT);
        viewer.renderingMode = RenderingMode.XRAY_ULTRA;

        heatmap.renderChannel(selectedChannel.channelId);
        setIconState(selectedChannel.channelId);
        icons.useClusterCellCenter = false;
        updateVisualization();
        setInterval(function(){
            updateVisualization();
        }, refreshInterval);

    } catch (e) {

    }
});

viewer.on("pick", (arg) => {
    console.log(`Product id: ${arg.id}, model: ${arg.model}  xyz: ${arg.xyz}`)
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
            case humidityChannel.name:{
                selectedChannel = humidityChannel;
                break;
            }
            case temperatureChannel.name:{
                selectedChannel = temperatureChannel;
                break;
            }
            case energyChannel.name:{
                selectedChannel = energyChannel;
                break;
            }
            case occupancyChannel.name:{
                selectedChannel = occupancyChannel;
                break;
            }
            case alarmChannel.name:{
                selectedChannel = alarmChannel;
                break;
            }
            case alertsClusteredChannel.name:{
                selectedChannel = alertsClusteredChannel;
                break;
            }
            default:
                console.error(`Channel ${selectedChannelName} not supported`);
        }
        setSelectedChannel();
        updateVisualization();
    }
}

function getSources(selectedChannel: IHeatmapChannel) : HeatmapSource[] {
    switch(selectedChannel.channelId) {
        case temperatureChannelId:
            return sources[temperatureChannelId].map(s => { s.value = ((getRandomInt(500)-100)/10);  return s;});
            
        case humidityChannelId:
            return sources[humidityChannelId].map(s => { s.value = getRandomInt(100);  return s;});

        case energyChannelId:
            return sources[energyChannelId].map(s => { s.value = (getRandomInt(5000)/1000);  return s;});

        case presenceChannelId:
            return sources[presenceChannelId].map(s => { s.value = (getRandomInt(2) % 2) == 0 ? "Vacant" : "Occupied";  return s;});

        case alarmChannelId:
            return sources[alarmChannelId].map(s => { s.value = (getRandomInt(2) % 2) == 0 ? "OK" : (getRandomInt(2) % 2) == 0 ?"Alarm" : "Warning";  return s;});

        case alertClusteredChannelId:
            return sources[alertClusteredChannelId].map(s => { s.value = (getRandomInt(2) % 2) == 0 ? "OK" : (getRandomInt(2) % 2) == 0 ?"Alarm" : "Warning";  return s;});
            
        default:
            return sources[temperatureChannelId].map(s => { s.value = ((getRandomInt(500)-100)/10);  return s;});
    }
}

function updateIcon(icon: Icon, channel: IHeatmapChannel, source: HeatmapSource) {
    if(icon == null) return;
    icon.description = `<b>Room</b> ${channel.name}: ${source.value}<sup>${channel.unit}</super>`;
    if (icon instanceof ClusterIcon) {
        icon.categoryColor = channel instanceof DiscreteHeatmapChannel || channel instanceof ValueRangesHeatmapChannel
            ? channel.getColor(source.value) || null
            : null;
        icon.categoryLabel = channel instanceof ValueRangesHeatmapChannel
            ? channel.getRange(source.value)?.label ?? null
            : null;
    }
    icon.value = source.value;
    icon.unit = channel.unit;
    icon.overlayValue = `${source.value}<sup>${channel.unit}</sup>`;
    icon.valueReadout = `${source.value}${channel.unit}`;
}



function setSelectedChannel() {

    switch(selectedChannel.channelType) {
        case ChannelType.Continuous: {
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
            break;
        }

        case ChannelType.ValueRanges:{
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
            break;
        }

        case ChannelType.Discrete: {
            const gradientElement = document.getElementById('gradient-parent')!;
            gradientElement.style.display = "none";
            const discreteChannel = selectedChannel as DiscreteHeatmapChannel;

            const container = document.getElementById('ranges')!;
            container.style.display = "flex";
            container.innerHTML  = "";

            Object.keys(discreteChannel.values).forEach(k => {
                var color = discreteChannel.values[k];
                const rangeDiv = document.createElement('div');
                rangeDiv.style.backgroundColor = color;
                rangeDiv.innerHTML = k;
                container.appendChild(rangeDiv);

            });
            break;
        }

        case ChannelType.Constant: {
            const gradientElement = document.getElementById('gradient-parent')!;
            gradientElement.style.display = "none";
            const constantChannel = selectedChannel as ConstantColorChannel;
            const container = document.getElementById('ranges')!;
            container.style.display = "flex";
            container.innerHTML  = "";

            const rangeDiv = document.createElement('div');
            rangeDiv.style.backgroundColor = constantChannel.color;
            rangeDiv.innerHTML = `${constantChannel.name} (${constantChannel.unit})`;
            container.appendChild(rangeDiv);

            //container.style.display = "none";
            break;
        }

        default: 
            console.log("Channel not supported", selectedChannel);

    }

    if(selectedChannel.channelId === temperatureChannelId) {
        icons.minimumIconsToCluster = 2;
    }
    else {
        icons.minimumIconsToCluster = 3;
    }
    
    viewer.resetState(ProductType.IFCPRODUCT)
    // Enable icons for this channel
    setIconState(selectedChannel.channelId);
    
    
}

function setIconState(channelId: string, isEnabled: boolean = true) {
    if(channelId && Object.keys(vizIcons).length > 0) {
        vizIcons[channelId].forEach(icon => {
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


