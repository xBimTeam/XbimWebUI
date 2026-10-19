import assert = require("assert");
import { vec3 } from "gl-matrix";
import { SectionBox } from "../src/section-box";
import { Argb } from "../src/bcf/argb";

const EPS = 1e-2;

function createBox(location: number[], lengths: number[], rotation: number[]): SectionBox {
    const box = new SectionBox(null);
    box.location = vec3.fromValues(location[0], location[1], location[2]);
    box.lengthX = lengths[0];
    box.lengthY = lengths[1];
    box.lengthZ = lengths[2];
    box.rotationX = rotation[0];
    box.rotationY = rotation[1];
    box.rotationZ = rotation[2];
    return box;
}

function testUnsetBoxHasNoPlanes(): void {
    assert.strictEqual(new SectionBox(null).toClippingPlanes(), null);
}

function testUnrotatedBoxPlanes(): void {
    const planes = createBox([10, 20, 30], [4, 6, 8], [0, 0, 0]).toClippingPlanes();
    assert.strictEqual(planes.length, 6);
    // every plane has unit outward normal and lies on a face of the box
    const faces = planes.map(p => `${p.direction.map(Math.round).join(',')}@${p.location.map(Math.round).join(',')}`).sort();
    assert.deepStrictEqual(faces, [
        '-1,0,0@8,20,30', '0,-1,0@10,17,30', '0,0,-1@10,20,26',
        '0,0,1@10,20,34', '0,1,0@10,23,30', '1,0,0@12,20,30'
    ].sort());
}

function testRoundTripThroughPlanes(): void {
    [[0, 0, 30], [30, 0, 0], [0, 30, 0], [20, 10, 30], [0, 0, 0]].forEach(rotation => {
        const original = createBox([5, -3, 2], [4, 6, 8], rotation);
        const restored = new SectionBox(null);
        assert.ok(restored.setToPlanes(original.toClippingPlanes()));

        const wcs = vec3.create();
        const a = original.getBoundingBox(wcs);
        const b = restored.getBoundingBox(wcs);
        for (let i = 0; i < 6; i++) {
            assert.ok(Math.abs(a[i] - b[i]) < EPS, `rotation ${rotation}: bbox[${i}] expected ${a[i]}, got ${b[i]}`);
        }
        near(restored.rotationX, rotation[0]);
        near(restored.rotationY, rotation[1]);
        near(restored.rotationZ, rotation[2]);
    });
}

function near(actual: number, expected: number): void {
    assert.ok(Math.abs(actual - expected) < EPS, `expected ${expected}, got ${actual}`);
}

function testArgbConversion(): void {
    assert.strictEqual(Argb.fromRgba([255, 0, 128, 255]), 'FFFF0080');
    assert.deepStrictEqual(Argb.toRgba('FFFF0080'), [255, 0, 128, 255]);
    assert.deepStrictEqual(Argb.toRgba('40E0D0'), [64, 224, 208, 255]);
    assert.deepStrictEqual(Argb.toRgba('80FF0000'), [255, 0, 0, 128]);
    assert.strictEqual(Argb.toRgba('xyz'), null);
}

testUnsetBoxHasNoPlanes();
testUnrotatedBoxPlanes();
testRoundTripThroughPlanes();
testArgbConversion();
