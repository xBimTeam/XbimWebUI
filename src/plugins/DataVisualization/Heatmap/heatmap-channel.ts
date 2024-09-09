/**
 * A IHeatmapChannel instance provides the visual representation for the data produced by the HeatmapSource instances.
 * Each HeatmapSource is related to a specific channel and the channel acts as the context in which the HeatmapSource 
 * data values are represented and visualized.
 */
export interface IHeatmapChannel {
    /**
     * The type of the channel (either continuous or discrete).
     * @type {ChannelType}
     */
    channelType: ChannelType;

    /**
     * A used defined unique identifier for the channel. 
     * @type {string}
     */
    channelId: string;

    /**
     * The name of the channel.
     * @type {string}
     */
    name: string;

    /**
     * A brief description of the channel.
     * @type {string}
     */
    description: string;

    /**
     * The data represented by this channel.
     * @type {string}
     */
    property: string;

    /**
     * The unit of measurement for the channel.
     * @type {string}
     */
    unit: string;

    /**
     * The data type of the channel values.
     * @type {string}
     */
    dataType: string;

    /**
     * A value indicates if this channel is enabled or not
     */
    isEnabled: boolean;
}

/**
 * Enum representing the types of channels available for a heatmap.
 * @enum {string}
 */
export enum ChannelType {
    /**
     * Represents a continuous channel type.
     * @type {string}
     */
    Continuous = "continuous",

    /**
     * Represents a discrete channel type.
     * @type {string}
     */
    Discrete = "discrete",

    /**
     * Represents a value ranges channel type.
     * @type {string}
     */
    ValueRanges = "valueRanges",
}
