import { Viewer } from "../viewer";
import { mat3, mat4, vec3, quat } from "gl-matrix";

/**
 * @category Core
 */
export enum EasingType {
    LINEAR,
    SINUS,
    SINUS2,
    CIRCLE
}

/**
 * Strategy used to interpolate between two views.
 * @category Core
 */
export enum TransitionMode {
    /** Pivot the camera towards where it is going (or the target), move, then settle into the final orientation. */
    STAGED,
    /** Orientation and position are interpolated together. */
    BLENDED
}

/**
 * A view of the model. Optional `target` is the point the view looks at.
 * @category Core
 */
export interface ViewState {
    mv: mat4;
    height: number;
    target?: vec3;
}

interface Pose { eye: vec3; orientation: quat; }

/**
 * @category Core
 */
export class Animations {

    /**
     * Strategy used for view transitions. Applies to transitions started after it is set.
     */
    public mode: TransitionMode = TransitionMode.STAGED;

    /**
     * Easing applied to view transitions (see {@link Animations#viewTo}). Can be changed at any time,
     * e.g. `viewer.animations.easing = EasingType.LINEAR`. Applies to transitions started after it is set.
     */
    public easing: EasingType = EasingType.SINUS2;

    private requestAnimationFrame: (callback: FrameRequestCallback) => number;
    private setTimeout: (callback: () => void, offset: number) => void;

