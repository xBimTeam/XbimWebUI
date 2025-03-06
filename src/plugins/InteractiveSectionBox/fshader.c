precision highp float;

uniform mat4 transformations[6];

uniform mat4 inverseProjectionMatrix;
uniform vec2 viewportDimensions;
uniform mat4 uPMatrix;

varying vec4 vColor;
varying mat4 planeTrsf;
varying vec3 FragPos;

void main(void) {
	gl_FragColor = vColor;
}