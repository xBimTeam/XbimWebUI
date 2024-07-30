export interface IHeatmapChannel {
    channelType: ChannelType;
    channelId: string;
    name: string;
    description: string;
    property: string;
    unit: string;
    dataType: string,
}

export enum ChannelType {
    Continuous = "continuous",
    Discrete = "discrete",
}