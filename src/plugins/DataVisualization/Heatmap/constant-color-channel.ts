import { IHeatmapChannel, ChannelType } from "./heatmap-channel";

/**
 * Constant color channel.
 * 
 * @implements {IHeatmapChannel}
 */
export class ConstantColorChannel implements IHeatmapChannel {
    private _channelType: ChannelType;
    private _channelId: string;
    private _dataType: string;
    private _name: string;
    private _description: string;
    private _property: string;
    private _unit: string;
    private _enabled: boolean;
    private _color: string;

    /**
     * Creates an instance of DiscreteHeatmapChannel.
     * 
     * @param {string} channelId - A user-defined unique identifier for the channel.
     * @param {string} dataType - The data type of the channel values.
     * @param {string} name - The name of the channel.
     * @param {string} description - A brief description of the channel.
     * @param {string} property - The data property represented by this channel.
     * @param {string} unit - The unit of measurement for the channel.
     * @param {string} color - The hex color.
     */
    constructor(
        channelId: string,
        dataType: string,
        name: string,
        description: string,
        property: string,
        unit: string,
        color: string
    ) {
        this._channelType = ChannelType.Constant;
        this._channelId = channelId;
        this._dataType = dataType;
        this._name = name;
        this._description = description;
        this._property = property;
        this._unit = unit;
        this._color = color;
        this._enabled = true;
    }

    /**
     * Gets the type of the channel.
     * @returns {ChannelType} The type of the channel.
     */
    public get channelType(): ChannelType {
        return this._channelType;
    }

    /**
     * Gets the unique identifier for the channel.
     * @returns {string} The channel ID.
     */
    public get channelId(): string {
        return this._channelId;
    }

    /**
     * Gets the data type of the channel values.
     * @returns {string} The data type.
     */
    public get dataType(): string {
        return this._dataType;
    }

    /**
     * Sets the data type of the channel values.
     * @param {string} value - The new data type.
     */
    public set dataType(value: string) {
        this._dataType = value;
    }

    /**
     * Gets the name of the channel.
     * @returns {string} The name of the channel.
     */
    public get name(): string {
        return this._name;
    }

    /**
     * Gets the description of the channel.
     * @returns {string} The description of the channel.
     */
    public get description(): string {
        return this._description;
    }

    /**
     * Sets the description of the channel.
     * @param {string} value - The new description.
     */
    public set description(value: string) {
        this._description = value;
    }

    /**
     * Gets the data property represented by this channel.
     * @returns {string} The data property represented by this channel.
     */
    public get property(): string {
        return this._property;
    }

    /**
     * Gets the unit of measurement for the channel.
     * @returns {string} The unit of measurement.
     */
    public get unit(): string {
        return this._unit;
    }

    /**
     * Sets the unit of measurement for the channel.
     * @param {string} value - The new unit of measurement.
     */
    public set unit(value: string) {
        this._unit = value;
    }

    /**
     * Gets hex color of the channel.
     * @returns {string} The hex color.
     */
    public get color(): string {
        return this._color;
    }

    /**
     * Gets a boolean value indicating if this channel is enabled
     * @returns {boolean} a value indicates if this channel is enabled.
     */
    public get isEnabled(): boolean {
        return this._enabled;
    }

     /**
     * Sets if this channel is enabled or not
     * @param {boolean} value - a value indicates if this channel is enabled.
     */
    public set isEnabled(value: boolean) {
        this._enabled = value;
    }
}