    /**
     * Constructor to handle all animations
     */
    constructor(private viewer: Viewer) {
        // monkey patching protection
        this.setTimeout = window.setTimeout.bind(window);
        this.requestAnimationFrame = (window.requestAnimationFrame ||
            window["webkitRequestAnimationFrame"] ||
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

    private static viewQueue: ViewState[] = [];

    /**
     * Animates transition from the current view to target view. Animations are queued and execuded in sequence.
     * 
     * @param end Target model view matrix and height. Optional `target` is the point the destination view looks at; when
     * provided, {@link TransitionMode.STAGED} transitions orbit around it so it stays in view.
     * @param duration Duration of the transition in milliseconds
     * @param easing Deprecated - set {@link Animations#easing} instead. Optional per-call override kept for backward compatibility; when null or omitted, {@link Animations#easing} is used.
     */
    public viewTo(end: ViewState, duration: number, easing: EasingType = null): Promise<void> {
        // capture so a change mid-transition doesn't cause a jump
        const easingMode = easing ?? this.easing;
        const transitionMode = this.mode;
        return new Promise<void>((resolve, reject) => {
            if (duration <= 0) { // no animation needed.
                this.viewer.mvMatrix = end.mv;
                this.viewer.cameraProperties.height = end.height;
                resolve();
                return;
            }

            let start: ViewState = null;
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

            let startTime: number = null;
            const evaluate = transitionMode === TransitionMode.BLENDED ?
                this.createBlendedPath(start, end, easingMode) :
                this.createStagedPath(start, end, easingMode);

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
                    const view = evaluate((now - startTime) / duration);
                    this.viewer.mvMatrix = view.mv;
                    this.viewer.cameraProperties.height = view.height;

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

    /**
     * Original strategy: rotation and translation of the model view matrix are interpolated together.
     */
    private createBlendedPath(start: ViewState, end: ViewState, easing: EasingType): (fraction: number) => ViewState {
        // decompose the start matrix
        const startRotation: quat = mat4.getRotation(quat.create(), start.mv);
        const startScale: vec3 = mat4.getScaling(vec3.create(), start.mv);
        const startTranslation: vec3 = mat4.getTranslation(vec3.create(), start.mv);

        // decompose final matrix
        const endRotation = mat4.getRotation(quat.create(), end.mv);
        const endScale = mat4.getScaling(vec3.create(), end.mv);
        const endTranslation = mat4.getTranslation(vec3.create(), end.mv);

        return (fraction: number) => {
            const state = this.applyEasing(fraction, easing);
            const rotation = quat.slerp(quat.create(), startRotation, endRotation, state);
            const scale = vec3.lerp(vec3.create(), startScale, endScale, state);
            const translation = vec3.lerp(vec3.create(), startTranslation, endTranslation, state);
            const mv = mat4.fromRotationTranslationScaleOrigin(mat4.create(), rotation, translation, scale, vec3.create());
            return { mv, height: start.height + (end.height - start.height) * state };
        };
    }

    /**
     * Staged transition strategy: decomposes camera motion into discrete, natural stages
     * rather than interpolating the model-view matrix components directly.
     *
     * In direct matrix interpolation, translation in the view matrix represents `-R * eye`.
     * Interpolating rotation and translation concurrently creates an unnatural curved flight path
     * where the camera drifts sideways relative to where it is looking or traveling.
     *
     * The staged path divides the transition into up to three stages:
     * 1. **Pivot**: The camera rotates in-place around its starting eye position to face either the target
     *    or its direction of travel.
     * 2. **Travel**: The camera eye translates to its destination position:
     *    - **Orbit Mode** (when `end.target` is present): The eye traces an arc on a sphere around the target,
     *      interpolating azimuth and elevation separately so the trajectory does not flip over the poles.
     *      The camera actively re-aims at the target throughout the arc, keeping the object centered in view.
     *    - **Linear Mode** (when no target is provided): The eye translates in a straight line while facing
     *      the destination position.
     *    - Orthographic camera `height` (zoom level) is smoothly transitioned during this travel stage.
     * 3. **Settle**: The camera rotates in-place at its destination eye position from its travel orientation
     *    into the exact target orientation (e.g. final view roll or top-down alignment).
     *
     * Stages are dynamically collapsed or omitted if their angular or spatial distance is below threshold,
     * and stage weights are scaled proportionally to the angle being rotated so small adjustments finish quickly.
     *
     * @param start Initial view state (matrix and ortho height).
     * @param end Destination view state, optionally containing an explicit `target` coordinate to orbit around.
     * @param easing Easing function to apply to each stage.
     * @returns A sampling function accepting a normalized fraction [0..1] and returning the interpolated ViewState.
     */
    private createStagedPath(start: ViewState, end: ViewState, easing: EasingType): (fraction: number) => ViewState {
        const EPS = 1e-4;
        const startPose = Animations.getPose(start.mv);
        const endPose = Animations.getPose(end.mv);

        interface Stage { weight: number; travels: boolean; at: (t: number) => Pose; }
        const stages: Stage[] = [];
        const angleWeight = (angle: number) => 0.1 + 0.2 * Math.min(angle / Math.PI, 1);

        const target = end.target;
        const startOffset = target ? vec3.subtract(vec3.create(), startPose.eye, target) : null;
        const endOffset = target ? vec3.subtract(vec3.create(), endPose.eye, target) : null;
        const orbit = target != null && vec3.length(startOffset) > EPS && vec3.length(endOffset) > EPS;
        const distance = vec3.distance(startPose.eye, endPose.eye);

        let travelStartOrientation: quat = endPose.orientation;
        let travelEndOrientation: quat = endPose.orientation;
        let travel: Stage = null;

        if (orbit) {
            const r0 = vec3.length(startOffset);
            const r1 = vec3.length(endOffset);
            const startDir = vec3.scale(vec3.create(), startOffset, 1 / r0);
            const endDir = vec3.scale(vec3.create(), endOffset, 1 / r1);
            const swing = Animations.getSwing(startDir, endDir);
            // orbit horizontally (azimuth) and tilt (elevation) separately so the camera doesn't go over the top;
            // near the poles azimuth is undefined so a direct swing is used.
            const polar = Math.hypot(startDir[0], startDir[1]) < 1e-3 || Math.hypot(endDir[0], endDir[1]) < 1e-3;
            const az0 = Math.atan2(startDir[1], startDir[0]);
            const el0 = Math.asin(Math.max(-1, Math.min(1, startDir[2])));
            const el1 = Math.asin(Math.max(-1, Math.min(1, endDir[2])));
            let dAz = Math.atan2(endDir[1], endDir[0]) - az0;
            dAz = Math.atan2(Math.sin(dAz), Math.cos(dAz));
            const eyeAt = (t: number) => {
                const radius = r0 + (r1 - r0) * t;
                if (polar) {
                    const q = quat.slerp(quat.create(), quat.create(), swing, t);
                    return vec3.scaleAndAdd(vec3.create(), target, vec3.transformQuat(vec3.create(), startDir, q), radius);
                }
                const az = az0 + dAz * t;
                const el = el0 + (el1 - el0) * t;
                return vec3.fromValues(
                    target[0] + radius * Math.cos(el) * Math.cos(az),
                    target[1] + radius * Math.cos(el) * Math.sin(az),
                    target[2] + radius * Math.sin(el));
            };
            // Looking straight down "up" is undefined, so orientation at the ends of the orbit is sampled just inside it.
            // This lets the roll change be animated in the pivot/settle stages rather than snapping when travel begins or ends.
            const orientationAt = (t: number) => {
                const clamped = Math.min(Math.max(t, 0.001), 0.999);
                const eye = eyeAt(clamped);
                return Animations.lookAtOrientation(vec3.subtract(vec3.create(), target, eye), startPose.orientation);
            };
            travelStartOrientation = orientationAt(0);
            travelEndOrientation = orientationAt(1);
            travel = {
                weight: 0.5,
                travels: true,
                at: (t) => ({ eye: eyeAt(t), orientation: orientationAt(t) })
            };
        } else if (distance > EPS) {
            const direction = vec3.subtract(vec3.create(), endPose.eye, startPose.eye);
            travelStartOrientation = travelEndOrientation = Animations.lookAtOrientation(direction, startPose.orientation);
            travel = {
                weight: 0.5,
                travels: true,
                at: (t) => ({ eye: vec3.lerp(vec3.create(), startPose.eye, endPose.eye, t), orientation: travelStartOrientation })
            };
        }

        if (travel == null) {
            // nothing moves, rotate only
            stages.push({ weight: 1, travels: false, at: (t) => ({ eye: startPose.eye, orientation: quat.slerp(quat.create(), startPose.orientation, endPose.orientation, t) }) });
        } else {
            const pivotAngle = quat.getAngle(startPose.orientation, travelStartOrientation);
            if (pivotAngle > EPS) {
                stages.push({ weight: angleWeight(pivotAngle), travels: false, at: (t) => ({ eye: startPose.eye, orientation: quat.slerp(quat.create(), startPose.orientation, travelStartOrientation, t) }) });
            }
            stages.push(travel);
            const settleAngle = quat.getAngle(travelEndOrientation, endPose.orientation);
            if (settleAngle > EPS) {
                stages.push({ weight: angleWeight(settleAngle), travels: false, at: (t) => ({ eye: endPose.eye, orientation: quat.slerp(quat.create(), travelEndOrientation, endPose.orientation, t) }) });
            }
        }

        const total = stages.reduce((s, st) => s + st.weight, 0);
        let cumulative = 0;
        const bounds = stages.map(st => {
            const from = cumulative / total;
            cumulative += st.weight;
            return { stage: st, from, to: cumulative / total };
        });

        return (fraction: number) => {
            const clamped = Math.min(Math.max(fraction, 0), 1);
            const current = bounds.find(b => clamped <= b.to) || bounds[bounds.length - 1];
            const local = this.applyEasing((clamped - current.from) / (current.to - current.from), easing);
            const pose = current.stage.at(local);

            // orthogonal view height changes with the movement; without a moving stage it follows the whole transition
            let heightState: number;
            if (travel == null) {
                heightState = this.applyEasing(clamped, easing);
            } else if (current.stage === travel) {
                heightState = local;
            } else {
                heightState = bounds.indexOf(current) < bounds.findIndex(b => b.stage === travel) ? 0 : 1;
            }
            return {
                mv: Animations.poseToMatrix(pose),
                height: start.height + (end.height - start.height) * heightState
            };
        };
    }

    /** Camera position and orientation (camera to world) from a model view matrix */
    private static getPose(mv: mat4): Pose {
        const inv = mat4.invert(mat4.create(), mv);
        return {
            eye: mat4.getTranslation(vec3.create(), inv),
            orientation: quat.normalize(quat.create(), mat4.getRotation(quat.create(), inv))
        };
    }

    private static poseToMatrix(pose: Pose): mat4 {
        const world = mat4.fromRotationTranslation(mat4.create(), pose.orientation, pose.eye);
        return mat4.invert(mat4.create(), world);
    }

    /**
     * Rotation which carries one unit direction onto another. Opposite directions swing around the world up axis
     * (or X when aligned with it), so a turn to the far side stays level.
     */
    private static getSwing(from: vec3, to: vec3): quat {
        if (vec3.dot(from, to) < -0.999999) {
            const up = Math.abs(from[2]) > 0.999 ? vec3.fromValues(1, 0, 0) : vec3.fromValues(0, 0, 1);
            return quat.setAxisAngle(quat.create(), up, Math.PI);
        }
        return quat.rotationTo(quat.create(), from, to);
    }

    /**
     * Roll free camera orientation looking along the direction, with world Z as up.
     * Falls back to the up vector of the reference orientation when looking along Z.
     */
    private static lookAtOrientation(direction: vec3, reference: quat): quat {
        const forward = vec3.normalize(vec3.create(), direction);
        let up = vec3.fromValues(0, 0, 1);
        let right = vec3.cross(vec3.create(), forward, up);
        if (vec3.length(right) < 1e-6) {
            up = vec3.transformQuat(vec3.create(), vec3.fromValues(0, 1, 0), reference);
            right = vec3.cross(vec3.create(), forward, up);
            if (vec3.length(right) < 1e-6) {
                right = vec3.transformQuat(vec3.create(), vec3.fromValues(1, 0, 0), reference);
            }
        }
        vec3.normalize(right, right);
        const camUp = vec3.cross(vec3.create(), right, forward);
        // camera looks along -Z with Y up
        const m = mat3.fromValues(
            right[0], right[1], right[2],
            camUp[0], camUp[1], camUp[2],
            -forward[0], -forward[1], -forward[2]);
        const q = quat.normalize(quat.create(), quat.fromMat3(quat.create(), m));
        // stay on the same hemisphere as the reference so slerp takes the short way
        return quat.dot(q, reference) < 0 ? quat.scale(q, q, -1) : q;
    }

    private applyEasing(state: number, easing: EasingType): number {
        switch (easing) {
            case EasingType.CIRCLE:
                return this.getCircleEasing(state);
            case EasingType.SINUS:
                return this.getSinEasing(state);
            case EasingType.SINUS2:
                return this.getSinEasing(this.getSinEasing(state));
            default: // LINEAR
                return state;
        }
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
