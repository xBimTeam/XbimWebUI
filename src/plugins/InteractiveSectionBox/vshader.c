attribute highp vec3 aVertex;
attribute highp vec4 aColour;
attribute highp float aId;

uniform mat4 uMvMatrix;
uniform mat4 uPMatrix;

uniform mediump float uColorCoding; 
uniform mediump float uSelectedId;

uniform vec4 uHoverPickColour;

varying vec4 vColor;
varying vec3 FragPos;
varying mat4 planeTrsf;

vec4 getIdColor(float id){
	float product = floor(id + 0.5);
	float B = floor(product / (256.0*256.0));
	float G = floor((product - B * 256.0*256.0) / 256.0);
	float R = mod(product, 256.0);
	return vec4(R / 255.0, G / 255.0, B / 255.0, 1.0);
}

vec4 getTransparentColor(vec4 color, float transparency){
	mat4 aMat4 = mat4(1.0, 0.0, 0.0, 0.0,
                  0.0, 1.0, 0.0, 0.0,
                  0.0, 0.0, 1.0, 0.0,
                  0.0, 0.0, 0.0, transparency);
	return aMat4 * color;
}

void main(void) {

	if (uColorCoding == 1.0)
	{
		vColor = getIdColor(aId);
	}
	else if (uColorCoding > 1.0)
	{
		vColor = getIdColor(float(uColorCoding));
	}
	else
	{ 
		if(uSelectedId == aId)
		{ 
			vColor = aColour; 
		}
		else
		{
			vColor = getTransparentColor(aColour, 0.5);
		}
	}

	gl_Position = uPMatrix *  uMvMatrix * (vec4(aVertex, 1.0) );
}
