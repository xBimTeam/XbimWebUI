attribute highp vec3 aVertex;
attribute highp vec4 aColour;

//transformations (model view and perspective matrix)
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

//this might be used for a color coding for pick operation
uniform bool uColorCoding;

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
	vColor = aColour;
	
	//gl_Position = uPMatrix * uMVMatrix * vec4(aVertex, 1.0);
	mat3 rotation = mat3(uMVMatrix);
	vec4 point = vec4(rotation * aVertex, 1.0);
	gl_Position = uPMatrix * point;
}