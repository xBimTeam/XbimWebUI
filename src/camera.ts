export class CameraProperties {

    /**
     * 
     */
    constructor(changeHandler: () => void) {
        this.onChange = changeHandler || (() => {});
    }

    private _fov = 45;
    private _near: number;
    private _far: number;
    private _width: number;

    public get fov(): number { return this._fov; }
    public get near(): number { return this._near; }
    public get far(): number { return this._far; }
    public get width(): number { return this._width; }

    public set fov( value: number) { this._fov = value; if (this.onChange) { this.onChange() }}
    public set near( value: number) { this._near = value; if (this.onChange) { this.onChange() }}
    public set far( value: number) { this._far = value; if (this.onChange) { this.onChange() }}
    public set width( value: number) { this._width = value; if (this.onChange) { this.onChange() }}

    public onChange = () => {};
}