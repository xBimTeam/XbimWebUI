precision mediump float;

uniform vec4 uClippingPlane;

varying vec4 vFrontColor;
varying vec4 vBackColor;
//position in real world. This is used for clipping.
varying vec3 vPosition;
//state passed to fragment shader
varying float vDiscard;

void main(void) {
	if ( int(vDiscard + 0.5) != 0) discard;
	
	if (ivec4(uClippingPlane + 0.5) != ivec4(0, 0, 0, 0))
	{
		//clipping test
		vec4 p = uClippingPlane;
		vec3 x = vPosition;
		float distance = (p.x * x.x + p.y * x.y + p.z * x.z + p.w) / sqrt(p.x * p.x + p.y * p.y  + p.z * p.z);
		if (int(distance + 0.5) < 0){
			discard;
		}
		
	}
	
	//fix wrong normals
	//gl_FragColor = gl_FrontFacing ? vFrontColor : vBackColor;
	//gl_FragColor = vBackColor;
	gl_FragColor = vFrontColor;
}