import assert = require("assert");
import { vec3 } from "gl-matrix";
import { SectionBox } from "../src/section-box";
import {
    BoxFrame, facePlane, frameCorners, frameFromSectionBox, moveFace, normalizeAngle, rotatedYaw, snapAngle, angleAround
} from "../src/plugins/InteractiveSectionBox/box-frame";

const EPS = 1e-9;
const deg = (d: number) => d * Math.PI / 180;

function near(a: number[], b: number[], eps = EPS): void {
    assert.strictEqual(a.length, b.length);
    a.forEach((v, i) => assert.ok(Math.abs(v - b[i]) < eps, `expected [${b}] got [${a}]`));
}

function boxFromFrame(frame: BoxFrame): SectionBox {
    const box = new SectionBox(null);
    box.location = vec3.fromValues(frame.centre[0], frame.centre[1], frame.centre[2]);
    box.lengthX = frame.half[0] * 2;
    box.lengthY = frame.half[1] * 2;
    box.lengthZ = frame.half[2] * 2;
    box.rotationX = 0;
    box.rotationY = 0;
    box.rotationZ = frame.yaw * 180 / Math.PI;
    return box;
}

function testCornersAtYaw90(): void {
    const frame: BoxFrame = { centre: [10, 20, 30], half: [2, 3, 4], yaw: deg(90) };
    const corners = frameCorners(frame);
    assert.strictEqual(corners.length, 8);
    // local (+2, -3, +4): rotated by 90 degrees about Z becomes (3, 2, 4)
    near(corners[0], [13, 22, 34]);
    // local (-2, +3, -4) is the opposite corner
    near(corners[7], [7, 18, 26]);
}

function testFacePlanesMatchSectionBox(): void {
    [0, 30, 90, 135, -170].forEach(yawDeg => {
        const frame: BoxFrame = { centre: [10, 20, 30], half: [2, 3, 4], yaw: deg(yawDeg) };
        const planes = boxFromFrame(frame).toClippingPlanes();
        // toClippingPlanes order is (Y+, Y-, X+, X-, Z+, Z-); tool order is (Z+, Z-, X+, X-, Y-, Y+)
        const mapping: [number, number][] = [[4, 0], [5, 1], [2, 2], [3, 3], [1, 4], [0, 5]];
        mapping.forEach(([planeIndex, face]) => {
            const expected = facePlane(frame, face);
            near(planes[planeIndex].direction, expected.direction, 1e-5);
            near(planes[planeIndex].location, expected.location, 1e-4);
        });
    });
}

function testSectionBoxRoundTrip(): void {
    const frame: BoxFrame = { centre: [1, 2, 3], half: [2, 3, 4], yaw: deg(40) };
    const box = new SectionBox(null);
    assert.ok(box.setToPlanes(boxFromFrame(frame).toClippingPlanes()));
    assert.ok(box.isZRotationOnly);
    const back = frameFromSectionBox(box.location, box.lengthX, box.lengthY, box.lengthZ, box.rotationZ);
    near(back.centre, frame.centre, 1e-6);
    near(back.half, frame.half, 1e-6);
    assert.ok(Math.abs(back.yaw - frame.yaw) < 1e-6);
}

function testIsZRotationOnly(): void {
    assert.strictEqual(new SectionBox(null).isZRotationOnly, false);
    const box = boxFromFrame({ centre: [0, 0, 0], half: [1, 1, 1], yaw: deg(33) });
    assert.strictEqual(box.isZRotationOnly, true);
    box.rotationX = 20;
    assert.strictEqual(box.isZRotationOnly, false);
    box.rotationX = 360;
    assert.strictEqual(box.isZRotationOnly, true);
}

function testMoveFace(): void {
    const frame: BoxFrame = { centre: [0, 0, 0], half: [2, 3, 4], yaw: deg(90) };
    // face 2 is local +X which points along world +Y at yaw 90
    assert.ok(moveFace(frame, 2, 2, 0.1));
    near(frame.half, [3, 3, 4]);
    near(frame.centre, [0, 1, 0]);
    // the opposite (local -X) face stays where it was: world y = -2
    near(facePlane(frame, 3).location, [0, -2, 0]);
    // shrinking below the minimum is rejected
    assert.strictEqual(moveFace(frame, 2, -10, 0.1), false);
    near(frame.half, [3, 3, 4]);
}

function testAngles(): void {
    assert.ok(Math.abs(normalizeAngle(deg(190)) - deg(-170)) < EPS);
    assert.ok(Math.abs(normalizeAngle(deg(-180)) - deg(180)) < EPS);
    assert.ok(Math.abs(snapAngle(deg(12)) - deg(10)) < EPS);
    assert.ok(Math.abs(snapAngle(deg(13)) - deg(15)) < EPS);
    assert.ok(Math.abs(angleAround([1, 1, 0], [1, 3, 0]) - deg(90)) < EPS);

    // pointer moved 20 degrees counter-clockwise from a 10 degree start; snapped result is a multiple of 5
    const start = deg(10);
    const snapped = rotatedYaw(deg(3), start, start + deg(22.4), true);
    assert.ok(Math.abs(snapped - deg(25)) < EPS);
    const free = rotatedYaw(deg(3), start, start + deg(22.4), false);
    assert.ok(Math.abs(free - deg(25.4)) < EPS);
    // crossing the +/-180 boundary keeps the delta small
    const wrapped = rotatedYaw(0, deg(179), deg(-179), false);
    assert.ok(Math.abs(wrapped - deg(2)) < EPS);
}

testCornersAtYaw90();
testFacePlanesMatchSectionBox();
testSectionBoxRoundTrip();
testIsZRotationOnly();
testMoveFace();
testAngles();
console.log('box-frame tests passed');
