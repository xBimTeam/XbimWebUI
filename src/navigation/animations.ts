import { Viewer } from "../viewer";
import { mat4, vec3, quat } from "gl-matrix";
import { stat } from "fs";

export enum EasingType {
    LINEAR,
    SINUS,
    SINUS2,
    CIRCLE
}

export class Animations {

    private requestAnimationFrame: (callback: FrameRequestCallback) => number;
    private setTimeout: (callback: () => void, offset: number) => void;

    /**
     * Constructor to handle all animations
     */
    constructor(private viewer: Viewer) {
        // monkey patching protection
        this.setTimeout = window.setTimeout.bind(window);
        this.requestAnimationFrame = (window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window["mozRequestAnimationFrame"] ||
            window["oRequestAnimationFrame"] ||
            window["msRequestAnimationFrame"] ||
            function (/* function FrameRequestCallback */ callback: () => void) {
                window.setTimeout(callback, 1000 / 60);
            }).bind(window);
    }

    private _rotationOn: boolean = false;
    public startRotation(): Promise<void> {
        if (this._rotationOn) {
            return new Promise<void>((a, r) => { a(); });
        }
        this._rotationOn = true;
        return new Promise<void>((a, r) => {
            let rotate = () => {
                if (!this._rotationOn) {
                    a();
                    return;
                }
                this.viewer.mvMatrix = mat4.rotateZ(mat4.create(), this.viewer.mvMatrix, 0.2 * Math.PI / 180.0);
                this.requestAnimationFrame(rotate);
            };
            rotate();
        });
    }

    public stopRotation(): void {
        this._rotationOn = false;
    }

    private static viewQueue: object[] = [];
    /**
     * Animates transition from the current view to target view
     * 
     * @param end Target model view matrix
     * @param duration Duration of the transition in milliseconds
     */
    public viewTo(end: mat4, duration: number, easing: EasingType = EasingType.SINUS2): Promise<void> {
        return new Promise<void>((resolve, reject) => {

            if (duration <= 0) { // no animation needed.
                this.viewer.mvMatrix = end;
                resolve();
                return;
            }

            let start: mat4 = null;
            let startRotation: quat = null;
            let startScale: vec3 = null;
            let startTranslation: vec3 = null;
            let startTime: number = 0;

            let endRotation = mat4.getRotation(quat.create(), end);
            let endScale = mat4.getScaling(vec3.create(), end);
            let endTranslation = mat4.getTranslation(vec3.create(), end);

            const id = {};
            Animations.viewQueue.push(id);
            let initialised = false;
            let step = () => {
                if (Animations.viewQueue[0] != id) {
                    // not our run, just wait, try again later
                    this.requestAnimationFrame(step);
                    return;
                }
                const now = Date.now();
                if (!initialised || now < (startTime + duration)) {
                    if (!initialised) {
                        // get current start
                        start = mat4.copy(mat4.create(), this.viewer.mvMatrix);
                        startRotation = mat4.getRotation(quat.create(), start);
                        startScale = mat4.getScaling(vec3.create(), start);
                        startTranslation = mat4.getTranslation(vec3.create(), start);
                        initialised = true;
                        startTime = Date.now();

                        if (mat4.equals(start, end)) { // nothing to do - dequeue and quit
                            Animations.viewQueue.shift();
                            resolve();
                            return;
                        }
                    }
                    let state = (now - startTime) / duration;

                    // apply easing in and out
                    switch (easing) {
                        case EasingType.LINEAR:
                            break;
                        case EasingType.CIRCLE:
                            state = this.getCircleEasing(state);
                            break;
                        case EasingType.SINUS:
                            state = this.getSinEasing(state);
                            break;
                        case EasingType.SINUS2:
                            state = this.getSinEasing(state);
                            state = this.getSinEasing(state);
                            break;
                        default:
                            break;
                    }

                    let rotation = quat.slerp(quat.create(), startRotation, endRotation, state);
                    let scale = vec3.lerp(vec3.create(), startScale, endScale, state);
                    let translation = vec3.lerp(vec3.create(), startTranslation, endTranslation, state);

                    let mv = mat4.fromRotationTranslationScaleOrigin(mat4.create(), rotation, translation, scale, vec3.create());
                    this.viewer.mvMatrix = mv;

                    this.requestAnimationFrame(step);
                } else { // set exact value, remove from the queue and quit
                    this.viewer.mvMatrix = end;
                    Animations.viewQueue.shift();
                    resolve();
                    return;
                }
            };

            // start
            step();
        });


    }

