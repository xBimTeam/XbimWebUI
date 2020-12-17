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

        // stop animations when user starts any interaction
        viewer.canvas.addEventListener('mousedown', () => this.clear());
        viewer.canvas.addEventListener('touchstart', () => this.clear());
    }

    /**
     * Stops all animations and clears the queues
     */
    public clear(): void {
        Animations.viewQueue = [];
        Animations.zoomQueue = [];
        this._rotationOn = false;
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

    private static viewQueue: { mv: mat4, height: number }[] = [];

    /**
     * Animates transition from the current view to target view. Animations are queued and execuded in sequence.
     * 
     * @param end Target model view matrix
     * @param duration Duration of the transition in milliseconds
     */
    public viewTo(end: { mv: mat4, height: number }, duration: number, easing: EasingType = EasingType.SINUS2): Promise<void> {
        return new Promise<void>((resolve, reject) => {

            if (duration <= 0) { // no animation needed.
                this.viewer.mvMatrix = end.mv;
                this.viewer.cameraProperties.height = end.height;
                resolve();
                return;
            }

            let start: { mv: mat4, height: number } = null;
            if (Animations.viewQueue.length > 0) {
                // use last animation as a start to create a smooth animation
                start = Animations.viewQueue[Animations.viewQueue.length - 1];
            } else {
                // nothing on the queue, just use the current values
                start = {
                    mv: mat4.copy(mat4.create(), this.viewer.mvMatrix),
                    height: this.viewer.cameraProperties.height
                };
            }

            // start and end are the same, do nothing and return
            if (mat4.equals(start.mv, end.mv) && Math.abs(start.height - end.height) < 1e-6) {
                resolve();
                return;
            }

            // decompose the start matrix
            let startRotation: quat = mat4.getRotation(quat.create(), start.mv);
            let startScale: vec3 = mat4.getScaling(vec3.create(), start.mv);
            let startTranslation: vec3 = mat4.getTranslation(vec3.create(), start.mv);
            let startTime: number = null;

            // decompose final matrix
            let endRotation = mat4.getRotation(quat.create(), end.mv);
            let endScale = mat4.getScaling(vec3.create(), end.mv);
            let endTranslation = mat4.getTranslation(vec3.create(), end.mv);

            Animations.viewQueue.push(end);
            let step = () => {
                if (Animations.viewQueue[0] !== end) {
                    // check we are in the queue
                    var exist = Animations.viewQueue.filter(m => m === end).pop() != null;
                    if (!exist) {
                        // navigation queue was cleared. stop animation
                        resolve();
                        return;
                    }

                    // not our run, just wait, try again later
                    this.requestAnimationFrame(step);
                    return;
                }
                if (startTime == null) { startTime = Date.now(); }
                const now = Date.now();
                if (now < (startTime + duration)) {

                    // linear interpolation of the state
                    let state = (now - startTime) / duration;

                    // apply easing in and out
                    switch (easing) {
                        case EasingType.LINEAR:
                            // linear is the default
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

                    // interpolate transformation components
                    let rotation = quat.slerp(quat.create(), startRotation, endRotation, state);
                    let scale = vec3.lerp(vec3.create(), startScale, endScale, state);
                    let translation = vec3.lerp(vec3.create(), startTranslation, endTranslation, state);
                    // interpolate orthogonal view height
                    let heightDelta = (end.height - start.height) * state;

                    // recompose the matrix
                    let mv = mat4.fromRotationTranslationScaleOrigin(mat4.create(), rotation, translation, scale, vec3.create());
                    this.viewer.mvMatrix = mv;
                    this.viewer.cameraProperties.height = start.height + heightDelta;

                    this.requestAnimationFrame(step);
                } else { // set exact value, remove from the queue and resolve promise
                    this.viewer.mvMatrix = end.mv;
                    this.viewer.cameraProperties.height = end.height;
                    Animations.viewQueue.shift();
                    resolve();
                    return;
                }
            };

            // start
            step();
        });


    }

    private static zoomQueue: { mv: mat4, height: number }[] = [];
    /**
     * Animates transition from the current view to target view
     * 
     * @param end Target model view matrix
     * @param duration Duration of the transition in milliseconds
     */
    public addZoom(distance: number, duration: number, direction?: vec3): Promise<void> {
        // current model view
        let currentMv = mat4.copy(mat4.create(), this.viewer.mvMatrix);
        let currentHeight = this.viewer.cameraProperties.height;

        // if there is an animation in progress, zoom should start where that ends
        if (Animations.zoomQueue.length > 0) {
            const current = Animations.zoomQueue[Animations.zoomQueue.length - 1];
            currentMv = current.mv;
            currentHeight = current.height;
        }

        // get zoom direction
        let zoomDirection = vec3.create();
        if (direction) {
            direction = vec3.normalize(vec3.create(), direction);
            vec3.negate(zoomDirection, direction);
        } else {
            const inv = mat4.invert(mat4.create(), currentMv);
            const rotation = mat4.getRotation(quat.create(), inv);
            const cameraDirection = vec3.transformQuat(vec3.create(), vec3.fromValues(0, 0, -1), rotation);
            vec3.negate(zoomDirection, cameraDirection);
        }

        // get movement and orthogonal view height
        const move = vec3.scale(vec3.create(), zoomDirection, distance);
        const fov = this.viewer.cameraProperties.fov * Math.PI / 180.0;
        let deltaHeight = 2.0 * distance * Math.tan(fov / 2.0);
        const limit = 2.0 * this.viewer.cameraProperties.near * Math.tan(fov / 2.0);

        // avoid singularity where height is negative and image is flipped.
        if ((currentHeight - deltaHeight) < limit)
            deltaHeight = 0;

        // final state
        const end = {
            mv: mat4.translate(mat4.create(), currentMv, move),
            height: currentHeight - deltaHeight
        };


        return new Promise<void>((resolve, reject) => {
            if (duration <= 0) { // no animation needed.
                Animations.zoomQueue = [];
                this.viewer.mvMatrix = end.mv;
                this.viewer.cameraProperties.height = end.height;
                resolve();
                return;
            }

            let startTime: number = null;
            let endTranslation = move;

            Animations.zoomQueue.push(end);
            let step = () => {
                if (Animations.zoomQueue[0] !== end) {
                    // check we are in the queue
                    var exist = Animations.zoomQueue.filter(m => m === end).pop() != null;
                    if (!exist) {
                        resolve();
                        return;
                    }

                    // not our run, just wait, try again later
                    this.requestAnimationFrame(step);
                    return;
                }
                // first run - set start
                if (startTime == null)
                    startTime = Date.now();
                const now = Date.now();
                if (now < (startTime + duration)) {
                    // we always use linear interpolation for zoom because it needs to be smooth when executed in sequence
                    let state = (now - startTime) / duration;
                    let translation = vec3.lerp(vec3.create(), vec3.create(), endTranslation, state);
                    let delta = deltaHeight * state;

                    // set position and perspective width
                    this.viewer.mvMatrix = mat4.translate(mat4.create(), currentMv, translation);
                    this.viewer.cameraProperties.height = currentHeight - delta;

                    this.requestAnimationFrame(step);
                } else { // set exact value, remove from the queue and quit
                    this.viewer.mvMatrix = end.mv;
                    this.viewer.cameraProperties.height = end.height;
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
