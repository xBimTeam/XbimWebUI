import { vec3, mat4, mat3, quat } from "gl-matrix";
import { ClippingPlane } from "./bcf";

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
        this._onChange = () => {
            // clear any cached objects
            this._lastWcs = null;
            this._lastBBox = null;

            if (onChange) {
                onChange();
            }
        };
    }

    public get location(): vec3 { return this._location; }
    public set location(value: vec3) { this._location = value; this._onChange(); }

    public get rotationX(): number { return this._rotationX; }
    public set rotationX(value: number) { this._rotationX = value; this._onChange(); }

    public get rotationY(): number { return this._rotationY; }
    public set rotationY(value: number) { this._rotationY = value; this._onChange(); }

    public get rotationZ(): number { return this._rotationZ; }
    public set rotationZ(value: number) { this._rotationZ = value; this._onChange(); }

    public get lengthX(): number { return this._lengthX; }
    public set lengthX(value: number) { this._lengthX = value; this._onChange(); }

    public get lengthY(): number { return this._lengthY; }
    public set lengthY(value: number) { this._lengthY = value; this._onChange(); }

    public get lengthZ(): number { return this._lengthZ; }
    public set lengthZ(value: number) { this._lengthZ = value; this._onChange(); }


    /**
     * Matrix representation of this box. Can be used for simple test of points.
     */
    public getMatrix(wcs: vec3): mat4 {
        let trans = mat4.create();
        trans = mat4.rotateX(mat4.create(), trans, - this.rotationX / 180.0 * Math.PI);
        trans = mat4.rotateY(mat4.create(), trans, - this.rotationY / 180.0 * Math.PI);
        trans = mat4.rotateZ(mat4.create(), trans, - this.rotationZ / 180.0 * Math.PI);

        // move location to defined WCS (reduce)
        const location = vec3.subtract(vec3.create(), this.location, wcs)

        // translation is to be applied as the last transformation
        var move = vec3.scale(vec3.create(), location, -1.0);
        trans = mat4.translate(mat4.create(), trans, move);

        var projection = mat4.ortho(mat4.create(),
            - this.lengthX / 2, this.lengthX / 2,
            - this.lengthY / 2, this.lengthY / 2,
            - this.lengthZ / 2, this.lengthZ / 2
        );

        return mat4.multiply(mat4.create(), projection, trans);
    }

    /**
     * True when section box is set, false otherwise
     */
    public get isSet(): boolean {
        return Number.isFinite(this._lengthX);
    }

    /**
     * Alias for setToInfinity(). Makes the section box infinitely large so it doesn't crop anything in the view
     */
    public clear(): void {
        this.setToInfinity();
    }

    /**
     * Sets frustum to maximum extens so that it shouldn't cut anything in the view.
     */
    public setToInfinity(): void {
        this._location = vec3.fromValues(0, 0, 0);
        this._rotationX = this._rotationY = this._rotationZ = 0.0;
        this._lengthX = this._lengthY = this._lengthZ = Number.MAX_SAFE_INTEGER;

        if (this._onChange)
            this._onChange();
    }

    /**
     * Sets all values for section box in one go as a copy from supplied box
     * @param box Section box values to be used
     */
    public setToBox(box: SectionBox) {
        this._location = vec3.clone(box.location);
        this._lengthX = box._lengthX;
        this._lengthY = box._lengthY;
        this._lengthZ = box._lengthZ;
        this._rotationX = box._rotationX;
        this._rotationY = box._rotationY;
        this._rotationZ = box._rotationZ;

        if (this._onChange) this._onChange();
    }

    public setToBoundingBox(box: ArrayLike<number>) {
        this._location = vec3.fromValues(box[0] + box[3] / 2.0, box[1] + box[4] / 2.0, box[2] + box[5] / 2.0);
        this._lengthX = box[3];
        this._lengthY = box[4];
        this._lengthZ = box[5];
        this._rotationX = 0;
        this._rotationY = 0;
        this._rotationZ = 0;

        if (this._onChange) this._onChange();
    }

    /**
     * Computes section box from 6 clipping planes if these form a box
     * @param planes 6 clipping planes representing the box
     * @returns {boolean} true if succeeded, false if planes don't form a box
     */
    public setToPlanes(planes: ClippingPlane[]): boolean {
        if (planes == null || planes.length !== 6)
            throw new Error('Invalid input: box has to be defined by 3 clipping planes');

        var results: { plane: ClippingPlane, points: vec3[] }[] = [];
        const points: vec3[] = [];

        for (let i = 0; i < 6; i++) {
            const planeA = planes[i];
            for (let j = i + 1; j < 6; j++) {
                const planeB = planes[j];
                if (!this.areOrthogonal(planeA, planeB)) continue;
                for (let k = j + 1; k < 6; k++) {
                    const planeC = planes[k];
                    if (!this.areOrthogonal(planeA, planeC)) continue;
                    if (!this.areOrthogonal(planeB, planeC)) continue;

                    // we have three perpendicular planes now which should have one common intersection point
                    const nA = planeA.direction;
                    const nB = planeB.direction;
                    const nC = planeC.direction;

                    const pA = planeA.location;
                    const pB = planeB.location;
                    const pC = planeC.location;

                    const dA = this.getDparam(nA, pA);
                    const dB = this.getDparam(nB, pB);
                    const dC = this.getDparam(nC, pC);

                    const D = vec3.fromValues(-dA, -dB, -dC);
                    const A = mat3.fromValues(
                        nA[0], nB[0], nC[0],
                        nA[1], nB[1], nC[1],
                        nA[2], nB[2], nC[2]);
                    const det = mat3.determinant(A);
                    if (Math.abs(det) < 1e-6) {
                        console.warn('Singular system of linear equations. Intersection point for section box can\'t be computed');
                        continue;
                    }
                    const Ainv = mat3.invert(mat3.create(), A);
                    const X = vec3.transformMat3(vec3.create(), D, Ainv);

                    points.push(X);
                    this.addPointToResults(results, planeA, X);
                    this.addPointToResults(results, planeB, X);
                    this.addPointToResults(results, planeC, X);
                }
            }
        }

        // we should have 8 points by now
        if (points.length !== 8) {
            console.warn('Section box based on clipping planes should have exactly 8 intersection points');
            return false;
        }

        const location = this.getCentroid(points);
        const sizeX = this.getSize(results[0].plane, planes);
        const sizeY = this.getSize(results[1].plane, planes);
        const sizeZ = this.getSize(results[2].plane, planes);

        if (sizeX == null || sizeY == null || sizeZ == null) {
            console.warn('Section box based on clipping planes should have always two planes pointing to opposite direction');
            return false;
        }

        const Xdir = vec3.normalize(vec3.create(), results[0].plane.direction);
        const Ydir = vec3.normalize(vec3.create(), results[1].plane.direction);
        const Zdir = vec3.normalize(vec3.create(), results[2].plane.direction);
        const rotation = quat.setAxes(quat.create(), vec3.negate(vec3.create(), Zdir), Xdir, Ydir);

        // get roll (X), pitch (Y) and yaw (Z) euler angles
        // https://en.wikipedia.org/wiki/Conversion_between_quaternions_and_Euler_angles
        const angles = this.toEulerAngles(rotation);

        // set values
        this._location = location;
        this._lengthX = sizeX;
        this._lengthY = sizeY;
        this._lengthZ = sizeZ;
        this._rotationX = angles.roll * 180.0 / Math.PI;
        this._rotationY = angles.pitch * 180.0 / Math.PI;
        this._rotationZ = -angles.yaw * 180.0 / Math.PI;

        // invoke change annotation
        if (this._onChange) {
            this._onChange();
        }

        // return true when clipping planes were interpreted as a section box
        return true;
    }

    private getSize(plane: ClippingPlane, planes: ClippingPlane[]): number {
        const opposite = planes.filter(p => this.isOpposite(plane.direction, p.direction)).pop();
        if (opposite == null)
            return null;

        const a = opposite.direction[0];
        const b = opposite.direction[1];
        const c = opposite.direction[2];
        const d = this.getDparam(opposite.direction, opposite.location);

        const x = plane.location[0];
        const y = plane.location[1];
        const z = plane.location[2];

        var distance = Math.abs(a * x + b * y + c * z + d) / vec3.length(opposite.direction);
        return distance;
    }

    private toEulerAngles(q: quat): { roll: number, pitch: number, yaw: number } {
        const qx = q[0];
        const qy = q[1];
        const qz = q[2];
        const qw = q[3];

        // roll (x-axis rotation)
        const sinr_cosp = 2 * (qw * qx + qy * qz);
        const cosr_cosp = 1 - 2 * (qx * qx + qy * qy);
        const roll = Math.atan2(sinr_cosp, cosr_cosp);

        // pitch (y-axis rotation)
        const sinp = 2 * (qw * qy - qz * qx);
        let pitch: number = null;
        if (Math.abs(sinp) >= 1)
            pitch = Math.PI / 2 * Math.sign(sinp); // use 90 degrees if out of range
        else
            pitch = Math.asin(sinp);

        // yaw (z-axis rotation)
        const siny_cosp = 2 * (qw * qz + qx * qy);
        const cosy_cosp = 1 - 2 * (qy * qy + qz * qz);
        const yaw = Math.atan2(siny_cosp, cosy_cosp);

        return { roll, pitch, yaw };
    }

    private isOpposite(a: number[], b: number[]) {
        var angle = vec3.angle(a, b);
        return Math.abs(angle - Math.PI) < 1e-2; //tolerance of approx. 0.6 degree
    }

    private getCentroid(points: vec3[]): vec3 {
        const sum = points.reduce((previous, current) => vec3.add(vec3.create(), previous, current));
        return vec3.scale(vec3.create(), sum, 1 / points.length);
    }

    private addPointToResults(results: { plane: ClippingPlane, points: vec3[] }[], plane: ClippingPlane, point: vec3): void {
        var result = results.filter(r => r.plane === plane).pop();
        if (result == null) {
            result = {
                plane: plane,
                points: []
            };
            results.push(result);
        }
        result.points.push(point);
    }

    private getDparam(normal: ArrayLike<number>, point: ArrayLike<number>) {
        return -normal[0] * point[0] - normal[1] * point[1] - normal[2] * point[2];
    }

    private areOrthogonal(a: ClippingPlane, b: ClippingPlane): boolean {
        var angle = vec3.angle(a.direction, b.direction);
        return Math.abs(angle - Math.PI / 2.0) < 1e-2; 
    }

    private _lastWcs: vec3;
    private _lastBBox: Float32Array;

    /**
     * Returns bounding box of the section box. This is usefull for
     * zooming and similar operations
     */
    public getBoundingBox(wcs: vec3): Float32Array {
        // return cached value if available and if WCS hasn't changed
        if (this._lastBBox && this._lastWcs && vec3.distance(this._lastWcs, wcs) < 1e-6) {
            return this._lastBBox;
        }

        const dx = this.lengthX / 2.0;
        const dy = this.lengthY / 2.0;
        const dz = this.lengthZ / 2.0;

        //create box vertices in local coordinates
        const local = [
            [- dx, - dy, - dz],
            [- dx, - dy, + dz],
            [- dx, + dy, - dz],
            [- dx, + dy, + dz],
            [+ dx, - dy, - dz],
            [+ dx, - dy, + dz],
            [+ dx, + dy, - dz],
            [+ dx, + dy, + dz]
        ];

        // reduce by wcs displacement
        const loc = vec3.subtract(vec3.create(), this.location, wcs);

        // create transformation from rotation and translation
        let m = mat4.create();
        m = mat4.rotateX(mat4.create(), m, this.rotationX * Math.PI / 180.0);
        m = mat4.rotateY(mat4.create(), m, this.rotationY * Math.PI / 180.0);
        m = mat4.rotateZ(mat4.create(), m, this.rotationZ * Math.PI / 180.0);
        m = mat4.translate(mat4.create(), m, loc);

        // transform section box vertices to real placement and rotation
        const vertices = local.map(v => vec3.transformMat4(vec3.create(), v, m));

        // get minimumm and maximum coordinates
        const min = vertices.reduce((previous, current) =>
            vec3.fromValues(
                Math.min(previous[0], current[0]),
                Math.min(previous[1], current[1]),
                Math.min(previous[2], current[2])
            ));
        const max = vertices.reduce((previous, current) =>
            vec3.fromValues(
                Math.max(previous[0], current[0]),
                Math.max(previous[1], current[1]),
                Math.max(previous[2], current[2])
            ));

        // return axis aligned bounding box of the section box
        this._lastWcs = wcs;
        this._lastBBox = new Float32Array([min[0], min[1], min[2], max[0] - min[0], max[1] - min[1], max[2] - min[2]]);
        return this._lastBBox;
    }
}