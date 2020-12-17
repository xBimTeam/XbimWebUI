attribute vec3 coordinates;

//transformations (model view and perspective matrix)
uniform mat4 uMvMatrix;
uniform mat4 uPMatrix;

void main(void) {
    gl_Position = uPMatrix * uMvMatrix * vec4(coordinates, 1.0);
}