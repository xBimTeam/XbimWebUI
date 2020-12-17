#version 300 es
precision mediump float;

uniform vec4 uClippingPlaneA;
uniform vec4 uClippingPlaneB;
uniform bool uClippingA;
uniform bool uClippingB;
// Gama, Brightness, Contrast
uniform vec3 uGBC;

// Light position
uniform vec3 uLight;

// Frustum test
uniform mat4 uSectionBox;

in vec4 vColor;
//position in real world. This is used for clipping.
in vec3 vPosition;
// normal in real world for Phong shading
in vec3 vNormal;

//state passed to fragment shader
in float vDiscard;

// in GLES 100 this was an implicit variable
out vec4 vFragColor;

void main(void) {
	//test if this fragment is to be discarded from vertex shader
	if ( vDiscard > 0.5) discard;
	
	// test frustum (section box)
	vec4 fp = uSectionBox * vec4(vPosition, 1);
	if (
		fp.x > 1.0 || fp.x < -1.0 || 
		fp.y > 1.0 || fp.y < -1.0 || 
		fp.z > 1.0 || fp.z < -1.0) 
		discard;

	//test if clipping plane is defined
	if (uClippingA)
	{
		//clipping test
		vec4 p = uClippingPlaneA;
		vec3 x = vPosition;
		float distance = (dot(p.xyz, x) + p.w) / length(p.xyz);
		if (distance < 0.0){
			discard;
			return;
		}
	}

	//test if clipping plane is defined
	if (uClippingB)
	{
		//clipping test
		vec4 p = uClippingPlaneB;
		vec3 x = vPosition;
		float distance = (dot(p.xyz, x) + p.w) / length(p.xyz);
		if (distance < 0.0) {
			discard;
			return;
		}

	}

	// it is colour coding. Don't do shading and lighting or anything else
	if (length(vNormal) < 0.1) {
		vFragColor = vColor;
		return;
	}

	//fix wrong normals (supposing the orientation of vertices is correct but normals are flipped)
	vec3 normalInterp = gl_FrontFacing ? vNormal : -vNormal;

	// Phong shading (http://multivis.net/lecture/phong.html)
	float Ka = 0.8;           // Ambient reflection coefficient [0.0,1.0]
	float Kd = 1.0;           // Diffuse reflection coefficient [0.0,1.0]
	float Ks = 0.15;           // Specular reflection coefficient [0.0,1.0], default 1.0
	float shininessVal = 30.0; // Shininess [1.0,128.0], default 4

	vec3 ambientColor = vColor.rgb * 0.5; // default (0.0, 0.0, 0.0)
	vec3 diffuseColor = vColor.rgb;
	vec3 specularColor = vec3(1.0, 1.0, 1.0);

	vec3 N = normalize(normalInterp);
  	vec3 L = normalize(uLight - vPosition);

  	// Lambert's cosine law - this is positive number (0,1.0] if the angle between
	// surface normal and light direction to the point is < 90DEG
  	float lambertian = max(dot(N, L), 0.0);

	// default is no specular colour
  	float specular = 0.0;

	// only set reflection is the angle between light and surface normal is between 0 and 90DEG
  	if (lambertian > 0.0) {
  	  vec3 R = reflect(-L, N);        // Reflected light vector
  	  //vec3 V = normalize(-vPosition); // Vector to viewer
  	  vec3 V = L; // Vector to viewer

  	  // Compute the specular term
  	  float specAngle = max(dot(R, V), 0.0);
  	  specular = pow(specAngle, shininessVal);
  	}

vec4 fragColor = vec4(
		  			  Ka * ambientColor +
                      Kd * lambertian * diffuseColor +
                      Ks * specular * specularColor
					 , vColor.a
					  );

	// apply gama, brightness and contrast to the colour, not to alpha
	// https://krpano.com/forum/wbb/index.php?page=Thread&threadID=13863
	fragColor.r = (pow(fragColor.r,uGBC[0]) - 0.5)*uGBC[1] + uGBC[2] + 0.5;
    fragColor.g = (pow(fragColor.g,uGBC[0]) - 0.5)*uGBC[1] + uGBC[2] + 0.5;
    fragColor.b = (pow(fragColor.b,uGBC[0]) - 0.5)*uGBC[1] + uGBC[2] + 0.5;

  	vFragColor = fragColor;
}