precision mediump float;

uniform vec4 uClippingPlane;

varying vec4 vColor;
//position in real world. This is used for clipping.
varying vec3 vPosition;
//state passed to fragment shader
varying float vDiscard;

void main(void) {
	if (vDiscard != 0.0) discard;
	
	if (uClippingPlane != vec4(0.0, 0.0, 0.0, 0.0))
	{
		//clipping test
		vec4 p = uClippingPlane;
		vec3 x = vPosition;
		float distance = (p.x * x.x + p.y * x.y + p.z * x.z + p.w) / sqrt(p.x * p.x + p.y * p.y  + p.z * p.z);
		if (distance < 0.0){
			discard;
		}
		
	}
	gl_FragColor = vColor;
}