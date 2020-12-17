import { mat4 } from "gl-matrix";

export class CameraProperties {

    /**
     * 
     */
    constructor(changeHandler: () => void) {
        this.onChange = changeHandler || (() => { return; });
    }

    private _fov = 45;
    private _near: number;
    private _far: number;
    private _height: number;
    private _type: CameraType = CameraType.PERSPECTIVE;

    public get fov(): number { return this._fov; }
    public set fov( value: number) { 
        if (value == null || value <= 0 || value > 180)
            throw new Error('Perspective field of view has to be a positive number between 0 and 180 degrees');
        this._fov = value; 
        if (this.onChange && this.type === CameraType.PERSPECTIVE) { this.onChange(); }
    }

    public get near(): number { return this._near; }
    public set near( value: number) { this._near = value; if (this.onChange) { this.onChange(); }}

    public get far(): number { return this._far; }
    public set far( value: number) { this._far = value; if (this.onChange) { this.onChange(); }}

    public get height(): number { return this._height; }
    public set height( value: number) { 
        if (value == null || value <= 0)
            throw new Error('Orthographic view height has to be a positive number');
        this._height = value; 
        if (this.onChange  && this.type === CameraType.ORTHOGONAL) { this.onChange(); }
    }

    public get type(): CameraType {return this._type; }
    public set type(value: CameraType) { this._type = value; if (this.onChange) { this.onChange(); }}

    public onChange = () => { return; };

    public getProjectionMatrix(width: number, height: number): mat4 {
        const aspect = width / height;
        //set up cameras
        switch (this.type) {
            case CameraType.PERSPECTIVE:
                return mat4.perspective(mat4.create(),
                    this.fov * Math.PI / 180.0,
                    aspect,
                    this.near,
                    this.far);
            case CameraType.ORTHOGONAL:
                const h = this.height;
                const w = h * aspect;
                return mat4.ortho(mat4.create(), w / -2, w / 2, h / -2, h / 2,
                    this.near,
                    this.far);
            default:
                throw new Error('Undefined camera type');
        }
    }
}

export enum CameraType {
    PERSPECTIVE = 0,
    ORTHOGONAL = 1
}
