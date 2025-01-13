precision highp float;

uniform mat4 transformations[6];

uniform mat4 inverseProjectionMatrix;
uniform vec2 viewportDimensions;
uniform mat4 uPMatrix;

varying vec4 vColor;
varying mat4 planeTrsf;
varying vec3 FragPos;

vec3 CalcEyeFromWindow(void)
{
    vec3 ndcPos;
    ndcPos.xy = (2.0 * gl_FragCoord.xy) / viewportDimensions - 1.;
 	ndcPos.z = (2.0 * gl_FragCoord.z - gl_DepthRange.near - gl_DepthRange.far) /
        (gl_DepthRange.far - gl_DepthRange.near);
    vec4 clipPos;
    clipPos.w = uPMatrix[3][2] /
       (ndcPos.z - (uPMatrix[2][2] / uPMatrix[2][3]));
    clipPos.xyz = ndcPos * clipPos.w;

    return (inverseProjectionMatrix * clipPos).xyz;
} 

bool isFrontFacing(mat4 trsf, vec3 point){
	vec3 planeNormal = vec3(trsf[0][0], trsf[1][0], trsf[2][0]);
    vec3 planePoint = vec3(trsf[0][3], trsf[1][3], trsf[2][3]);
	float planeD = -dot(planeNormal, planePoint);
    float positionRelative = dot(planeNormal, point) + planeD;
	return positionRelative <= 0.;
}

float getFrontFacing(mat4 trsf, vec3 point){
	vec3 planeNormal = vec3(trsf[0][0], trsf[0][1], trsf[0][2]);
    vec3 planePoint = vec3(trsf[3][0], trsf[3][1], trsf[3][2]);
	float planeD = -dot(planeNormal, planePoint);
    float positionRelative = dot(planeNormal, point) + planeD;
	return positionRelative;
}

void main(void) {

	bool ignoreFragment = false;
	vec3 viewPos = CalcEyeFromWindow();
	vec3 color = vec3(0.0);
	for(int i = 0; i < 6; i++){
		mat4 trsf = transformations[i];
		if(isFrontFacing(trsf, viewPos)){
			ignoreFragment = true;
			vec3 planeNormal = vec3(trsf[0][0], trsf[0][1], trsf[0][2]);
			color = planeNormal * getFrontFacing(planeTrsf, viewPos);
			break;
		}
	}

	gl_FragColor = vec4(((vec4((FragPos), 1.0)).xyz+vec3(100.))/100., 1.0);
	gl_FragColor = vColor;
}