    private static zoomQueue: Array<{ mv: mat4, width: number }> = [];
    /**
     * Animates transition from the current view to target view
     * 
     * @param end Target model view matrix
     * @param duration Duration of the transition in milliseconds
     */
    public addZoom(distance: number, duration: number): Promise<void> {
        // current model view
        let currentMv = mat4.copy(mat4.create(), this.viewer.mvMatrix);
        let currentWidth = this.viewer.cameraProperties.width;

        // if there is an animation in progress, zoom should start where that ends
        if (Animations.zoomQueue.length > 0) {
            const current = Animations.zoomQueue[Animations.zoomQueue.length - 1];
            currentMv = current.mv;
            currentWidth = current.width;
        }

        // get zoom direction
        const inv = mat4.invert(mat4.create(), currentMv);
        const rotation = mat4.getRotation(quat.create(), inv);
        const cameraDirection = vec3.transformQuat(vec3.create(), vec3.fromValues(0, 0, -1), rotation);
        const zoomDirection = vec3.negate(vec3.create(), cameraDirection);
        const move = vec3.scale(vec3.create(), zoomDirection, distance);
        const fov = this.viewer.cameraProperties.fov * Math.PI / 180.0;
        let deltaWidth =  2.0 * distance * Math.tan(fov / 2.0);
        const oneMeter = this.viewer.unitsInMeter;

        // avoid singularity where width is negative and image is flipped.
        if ((currentWidth - deltaWidth) <  oneMeter)
            deltaWidth = 0;

        // final state
        const end = { 
            mv: mat4.translate(mat4.create(), currentMv, move), 
            width: currentWidth - deltaWidth
         };


        return new Promise<void>((resolve, reject) => {
            if (duration <= 0) { // no animation needed.
                Animations.zoomQueue = [];
                this.viewer.mvMatrix = end.mv;
                this.viewer.cameraProperties.width = end.width;
                resolve();
                return;
            }

            let startTime: number = Date.now();
            let endTranslation = move;

            Animations.zoomQueue.push(end);
            let step = () => {
                if (Animations.zoomQueue[0] != end) {
                    // check we are in the queue
                    var exist = Animations.zoomQueue.filter(m => m == end).pop() != null;
                    if (!exist)
                        return;

                    // not our run, just wait, try again later
                    this.requestAnimationFrame(step);
                    return;
                }
                const now = Date.now();
                if (now < (startTime + duration)) {

                    let state = (now - startTime) / duration;
                    let translation = vec3.lerp(vec3.create(), vec3.create(), endTranslation, state);
                    let delta = deltaWidth * state;

                    // set position and perspective width
                    this.viewer.mvMatrix = mat4.translate(mat4.create(), currentMv, translation);
                    this.viewer.cameraProperties.width = currentWidth - delta;

                    this.requestAnimationFrame(step);
                } else { // set exact value, remove from the queue and quit
                    this.viewer.mvMatrix = end.mv;
                    this.viewer.cameraProperties.width = end.width;
                    Animations.zoomQueue.shift();
                    resolve();
                    return;
                }
            };

            // start
            step();
        });


    }

    /**
     * Returns easing spread over circular path
     * 
     * @param value value between 0.0 and 1.0
     */
    private getCircleEasing(value: number): number {
        // x2 + y2 = r2, r = 1
        // y = Math.sqtr(r2 - x2)
        if (value <= 0.5) {
            const period = value * 2.0;
            const y = Math.sqrt(1 - period * period);
            return (1.0 - y) / 2.0;
        } else {
            const period = value * 2.0 - 2.0;
            const y = Math.sqrt(1 - period * period);
            return (1.0 + y) / 2.0;
        }
    }

    private getSinEasing(value: number): number {
        // apply easing in and out using sinus
        let period = value * Math.PI - Math.PI / 2.0;
        return Math.sin(period) * 0.5 + 0.5;
    }
}
