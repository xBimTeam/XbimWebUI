/**
 * Geometry of an upright box rotated about the world Z axis (yaw). Pure maths, no rendering dependencies.
 * Local axes: X (front/back), Y (right/left), Z (top/bottom). Yaw is counter-clockwise, in radians,
 * matching SectionBox.rotationZ (degrees).
 */
export interface BoxFrame {
    centre: number[];
    /** Half extents along the local X, Y and Z axes */
    half: number[];
    yaw: number;
}

/** Local outward face normals in the canonical face order [top, bottom, front(+X), back(-X), (-Y), (+Y)] */
export const FACE_NORMALS: number[][] = [
    [0, 0, 1], [0, 0, -1], [1, 0, 0], [-1, 0, 0], [0, -1, 0], [0, 1, 0]
];

/* 5 degrees is the default rotation snap */
export const DEFAULT_SNAP_STEP = 5 * Math.PI / 180;

export function frameFromSectionBox(location: ArrayLike<number>, lengthX: number, lengthY: number, lengthZ: number, rotationZDegrees: number): BoxFrame {
    return {
        centre: [location[0], location[1], location[2]],
        half: [lengthX / 2, lengthY / 2, lengthZ / 2],
        yaw: normalizeAngle(rotationZDegrees * Math.PI / 180)
    };
}

export function rotateZ(v: ArrayLike<number>, yaw: number): number[] {
    const c = Math.cos(yaw);
    const s = Math.sin(yaw);
    return [c * v[0] - s * v[1], s * v[0] + c * v[1], v[2]];
}

/** World direction of a local direction */
export function worldDirection(frame: BoxFrame, local: ArrayLike<number>): number[] {
    return rotateZ(local, frame.yaw);
}

/** World position of a local offset from the box centre */
export function localToWorld(frame: BoxFrame, local: ArrayLike<number>): number[] {
    const r = rotateZ(local, frame.yaw);
    return [frame.centre[0] + r[0], frame.centre[1] + r[1], frame.centre[2] + r[2]];
}

/** Local axis (0 = X, 1 = Y, 2 = Z) a face is perpendicular to */
export function faceAxis(face: number): number {
    const n = FACE_NORMALS[face];
    return n[0] !== 0 ? 0 : n[1] !== 0 ? 1 : 2;
}

/**
 * The 8 corners. Order: index = bottom * 4 + back * 2 + right, where bottom/back/right are 0 or 1
 * (back = local -X, right = local +Y).
 */
export function frameCorners(frame: BoxFrame): number[][] {
    const corners: number[][] = [];
    for (let bottom = 0; bottom < 2; bottom++) {
        for (let back = 0; back < 2; back++) {
            for (let right = 0; right < 2; right++) {
                corners.push(localToWorld(frame, [
                    back ? -frame.half[0] : frame.half[0],
                    right ? frame.half[1] : -frame.half[1],
                    bottom ? -frame.half[2] : frame.half[2]]));
            }
        }
    }
    return corners;
}

/** Outward direction and a point on the plane of a face (world coordinates) */
export function facePlane(frame: BoxFrame, face: number): { direction: number[], location: number[] } {
    const n = FACE_NORMALS[face];
    return {
        direction: worldDirection(frame, n),
        location: localToWorld(frame, [n[0] * frame.half[0], n[1] * frame.half[1], n[2] * frame.half[2]])
    };
}

/**
 * Moves a face by a distance along its outward normal (negative moves it inwards). The opposite face stays put.
 * Returns false (and leaves the frame unchanged) if the box would become thinner than minSize while shrinking.
 */
export function moveFace(frame: BoxFrame, face: number, distance: number, minSize: number): boolean {
    const axis = faceAxis(face);
    const newHalf = frame.half[axis] + distance / 2;
    if (distance < 0 && newHalf * 2 <= minSize) {
        return false;
    }
    const direction = worldDirection(frame, FACE_NORMALS[face]);
    frame.half[axis] = newHalf;
    for (let i = 0; i < 3; i++) {
        frame.centre[i] += direction[i] * distance / 2;
    }
    return true;
}

/** Normalises an angle to (-PI, PI] */
export function normalizeAngle(angle: number): number {
    const twoPi = Math.PI * 2;
    let a = angle % twoPi;
    if (a > Math.PI) a -= twoPi;
    if (a <= -Math.PI) a += twoPi;
    return a;
}

export function snapAngle(angle: number, step: number = DEFAULT_SNAP_STEP): number {
    return normalizeAngle(Math.round(angle / step) * step);
}

/** Angle (counter-clockwise from +X) of a point around a centre, measured in the XY plane */
export function angleAround(centre: ArrayLike<number>, point: ArrayLike<number>): number {
    return Math.atan2(point[1] - centre[1], point[0] - centre[0]);
}

/**
 * New yaw after dragging a rotation handle.
 * @param startYaw yaw when the drag started
 * @param startAngle angle of the pointer around the centre when the drag started
 * @param currentAngle current angle of the pointer around the centre
 * @param snap snap result to the step (5 degrees by default)
 */
export function rotatedYaw(startYaw: number, startAngle: number, currentAngle: number, snap: boolean, step: number = DEFAULT_SNAP_STEP): number {
    const yaw = normalizeAngle(startYaw + normalizeAngle(currentAngle - startAngle));
    return snap ? snapAngle(yaw, step) : yaw;
}
