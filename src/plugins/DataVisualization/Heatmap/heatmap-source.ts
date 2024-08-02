/**
 * The HeatmapSource class represents the producers of values for the heatmap.
 * Sources are responsible for providing and feeding the data to the IHeatmapChannel instances.
 */
export class HeatmapSource {
    private _id: string;
    private _modelId: number;
    private _productId: number;
    private _channelId: string;
    private _value: any;
    private _enabled: boolean;

    /**
     * Creates an instance of HeatmapSource.
     * 
     * @param {string} id - A unique identifier for the heatmap source.
     * @param {number} modelId - The model ID associated with the source.
     * @param {number} productId - The product ID associated with the source.
     * @param {string} channelId - The channel ID associated with the source.
     * @param {any} value - The value produced by the source.
     */
    constructor(id: string, modelId: number, productId: number, channelId: string, value: any) {
        this._id = id;
        this._modelId = modelId;
        this._productId = productId;
        this._channelId = channelId;
        this._value = value;
        this._enabled = true;
    }

    /**
     * Gets the unique identifier for the heatmap source.
     * @returns {string} The source ID.
     */
    public get id(): string {
        return this._id;
    }

    /**
     * Gets the model ID associated with the source.
     * @returns {number} The model ID.
     */
    public get modelId(): number {
        return this._modelId;
    }

    /**
     * Gets the product ID associated with the source.
     * @returns {number} The product ID.
     */
    public get productId(): number {
        return this._productId;
    }

    /**
     * Gets the channel ID associated with the source.
     * @returns {string} The channel ID.
     */
    public get channelId(): string {
        return this._channelId;
    }

    /**
     * Gets the value produced by the source.
     * @returns {any} The value.
     */
    public get value(): any {
        return this._value;
    }

    /**
     * Sets the value produced by the source.
     * @param {any} value - The new value.
     */
    public set value(value: any) {
        this._value = value;
    }

    /**
     * Gets a boolean value indicating if this source is enabled
     * @returns {boolean} a value indicates if this source is enabled.
     */
     public get isEnabled(): boolean {
        return this._enabled;
    }

    /**
     * Sets if this source is enabled or not
     * @param {boolean} value - a value indicates if this source is enabled.
     */
    public set isEnabled(value: boolean) {
        this._enabled = value;
    }
}
