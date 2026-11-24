import assert = require("assert");
import { describe, it } from "node:test";
import { vec3 } from "gl-matrix";
import { WalkView } from "../src/navigation/walk-view";

// 40 (x) x 20 (y) x 10 (z) building in meters, centred on (20, 10)
const bbox = [0, 0, 5, 40, 20, 10];
const forward = vec3.fromValues(0, 0, -1);

const view = (eye: number[], overrides = {}) => WalkView.getViewpoint({
    bbox, eye: vec3.fromValues(eye[0], eye[1], eye[2]), forward, meter: 1, eyeHeight: 1.7, standoff: 10, ...overrides
});

describe("WalkView", () => {
    it("approaches the elevation nearest to the camera at ground level", () => {
        const east = view([100, 12, 80]);
        assert.ok(Math.abs(east.eye[0] - 50) < 1e-9 && Math.abs(east.eye[1] - 10) < 1e-9);
        assert.ok(Math.abs(east.eye[2] - 6.7) < 1e-5);
        assert.ok(Math.abs(east.target[0] - 40) < 1e-9 && Math.abs(east.target[2] - east.eye[2]) < 1e-9);

        const west = view([-100, 10, 80]);
        assert.ok(Math.abs(west.eye[0] + 10) < 1e-9);

        const south = view([20, -100, 80]);
        assert.ok(Math.abs(south.eye[1] + 10) < 1e-9);
        assert.ok(Math.abs(south.target[1] - 0) < 1e-9);

        const north = view([20, 100, 80]);
        assert.ok(Math.abs(north.eye[1] - 30) < 1e-9);
    });

    it("compares against the footprint proportions so a long side is chosen for a diagonal approach", () => {
        // equal offsets in x and y, but the building is twice as long in x so the y (long) face is nearer in relative terms
        const result = view([60, 50, 80]);
        assert.ok(Math.abs(result.eye[1] - 30) < 1e-9);
    });

    it("stands at the middle of the face regardless of the lateral camera position", () => {
        const result = view([500, 100, 80]);
        assert.ok(Math.abs(result.eye[0] - 50) < 1e-9);
        assert.ok(Math.abs(result.eye[1] - 10) < 1e-9);
        assert.ok(Math.abs(result.target[1] - 10) < 1e-9);
    });

    it("falls back to the viewing direction, then the front elevation, when above the centre", () => {
        const looking = WalkView.getViewpoint({ bbox, eye: vec3.fromValues(20, 10, 100), forward: vec3.fromValues(1, 0, 0), meter: 1, eyeHeight: 1.7, standoff: 10 });
        assert.ok(looking.eye[0] < 0);

        const topDown = view([20, 10, 100]);
        assert.ok(Math.abs(topDown.eye[1] + 10) < 1e-9);
    });

    it("scales eye height and stand-off by model units", () => {
        const mm = [0, 0, 5000, 40000, 20000, 10000];
        const result = WalkView.getViewpoint({ bbox: mm, eye: vec3.fromValues(100000, 12000, 80000), forward, meter: 1000, eyeHeight: 1.7, standoff: 10 });
        assert.ok(Math.abs(result.eye[2] - 6700) < 1e-6);
        assert.ok(Math.abs(result.eye[0] - 50000) < 1e-6);
    });

    it("skips when already at ground level near the building", () => {
        assert.strictEqual(view([50, 12, 6.7]).skip, true);
        assert.strictEqual(view([50, 12, 30]).skip, false);
        assert.strictEqual(view([500, 12, 6.7]).skip, false);
    });

    it("returns null when there is nothing to walk around", () => {
        assert.strictEqual(WalkView.getViewpoint({ bbox: null, eye: vec3.create(), forward, meter: 1, eyeHeight: 1.7, standoff: 10 }), null);
    });
});
