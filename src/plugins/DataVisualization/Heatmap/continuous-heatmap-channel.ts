import { IHeatmapChannel, ChannelType } from "./heatmap-channel";

/**
 * A continuous heatmap channel is to used to represent a range of continous values.
 * 
 * @implements {IHeatmapChannel}
 */
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
    private _enabled: boolean;

    /**
     * Creates an instance of ContinuousHeatmapChannel.
     * 
     * @param {string} channelId - A user-defined unique identifier for the channel.
     * @param {string} dataType - The data type of the channel values.
     * @param {string} name - The name of the channel.
     * @param {string} description - A brief description of the channel.
     * @param {string} property - The data property represented by this channel.
     * @param {string} unit - The unit of measurement for the channel.
     * @param {number} min - The minimum value for the data range represented by this channel.
     * @param {number} max - The maximum value for the data range represented by this channel.
     * @param {string[]} colorGradient - A list of hex color gradient stops used to represent the data values carried through this channel.
     */
    constructor(
        channelId: string,
        dataType: string,
        name: string,
        description: string,
        property: string,
        unit: string,
        min: number,
        max: number,
        colorGradient: string[]
    ) {
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
     * Gets the minimum value for the continuous data range.
     * @returns {number} The minimum value.
     */
    public get min(): number {
        return this._min;
    }

    /**
     * Sets the minimum value for the continuous data range.
     * @param {number} value - The new minimum value.
     */
    public set min(value: number) {
        this._min = value;
    }

    /**
     * Gets the maximum value for the continuous data range.
     * @returns {number} The maximum value.
     */
    public get max(): number {
        return this._max;
    }

    /**
     * Sets the maximum value for the continuous data range.
     * @param {number} value - The new maximum value.
     */
    public set max(value: number) {
        this._max = value;
    }

    /**
     * Gets the hex color gradient stops used to represent the data values.
     * @returns {string[]} The hex color gradient  stops.
     */
    public get colorGradient(): string[] {
        return this._colorGradient;
    }

    /**
     * Sets the hex color gradient stops used to represent the data values.
     * @param {string[]} value - The new hex color gradient stops.
     */
    public set colorGradient(value: string[]) {
        this._colorGradient = value;
    }

    public getColor(value: any): string | undefined {
        const numericValue = Number(value);
        if (isNaN(numericValue)) {
            return undefined;
        }
        if (this._colorGradient.length === 0) {
            throw new Error("Color array cannot be empty.");
        }

        const normalizedValue = this.clamp((numericValue - this._min) / (this._max - this._min), this._min, this._max);
        const color = this.interpolateColor(normalizedValue);
        return this.rgbaToHex(color);
    }

    private interpolateColor(value: number): number[] {
        const lastIndex = this._colorGradient.length - 1;
        if (value <= 0) {
            return this.hexToRgba(this._colorGradient[0]);
        }
        if (value >= 1) {
            return this.hexToRgba(this._colorGradient[lastIndex]);
        }

        const scaledValue = value * lastIndex;
        const startIndex = Math.floor(scaledValue);
        const endIndex = Math.ceil(scaledValue);
        const segmentValue = scaledValue - startIndex;
        const startColor = this.hexToRgba(this._colorGradient[startIndex]);
        const endColor = this.hexToRgba(this._colorGradient[endIndex]);

        return startColor.map((component, index) => Math.round(component + (endColor[index] - component) * segmentValue));
    }

    private hexToRgba(hex: string): number[] {
        hex = hex.replace(/^#/, "");
        let r: number, g: number, b: number, a: number;

        if (hex.length === 3) {
            r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
            g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
            b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
            a = 255;
        } else if (hex.length === 6) {
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
            a = 255;
        } else if (hex.length === 8) {
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
            a = parseInt(hex.substring(6, 8), 16);
        } else {
            throw new Error(`Invalid hex color '${hex}'`);
        }

        return [r, g, b, a];
    }

    private componentToHex(component: number): string {
        const hex = component.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }

    private rgbaToHex(color: number[]): string {
        const components = color.map(component => Math.max(0, Math.min(255, component)));
        return `#${components.map(component => this.componentToHex(component)).join("")}`;
    }

    private clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
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
