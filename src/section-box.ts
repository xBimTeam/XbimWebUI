import { vec3, mat4, quat } from "gl-matrix";

export class SectionBox {
    private _location: vec3;
    private _lengthX: number;
    private _lengthY: number;
    private _lengthZ: number;
    private _rotationX: number;
    private _rotationY: number;
    private _rotationZ: number;
    private _onChange: () => void;

    constructor(onChange: () => void) {
        this.setToInfinity();
        this._onChange = onChange || (() => { });
    }

    public get location(): vec3 { return this._location; }
    public get rotationX(): number { return this._rotationX; }
    public get rotationY(): number { return this._rotationY; }
    public get rotationZ(): number { return this._rotationZ; }
    public get lengthX(): number { return this._lengthX; }
    public get lengthY(): number { return this._lengthY; }
    public get lengthZ(): number { return this._lengthZ; }

    public set location(value: vec3) { this._location = value; this._onChange(); }
    public set rotationX(value: number) { this._rotationX = value; this._onChange(); }
    public set rotationY(value: number) { this._rotationY = value; this._onChange(); }
    public set rotationZ(value: number) { this._rotationZ = value; this._onChange(); }
    public set lengthX(value: number) { this._lengthX = value; this._onChange(); }
    public set lengthY(value: number) { this._lengthY = value; this._onChange(); }
    public set lengthZ(value: number) { this._lengthZ = value; this._onChange(); }

    /**
     * Matrix representation of this box. Can be used for simple test of points.
     */
    public get matrix(): mat4 {
        let trans = mat4.create();
        trans = mat4.rotateX(mat4.create(), trans, - this.rotationX / 180.0 * Math.PI);
        trans = mat4.rotateY(mat4.create(), trans, - this.rotationY / 180.0 * Math.PI);
        trans = mat4.rotateZ(mat4.create(), trans, - this.rotationZ / 180.0 * Math.PI);

        // translation is to be applied as the last transformation
        var move = vec3.scale(vec3.create(), this.location, -1.0);
        trans = mat4.translate(mat4.create(), trans, move);

        var projection = mat4.ortho(mat4.create(), 
         - this.lengthX /2, this.lengthX/2,
         - this.lengthY /2, this.lengthY/2,
         - this.lengthZ /2, this.lengthZ/2
        );

        return mat4.multiply(mat4.create(), projection, trans);
    }

    /**
     * Sets frustum to maximum extens so that it shouldn't cut anything in the view.
     */
    public setToInfinity(): void {
        this._location = vec3.fromValues(0,0,0);
        this._rotationX = this._rotationY = this._rotationZ = 0.0;
        this._lengthX = this._lengthY = this._lengthZ = Number.MAX_VALUE;

        if (this._onChange)
            this._onChange();
    }
}