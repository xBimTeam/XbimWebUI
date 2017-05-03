import { vec3 } from "./vec3";
import { quat } from "./quat";
export declare class mat4 {
    /**
 * Creates a new identity mat4
 *
 * @returns {mat4} a new 4x4 matrix
 */
    static create(): Float32Array;
    /**
     * Creates a new mat4 initialized with values from an existing matrix
     *
     * @param {mat4} a matrix to clone
     * @returns {mat4} a new 4x4 matrix
     */
    static clone(a: Float32Array): Float32Array;
    /**
     * Copy the values from one mat4 to another
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the source matrix
     * @returns {mat4} out
     */
    static copy(out: Float32Array, a: Float32Array): Float32Array;
    /**
     * Create a new mat4 with the given values
     *
     * @param {Number} m00 Component in column 0, row 0 position (index 0)
     * @param {Number} m01 Component in column 0, row 1 position (index 1)
     * @param {Number} m02 Component in column 0, row 2 position (index 2)
     * @param {Number} m03 Component in column 0, row 3 position (index 3)
     * @param {Number} m10 Component in column 1, row 0 position (index 4)
     * @param {Number} m11 Component in column 1, row 1 position (index 5)
     * @param {Number} m12 Component in column 1, row 2 position (index 6)
     * @param {Number} m13 Component in column 1, row 3 position (index 7)
     * @param {Number} m20 Component in column 2, row 0 position (index 8)
     * @param {Number} m21 Component in column 2, row 1 position (index 9)
     * @param {Number} m22 Component in column 2, row 2 position (index 10)
     * @param {Number} m23 Component in column 2, row 3 position (index 11)
     * @param {Number} m30 Component in column 3, row 0 position (index 12)
     * @param {Number} m31 Component in column 3, row 1 position (index 13)
     * @param {Number} m32 Component in column 3, row 2 position (index 14)
     * @param {Number} m33 Component in column 3, row 3 position (index 15)
     * @returns {mat4} A new mat4
     */
    static fromValues(m00: number, m01: number, m02: number, m03: number, m10: number, m11: number, m12: number, m13: number, m20: number, m21: number, m22: number, m23: number, m30: number, m31: number, m32: number, m33: number): Float32Array;
    /**
     * Set the components of a mat4 to the given values
     *
     * @param {mat4} out the receiving matrix
     * @param {Number} m00 Component in column 0, row 0 position (index 0)
     * @param {Number} m01 Component in column 0, row 1 position (index 1)
     * @param {Number} m02 Component in column 0, row 2 position (index 2)
     * @param {Number} m03 Component in column 0, row 3 position (index 3)
     * @param {Number} m10 Component in column 1, row 0 position (index 4)
     * @param {Number} m11 Component in column 1, row 1 position (index 5)
     * @param {Number} m12 Component in column 1, row 2 position (index 6)
     * @param {Number} m13 Component in column 1, row 3 position (index 7)
     * @param {Number} m20 Component in column 2, row 0 position (index 8)
     * @param {Number} m21 Component in column 2, row 1 position (index 9)
     * @param {Number} m22 Component in column 2, row 2 position (index 10)
     * @param {Number} m23 Component in column 2, row 3 position (index 11)
     * @param {Number} m30 Component in column 3, row 0 position (index 12)
     * @param {Number} m31 Component in column 3, row 1 position (index 13)
     * @param {Number} m32 Component in column 3, row 2 position (index 14)
     * @param {Number} m33 Component in column 3, row 3 position (index 15)
     * @returns {mat4} out
     */
    static set(out: any, m00: any, m01: any, m02: any, m03: any, m10: any, m11: any, m12: any, m13: any, m20: any, m21: any, m22: any, m23: any, m30: any, m31: any, m32: any, m33: any): Float32Array;
    /**
     * Set a mat4 to the identity matrix
     *
     * @param {mat4} out the receiving matrix
     * @returns {mat4} out
     */
    static identity(out: Float32Array): Float32Array;
    /**
     * Transpose the values of a mat4 not using SIMD
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the source matrix
     * @returns {mat4} out
     */
    static transpose(out: Float32Array, a: Float32Array): Float32Array;
    /**
     * Inverts a mat4 not using SIMD
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the source matrix
     * @returns {mat4} out
     */
    static invert(out: Float32Array, a: Float32Array): Float32Array;
    /**
     * Calculates the adjugate of a mat4 not using SIMD
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the source matrix
     * @returns {mat4} out
     */
    static adjoint(out: Float32Array, a: Float32Array): Float32Array;
    /**
     * Calculates the determinant of a mat4
     *
     * @param {mat4} a the source matrix
     * @returns {Number} determinant of a
     */
    static determinant(a: Float32Array): number;
    /**
     * Multiplies two mat4's explicitly not using SIMD
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the first operand
     * @param {mat4} b the second operand
     * @returns {mat4} out
     */
    static multiply(out: Float32Array, a: Float32Array, b: Float32Array): Float32Array;
    /**
     * Alias for {@link mat4.multiply}
     * @function
     */
    static mul: typeof mat4.multiply;
    /**
     * Translate a mat4 by the given vector not using SIMD
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the matrix to translate
     * @param {vec3} v vector to translate by
     * @returns {mat4} out
     */
    static translate(out: Float32Array, a: Float32Array, v: vec3 | number[]): Float32Array;
    /**
     * Scales the mat4 by the dimensions in the given vec3 not using vectorization
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the matrix to scale
     * @param {vec3} v the vec3 to scale the matrix by
     * @returns {mat4} out
     **/
    static scale(out: Float32Array, a: Float32Array, v: vec3): Float32Array;
    /**
     * Rotates a mat4 by the given angle around the given axis
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the matrix to rotate
     * @param {Number} rad the angle to rotate the matrix by
     * @param {vec3} axis the axis to rotate around
     * @returns {mat4} out
     */
    static rotate(out: Float32Array, a: Float32Array, rad: number, axis: vec3 | number[]): Float32Array;
    /**
     * Rotates a matrix by the given angle around the X axis not using SIMD
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the matrix to rotate
     * @param {Number} rad the angle to rotate the matrix by
     * @returns {mat4} out
     */
    static rotateX(out: Float32Array, a: Float32Array, rad: number): Float32Array;
    /**
     * Rotates a matrix by the given angle around the Y axis not using SIMD
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the matrix to rotate
     * @param {Number} rad the angle to rotate the matrix by
     * @returns {mat4} out
     */
    static rotateY(out: Float32Array, a: Float32Array, rad: number): Float32Array;
    /**
     * Rotates a matrix by the given angle around the Z axis not using SIMD
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the matrix to rotate
     * @param {Number} rad the angle to rotate the matrix by
     * @returns {mat4} out
     */
    static rotateZ(out: Float32Array, a: Float32Array, rad: number): Float32Array;
    /**
     * Creates a matrix from a vector translation
     * This is equivalent to (but much faster than):
     *
     *     public static identity(dest);
     *     public static translate(dest, dest, vec);
     *
     * @param {mat4} out mat4 receiving operation result
     * @param {vec3} v Translation vector
     * @returns {mat4} out
     */
    static fromTranslation(out: Float32Array, v: vec3): Float32Array;
    /**
     * Creates a matrix from a vector scaling
     * This is equivalent to (but much faster than):
     *
     *     public static identity(dest);
     *     public static scale(dest, dest, vec);
     *
     * @param {mat4} out mat4 receiving operation result
     * @param {vec3} v Scaling vector
     * @returns {mat4} out
     */
    static fromScaling(out: Float32Array, v: vec3): Float32Array;
    /**
     * Creates a matrix from a given angle around a given axis
     * This is equivalent to (but much faster than):
     *
     *     public static identity(dest);
     *     public static rotate(dest, dest, rad, axis);
     *
     * @param {mat4} out mat4 receiving operation result
     * @param {Number} rad the angle to rotate the matrix by
     * @param {vec3} axis the axis to rotate around
     * @returns {mat4} out
     */
    static fromRotation(out: Float32Array, rad: number, axis: vec3): Float32Array;
    /**
     * Creates a matrix from the given angle around the X axis
     * This is equivalent to (but much faster than):
     *
     *     public static identity(dest);
     *     public static rotateX(dest, dest, rad);
     *
     * @param {mat4} out mat4 receiving operation result
     * @param {Number} rad the angle to rotate the matrix by
     * @returns {mat4} out
     */
    static fromXRotation(out: Float32Array, rad: number): Float32Array;
    /**
     * Creates a matrix from the given angle around the Y axis
     * This is equivalent to (but much faster than):
     *
     *     public static identity(dest);
     *     public static rotateY(dest, dest, rad);
     *
     * @param {mat4} out mat4 receiving operation result
     * @param {Number} rad the angle to rotate the matrix by
     * @returns {mat4} out
     */
    static fromYRotation(out: Float32Array, rad: number): Float32Array;
    /**
     * Creates a matrix from the given angle around the Z axis
     * This is equivalent to (but much faster than):
     *
     *     public static identity(dest);
     *     public static rotateZ(dest, dest, rad);
     *
     * @param {mat4} out mat4 receiving operation result
     * @param {Number} rad the angle to rotate the matrix by
     * @returns {mat4} out
     */
    static fromZRotation(out: Float32Array, rad: number): Float32Array;
    /**
     * Creates a matrix from a quaternion rotation and vector translation
     * This is equivalent to (but much faster than):
     *
     *     public static identity(dest);
     *     public static translate(dest, vec);
     *     var quatMat = mat4.create();
     *     quat4.toMat4(quat, quatMat);
     *     public static multiply(dest, quatMat);
     *
     * @param {mat4} out mat4 receiving operation result
     * @param {quat} q Rotation quaternion
     * @param {vec3} v Translation vector
     * @returns {mat4} out
     */
    static fromRotationTranslation(out: Float32Array, q: quat, v: vec3): Float32Array;
    /**
     * Returns the translation vector component of a transformation
     *  matrix. If a matrix is built with fromRotationTranslation,
     *  the returned vector will be the same as the translation vector
     *  originally supplied.
     * @param  {vec3} out Vector to receive translation component
     * @param  {mat4} mat Matrix to be decomposed (input)
     * @return {vec3} out
     */
    static getTranslation(out: vec3, mat: Float32Array): vec3;
    /**
     * Returns the scaling factor component of a transformation
     *  matrix. If a matrix is built with fromRotationTranslationScale
     *  with a normalized Quaternion paramter, the returned vector will be
     *  the same as the scaling vector
     *  originally supplied.
     * @param  {vec3} out Vector to receive scaling factor component
     * @param  {mat4} mat Matrix to be decomposed (input)
     * @return {vec3} out
     */
    static getScaling(out: vec3, mat: Float32Array): vec3;
    /**
     * Returns a quaternion representing the rotational component
     *  of a transformation matrix. If a matrix is built with
     *  fromRotationTranslation, the returned quaternion will be the
     *  same as the quaternion originally supplied.
     * @param {quat} out Quaternion to receive the rotation component
     * @param {mat4} mat Matrix to be decomposed (input)
     * @return {quat} out
     */
    static getRotation(out: quat, mat: Float32Array): quat;
    /**
     * Creates a matrix from a quaternion rotation, vector translation and vector scale
     * This is equivalent to (but much faster than):
     *
     *     public static identity(dest);
     *     public static translate(dest, vec);
     *     var quatMat = mat4.create();
     *     quat4.toMat4(quat, quatMat);
     *     public static multiply(dest, quatMat);
     *     public static scale(dest, scale)
     *
     * @param {mat4} out mat4 receiving operation result
     * @param {quat4} q Rotation quaternion
     * @param {vec3} v Translation vector
     * @param {vec3} s Scaling vector
     * @returns {mat4} out
     */
    static fromRotationTranslationScale(out: Float32Array, q: quat, v: vec3, s: vec3): Float32Array;
    /**
     * Creates a matrix from a quaternion rotation, vector translation and vector scale, rotating and scaling around the given origin
     * This is equivalent to (but much faster than):
     *
     *     public static identity(dest);
     *     public static translate(dest, vec);
     *     public static translate(dest, origin);
     *     var quatMat = mat4.create();
     *     quat4.toMat4(quat, quatMat);
     *     public static multiply(dest, quatMat);
     *     public static scale(dest, scale)
     *     public static translate(dest, negativeOrigin);
     *
     * @param {mat4} out mat4 receiving operation result
     * @param {quat4} q Rotation quaternion
     * @param {vec3} v Translation vector
     * @param {vec3} s Scaling vector
     * @param {vec3} o The origin vector around which to scale and rotate
     * @returns {mat4} out
     */
    static fromRotationTranslationScaleOrigin(out: Float32Array, q: quat, v: vec3, s: vec3, o: vec3): Float32Array;
    /**
     * Calculates a 4x4 matrix from the given quaternion
     *
     * @param {mat4} out mat4 receiving operation result
     * @param {quat} q Quaternion to create matrix from
     *
     * @returns {mat4} out
     */
    static fromQuat(out: Float32Array, q: quat): Float32Array;
    /**
     * Generates a frustum matrix with the given bounds
     *
     * @param {mat4} out mat4 frustum matrix will be written into
     * @param {Number} left Left bound of the frustum
     * @param {Number} right Right bound of the frustum
     * @param {Number} bottom Bottom bound of the frustum
     * @param {Number} top Top bound of the frustum
     * @param {Number} near Near bound of the frustum
     * @param {Number} far Far bound of the frustum
     * @returns {mat4} out
     */
    static frustum(out: Float32Array, left: number, right: number, bottom: number, top: number, near: number, far: number): Float32Array;
    /**
     * Generates a perspective projection matrix with the given bounds
     *
     * @param {mat4} out mat4 frustum matrix will be written into
     * @param {number} fovy Vertical field of view in radians
     * @param {number} aspect Aspect ratio. typically viewport width/height
     * @param {number} near Near bound of the frustum
     * @param {number} far Far bound of the frustum
     * @returns {mat4} out
     */
    static perspective(out: Float32Array, fovy: number, aspect: number, near: number, far: number): Float32Array;
    /**
     * Generates a perspective projection matrix with the given field of view.
     * This is primarily useful for generating projection matrices to be used
     * with the still experiemental WebVR API.
     *
     * @param {mat4} out mat4 frustum matrix will be written into
     * @param {Object} fov Object containing the following values: upDegrees, downDegrees, leftDegrees, rightDegrees
     * @param {number} near Near bound of the frustum
     * @param {number} far Far bound of the frustum
     * @returns {mat4} out
     */
    static perspectiveFromFieldOfView(out: Float32Array, fov: {
        upDegrees: number;
        downDegrees: number;
        leftDegrees: number;
        rightDegrees: number;
    }, near: number, far: number): Float32Array;
    /**
     * Generates a orthogonal projection matrix with the given bounds
     *
     * @param {mat4} out mat4 frustum matrix will be written into
     * @param {number} left Left bound of the frustum
     * @param {number} right Right bound of the frustum
     * @param {number} bottom Bottom bound of the frustum
     * @param {number} top Top bound of the frustum
     * @param {number} near Near bound of the frustum
     * @param {number} far Far bound of the frustum
     * @returns {mat4} out
     */
    static ortho(out: Float32Array, left: number, right: number, bottom: number, top: number, near: number, far: number): Float32Array;
    /**
     * Generates a look-at matrix with the given eye position, focal point, and up axis
     *
     * @param {mat4} out mat4 frustum matrix will be written into
     * @param {vec3} eye Position of the viewer
     * @param {vec3} center Point the viewer is looking at
     * @param {vec3} up vec3 pointing up
     * @returns {mat4} out
     */
    static lookAt(out: Float32Array, eye: vec3 | number[], center: vec3 | number[], up: vec3 | number[]): Float32Array;
    /**
     * Returns a string representation of a mat4
     *
     * @param {mat4} a matrix to represent as a string
     * @returns {String} string representation of the matrix
     */
    static str(a: Float32Array): string;
    /**
     * Returns Frobenius norm of a mat4
     *
     * @param {mat4} a the matrix to calculate Frobenius norm of
     * @returns {Number} Frobenius norm
     */
    static frob(a: Float32Array): number;
    /**
     * Adds two mat4's
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the first operand
     * @param {mat4} b the second operand
     * @returns {mat4} out
     */
    static add(out: Float32Array, a: Float32Array, b: Float32Array): Float32Array;
    /**
     * Subtracts matrix b from matrix a
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the first operand
     * @param {mat4} b the second operand
     * @returns {mat4} out
     */
    static subtract(out: Float32Array, a: Float32Array, b: Float32Array): Float32Array;
    /**
     * Alias for {@link mat4.subtract}
     * @function
     */
    static sub: typeof mat4.subtract;
    /**
     * Multiply each element of the matrix by a scalar.
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the matrix to scale
     * @param {Number} b amount to scale the matrix's elements by
     * @returns {mat4} out
     */
    static multiplyScalar(out: Float32Array, a: Float32Array, b: number): Float32Array;
    /**
     * Adds two mat4's after multiplying each element of the second operand by a scalar value.
     *
     * @param {mat4} out the receiving vector
     * @param {mat4} a the first operand
     * @param {mat4} b the second operand
     * @param {Number} scale the amount to scale b's elements by before adding
     * @returns {mat4} out
     */
    static multiplyScalarAndAdd(out: Float32Array, a: Float32Array, b: Float32Array, scale: number): Float32Array;
    /**
     * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
     *
     * @param {mat4} a The first matrix.
     * @param {mat4} b The second matrix.
     * @returns {Boolean} True if the matrices are equal, false otherwise.
     */
    static exactEquals(a: Float32Array, b: Float32Array): boolean;
    /**
     * Returns whether or not the matrices have approximately the same elements in the same position.
     *
     * @param {mat4} a The first matrix.
     * @param {mat4} b The second matrix.
     * @returns {Boolean} True if the matrices are equal, false otherwise.
     */
    static equals(a: Float32Array, b: Float32Array): boolean;
}
