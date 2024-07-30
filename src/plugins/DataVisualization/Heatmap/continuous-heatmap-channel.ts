import { IHeatmapChannel, ChannelType } from "./heatmap-channel";

export class ContinuousHeatmapChannel implements IHeatmapChannel {
    private _channelType: ChannelType;
    private _channelId: string;
    private _dataType: string;
    private _name: string;
    private _description: string;
    private _property: string;
    private _unit: string;
    private _min: number;
    private _max: number;
    private _colorGradient: string[];

    constructor(channelId: string, dataType: string, name: string, description: string, property: string, unit: string, min: number, max: number, colorGradient: string[]) {
        this._channelType = ChannelType.Continuous;
        this._channelId = channelId;
        this._dataType = dataType;
        this._name = name;
        this._description = description;
        this._property = property;
        this._unit = unit;
        this._min = min;
        this._max = max;
        this._colorGradient = colorGradient;
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

    public get min(): number {
        return this._min;
    }

    public set min(value: number) {
        this._min = value;
    }

    public get max(): number {
        return this._max;
    }

    public set max(value: number) {
        this._max = value;
    }

    public get colorGradient(): string[] {
        return this._colorGradient;
    }

    public set colorGradient(value: string[]) {
        this._colorGradient = value;
    }
}
