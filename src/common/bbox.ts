import { vec3, mat4 } from "gl-matrix";

/**
 * Static helper functions for bounding boxes
 */
export class BBox {
    public static centre(a: ArrayLike<number>): number[] {
        return [a[0] + a[3] / 2.0, a[1] + a[4] / 2.0, a[2] + a[5] / 2.0];
    }

    public static none: number[] = [Number.MAX_VALUE/2, Number.MAX_VALUE/2, Number.MAX_VALUE/2, -Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE]

    public static union(a: ArrayLike<number>, b: ArrayLike<number>): number[] {
        const minA = [a[0], a[1], a[2]];
        const minB = [b[0], b[1], b[2]];
        const maxA = [a[0] + a[3], a[1] + a[4], a[2] + a[5]];
        const maxB = [b[0] + b[3], b[1] + b[4], b[2] + b[5]];

        const min = [Math.min(minA[0], minB[0]), Math.min(minA[1], minB[1]), Math.min(minA[2], minB[2])];
        const max = [Math.max(maxA[0], maxB[0]), Math.max(maxA[1], maxB[1]), Math.max(maxA[2], maxB[2])];

        return [min[0], min[1], min[2], max[0] - min[0], max[1] - min[1], max[2] - min[2]];
    }

    public static intersection(a: ArrayLike<number>, b: ArrayLike<number>): number[] {
        if (a == null || b == null || BBox.areDisjoint(a, b))
            return null;

        const minA = [a[0], a[1], a[2]];
        const minB = [b[0], b[1], b[2]];
        const maxA = [a[0] + a[3], a[1] + a[4], a[2] + a[5]];
        const maxB = [b[0] + b[3], b[1] + b[4], b[2] + b[5]];

        const min = [Math.max(minA[0], minB[0]), Math.max(minA[1], minB[1]), Math.max(minA[2], minB[2])];
        const max = [Math.min(maxA[0], maxB[0]), Math.min(maxA[1], maxB[1]), Math.min(maxA[2], maxB[2])];

        return [min[0], min[1], min[2], max[0] - min[0], max[1] - min[1], max[2] - min[2]];
    }

    /**
     * Checks if bounding boxes are disjoint
     * @param a Bounding box A
     * @param b Bounding box B
     * @returns {boolean} Returns true when bounding boxes are disjoint
     */
    public static areDisjoint(a: ArrayLike<number>, b: ArrayLike<number>): boolean {
        if (a == null || b == null)
            throw new Error('Bounding box is not defined');

        const minA = [a[0], a[1], a[2]];
        const minB = [b[0], b[1], b[2]];
        const maxA = [a[0] + a[3], a[1] + a[4], a[2] + a[5]];
        const maxB = [b[0] + b[3], b[1] + b[4], b[2] + b[5]];

        return minA[0] > maxB[0] || minA[1] > maxB[1] || minA[2] > maxB[2] ||
            minB[0] > maxA[0] || minB[1] > maxA[1] || minB[2] > maxA[2];
    }

    /**
     * Transforms axis aligned bounding box into current model view and returns width and height
     * @param bBox Axis aligned bounding box
     * @param viewDirection Direction of the view
     * @param upDirection Up direction of the camera
     */
    public static getSizeInView(bBox: number[] | Float32Array, viewDirection: vec3, upDirection: vec3): { width: number, height: number, depth: number } {
        // http://dev.theomader.com/transform-bounding-boxes/

        // create transformation matrix from direction
        viewDirection = vec3.normalize(vec3.create(), viewDirection);
        upDirection = vec3.normalize(vec3.create(), upDirection);
        const moveDirection = vec3.negate(vec3.create(), viewDirection);
        const boxSize = Math.max(bBox[3], bBox[4], bBox[5]);
        const boxPosition = vec3.fromValues(bBox[0] + bBox[3] / 2.0, bBox[1] + bBox[4] / 2.0, bBox[2] + bBox[5] / 2.0)
        const move = vec3.scale(vec3.create(), moveDirection, boxSize);
        const eye = vec3.add(vec3.create(), boxPosition, move);

        const m = mat4.lookAt(mat4.create(), eye, boxPosition, upDirection);

        const right = Array.prototype.slice.call(m.slice(0, 3));
        const up = Array.prototype.slice.call(m.slice(4, 7));
        const back = Array.prototype.slice.call(m.slice(8, 11));

        const xa = vec3.scale(vec3.create(), right, bBox[0]);
        const xb = vec3.scale(vec3.create(), right, (bBox[0] + bBox[3]));

        const ya = vec3.scale(vec3.create(), up, bBox[1]);
        const yb = vec3.scale(vec3.create(), up, (bBox[1] + bBox[4]));

        const za = vec3.scale(vec3.create(), back, bBox[2]);
        const zb = vec3.scale(vec3.create(), back, (bBox[2] + bBox[5]));


        const min1 = vec3.min(vec3.create(), xa, xb);
        const min2 = vec3.min(vec3.create(), ya, yb);
        const min3 = vec3.min(vec3.create(), za, zb);

        const max1 = vec3.max(vec3.create(), xa, xb);
        const max2 = vec3.max(vec3.create(), ya, yb);
        const max3 = vec3.max(vec3.create(), za, zb);

        const min = [
            min1[0] + min2[0] + min3[0],
            min1[1] + min2[1] + min3[1],
            min1[2] + min2[2] + min3[2]
        ]

        const max = [
            max1[0] + max2[0] + max3[0],
            max1[1] + max2[1] + max3[1],
            max1[2] + max2[2] + max3[2]
        ]

        const size = vec3.sub(vec3.create(), max, min);

        return {
            width: size[0] * 1.0, // X => width
            height: size[1] * 1.0,  // Y => height
            depth: size[2]
        };
    }
}