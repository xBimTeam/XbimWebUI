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

//One meter
uniform float uMeter;

//sets if all the colours are only to be used for colour coding of IDs
//this is used for picking
uniform bool uColorCoding;

//sampler with vertices
uniform highp sampler2D uVertexSampler;
uniform int uVertexTextureSize;

uniform highp sampler2D uMatrixSampler;
uniform int uMatrixTextureSize;

uniform highp sampler2D uStyleSampler;
uniform int uStyleTextureSize;

uniform highp sampler2D uStateStyleSampler;

//colour to go to fragment shader
varying vec4 vColor;
//varying position used for clipping in fragment shader
varying vec3 vPosition;
//state passed to fragment shader
varying float vDiscard;

//using this encoding the base normals are encoded as follows:
//  Z : [0,0,1]  : 0
// -Z : [0,0,-1] : 36
//  X : [1,0,0]  : 18
// -X : [-1,0,0] : 54
//  Y : [0,1,0]  : 1314
// -Y : [0,-1,0] : 1350
vec3 getNormal(){
	//normal is encoded as the second number in the array
	float U = aNormal[0];
	float V = aNormal[1];
	float PI = 3.1415926535897932384626433832795;
	float u = ((U / 252.0) * (2.0 * PI)) - PI;
	float v = ((V / 252.0) * (2.0 * PI)) - PI;
	
	float x = sin(v) * cos(u);
	float y = sin(v) * sin(u);
	float z = cos(v);
	return normalize(vec3(x, y, z));
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
	float x = float(index - (index / size) * size); //mod(index, uVertexTextureSize);
	float y = float(index / size);
	float pixelSize = 1.0 / float(size);
	return vec2((x + 0.5) * pixelSize, (y + 0.5) * pixelSize);
}


vec4 getColor(){
	int restyle = int(floor(aState[1] + 0.5));
	//return colour based on restyle
	if (restyle > 224){
		int index = int (floor(aStyleIndex + 0.5));
		vec2 coords = getTextureCoordinates(index, uStyleTextureSize);
		return texture2D(uStyleSampler, coords);
	}
	else{
		vec2 coords = getTextureCoordinates(restyle, 15);
		return texture2D(uStateStyleSampler, coords);
	}
	
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
	int state = int(floor(aState[0] + 0.5));
	
	if (state == 254) //HIDDEN state
	{
		vDiscard = 1.0;
		return;
	}
	
	if (uColorCoding){
		vColor = getIdColor();					
	}
	else{
		//ulightA[3] represents intensity of the light
		float lightAIntensity = ulightA[3];
		vec3 lightADirection = normalize(ulightA.xyz - vPosition);
		float lightBIntensity = ulightB[3];
		vec3 lightBDirection = normalize(ulightB.xyz - vPosition);
		
		//Light weighting
		float lightWeightA = max(dot(normal, lightADirection ) * lightAIntensity, 0.0);
		float lightWeightB = max(dot(normal, lightBDirection ) * lightBIntensity, 0.0);
		
		//minimal constant value is for ambient light
		float lightWeighting = lightWeightA + lightWeightB + 0.4;
		
		//get base color or set highlighted colour
		vec4 baseColor = state == 253 ? vec4(0.168, 0.839, 0.984, 1.0) : getColor();
		
		//offset semitransparent triangles
		if (baseColor.a < 1.0)
		{
			mat4 transpose = mat4(1);
			vec3 trans = -0.002 * uMeter * normalize(normal);
			transpose[3] = vec4(trans,1.0);
			vertex = vec3(transpose * vec4(vertex, 1.0));
		}
		
		//transform colour to simulate lighting
		//preserve original alpha channel
		vColor = vec4(baseColor.rgb * lightWeighting, baseColor.a);
	}
	vPosition = vertex;
	gl_Position = uPMatrix * uMVMatrix * vec4(vertex, 1.0);
	
}			