attribute highp float aVertexIndex;
attribute highp float aTransformationIndex;
attribute highp float aStyleIndex;
attribute highp float aProduct;
attribute highp vec2 aState;
attribute highp vec2 aNormal;

//transformations (model view and perspective matrix)
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

//Lights
uniform vec4 ulightA;
uniform vec4 ulightB;

//Highlighting colour
uniform vec4 uHighlightColour;

//One meter
uniform float uMeter;

//sets if all the colours are only to be used for colour coding of IDs
//this is used for picking
uniform bool uColorCoding;

//used for 3 states in x-ray rendering (no x-ray, only highlighted, only non-highlighted as semitransparent)
uniform int uRenderingMode;

//sampler with vertices
uniform highp sampler2D uVertexSampler;
uniform int uVertexTextureSize;

//sampler with transformation matrices
uniform highp sampler2D uMatrixSampler;
uniform int uMatrixTextureSize;

//sampler with default styles
uniform highp sampler2D uStyleSampler;
uniform int uStyleTextureSize;

//sampler with user defined styles
uniform highp sampler2D uStateStyleSampler;

//sampler used to decode normals
uniform highp sampler2D uNormalDecodeSampler;

//colour to go to fragment shader
varying vec4 vFrontColor;
varying vec4 vBackColor;
//varying position used for clipping in fragment shader
varying vec3 vPosition;
//state passed to fragment shader
varying float vDiscard;

vec3 getNormal(){
	float U = aNormal[0] / 252.0;
	float V = aNormal[1] / 252.0;
	return vec3(texture2D(uNormalDecodeSampler, vec2(U, V)));
	
	//The old way this was calculated every time for every index
	//float U = aNormal[0];
	//float V = aNormal[1];
	//float PI = 3.1415926535897932384626433832795;
	//float lon = U / 252.0 * 2.0 * PI;
	//float lat = V / 252.0 * PI;
	//
	//float x = sin(lon) * sin(lat);
	//float z = cos(lon) * sin(lat);
	//float y = cos(lat);
	//return normalize(vec3(x, y, z));
}

vec4 getIdColor(){
	float product = floor(aProduct + 0.5);
	float B = floor (product/(256.0*256.0));
	float G = floor((product  - B * 256.0*256.0)/256.0);
	float R = mod(product, 256.0);
	return vec4(R/255.0, G/255.0, B/255.0, 1.0);
}

vec2 getTextureCoordinates(int index, int size)
{
	float x = float(index - (index / size) * size); 
	float y = float(index / size);
	float pixelSize = 1.0 / float(size);
	//ask for the middle of the pixel
	return vec2((x + 0.5) * pixelSize, (y + 0.5) * pixelSize);
}


vec4 getColor(){
	if (uRenderingMode == 2){
		return vec4(0.0, 0.0, 0.3, 0.5); //x-ray semitransparent light blue colour
	}
	
	int restyle = int(floor(aState[1] + 0.5));
	if (restyle > 224){
		int index = int (floor(aStyleIndex + 0.5));
		vec2 coords = getTextureCoordinates(index, uStyleTextureSize);
		return texture2D(uStyleSampler, coords);
	}
	
	//return colour based on restyle
	vec2 coords = getTextureCoordinates(restyle, 15);
	return texture2D(uStateStyleSampler, coords);
}

vec3 getVertexPosition(){
	int index = int (floor(aVertexIndex +0.5));
	vec2 coords = getTextureCoordinates(index, uVertexTextureSize);
	vec3 point = vec3(texture2D(uVertexSampler, coords));
	
	int tIndex = int(floor(aTransformationIndex + 0.5));
	if (tIndex != 65535)
	{
		tIndex *=4;
		//get transformation matrix 4x4 and transform the point
		mat4 transform = mat4(
		texture2D(uMatrixSampler, getTextureCoordinates(tIndex, uMatrixTextureSize)),
		texture2D(uMatrixSampler, getTextureCoordinates(tIndex+1, uMatrixTextureSize)),
		texture2D(uMatrixSampler, getTextureCoordinates(tIndex+2, uMatrixTextureSize)),
		texture2D(uMatrixSampler, getTextureCoordinates(tIndex+3, uMatrixTextureSize))
		);
		
		return vec3(transform * vec4(point, 1.0));
	}
	
	return point;
	
}

void main(void) {
	//transform data to simulate camera perspective and position
	vec3 vertex = getVertexPosition();
	vec3 normal = getNormal();
	vec3 backNormal = normal * -1.0;

	int state = int(floor(aState[0] + 0.5));
	int restyle = int(floor(aState[1] + 0.5));
	//HIDDEN state or first stage of xray rendering and no style state
	if (state == 254 || (uRenderingMode == 1 && !(state == 253 || state == 252)) || (uRenderingMode == 2 && (state == 253 || state == 252)))
	{
		vDiscard = 1.0;
		return;
	}
	else
	{
		vDiscard = 0.0;
	}
	
	if (uColorCoding){
		vec4 idColor = getIdColor();
		vFrontColor = idColor;
		vBackColor = idColor;
	}
	else{
		//ulightA[3] represents intensity of the light
		float lightAIntensity = ulightA[3];
		vec3 lightADirection = normalize(ulightA.xyz - vertex);
		float lightBIntensity = ulightB[3];
		vec3 lightBDirection = normalize(ulightB.xyz - vertex);
		
		//Light weighting
		float lightWeightA = max(dot(normal, lightADirection ) * lightAIntensity, 0.0);
		float lightWeightB = max(dot(normal, lightBDirection ) * lightBIntensity, 0.0);
		float backLightWeightA = max(dot(backNormal, lightADirection) * lightAIntensity, 0.0);
		float backLightWeightB = max(dot(backNormal, lightBDirection) * lightBIntensity, 0.0);
		
		//minimal constant value is for ambient light
		float lightWeighting = lightWeightA + lightWeightB + 0.4;
		float backLightWeighting = backLightWeightA + backLightWeightB + 0.4;
		
		//get base color or set highlighted colour
		vec4 baseColor = state == 253 ? uHighlightColour : getColor();
		
		//offset semitransparent triangles
		if (baseColor.a < 0.98 && uRenderingMode == 0)
		{
			mat4 transpose = mat4(1);
			vec3 trans = -0.002 * uMeter * normalize(normal);
			transpose[3] = vec4(trans,1.0);
			vertex = vec3(transpose * vec4(vertex, 1.0));
		}
		
		//transform colour to simulate lighting
		//preserve original alpha channel
		vFrontColor = vec4(baseColor.rgb * lightWeighting, baseColor.a);
		vBackColor = vec4(baseColor.rgb * backLightWeighting, baseColor.a);
	}
	vPosition = vertex;
	gl_Position = uPMatrix * uMVMatrix * vec4(vertex, 1.0);
	
}			