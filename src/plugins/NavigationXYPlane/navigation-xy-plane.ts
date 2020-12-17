import { mat4, vec3 } from "gl-matrix";
import { Viewer } from "../../viewer";
import { IPlugin } from "../plugin";

export class NavigationXYPlane implements IPlugin
{
    // tslint:disable-next-line:no-empty
    onAfterDrawModelId(): void { }

    // original navigation function
    private _originalNavigate: (type: string, deltaX: number, deltaY: number) => void;
    private _viewer: Viewer;

    // called by the viewer when plugin is added
    init(viewer: Viewer): void {

        // patch the internal implementation (keep binding to the original object)
        this._originalNavigate = viewer.navigate.bind(viewer);
        viewer.navigate = this.navigate.bind(this);

        // keep the reference for the navigation
        this._viewer = viewer;
    }

    /**
     * Use this boolean switch to activate and deactivate the plugin. This will supposingly be bound to 
     * some user interaction (like a button in the toolbar).
     * @member {boolean} NavigationXYPlane#isActive
     * */
    private _isActive = false;
    public get isActive(): boolean { return this._isActive; }
    public set isActive(value: boolean) { this._isActive = value; }

    /**
     * When a vertical angle from horizontal plane is bigger than this, default navigation is used.
     * The default is 60 degrees. Applies for both up and down looking angles.
     * @member {number} NavigationXYPlane#bowLimit
     * */
    private _bowLimit = 60.0;
    public get bowLimit(): number { return this._bowLimit; }
    public set bowLimit(value: number) { this._bowLimit = value; }

    /**
     * By default this is 1.0. Make this bigger to speed the movement up or make it smaller to slow it down
     * @member {number} NavigationXYPlane#speedFactor
     * */
    private _speedFactor = 1.0;
    public get speedFactor(): number { return this._speedFactor; }
    public set speedFactor(value: number ){ this._speedFactor = value; }


    private navigate(type: string, deltaX: number, deltaY: number) {
        // this is not active or it is not a zoom operation so call the original implementation
        if (!this.isActive || type !== 'zoom') {
            this._originalNavigate(type, deltaX, deltaY);
            return;
        }

        // transform [0,0,1] direction from view space to model space
        const pMatrix = this._viewer.pMatrix;
        const mvMatrix = this._viewer.mvMatrix;

        const transform = mat4.multiply(mat4.create(), pMatrix, mvMatrix);
        const inv = mat4.invert(mat4.create(), transform);

        // direction in model space
        let dir = vec3.transformMat4(vec3.create(), vec3.fromValues(0, 0, 1), inv);

        // calculate bow angle
        const xy = Math.sqrt(dir[0] * dir[0] + dir[1] * dir[1]);
        const z = Math.abs(dir[2]);

        // check for singularity
        let bow = 0.0;
        if (xy < 1e-5) {
            bow = Math.PI / 2.0;
        }
        else {
            bow = Math.atan(z / xy);
        }

        // if the view direction is more than BowLimit from the horizontal view,
        // navigate as usual.
        if (bow > this.bowLimit * Math.PI / 180) {
            this._originalNavigate(type, deltaX, deltaY);
            return;
        }

        // project to XY plane in model space and normalize;
        dir[2] = 0;
        dir = vec3.normalize(vec3.create(), dir);

        // scale by the factor and navigation
        const meter = this._viewer.unitsInMeter;
        const sign = (deltaY >= 0 ? 1 : -1) * (deltaX >= 0 ? 1 : -1);
        const factor = this.speedFactor * meter * sign;
        dir = vec3.scale(vec3.create(), dir, factor);

        // set the actual model view matrix for rendering
        this._viewer.mvMatrix = mat4.translate(mat4.create(), mvMatrix, dir);
    }

    // tslint:disable-next-line:no-empty
    public onBeforeDraw(): void { }

    // tslint:disable-next-line:no-empty
    public onAfterDraw(): void { }

    // tslint:disable-next-line:no-empty
    public onBeforeDrawId(): void { }

    // tslint:disable-next-line:no-empty
    public onAfterDrawId(): void { }

    public onBeforeGetId(id: number): boolean {
        return false;
    }

    public onBeforePick(id: number): boolean {
        return false;
    }
}