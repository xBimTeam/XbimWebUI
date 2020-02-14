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

varying vec4 vColor;
//position in real world. This is used for clipping.
varying vec3 vPosition;
// normal in real world for Phong shading
varying vec3 vNormal;

//state passed to fragment shader
varying float vDiscard;

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
	
	// it is colour coding. Don't to shading and lighting or anything else
	if (length(vNormal) < 0.1) {
		gl_FragColor = vColor;
		return;
	}

	//fix wrong normals (supposing the orientation of vertices is correct but normals are flipped)
	vec3 normalInterp = gl_FrontFacing ? vNormal : -vNormal;

	// Phong shading (http://multivis.net/lecture/phong.html)
	float Ka = 1.0;           // Ambient reflection coefficient [0.0,1.0]
	float Kd = 1.0;           // Diffuse reflection coefficient [0.0,1.0]
	float Ks = 0.2;           // Specular reflection coefficient [0.0,1.0], default 1.0
	float shininessVal = 30.0; // Shininess [1.0,128.0], default 4

	vec3 ambientColor = vColor.rgb * 0.2; // default (0.0, 0.0, 0.0)
	vec3 diffuseColor = vColor.rgb;
	vec3 specularColor = vec3(1.0, 1.0, 1.0);

	vec3 N = normalize(normalInterp);
  	vec3 L = normalize(uLight - vPosition);

  	// Lambert's cosine law
  	float lambertian = max(dot(N, L), 0.0);

  	float specular = 0.0;

  	if(lambertian > 0.0) {
  	  vec3 R = reflect(-L, N);        // Reflected light vector
  	  // vec3 V = normalize(-vPosition); // Vector to viewer
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

  	gl_FragColor = fragColor;
}