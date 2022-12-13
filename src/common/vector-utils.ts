import { vec3 } from "gl-matrix";

export class VectorUtils {
    public static getVec3(a: ArrayLike<number>) : vec3 {
        if(a.length >= 3)
            return vec3.fromValues(a[0], a[1], a[2]);
    }
}