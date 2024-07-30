export class HeatmapSource {
    private _id: string;
    private _modelId: number;
    private _productId: number;
    private _channelId: string;
    private _value: any;

    constructor(id: string, modelId: number, productId: number, channelId: string, value: any) {
        this._id = id;
        this._modelId = modelId;
        this._productId = productId;
        this._channelId = channelId;
        this._value = value;
    }

    public get id(): string {
        return this._id;
    }

    public get modelId(): number {
        return this._modelId;
    }

    public get productId(): number {
        return this._productId;
    }

    public get channelId(): string {
        return this._channelId;
    }

    public get value(): any {
        return this._value;
    }

    public set value(value: any) {
        this._value = value;
    }
}
