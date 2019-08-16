import { Viewer } from "../viewer";
import { mat4, vec3, quat } from "gl-matrix";

export class Animations {

    /**
     * Constructor to handle all animations
     */
    constructor(private viewer: Viewer) {

    }

    private currentAnimation: Promise<void> = null;

    private _rotationOn: boolean = false;
    public startRotation(): Promise<void> {
        this._rotationOn = true;
        const interval = 30; // ms
        return new Promise<void>((a, r) => {
            let rotate = () => {
                if (!this._rotationOn) {
                    a();
                    return;
                }
                this.viewer.mvMatrix = mat4.rotateZ(mat4.create(), this.viewer.mvMatrix, 0.2 * Math.PI / 180.0);
                setTimeout(rotate, interval);
            };
            setTimeout(rotate, interval);
        });
    }

    public stopRotation(): void {
        this._rotationOn = false;
    }

    private viewQueue: object[] = [];
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

            let start:mat4 = null;
            let startRotation: quat = null;
            let startScale: vec3 = null;
            let startTranslation:vec3 = null;

            let endRotation = mat4.getRotation(quat.create(), end);
            let endScale = mat4.getScaling(vec3.create(), end);
            let endTranslation = mat4.getTranslation(vec3.create(), end);

            const fps = 50;
            const stepsCount = duration / 1000.0 * fps;
            const stepDuration = duration / stepsCount;
            const stepSize = 1.0 / stepsCount;

            const id = {};
            this.viewQueue.push(id);
            let state = 0.0;
            let initialised = false;
            let step = () => {
                if (this.viewQueue[0] != id) {
                    // not our run, just wait, try again later
                    setTimeout(step, stepDuration);
                    return;
                }
                if (state < 1.0) {
                    if (!initialised) {
                        // get current start
                        start = mat4.copy(mat4.create(), this.viewer.mvMatrix);
                        startRotation = mat4.getRotation(quat.create(), start);
                        startScale = mat4.getScaling(vec3.create(), start);
                        startTranslation = mat4.getTranslation(vec3.create(), start);
                        initialised = true;

                        if (mat4.equals(start, end)) { // nothing to do - dequeue and quit
                            this.viewQueue.shift();
                            resolve();
                            return;
                        }
                    }
                    state += stepSize;
                    let rotation = quat.slerp(quat.create(), startRotation, endRotation, state);
                    let scale = vec3.lerp(vec3.create(), startScale, endScale, state);
                    let translation = vec3.lerp(vec3.create(), startTranslation, endTranslation, state);

                    let mv = mat4.fromRotationTranslationScaleOrigin(mat4.create(), rotation, translation, scale, vec3.create());
                    this.viewer.mvMatrix = mv;

                    setTimeout(step, stepDuration);
                }
                else { // set exact value, remove from the queue and quit
                    this.viewer.mvMatrix = end;
                    this.viewQueue.shift();
                    resolve();
                }
            };

            // interpolate with timeout
            setTimeout(step, stepDuration);
        });


    }
}