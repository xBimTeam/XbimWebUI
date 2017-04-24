/**
 * @class Common utilities
 * @name glMatrix
 */
export declare class glMatrix {
    static EPSILON: number;
    static ARRAY_TYPE: Float32ArrayConstructor | ArrayConstructor;
    static RANDOM: () => number;
    static ENABLE_SIMD: boolean;
    static SIMD_AVAILABLE: boolean;
    static USE_SIMD: boolean;
    private static degree;
    /**
     * Sets the type of array used when creating new vectors and matrices
     *
     * @param {Type} type Array type, such as Float32Array or Array
     */
    static setMatrixArrayType(type: any): void;
    /**
    * Convert Degree To Radian
    *
    * @param {Number} a Angle in Degrees
    */
    static toRadian(a: number): number;
    /**
     * Tests whether or not the arguments have approximately the same value, within an absolute
     * or relative tolerance of glMatrix.EPSILON (an absolute tolerance is used for values less
     * than or equal to 1.0, and a relative tolerance is used for larger values)
     *
     * @param {Number} a The first number to test.
     * @param {Number} b The second number to test.
     * @returns {Boolean} True if the numbers are approximately equal, false otherwise.
     */
    static equals(a: number, b: number): boolean;
}
