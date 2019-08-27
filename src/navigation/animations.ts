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

    public easing: EasingType = EasingType.SINUS2;

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
    public viewTo(end: mat4, duration: number): Promise<void> {
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
            const easing = this.easing;
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
                }
                else { // set exact value, remove from the queue and quit
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