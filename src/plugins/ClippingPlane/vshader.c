attribute highp vec3 aVertex;
attribute highp vec4 aColour;
attribute highp float aId;

//transformations (model view and perspective matrix)
uniform mat4 uMvMatrix;
uniform mat4 uPMatrix;

//this might be used for a color coding for pick operation
uniform mediump float uColorCoding; 
uniform mediump float uSelectedId;


uniform vec4 uHoverPickColour;

//this will pass colour information to fragment shader
varying vec4 vColor;

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

	bool ignoreVec = false;
	if (uColorCoding > 0.5 && uColorCoding <= 1.0)
	{
		ignoreVec = aId == 4.0;
		vColor = getIdColor(aId);
	}
	else if (uColorCoding < -0.5)
	{
		ignoreVec = aId == 4.0;
		vColor = getIdColor(1000010.0);
	}
	else
	{ 
		if(uSelectedId == aId)
		{ 
			vColor = aColour; 
		}
		else
		{
			if(uSelectedId > 0.0) // there is a selection
			{
				if(aId != 4.0){ // hide other controls but leave the plane
					ignoreVec = true;
				}
				else if(uSelectedId != 4.0) 
					vColor = getTransparentColor(aColour, 1.5);
			}
			else 
				vColor = aColour;
		}
	}

	if(!ignoreVec)
	{
   		gl_Position = uPMatrix * uMvMatrix * vec4(aVertex, 1.0);
	}

}