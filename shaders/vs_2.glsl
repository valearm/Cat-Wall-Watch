#version 300 es

in vec3 a_position;
in vec3 inNormal;
out vec3 fsNormal;
out vec3 fsPos;


uniform mat4 matrix;
uniform mat4 worldMatrix;
uniform mat4 nMatrix;

void main() {
  fsNormal = mat3(nMatrix) * inNormal; //from object space to world space
  fsPos = (worldMatrix * vec4(a_position,1.0)).xyz;  //from object space to world space

  gl_Position =  matrix * vec4(a_position, 1.0);
}
