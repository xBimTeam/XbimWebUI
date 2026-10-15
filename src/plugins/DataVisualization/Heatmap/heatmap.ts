import { IPlugin } from "../../plugin";
import { Viewer } from "../../../viewer";
import { ChannelType, IHeatmapChannel } from "./heatmap-channel";
import { ModelHandle } from "../../../model-handle";
import { HeatmapSource } from "./heatmap-source";
import { ContinuousHeatmapChannel } from "./continuous-heatmap-channel";
import { ConstantColorChannel } from "./constant-color-channel";
import { DiscreteHeatmapChannel } from "./discrete-heatmap-channel";
import { ValueRangesHeatmapChannel } from "./value-ranges-heatmap-channel";
import { State } from "../../../common";

/**
 * @category Plugins
 */
export class Heatmap implements IPlugin {
    private _viewer: Viewer = null;
    private _channels = new Map<string, IHeatmapChannel>();
    private _sources = new Map<string, HeatmapSource>();
    private _colorStylesMap: { [colorHex: string]: number } = {};
    private _stopped = true;
    private _nextStyleId: number = 0;

    public get channels(): IHeatmapChannel[] { return Array.from(this._channels.values()); }

    public get stopped(): boolean { return this._stopped; }

    public set stopped(value: boolean) {
        this._stopped = value;
        if (this._viewer) {
            this._viewer.draw();
        }
    }

    public init(viewer: Viewer): void {
        this._viewer = viewer;
    }

    public addChannel(channel: IHeatmapChannel): void {
        if (this._channels.has(channel.channelId)) {
            const msg = `A channel with this Id '${channel.channelId}' already exists.`;
            console.error(msg)
            throw new Error(msg);
        }
        this._channels.set(channel.channelId, channel);
    }

    public addSource(source: HeatmapSource): void {
        this.addSources([source]);
    }

    /** Register multiple sources after validating the complete batch. */
    public addSources(sources: HeatmapSource[]): void {
        const pendingIds = new Set<string>();
        sources.forEach(source => {
            if (this._sources.has(source.id) || pendingIds.has(source.id)) {
                const msg = `A source with this Id '${source.id}' already exists.`;
                console.error(msg);
                throw new Error(msg);
            }
            if (!this._channels.has(source.channelId)) {
                const msg = `No channel with Id '${source.channelId}' exists for this source '${source.id}'.`;
                console.error(msg);
                throw new Error(msg);
            }
            pendingIds.add(source.id);
        });
        sources.forEach(source => this._sources.set(source.id, source));
    }

    public renderChannel(channelId: string) {
        const channel = this._channels.get(channelId);
        if (!channel) {
            const msg = `No channel registered with this Id '${channelId}'.`;
            console.error(msg);
            throw new Error(msg);
        }
        this.renderChannelInternal(channel, null, channelId);
    }

    public getChannel(channelId: string): IHeatmapChannel {
        return this._channels.get(channelId);
    }

    public renderSource(sourceId: string) {
        this.renderSources([sourceId]);
    }

    /** Render selected sources in channel batches, or all registered sources when no IDs are supplied. */
    public renderSources(ids?: string[]): void {
        const sources = ids === undefined
            ? Array.from(this._sources.values())
            : Array.from(new Set(ids)).map(id => {
                const source = this._sources.get(id);
                if (!source) {
                    const msg = `No source registered with this Id '${id}'.`;
                    console.error(msg);
                    throw new Error(msg);
                }
                return source;
            });
        const sourcesByChannel = new Map<string, HeatmapSource[]>();
        sources.forEach(source => {
            let channelSources = sourcesByChannel.get(source.channelId);
            if (!channelSources) {
                channelSources = [];
                sourcesByChannel.set(source.channelId, channelSources);
            }
            channelSources.push(source);
        });
        sourcesByChannel.forEach((channelSources, channelId) => {
            this.renderChannelInternal(this._channels.get(channelId), channelSources, channelId);
        });
    }

