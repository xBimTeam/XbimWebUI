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
            let start = mat4.copy(mat4.create(), this.viewer.mvMatrix);
            if (mat4.equals(start, end)) { // nothing to do
                resolve();
                return;
            }
            let startRotation = mat4.getRotation(quat.create(), start);
            let startScale = mat4.getScaling(vec3.create(), start);
            let startTranslation = mat4.getTranslation(vec3.create(), start);

            let endRotation = mat4.getRotation(quat.create(), end);
            let endScale = mat4.getScaling(vec3.create(), end);
            let endTranslation = mat4.getTranslation(vec3.create(), end);

            const fps = 50;
            const stepsCount = duration / 1000.0 * fps;
            const stepDuration = duration / stepsCount;
            const stepSize = 1.0 / stepsCount;

            let state = 0.0;
            let step = () => {
                state += stepSize;
                if (state < 1.0) {
                    let rotation = quat.slerp(quat.create(), startRotation, endRotation, state);
                    let scale = vec3.lerp(vec3.create(), startScale, endScale, state);
                    let translation = vec3.lerp(vec3.create(), startTranslation, endTranslation, state);

                    let mv = mat4.fromRotationTranslationScaleOrigin(mat4.create(), rotation, translation, scale, vec3.create());
                    this.viewer.mvMatrix = mv;

                    setTimeout(step, stepDuration);
                }
                else { // set exact value
                    this.viewer.mvMatrix = end;
                    resolve();
                }
            };

            // interpolate with timeout
            setTimeout(step, stepDuration);
        });


    }
}