import assert = require("assert");
import { mat4, vec3 } from "gl-matrix";
import { SectionBox } from "../src/section-box";

const EPS = 1e-2;

function near(actual: number, expected: number, message: string): void {
    assert.ok(Math.abs(actual - expected) < EPS, `${message}: expected ${expected}, got ${actual}`);
}

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

// Bbox format is [minX, minY, minZ, sizeX, sizeY, sizeZ]
function testUnrotatedBox(): void {
    const box = createBox([10, 20, 30], [4, 6, 8], [0, 0, 0]);
    const bb = box.getBoundingBox(vec3.create());
    [8, 17, 26, 4, 6, 8].forEach((v, i) => near(bb[i], v, `unrotated bbox[${i}]`));
}

// Regression: rotation used to be applied to the translation, shifting the bbox
// away from the box location and hiding icons that were inside the section box.
function testRotatedBoxIsCentredOnLocation(): void {
    const location = [-1099.873779296875, 601.02880859375, 550];
    const box = createBox(location, [12199.74755859375, 3100, 15936.8974609375], [-90, 0, 0]);
    const bb = box.getBoundingBox(vec3.create());

    // rotating 90deg around X swaps the Y and Z extents
    near(bb[3], 12199.74755859375, "size X");
    near(bb[4], 15936.8974609375, "size Y");
    near(bb[5], 3100, "size Z");

    for (let i = 0; i < 3; i++) {
        near(bb[i] + bb[i + 3] / 2, location[i], `bbox centre ${i}`);
    }

    // sensor positions from the failing case must be inside
    [[-3081.0986, 1581.0823, 1250], [3893.9014, 2677.3323, 1250], [3893.9014, -125.1677, 1250]].forEach((p, n) => {
        for (let i = 0; i < 3; i++) {
            assert.ok(p[i] >= bb[i] && p[i] <= bb[i] + bb[i + 3], `point ${n} outside bbox on axis ${i}`);
        }
    });
}

function testRotatedBoxBoundsAllShaderInsidePoints(): void {
    const wcs = vec3.fromValues(100, -50, 25);
    const box = createBox([500, 300, 200], [400, 100, 50], [30, 45, 60]);
    const bb = box.getBoundingBox(wcs);
    const inverse = mat4.invert(mat4.create(), box.getMatrix(wcs));

    // every point the shader considers inside the box must be inside the bbox
    for (let x = -1; x <= 1; x += 0.25) {
        for (let y = -1; y <= 1; y += 0.25) {
            for (let z = -1; z <= 1; z += 0.25) {
                const p = vec3.transformMat4(vec3.create(), vec3.fromValues(x, y, z), inverse);
                for (let i = 0; i < 3; i++) {
                    assert.ok(p[i] >= bb[i] - EPS && p[i] <= bb[i] + bb[i + 3] + EPS,
                        `shader-inside point [${x},${y},${z}] outside bbox on axis ${i}`);
                }
            }
        }
    }
}

function testBoundingBoxCacheInvalidatedOnChange(): void {
    const box = createBox([0, 0, 0], [2, 2, 2], [0, 0, 0]);
    const wcs = vec3.create();
    near(box.getBoundingBox(wcs)[0], -1, "initial min X");
    box.location = vec3.fromValues(10, 0, 0);
    near(box.getBoundingBox(wcs)[0], 9, "min X after move");
}

testUnrotatedBox();
testRotatedBoxIsCentredOnLocation();
testRotatedBoxBoundsAllShaderInsidePoints();
testBoundingBoxCacheInvalidatedOnChange();