    private renderChannelInternal(channel: IHeatmapChannel, sources: HeatmapSource[] = null, channelId?: string) {
        if (channel) {
            switch (channel.channelType) {
                case ChannelType.Continuous: {
                    this.renderContinuousChannel(channel as ContinuousHeatmapChannel, sources);
                    return;
                }
                case ChannelType.Discrete: {
                    this.renderDiscreteChannel(channel as DiscreteHeatmapChannel, sources);
                    return;
                }
                case ChannelType.ValueRanges: {
                    this.renderValueRangesChannel(channel as ValueRangesHeatmapChannel, sources);
                    return;
                }
                case ChannelType.Constant: {
                    this.renderConstantColorChannel(channel as ConstantColorChannel, sources);
                    return;
                }
            }
        }
        else {
            const msg = `No channel registered with this Id '${channelId || ''}'.`;
            throw new Error(msg);
        }
    }

    private getSources(): HeatmapSource[] {
        return Array.from(this._sources.values());
    }

    private renderConstantColorChannel(channel: ConstantColorChannel, sources: HeatmapSource[] = null) {
        const colorHex = channel.getColor(undefined);
        if (this._colorStylesMap[colorHex] === undefined) {
            const rgba = this.hexToRgba(colorHex);
            this._viewer.defineStyle(this._nextStyleId, rgba);
            this._colorStylesMap[colorHex] = this._nextStyleId;
            this._nextStyleId++;
        }
    
        const maps = (sources ?? this.getSources()).filter(s => s.channelId == channel.channelId);
        const groups: Record<string, number[]> = maps.map(m => m.products).flat().reduce((groups, item) => {
            const key = item.model;
            if (!groups[key]) {
              groups[key] = [];
            }
            groups[key].push(item.id);
            return groups;
          }, {});
          
        
          Object.entries(groups).forEach(([model, products]) => {
                        this._viewer.setStyle(this._colorStylesMap[colorHex], products, Number(model));
            this._viewer.addState(State.XRAYVISIBLE, products, Number(model));
        });
    }
    

    private renderDiscreteChannel(channel: DiscreteHeatmapChannel, sources: HeatmapSource[] = null) {
        const colorVals = Object.values(channel.values);
        colorVals.forEach(colorHex => {
            if (this._colorStylesMap[colorHex] !== undefined)
                return;

            const rgba = this.hexToRgba(colorHex);
            this._viewer.defineStyle(this._nextStyleId, rgba);
            this._colorStylesMap[colorHex] = this._nextStyleId;
            this._nextStyleId++;
        });
        const maps = (sources ?? this.getSources()).filter(s => s.channelId == channel.channelId);
        const groups: Record<string, {source:HeatmapSource, product: {id:number, model:number}}[]> = maps.flatMap(source => source.products.map(product => ({ product, source })))
        .reduce((groups, item) => {
            const key = `${item.source.value}-${item.product.model}`;
            if (!groups[key]) {
              groups[key] = [];
            }
            groups[key].push(item);
            return groups;
          }, {});
          
          Object.entries(groups).forEach(([key, val]) => {
            const modelId = val[0].product.model;
            const colorHex = channel.getColor(val[0].source.value);
            if (colorHex !== undefined) {
                let productsIds: number[] = val.map(p => p.product.id);
                this._viewer.setStyle(this._colorStylesMap[colorHex], productsIds, modelId);
                this._viewer.addState(State.XRAYVISIBLE, productsIds, modelId)
            }
        });
    }

