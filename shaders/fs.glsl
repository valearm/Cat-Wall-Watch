#version 300 es

precision mediump float;

in vec2 uvFS;
in vec3 fsNormal;
in vec3 fsPos;
out vec4 outColor;

uniform sampler2D u_texture;

uniform vec3 lightDirection; // directional light direction vec
uniform vec4 lightColor; //directional light color

uniform vec3 eyePos; // [cx, cy, cz]
//can be set from GUI
uniform vec4 specularColor;
uniform float specShine;
uniform int specType; // used to filter the BLINN or PHONG specular from GUI
uniform int diffType; // used to filter the diffuse type from GUI

uniform vec4 ambientLight;

void main() {
    vec3 nNormal = normalize(fsNormal);
    vec3 eyeDir = normalize(eyePos - fsPos);
    vec3 nLightDirection = normalize(-lightDirection);
    float DToonTh = 50.0;
    // Set the output to a constant
    vec4 texcol = texture(u_texture, uvFS);

//------------LAMBERT DIFFUSE------------------------------

vec4 diffTerm = vec4(1.0, 1.0, 1.0, 1.0);

    if(diffType == 1){
      //LAMBERT
    diffTerm = lightColor  * texcol * clamp(dot(nLightDirection,nNormal), 0.0, 1.0);
    }
    if(diffType == 2){
    // OREN-NAYAR
  	float sigma2 = 0.25;
  	float theta_i = acos(dot(nLightDirection, nNormal));
      float theta_r = acos(dot(eyeDir, nNormal));
      float alpha = max(theta_i, theta_r);
      float beta = min(theta_i, theta_r);
      float A = 1.0 - 0.5 * sigma2/(sigma2 + 0.33);
      float B = 0.45 * sigma2 / (sigma2 + 0.09);
      vec3 v_i = normalize(nLightDirection - dot(nLightDirection, nNormal) * nNormal);
      vec3 v_r = normalize(eyeDir - dot(eyeDir, nNormal) * nNormal);
      float G = max(0.0, dot(v_i, v_r));
      float Lcontr = clamp(dot(nLightDirection, nNormal),0.0,1.0);
      vec4 diffuseOrenNayar = lightColor * texcol * Lcontr * (A + B * G * sin(alpha) * tan(beta));
      diffTerm = diffuseOrenNayar;
    }
    if(diffType == 3){

      //TOON
      vec4 diffuseToon = max(sign(max(0.0, dot(nNormal, nLightDirection)) - DToonTh ), 0.0) * lightColor * texcol;
      diffTerm = diffuseToon;
    }


    //-----------------SPECULAR---------------------------
    //-----------------PHONG -----------------------------

    vec4 specularTerm = vec4(0.0, 0.0, 0.0, 1.0);
    if(specType == 1){
    vec3 reflectDir = normalize(-reflect(nLightDirection, nNormal));
    vec4 specularPhong = specularColor * pow(clamp(dot(eyeDir, reflectDir), 0.0, 1.0), specShine);
    specularTerm = specularPhong;
    }else{
    //-----------------BLINN-----------------------------
    vec3 halfVec = normalize(eyeDir + nLightDirection);
    specularTerm = specularColor * pow(max(dot(halfVec, nNormal), 0.0), specShine);
}





    // --- AMBIENT ---
    vec4 ambientContr = ambientLight;


    vec4 finalColor =  clamp(diffTerm + specularTerm + ambientContr, 0.0, 1.0);
    outColor = vec4(finalColor.rgb, texcol.a);
}
