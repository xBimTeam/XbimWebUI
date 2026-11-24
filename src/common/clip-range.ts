import { vec3 } from 'gl-matrix';
import { BBox } from './bbox';

/**
 * Pure helpers for deriving near/far clipping planes and walk pace from the camera and a
 * bounding box ([x, y, z, sizeX, sizeY, sizeZ]). Kept independent of WebGL so they can be unit tested.
 */
export class ClipRange {

    /**
     * Returns distances along the view direction to the nearest and farthest corner of the bounding box
     * (including a margin). Near can be zero or negative when the camera is inside or beyond the box.
     */
    public static getDepthRange(bbox: ArrayLike<number>, camera: vec3, viewDirection: vec3): { near: number, far: number, size: number } {
        if (!bbox || bbox.length === 0) {
            return { near: 0, far: 0, size: 0 };
        }

        const viewDir = vec3.normalize(vec3.create(), viewDirection);
        const size = BBox.getDiagonalSize(bbox as number[]);

        // project all 8 corners of the box onto the view direction. The centre-based estimate is only
        // valid when the camera looks at the centre, which breaks for long models or a camera inside the box.
        let near = Infinity;
        let far = -Infinity;
        const corner = vec3.create();
        for (let x = 0; x <= 1; x++) {
            for (let y = 0; y <= 1; y++) {
                for (let z = 0; z <= 1; z++) {
                    vec3.set(corner, bbox[0] + x * bbox[3] - camera[0], bbox[1] + y * bbox[4] - camera[1], bbox[2] + z * bbox[5] - camera[2]);
                    const depth = vec3.dot(viewDir, corner);
                    near = Math.min(near, depth);
                    far = Math.max(far, depth);
                }
            }
        }

        // margin so geometry on or slightly beyond the boundary (e.g. section box wireframe) is not easily clipped
        const margin = size * 0.2;
        return { near: near - margin, far: far + margin, size };
    }

    /**
     * Gets valid near and far planes for the depth range or null if the range can't be used
     * (the caller should fall back to planes based on the model units).
     *
     * @param meter number of model units in a meter
     */
    public static getClipPlanes(range: { near: number, far: number }, meter: number): { near: number, far: number } | null {
        const far = range.far;
        if (!(far > 0) || !isFinite(far)) {
            return null;
        }

        // camera inside (or very close to) the box: use a near plane based on the model units
        let near = range.near > 0 ? range.near : meter / 4;
        // keep the depth range sane to preserve depth precision
        near = Math.max(near, far / 10000);
        if (!isFinite(near) || near <= 0 || near >= far) {
            return null;
        }
        return { near, far };
    }

    /**
     * Distance from a point to the bounding box. Zero when the point is inside.
     */
    public static distanceToBBox(bbox: ArrayLike<number>, point: vec3): number {
        if (!bbox || bbox.length === 0) {
            return 0;
        }
        let sq = 0;
        for (let i = 0; i < 3; i++) {
            const min = bbox[i];
            const max = bbox[i] + bbox[i + 3];
            const d = Math.max(min - point[i], 0, point[i] - max);
            sq += d * d;
        }
        return Math.sqrt(sq);
    }

    /** Portion of the distance to the model covered by one walk step when outside of it */
    public static readonly walkDistanceFactor = 0.25;

    /**
     * Gets the walk pace in model units for a unit of input. It is a constant pace (half a meter) when in or
     * near the model, but increases with the distance from the model so approaching a large model isn't painfully slow.
     */
    public static getWalkPace(meter: number, distanceToModel: number): number {
        const base = meter * 0.5;
        if (!(distanceToModel > 0) || !isFinite(distanceToModel)) {
            return base;
        }
        return Math.max(base, distanceToModel * ClipRange.walkDistanceFactor);
    }
}
