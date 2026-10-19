import assert = require("assert");
import { vec3 } from "gl-matrix";
import { SectionBox } from "../src/section-box";
import { ClippingPlane } from "../src/bcf/clipping-plane";
import { sortAxisAlignedPlanes } from "../src/plugins/InteractiveSectionBox/plane-sorting";

function createBox(rotation: number[]): SectionBox {
    const box = new SectionBox(null);
    box.location = vec3.fromValues(10, 20, 30);
    box.lengthX = 4;
    box.lengthY = 6;
    box.lengthZ = 8;
    box.rotationX = rotation[0];
    box.rotationY = rotation[1];
    box.rotationZ = rotation[2];
    return box;
}

function plane(direction: number[], location: number[]): ClippingPlane {
    const p = new ClippingPlane();
    p.direction = direction;
    p.location = location;
    return p;
}

function testNoNoiseInDirections(): void {
    [[0, 0, 0], [0, 0, 90], [90, 0, 0], [0, 90, 180]].forEach(rotation => {
        const planes = createBox(rotation).toClippingPlanes();
        planes.forEach(p => p.direction.forEach(c => {
            assert.ok([-1, 0, 1].indexOf(c) >= 0, `noisy component ${c} for rotation ${rotation}`);
            assert.ok(!Object.is(c, -0), 'negative zero');
        }));
        sortAxisAlignedPlanes(planes);
    });
}

function testIsAxisAligned(): void {
    assert.strictEqual(createBox([0, 0, 0]).isAxisAligned, true);
    assert.strictEqual(createBox([0, 0, 90]).isAxisAligned, true);
    assert.strictEqual(createBox([0, 0, 30]).isAxisAligned, false);
    assert.strictEqual(new SectionBox(null).isAxisAligned, false);
}

function testSorterToleratesNoise(): void {
    const planes = [
        plane([6e-17, 0, 1], [0, 0, 1]),
        plane([-0, 0, -1], [0, 0, -1]),
        plane([1, 6e-17, -0], [1, 0, 0]),
        plane([-1, 0, 0], [-1, 0, 0]),
        plane([0, -1, 1e-12], [0, -1, 0]),
        plane([0, 1, 0], [0, 1, 0])
    ];
    const sorted = sortAxisAlignedPlanes(planes);
    assert.strictEqual(sorted[0], planes[0]);
    assert.strictEqual(sorted[4], planes[4]);
}

function testSorterRejectsTiltedAndIncomplete(): void {
    const tilted = createBox([0, 0, 30]).toClippingPlanes();
    assert.throws(() => sortAxisAlignedPlanes(tilted), /not axis-aligned/);
    const planes = createBox([0, 0, 0]).toClippingPlanes();
    assert.throws(() => sortAxisAlignedPlanes(planes.slice(1)), /6 planes/);
    planes[1] = planes[0];
    assert.throws(() => sortAxisAlignedPlanes(planes), /could not be classified/);
}

function testChangeListener(): void {
    const box = new SectionBox(null);
    let count = 0;
    const off = box.addChangeListener(() => count++);
    box.setToPlanes(createBox([0, 0, 0]).toClippingPlanes());
    assert.strictEqual(count, 1, 'setToPlanes should notify once');
    off();
    box.clear();
    assert.strictEqual(count, 1, 'unsubscribed listener must not fire');
}

testNoNoiseInDirections();
testIsAxisAligned();
testSorterToleratesNoise();
testSorterRejectsTiltedAndIncomplete();
testChangeListener();
console.log('section-box-axis-aligned tests passed');