    private renderValueRangesChannel(channel: ValueRangesHeatmapChannel, sources: HeatmapSource[] = null) {
        const colorVals = channel.valueRanges.map(vr => vr.color);
        colorVals.forEach(colorHex => {
            if (this._colorStylesMap[colorHex] !== undefined)
                return;

            const rgba = this.hexToRgba(colorHex);
            this._viewer.defineStyle(this._nextStyleId, rgba);
            this._colorStylesMap[colorHex] = this._nextStyleId;
            this._nextStyleId++;
        });

        const maps = (sources ?? this.getSources()).filter(s => s.channelId == channel.channelId);
        const groups: Record<string, Record<string, number[]>> = {};
        maps.forEach(source => {
            const colorHex = channel.getColor(source.value);
            if (colorHex === undefined) {
                return;
            }

            source.products.forEach(product => {
                const model = String(product.model);
                if (!groups[colorHex]) {
                    groups[colorHex] = {};
                }
                if (!groups[colorHex][model]) {
                    groups[colorHex][model] = [];
                }
                groups[colorHex][model].push(product.id);
            });
        });

        Object.keys(groups).forEach(colorHex => {
            const models = groups[colorHex];
            Object.keys(models).forEach(model => {
                const products = models[model];
                this._viewer.setStyle(this._colorStylesMap[colorHex], products, Number(model));
                this._viewer.addState(State.XRAYVISIBLE, products, Number(model));
            });
        });
    }

    private renderContinuousChannel(channel: ContinuousHeatmapChannel, sources: HeatmapSource[] = null) {
        // styles for edges of gradient
        channel.colorGradient.forEach(colorHex => {
            if (this._colorStylesMap[colorHex] !== undefined)
                return;

            const rgba = this.hexToRgba(colorHex);
            this._viewer.defineStyle(this._nextStyleId, rgba);
            this._colorStylesMap[colorHex] = this._nextStyleId;
            this._nextStyleId++;
        });

        const maps = (sources ?? this.getSources()).filter(source => source.channelId == channel.channelId && source.products.length > 0);
        const groups: Record<string, Record<string, number[]>> = {};
        maps.forEach(source => {
            const colorHex = channel.getColor(source.value);
            if (colorHex === undefined) {
                return;
            }

            source.products.forEach(product => {
                const model = String(product.model);
                if (!groups[colorHex]) {
                    groups[colorHex] = {};
                }
                if (!groups[colorHex][model]) {
                    groups[colorHex][model] = [];
                }
                groups[colorHex][model].push(product.id);
            });
        });

        Object.keys(groups).forEach(colorHex => {
            const models = groups[colorHex];
            let style = this._colorStylesMap[colorHex];
            if (style === undefined) {
                const rgba = this.hexToRgba(colorHex);
                this._viewer.defineStyle(this._nextStyleId, rgba);
                style = this._nextStyleId;
                this._colorStylesMap[colorHex] = style;
                this._nextStyleId++;
            }

            Object.keys(models).forEach(model => {
                const products = models[model];
                this._viewer.setStyle(style, products, Number(model));
                this._viewer.addState(State.XRAYVISIBLE, products, Number(model));
            });
        });
    }

    private hexToRgba(hex: string, alpha: number = 1): number[] {
        hex = hex.replace(/^#/, '');
        let r: number, g: number, b: number, a: number;

        if (hex.length === 3) {
            // Handle shorthand notation (e.g., "#03F")
            r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
            g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
            b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
            a = Math.round(alpha * 255); // Default alpha value
        } else if (hex.length === 6) {
            // Handle full notation (e.g., "#0033FF")
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
            a = Math.round(alpha * 255); // Default alpha value
        } else if (hex.length === 8) {
            // Handle full notation with alpha channel (e.g., "#0033FF80")
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
            a = parseInt(hex.substring(6, 8), 16);
        } else {
            const msg = `Invalid hex color '${hex}'`;
            console.error(msg)
            throw new Error(msg);
        }

        return [r, g, b, a];
    }

    private groupBy<T>(array: Array<T>, keyFunc: (item: T) => string): Array<Array<T>> {
        const seed: { [key: string]: T[] } = {};
        const groups = array.reduce((dictionary, item) => {
            const key = keyFunc(item);
            (dictionary[key] = dictionary[item[key]] || []).push(item);
            return dictionary;
        }, seed);

        const resultSeed: Array<Array<T>> = [];
        return Object.keys(groups).reduce((array, key) => { array.push(groups[key]); return array; }, resultSeed);
    };

    public onAfterDraw(width: number, height: number): void {
    }

    public onBeforeDraw(width: number, height: number): void {
    }

    public onBeforeDrawId(): void { }

    public onAfterDrawId(): void { }

    public onAfterDrawModelId(): void { }

}
