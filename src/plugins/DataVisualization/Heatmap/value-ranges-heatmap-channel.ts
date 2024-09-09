import { IHeatmapChannel, ChannelType } from "./heatmap-channel";


export class ValueRange {

    private _min: number;
    private _max: number;
    private _color: string;
    private _label: string;


    /**
         * Constructor to initialize the ValueRange object.
         * @param {number} min - The minimum value.
         * @param {number} max - The maximum value.
         * @param {string} color - The color associated with the range.
         * @param {string} label - The label for the value range.
         */
    constructor(min: number, max: number, color: string, label: string) {
        this._min = min;
        this._max = max;
        this._color = color;
        this._label = label;
    }

    /**
     * Gets the minimum value in the range.
     * @returns {number} The minimum value.
     */
    public get min(): number {
        return this._min;
    }

    /**
     * Sets the minimum value in the range.
     * @param {number} value - The minimum value to set.
     */
    public set min(value: number) {
        this._min = value;
    }

    /**
     * Gets the maximum value in the range.
     * @returns {number} The maximum value.
     */
    public get max(): number {
        return this._max;
    }

    /**
     * Sets the maximum value in the range.
     * @param {number} value - The maximum value to set.
     */
    public set max(value: number) {
        this._max = value;
    }

    /**
     * Gets the color associated with this value range.
     * @returns {string} The color value.
     */
    public get color(): string {
        return this._color;
    }

    /**
     * Sets the color associated with this value range.
     * @param {string} value - The color value to set.
     */
    public set color(value: string) {
        this._color = value;
    }

    /**
     * Gets the label for the value range.
     * @returns {string} The label for the range.
     */
    public get label(): string {
        return this._label;
    }

    /**
     * Sets the label for the value range.
     * @param {string} value - The label to set.
     */
    public set label(value: string) {
        this._label = value;
    }
}


/**
 * A value ranges heatmap channel is to used to represent a list of colored vlaue ranges.
 * 
 * @implements {IHeatmapChannel}
 */
export class ValueRangesHeatmapChannel implements IHeatmapChannel {
    private _channelType: ChannelType;
    private _channelId: string;
    private _dataType: string;
    private _name: string;
    private _description: string;
    private _property: string;
    private _unit: string;
    private _ranges: ValueRange[];
    private _enabled: boolean;

    /**
     * Creates an instance of ValueRangesHeatmapChannel.
     * 
     * @param {string} channelId - A user-defined unique identifier for the channel.
     * @param {string} dataType - The data type of the channel values.
     * @param {string} name - The name of the channel.
     * @param {string} description - A brief description of the channel.
     * @param {string} property - The data property represented by this channel.
     * @param {string} unit - The unit of measurement for the channel.
     * @param {ValueRange[]} ranges - A list of ValueRange items used to represent the data values carried through this channel.
     */
    constructor(
        channelId: string,
        dataType: string,
        name: string,
        description: string,
        property: string,
        unit: string,
        ranges: ValueRange[]
    ) {
        this._channelType = ChannelType.ValueRanges;
        this._channelId = channelId;
        this._dataType = dataType;
        this._name = name;
        this._description = description;
        this._property = property;
        this._unit = unit;
        this._ranges = ranges;
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
     * @param {string} value - The new description of the channel.
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
     * Gets the unit of measurement for the channel values.
     * @returns {string} The unit of measurement.
     */
    public get unit(): string {
        return this._unit;
    }

    /**
     * Sets the unit of measurement for the channel values.
     * @param {string} value - The new unit of measurement.
     */
    public set unit(value: string) {
        this._unit = value;
    }
 
    /**
     * Gets list of ValueRange items used to represent the data values carried through this channel.
     * @returns {ValueRange[]} The value ranges.
     */
    public get valueRanges(): ValueRange[] {
        return this._ranges;
    }

    /**
     * Sets list of ValueRange items used to represent the data values carried through this channel.
     * @param {ValueRange[]} value - The new  value ranges.
     */
    public set valueRanges(value: ValueRange[]) {
        this._ranges = value;
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
