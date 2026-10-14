precision highp float;

uniform mat4 transformations[6];

uniform mat4 inverseProjectionMatrix;
uniform vec2 viewportDimensions;
uniform mat4 uPMatrix;

varying vec4 vColor;
varying float vDist;
uniform float uDashPeriod;
varying mat4 planeTrsf;
varying vec3 FragPos;

void main(void) {
	if (uDashPeriod > 0.0 && mod(vDist, uDashPeriod) > uDashPeriod * 0.5) {
		discard;
	}
	gl_FragColor = vColor;
}