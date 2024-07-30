export class Icon {
    private _modelId: number;
    private _productId: number;
    private _xyz: Float32Array;
    private _imageData: string;
    private _description: string;
    private _name: string;
    private _width: number;
    private _height: number;
    private _onIconSelected: () => void;
    
    /**
     * Creates an instance of Icon.
     * 
     * @param {string} name - The name of the icon.
     * @param {string} description - A brief description of the icon.
     * @param {number} modelId - The model ID associated with the icon.
     * @param {number} productId - The product ID associated with the icon.
     * @param {string} imageData - Base64 encoded image data for the icon.
     * @param {Float32Array} [xyz=null] - The XYZ coordinates for the icon. If not provided, the centroid of the product bounding box is used.
     * @param {number | null} [width=null] - The width of the icon. If null, default width is used.
     * @param {number | null} [height=null] - The height of the icon. If null, default height is used.
     * @param {() => void} [onIconSelected=null] - Callback function to be executed when the icon is selected.
     * @example
     * const icon = new Icon('Sample Icon', 'This is a sample icon.', 1, 101, 'imageDataString', 100, 100, () => console.log('Icon selected'));
     */
    constructor(name: string, description: string, modelId: number, productId: number, imageData: string, xyz: Float32Array = null, width: number | null = null, height: number | null = null, onIconSelected: () => void = null) {
        this._modelId = modelId;
        this._productId = productId;
        this._imageData = imageData;
        this._xyz = xyz;
        this._name = name;
        this._description = description;
        this._width = width;
        this._height = height;
        this._onIconSelected = onIconSelected;
    }

    public get modelId(): number {
        return this._modelId;
    }

    public get productId(): number {
        return this._productId;
    }

    public get xyz(): Float32Array {
        return this._xyz;
    }

    public set xyz(value: Float32Array) {
         this._xyz = value;
    }

    public get imageData(): string {
        return this._imageData;
    }

    public set imageData(value: string) {
        this._imageData = value;
    }

    public get name(): string {
        return this._name;
    }

    public set name(value: string) {
        this._name = value;
    }

    public get description(): string {
        return this._description;
    }

    public set description(value: string) {
        this._description = value;
    }

    public get width(): number {
        return this._width;
    }

    public set width(value: number) {
        this._width = value;
    }

    public get height(): number {
        return this._height;
    }

    public set height(value: number) {
        this._height = value;
    }

    public get onIconSelected(): () => void {
        return this._onIconSelected;
    }
}
