attribute highp vec3 aVertex;
attribute highp vec4 aColour;
attribute highp float aId;

//transformations (model view and perspective matrix)
uniform mat4 uMvMatrix;
uniform mat4 uPMatrix;

//this might be used for a color coding for pick operation
uniform mediump float uColorCoding; 

//this will pass colour information to fragment shader
varying vec4 vColor;

vec4 getIdColor(float id){
	float product = floor(id + 0.5);
	float B = floor(product / (256.0*256.0));
	float G = floor((product - B * 256.0*256.0) / 256.0);
	float R = mod(product, 256.0);
	return vec4(R / 255.0, G / 255.0, B / 255.0, 1.0);
}

void main(void) {
    gl_Position = uPMatrix * uMvMatrix * vec4(aVertex, 1.0);

	if (uColorCoding > 0.5)
	{
		vColor = getIdColor(aId);
	}
	else if (uColorCoding < -0.5)
	{
		vColor = getIdColor(1000010.0);
	}
	else
	{
		vColor = aColour;
	}
}