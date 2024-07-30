import { IHeatmapChannel, ChannelType } from "./heatmap-channel";

export class DiscreteHeatmapChannel implements IHeatmapChannel {
    private _channelType: ChannelType;
    private _channelId: string;
    private _dataType: string;
    private _name: string;
    private _description: string;
    private _property: string;
    private _unit: string;
    private _values: { [value: string] : string };

    constructor(channelId: string, dataType: string, name: string, description: string, property: string, unit: string, values: { [value: string] : string }) {
        this._channelType = ChannelType.Discrete;
        this._channelId = channelId;
        this._dataType = dataType;
        this._name = name;
        this._description = description;
        this._property = property;
        this._unit = unit;
        this._values = values;
    }

    public get channelType(): ChannelType {
        return this._channelType;
    }

    public get channelId(): string {
        return this._channelId;
    }

    public get dataType(): string {
        return this._dataType;
    }

    public set dataType(value: string) {
        this._dataType = value;
    }

    public get name(): string {
        return this._name;
    }

    public get description(): string {
        return this._description;
    }

    public set description(value: string) {
        this._description = value;
    }

    public get property(): string {
        return this._property;
    }

    public get unit(): string {
        return this._unit;
    }

    public set unit(value: string) {
        this._unit = value;
    }

    public get values(): { [value: string] : string } {
        return this._values;
    }

}
