#version 300 es

precision mediump float;
in vec3 fsNormal;
in vec3 fsPos;
out vec4 outColor;


uniform vec4 mDiffColor; //material diffuse color for the tail is (0.0,0.0, 0.0, 1.0), for the clockhands is (1.0, 1.0, 1.0,1.0)
uniform vec3 lightDirection; // directional light direction vec
uniform vec4 lightColor; //directional light color
uniform vec4 ambientLight;
uniform vec3 eyePos;  // [cx, cy, cz]
uniform vec4 specularColor;
uniform float specShine;
uniform int specType;// used to filter the BLINN or PHONG specular from GUI
uniform int diffType; // used to filter the diffuse type from GUI

void main() {
  vec3 nNormal = normalize(fsNormal);
      vec3 eyeDir = normalize(eyePos - fsPos);
              float DToonTh = 50.0;
  vec4 diffuseTerm = vec4(0.0, 0.0, 0.0, 1.0);

    if(diffType == 1){
      //LAMBERT
   diffuseTerm = lightColor * mDiffColor  * clamp(dot(-lightDirection,nNormal), 0.0, 1.0);

    }
    if(diffType == 2){
    // OREN-NAYAR
  	float sigma2 = 0.25;
  	float theta_i = acos(dot(lightDirection, nNormal));
      float theta_r = acos(dot(eyeDir, nNormal));
      float alpha = max(theta_i, theta_r);
      float beta = min(theta_i, theta_r);
      float A = 1.0 - 0.5 * sigma2/(sigma2 + 0.33);
      float B = 0.45 * sigma2 / (sigma2 + 0.09);
      vec3 v_i = normalize(lightDirection - dot(lightDirection, nNormal) * nNormal);
      vec3 v_r = normalize(eyeDir - dot(eyeDir, nNormal) * nNormal);
      float G = max(0.0, dot(v_i, v_r));
      float Lcontr = clamp(dot(lightDirection, nNormal),0.0,1.0);
      vec4 diffuseOrenNayar = lightColor * mDiffColor * Lcontr * (A + B * G * sin(alpha) * tan(beta));
      diffuseTerm = diffuseOrenNayar;
    }
    if(diffType == 3){

      //TOON
      vec4 diffuseToon = max(sign(max(0.0, dot(nNormal, lightDirection)) - DToonTh ), 0.0) * lightColor * mDiffColor;
      diffuseTerm = diffuseToon;
    }

    //-----------------SPECULAR---------------------------
    //-----------------PHONG -----------------------------
    vec4 specularTerm = vec4(0.0, 0.0, 0.0, 1.0);
    if(specType == 1){
    vec3 reflectDir = normalize(-reflect(lightDirection, nNormal));
    vec4 specularPhong = specularColor * pow(clamp(dot(eyeDir, reflectDir), 0.0, 1.0), specShine);
    specularTerm = specularPhong;
    }else{


    //-----------------BLINN-----------------------------
    vec3 halfVec = normalize(eyeDir + lightDirection);
    specularTerm = specularColor * pow(max(dot(halfVec, nNormal), 0.0), specShine);
    }

    // --- AMBIENT ---
    vec4 ambientContr = ambientLight;


  vec4 finalColor = clamp((diffuseTerm + specularTerm + ambientContr), 0.0, 1.0);
  outColor = finalColor;
  }
