attribute highp vec3 aVertex;
attribute highp vec4 aColour;
attribute highp float aId;

//transformations (model view and perspective matrix)
uniform mat3 uRotation;
uniform mat4 uPMatrix;
uniform float uAlpha;
uniform float uSelection;

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
	if (uColorCoding)
	{
		vColor = getIdColor(aId);
	}
	else
	{
		bool isSelected = abs(uSelection - aId) < 0.1;
		if (isSelected)
		{
			vColor = vec4(aColour.rgb, uAlpha);
		}
		else
		{
			vColor = vec4(aColour.rgb * 0.8, uAlpha);
		}
	}
	
	//gl_Position = uPMatrix * uRotation * vec4(aVertex, 1.0);
	vec4 point = vec4(uRotation * aVertex, 1.0);
	gl_Position = uPMatrix * point;
}