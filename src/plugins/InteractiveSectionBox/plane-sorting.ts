import { ClippingPlane } from "../../bcf/clipping-plane";

/**
 * Tolerance used to decide a plane normal is parallel to a world axis
 */
export const AXIS_TOLERANCE = 1e-6;

/**
 * Sorts 6 clipping planes of an axis-aligned box into the canonical face order
 * [top (+Z), bottom (-Z), front (+X), back (-X), left (-Y), right (+Y)].
 * Directions are matched with a tolerance so floating point noise (e.g. 6e-17 or -0) is accepted.
 * @throws if the planes are not exactly six axis-aligned faces of a box
 */
export function sortAxisAlignedPlanes(planes: ClippingPlane[]): ClippingPlane[] {
    if (planes == null || planes.length !== 6) {
        throw new Error('Expected exactly 6 planes.');
    }

    // candidate axis directions in canonical order
    const axes = [[0, 0, 1], [0, 0, -1], [1, 0, 0], [-1, 0, 0], [0, -1, 0], [0, 1, 0]];
    const sorted: ClippingPlane[] = new Array(6);

    for (const plane of planes) {
        const d = plane.direction;
        const length = Math.sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
        if (!(length > 0)) {
            throw new Error('Section box plane has an invalid direction.');
        }
        const index = axes.findIndex(a =>
            Math.abs(d[0] / length - a[0]) < AXIS_TOLERANCE &&
            Math.abs(d[1] / length - a[1]) < AXIS_TOLERANCE &&
            Math.abs(d[2] / length - a[2]) < AXIS_TOLERANCE);
        if (index < 0) {
            throw new Error(`Plane direction [${d.join(', ')}] is not axis-aligned. Only axis-aligned section boxes can be edited.`);
        }
        if (sorted[index]) {
            throw new Error('One or more planes could not be classified: duplicate plane direction.');
        }
        sorted[index] = plane;
    }

    if (sorted.some(p => !p)) {
        throw new Error('One or more planes could not be classified.');
    }
    return sorted;
}
