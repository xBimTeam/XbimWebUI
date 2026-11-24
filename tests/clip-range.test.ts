import assert = require("assert");
import { describe, it } from "node:test";
import { vec3 } from "gl-matrix";
import { ClipRange } from "../src/common/clip-range";

// 200 x 20 x 30 box starting at the origin; diagonal ~ 203
const bbox = [0, 0, 0, 200, 20, 30];

describe("ClipRange", () => {
    it("sets near to the closest box depth when the camera is outside a long model", () => {
        const camera = vec3.fromValues(-100, 10, 15);
        const range = ClipRange.getDepthRange(bbox, camera, vec3.fromValues(1, 0, 0));
        const margin = range.size * 0.2;
        assert.ok(Math.abs(range.near - (100 - margin)) < 1e-6);
        assert.ok(Math.abs(range.far - (300 + margin)) < 1e-6);

        const planes = ClipRange.getClipPlanes(range, 1);
        assert.ok(planes != null && planes.near > 50 && planes.near < planes.far);
    });

    it("falls back to unit based near plane when camera is inside the model", () => {
        const camera = vec3.fromValues(100, 10, 15);
        const range = ClipRange.getDepthRange(bbox, camera, vec3.fromValues(1, 0, 0));
        assert.ok(range.near < 0);

        const planes = ClipRange.getClipPlanes(range, 1);
        assert.ok(planes != null);
        assert.ok(Math.abs(planes.near - Math.max(0.25, planes.far / 10000)) < 1e-9);
    });

    it("rejects an unusable range", () => {
        assert.strictEqual(ClipRange.getClipPlanes({ near: 0, far: 0 }, 1), null);
        assert.strictEqual(ClipRange.getClipPlanes({ near: 0, far: NaN }, 1), null);
    });

    it("measures distance to the box as zero inside and euclidean outside", () => {
        assert.strictEqual(ClipRange.distanceToBBox(bbox, vec3.fromValues(100, 10, 15)), 0);
        assert.strictEqual(ClipRange.distanceToBBox(bbox, vec3.fromValues(-30, 10, 15)), 30);
        assert.strictEqual(ClipRange.distanceToBBox(bbox, vec3.fromValues(-30, -40, 15)), 50);
        assert.strictEqual(ClipRange.distanceToBBox(null, vec3.create()), 0);
    });

    it("keeps the base walk pace in the model and speeds up with distance outside", () => {
        const base = 0.5 * 1000;
        assert.strictEqual(ClipRange.getWalkPace(1000, 0), base);
        assert.strictEqual(ClipRange.getWalkPace(1000, 100), base);
        const far = ClipRange.getWalkPace(1000, 100000);
        assert.ok(far > base);
        assert.ok(ClipRange.getWalkPace(1000, 200000) > far);
    });
});
