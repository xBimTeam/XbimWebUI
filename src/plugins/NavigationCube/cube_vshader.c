attribute highp vec3 aVertex;
attribute highp vec2 aTexCoord;
attribute highp float aId;

//transformations (model view and perspective matrix)
uniform mat3 uRotation;
uniform mat4 uPMatrix;


//this might be used for a color coding for pick operation
uniform mediump float uColorCoding; 
uniform float uSelection;

//this will pass colour information to fragment shader
varying vec2 vTexCoord;
varying vec4 vIdColor;

vec4 getIdColor(float id){
	float product = floor(id + 0.5);
	float B = floor(product / (256.0*256.0));
	float G = floor((product - B * 256.0*256.0) / 256.0);
	float R = mod(product, 256.0);
	return vec4(R / 255.0, G / 255.0, B / 255.0, 1.0);
}

void main(void) {
	vec4 point = vec4(uRotation * aVertex, 1.0);
	gl_Position = uPMatrix * point;
	vTexCoord = aTexCoord;

	if (uColorCoding == 1.0)
	{
		vIdColor = getIdColor(aId);
		return;
	}

	if (uColorCoding > 1.0)
	{
		vIdColor = getIdColor(float(uColorCoding));
		return;
	}
	
	bool isSelected = abs(uSelection - aId) < 0.1;
	if (isSelected){
		vIdColor = vec4(-1.0, -1.0, -1.0, -1.0);
	}
	else{
		vIdColor = vec4(1.0, 1.0, 1.0, 1.0);
	}
}