import { Icons } from './icons'

/**
 * Represents an icon that can be rendered using the Icons plugin
 * 
 * @see Icons
 */
export class Icon {
    private _products: { id: number, model: number }[] | null;
    private _location: Float32Array;
    private _imageData: string;
    private _description: string;
    private _valueReadout: string;
    private _valueFormatted: string | null = null;
    private _name: string;
    private _width: number;
    private _height: number;
    private _value: unknown;
    private _unit: string;
    private _enabled: boolean;
    private _displayValue: boolean;
    private _onIconSelected: () => void;
    
    private _movementQueue: Array<{ location: Float32Array; speed: number }> = [];
    private _isMoving: boolean = false;

    /**
     * Creates an instance of Icon.
     * 
     * @param {string} name - The name of the icon.
     * @param {string} description - A brief description of the icon.
     * @param {string | null} valueReadout - A value readout of the icon.
     * @param {number} products - The products associated with the icon.
     * @param {string} imageData - Base64 encoded image data for the icon.
     * @param {Float32Array | null} [location=null] - The XYZ coordinates for the icon location. If not provided, the centroid of the product bounding box is used.
     * @param {number | null} [width=null] - The width of the icon. If null, default width is used.
     * @param {number | null} [height=null] - The height of the icon. If null, default height is used.
     * @param {() => void} [onIconSelected=null] - Callback function to be executed when the icon is selected.
     * @param {boolean} [displayValue=true] - Whether the value should be displayed for this icon
     * @example
     * const icon = new Icon('Sample Icon', 'This is a sample icon.', 1, 101, 'imageDataString', new Float32Array([0, 0, 0]), 100, 100, () => console.log('Icon selected'));
     */
    constructor(
        name: string,
        description: string,
        valueReadout: string | null,
        products: { id: number, model: number }[] | null,
        imageData: string | null,
        location: Float32Array | null = null,
        width: number | null = null,
        height: number | null = null,
        onIconSelected: () => void = null,
        displayValue: boolean = true,
        value: any = undefined,
        unit: string = ''
    ) {
        this._products = products;
        this._imageData = imageData;
        this._location = location;
        this._name = name;
        this._description = description;
        this._valueReadout = valueReadout;
        this._width = width;
        this._height = height;
        this._value = value;
        this._unit = unit;
        this._onIconSelected = onIconSelected;
        this._displayValue = displayValue;
        this._enabled = true;
    }

    /**
     * Gets the products associated with the icon.
     * @returns {{ id: number, model: number }[] } The products.
     */
    public get products(): { id: number, model: number }[] | null {
        return this._products;
    }

    /**
     * Sets the products associated with the icon.
     * @param {any} value - The new products.
     */
    public set products(products: { id: number, model: number }[] | null){
        this._products = products;
    }

    /**
     * Gets the location of the icon.
     * @returns {Float32Array} The XYZ coordinates of the icon.
     */
    public get location(): Float32Array {
        return this._location;
    }

    /**
     * Sets the location of the icon.
     * @param {Float32Array} value - The new XYZ coordinates for the icon.
     */
    public set location(value: Float32Array) {
         this._location = value;
    }

    /**
     * Gets the Base64 encoded image data of the icon.
     * @returns {string} The Base64 encoded image data.
     */
    public get imageData(): string {
        return this._imageData;
    }

    /**
     * Sets the Base64 encoded image data of the icon.
     * @param {string} value - The new Base64 encoded image data.
     */
    public set imageData(value: string) {
        this._imageData = value;
    }

    /**
     * Gets the name of the icon.
     * @returns {string} The name of the icon.
     */
    public get name(): string {
        return this._name;
    }

    /**
     * Sets the name of the icon.
     * @param {string} value - The new name of the icon.
     */
    public set name(value: string) {
        this._name = value;
    }

    /**
     * Gets the description of the icon.
     * @returns {string} The description of the icon.
     */
    public get description(): string {
        return this._description;
    }

    /**
     * Sets the description of the icon.
     * @param {string} value - The new description of the icon.
     */
    public set description(value: string) {
        this._description = value;
    }

