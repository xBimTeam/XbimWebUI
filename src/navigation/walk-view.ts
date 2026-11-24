import { vec3 } from 'gl-matrix';
import { ClipRange } from '../common/clip-range';

export interface WalkViewInput {
    /** Bounding box of the model as [x, y, z, sizeX, sizeY, sizeZ]. Z is up */
    bbox: ArrayLike<number>;
    eye: vec3;
    forward: vec3;
    /** Number of model units in a meter */
    meter: number;
    /** Eye height above the lowest point of the model in meters */
    eyeHeight: number;
    /** Distance from the building face in meters */
    standoff: number;
}

export interface WalkViewResult {
    /** True when the camera is already at a suitable walking position */
    skip: boolean;
    eye: vec3;
    /** Point on the building face, at the eye height, which the camera looks at */
    target: vec3;
}

/**
 * Pure helper to derive a ground level walking viewpoint in front of the nearest building elevation.
 * Kept independent of WebGL so it can be unit tested.
 */
export class WalkView {

    /** Eye closer than this fraction of a meter to the walking height is considered to be at the ground level */
    private static readonly groundTolerance = 0.5;
    /** The camera is close enough to the building when within this multiple of the stand-off distance */
    private static readonly nearFactor = 1.5;

    public static getViewpoint(input: WalkViewInput): WalkViewResult | null {
        const { bbox, eye, meter } = input;
        if (!bbox || bbox.length < 6 || !(meter > 0)) {
            return null;
        }

        const centreX = bbox[0] + bbox[3] / 2;
        const centreY = bbox[1] + bbox[4] / 2;
        const halfX = Math.max(bbox[3] / 2, 1e-6);
        const halfY = Math.max(bbox[4] / 2, 1e-6);
        const groundZ = bbox[2] + input.eyeHeight * meter;
        const standoff = input.standoff * meter;

        // the horizontal direction from the building to the camera decides which elevation we approach
        let dx = eye[0] - centreX;
        let dy = eye[1] - centreY;
        if (Math.abs(dx) / halfX + Math.abs(dy) / halfY < 1e-6) {
            // above the centre: use the direction we are looking from, or default to the front elevation
            dx = -input.forward[0];
            dy = -input.forward[1];
            if (Math.abs(dx) + Math.abs(dy) < 1e-6) {
                dx = 0;
                dy = -1;
            }
        }

        let normal: vec3;
        let position: vec3;
        if (Math.abs(dx) / halfX > Math.abs(dy) / halfY) {
            const sign = dx > 0 ? 1 : -1;
            normal = vec3.fromValues(sign, 0, 0);
            position = vec3.fromValues(centreX + sign * (halfX + standoff), centreY, groundZ);
        } else {
            const sign = dy > 0 ? 1 : -1;
            normal = vec3.fromValues(0, sign, 0);
            position = vec3.fromValues(centreX, centreY + sign * (halfY + standoff), groundZ);
        }

        const target = vec3.scaleAndAdd(vec3.create(), position, normal, -standoff);

        const atGround = Math.abs(eye[2] - groundZ) < WalkView.groundTolerance * meter;
        const isNear = ClipRange.distanceToBBox(bbox, eye) <= standoff * WalkView.nearFactor;
        const skip = atGround && isNear;

        return { skip, eye: position, target };
    }
}
