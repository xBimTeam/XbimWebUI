import { mat4 } from "./mat4";
export declare class mat3 {
    /**
    * Creates a new identity mat3
    *
    * @returns {mat3} a new 3x3 matrix
    */
    static create: () => Float32Array;
    /**
    * Copies the upper-left 3x3 values into the given mat3.
    *
    * @param {mat3} out the receiving 3x3 matrix
    * @param {mat4} a   the source 4x4 matrix
    * @returns {mat3} out
    */
    static fromMat4(out: Float32Array, a: mat4): Float32Array;
}
