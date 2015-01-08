attribute highp float aVertexIndex;
attribute highp float aTransformationIndex;
attribute highp float aStyleIndex;
attribute highp float aProduct;
attribute highp float aState;
attribute highp vec2 aNormal;

//transformations (model view and perspective matrix)
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

//Lights
uniform vec4 ulightA;
uniform vec4 ulightB;

//sets if all the colours are only to be used for colour coding of IDs
//this is used for picking
uniform bool uColorCoding;

uniform bool uFloatingPoint;

//sampler with vertices
uniform highp sampler2D uVertexSampler;
uniform int uVertexTextureSize;

uniform highp sampler2D uMatrixSampler;
uniform int uMatrixTextureSize;

uniform highp sampler2D uStyleSampler;
uniform int uStyleTextureSize;

uniform highp sampler2D uStateStyleSampler;
int stateStyleTextureSize = 15;


//colour to go to fragment shader
varying vec4 vColor;
//varying position used for clipping in fragment shader
varying vec3 vPosition;

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
	float R = mod(aProduct, 256.0) / 255.0;
	float G = floor(aProduct/256.0) / 255.0;
	float B = floor (aProduct/(256.0*256.0)) / 255.0;
	return vec4(R, G, B, 1.0);
}

vec2 getVertexTextureCoordinates(int index, int size)
{
	float x = float(index - (index / size) * size); //mod(index, uVertexTextureSize);
	float y = float(index / size);
	
	float pixelSize = 1.0 / float(size);
	
	
	return vec2((x + 0.5) * pixelSize, (y + 0.5) * pixelSize);
}

int getByteFromScale(float base)
{
	float result = base * 255.0;
	int correction = fract(result) >= 0.5 ? 1 : 0; 
	return int(result) + correction;
}

ivec4 getPixel(int index, sampler2D sampler, int size)
{
	vec2 coords = getVertexTextureCoordinates(index, size);
	vec4 pixel = texture2D(sampler, coords);
	
	return ivec4(
	getByteFromScale(pixel.r), 
	getByteFromScale(pixel.g), 
	getByteFromScale(pixel.b), 
	getByteFromScale(pixel.a)
	);
}

void getBits(ivec4 pixel, out int result[32])
{
	for (int i = 0; i < 4; i++)
	{
		int actualByte = pixel[i];
		for (int j = 0; j < 8; j++)
		{
			result[31 - (j + i * 8)] =  actualByte - (actualByte / 2) * 2;
			actualByte /= 2;
		}
	}
}

float getFloatFromPixel(ivec4 pixel)
{
	int bits[32]; 
	getBits(pixel, bits);
	
	float sign =  bits[0] == 0 ? 1.0 : -1.0; 
	highp float fraction = 1.0;
	highp float exponent = 0.0;
	
	//exponent is INT encoded in 1-9 bits
	for (int i = 1; i < 9; i++)
	{
		exponent += float(bits[9 - i]) * exp2(float (i - 1));
	}
	exponent -= 127.0; //IEEE bias
	
	//fraction is encoded in 10 - 32 bits
	for (int i = 9; i < 32; i++)
	{
		fraction += float(bits[i]) * exp2(float((-1)*(i-8)));
	}
	
	return sign * fraction * exp2(exponent);
}

float getFloatFromPixel(int index, sampler2D sampler, int size)
{
	ivec4 pixel = getPixel(index, sampler, size);
	return getFloatFromPixel(pixel);
}

vec4 getColor(){
	//int tIndex = int(floor(aTransformationIndex + 0.5));
	//if (tIndex != 65535)
	//return vec4(1.0,0.0,0.0,1.0);
	//else
	//return vec4(1.0,1.0,1.0,1.0);
	
	
	//return colour based on state
	if (floor(aState + 0.5) == 0.0){
		int index = int (floor(aStyleIndex + 0.5));
		vec2 coords = getVertexTextureCoordinates(index, uStyleTextureSize);
		return texture2D(uStyleSampler, coords);
	}
	else{
		return vec4(1.0,1.0,1.0,1.0);
	}
	
}

vec3 getVertexPosition(){
	int index = int (floor(aVertexIndex +0.5))* 3;
	vec3 position = vec3(
	getFloatFromPixel(index, uVertexSampler, uVertexTextureSize),
	getFloatFromPixel(index + 1, uVertexSampler, uVertexTextureSize),
	getFloatFromPixel(index + 2, uVertexSampler, uVertexTextureSize)
	);
	
	//transform if necessary
	int tIndex = int(floor(aTransformationIndex + 0.5));
	if (tIndex != 65535)
	{
		tIndex *= 16;
		//get transformation matrix 4x4 and transform the point
		mat4 transform = mat4(
		//first column
		getFloatFromPixel(tIndex + 0, uMatrixSampler, uMatrixTextureSize),
		getFloatFromPixel(tIndex + 1, uMatrixSampler, uMatrixTextureSize),
		getFloatFromPixel(tIndex + 2, uMatrixSampler, uMatrixTextureSize),
		getFloatFromPixel(tIndex + 3, uMatrixSampler, uMatrixTextureSize),
		//second column         
		getFloatFromPixel(tIndex + 4, uMatrixSampler, uMatrixTextureSize),
		getFloatFromPixel(tIndex + 5, uMatrixSampler, uMatrixTextureSize),
		getFloatFromPixel(tIndex + 6, uMatrixSampler, uMatrixTextureSize),
		getFloatFromPixel(tIndex + 7, uMatrixSampler, uMatrixTextureSize),
		//third column          
		getFloatFromPixel(tIndex + 8, uMatrixSampler, uMatrixTextureSize),
		getFloatFromPixel(tIndex + 9, uMatrixSampler, uMatrixTextureSize),
		getFloatFromPixel(tIndex + 10, uMatrixSampler, uMatrixTextureSize),
		getFloatFromPixel(tIndex + 11, uMatrixSampler, uMatrixTextureSize),
		//fourth column         
		getFloatFromPixel(tIndex + 12, uMatrixSampler, uMatrixTextureSize),
		getFloatFromPixel(tIndex + 13, uMatrixSampler, uMatrixTextureSize),
		getFloatFromPixel(tIndex + 14, uMatrixSampler, uMatrixTextureSize),
		getFloatFromPixel(tIndex + 15, uMatrixSampler, uMatrixTextureSize)
		);
		
		vec4 transformedPosition = transform * vec4(position, 1.0);
		return vec3(transformedPosition);
	}
	return position;
}

void main(void) {
	//transform data to simulate camera perspective and position
	vec3 vertex = getVertexPosition();
	vPosition = vertex;
	gl_Position = uPMatrix * uMVMatrix * vec4(vertex, 1.0);
	
	if (uColorCoding){
		vColor = getIdColor();					
	}
	else{
		//ulightA[3] represents intensity of the light
		vec3 normal = getNormal();
		float lightAIntensity = ulightA[3];
		vec3 lightADirection = normalize(ulightA.xyz - vPosition);
		float lightBIntensity = ulightB[3];
		vec3 lightBDirection = normalize(ulightB.xyz - vPosition);
		
		//Light weighting
		float lightWeightA = max(dot(normal, lightADirection ) * lightAIntensity, 0.0);
		float lightWeightB = max(dot(normal, lightBDirection ) * lightBIntensity, 0.0);
		
		//minimal constant value is for ambient light
		float lightWeighting = lightWeightA + lightWeightB + 0.4;
		
		//transform colour to simulate lighting
		//preserve original alpha channel
		vec4 baseColor = getColor();
		vColor = vec4(baseColor.rgb * lightWeighting, baseColor.a);
	}
	
}