    /**
     * Gets the value readout of the icon.
     * @returns {string} The value readout of the icon.
     */
    public get valueReadout(): string {
        return this._valueReadout;
    }

    /**
     * Sets the value readout of the icon.
     * @param {string} value - The new value readout of the icon.
     */
    public set valueReadout(value: string) {
        this._valueReadout = value;
    }

    /**
     * Gets the overlay text for the icon. Can include Html elements.
     * @returns {string} The value readout of the icon.
     */
    public get overlayValue(): string {
        return this._valueFormatted;
    }

    /**
     * Sets the overlay text for the icon. Can include Html elements.
     * @param {string} value - The new value readout of the icon.
     */
    public set overlayValue(value: string) {
        this._valueFormatted = value;
    }


    /**
     * Gets the width of the icon.
     * @returns {number} The width of the icon.
     */
    public get width(): number {
        return this._width;
    }

    /**
     * Sets the width of the icon.
     * @param {number} value - The new width of the icon.
     */
    public set width(value: number) {
        this._width = value;
    }

    /**
     * Gets the height of the icon.
     * @returns {number} The height of the icon.
     */
    public get height(): number {
        return this._height;
    }

    /**
     * Sets the height of the icon.
     * @param {number} value - The new height of the icon.
     */
    public set height(value: number) {
        this._height = value;
    }

    public get value(): any {
        return this._value;
    }

    public set value(value: any) {
        this._value = value;
    }

    public get unit(): string {
        return this._unit;
    }

    public set unit(unit: string) {
        this._unit = unit;
    }

    /**
     * Gets the callback function to be executed when the icon is selected.
     * @returns {() => void} The callback function.
     */
    public get onIconSelected(): () => void {
        return this._onIconSelected;
    }

    /**
     * Gets a boolean value indicating if this icon is enabled
     * @returns {boolean} a value indicates if this icon is enabled.
     */
    public get isEnabled(): boolean {
        return this._enabled;
    }

     /**
     * Sets if this icon is enabled or not
     * @param {boolean} value - a value indicates if this icon is enabled.
     */
    public set isEnabled(value: boolean) {
        this._enabled = value;
    }

    /**
     * Gets a boolean value indicating if this value is displayed
     * @returns {boolean} a value indicates if this value is displayed.
     */
    public get isValueDisplayed(): boolean {
        return this._displayValue;
    }

     /**
     * Sets if this value should be displayed or not
     * @param {boolean} value - a value indicates if this value is displayed.
     */
    public set isValueDisplayed(value: boolean) {
        this._displayValue = value;
    }

    /**
     * Gets the movement queue for the icon.
     * @returns {Array<{ location: Float32Array; speed: number }>} The queue of movements.
     */
    public get movementQueue(): Array<{ location: Float32Array; speed: number }> {
        return this._movementQueue;
    }

    /**
     * Adds a movement task to the queue.
     * @param {Float32Array} location - The target location.
     * @param {number} speed - The speed of the movement.
     */
    public addMovementToQueue(location: Float32Array, speed: number): void {
        this._movementQueue.push({ location, speed });
    }

    /**
     * Clears the movement queue.
     */
    public clearMovementQueue(): void {
        this._movementQueue = [];
    }

    /**
     * Gets whether the icon is currently moving.
     * @returns {boolean} True if the icon is moving, otherwise false.
     */
    public get isMoving(): boolean {
        return this._isMoving;
    }

    /**
     * Sets whether the icon is currently moving.
     * @param {boolean} value - True to set the icon as moving, otherwise false.
     */
    public set isMoving(value: boolean) {
        this._isMoving = value;
    }
}

export class ClusterIcon extends Icon {
    public categoryColor: string | null = null;

    constructor(
        name: string,
        description: string,
        valueReadout: string | null,
        products: { id: number, model: number }[] | null,
        imageData: string | null,
        location: Float32Array | null = null,
        width: number | null = null,
        height: number | null = null,
        onIconSelected: () => void = null,
        displayValue: boolean = true,
        value: unknown = undefined,
        unit: string = ''
    ) {
        super(
            name,
            description,
            valueReadout,
            products,
            imageData,
            location,
            width,
            height,
            onIconSelected,
            displayValue,
            value,
            unit
        );
    }
}
