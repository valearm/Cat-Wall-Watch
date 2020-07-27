var programs = new Array();
var canvas;
var gl;
var shaderDir;
var baseDir;
var catModel;
var tailModel;
var eye1Model;
var eye2Model;
var clockHand1Model;
var clockHand2Model;
var pastMinute = 0;
var initial = 0;
var mid = 0;
var viewMatrix;
var perspectiveMatrix;

var backgroundColorR=1.0;
var backgroundColorG=0.0;
var backgroundColorB=0.0;

  var specularShine = 100;
  var alpha = 45;
  var beta = 45;
  var specularColor = [1.0, 0.0, 0.0, 1.0];
  var ambientLight = [0.1, 0.1, 0.1, 1.0];
  //directional light
  var dirLightAlpha = -utils.degToRad(alpha);
  var dirLightBeta  = -utils.degToRad(beta);
  var directionalLight = [Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
              Math.sin(dirLightAlpha), Math.cos(dirLightAlpha) * Math.sin(dirLightBeta)];

    //material color
    var tailMaterialColor = [0.0, 0.0, 0.0, 1.0];
    var clockMaterialColor = [1.0, 1.0, 1.0, 1.0];
    var diffColor = [0.5, 0.5, 0.5, 1.0];
    var directionalLightColor = [1.0, 1.0, 1.0, 1.0];




  var specType = 1;
  var diffType = 1;

//CAMERA COORDS
var cx = 0.0;
var cy = 0.0;
var cz = 2.0;
var elevation = 0.0;
var angle = 0.0;
var w, h;
var eyePos = [cx, cy, cz];
var aspect;
var zNear = 0.1;
var zFar = 2000;
var fieldOfViewDeg = 1;

var canw, canh;
var extView = 1;

var roll = 0.01;
var modRot = 0.0;
var EVelevation = -15;
var EVangle = 30;

var lookRadius = 10.0;

var keys = [];
var rvx = 0.0;
var rvy = 0.0;
var rvz = 0.0;


// CAT POSITION
  var Rx = 0.0;
  var Ry = 0.0;
  var Rz = 0.0;
  var S  = 1;
  var objectWorldMatrix = utils.MakeWorld(0.0, 0.0, 0.0, Rx, Ry, Rz, S); // Pos Cat Body



var camera = [cx, cy, cz];
var target = [Rx, Ry, Rz];
var upVector = [0.0, 1.0, 0.0];


var delta = 0.1;

var modelStr = Array();
var modelTexture = Array();

modelStr[0] = 'Body/Cat_body_norm.obj';
modelStr[1] = 'Pieces/tail.obj';
modelStr[2] = 'Pieces/eye_norm.obj';
modelStr[3] = 'Pieces/eye_norm.obj';
modelStr[4] = 'Pieces/clockhand1.obj';
modelStr[5] = 'Pieces/clockhand2.obj';

modelTexture[0] = 'KitCat_color.png';

var counter= 1;
var flag = 1;
var startTail= tailLocalMatrix;
var first = 1;


//----------------------------------------START MOUSE HANDLER---------------------------
// event handler

var mouseState = false;
var lastMouseX = -100, lastMouseY = -100;
function doMouseDown(event) {
	lastMouseX = event.pageX;
	lastMouseY = event.pageY;
	mouseState = true;
}
function doMouseUp(event) {
	lastMouseX = -100;
	lastMouseY = -100;
	mouseState = false;
}
function doMouseMove(event) {
	if(mouseState) {
	 var dx = event.pageX - lastMouseX;
	var dy = lastMouseY - event.pageY;

		if((dx != 0) || (dy != 0)) {

			angle += 0.3 * dx;
			elevation += 0.3 * dy;

		}
	  lastMouseX = event.pageX;
	  lastMouseY = event.pageY;
	}
}
function doMouseWheel(event) {
	var nLookRadius = lookRadius + event.wheelDelta/1000.0;
	if((nLookRadius > 2.0) && (nLookRadius < 20.0)) {
		lookRadius = nLookRadius;
	}
}

function toggleExtView() {
	extView = 1-extView;
}


//----------------------------- END MOUSE HANDLER-------------------------------------------


//---------------------------- COMPARE MATRIX FUNCTIONS (NOT USED) -------------------------
/*
function compareMatrix(m1, m2){
  if(m1.length != m2.length){
    return 1;
  }

  for(i=0; i < m1.length; i++){
      if(m1[i] != m2[i]){
        return 1;
      }
  }
  return 0;
}

function checkInterval(tailLocalMatrix){
  var d=0.0;
  while (d < 20){
    var limit1= utils.MakeRotateZMatrix(30 + d);
    var m1= utils.multiplyMatrices(startTail, limit1)
    var out = compareMatrix(tailLocalMatrix, m1);
    if(out == 1){
      return 1;
    }
    d= d + 0.1;
  }
  return 0;
}*/
//------------------------------- END COMPARE MATRIX FUNCTIONS ---------------------------

function main() {
  canvas.addEventListener("mousedown", doMouseDown, false);
  canvas.addEventListener("mouseup", doMouseUp, false);
  canvas.addEventListener("mousemove", doMouseMove, false);
  canvas.addEventListener("mousewheel", doMouseWheel, false);

  // prepares the world, view and projection matrices.
  canw=canvas.clientWidth;
  canh=canvas.clientHeight;
  aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;







  utils.resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(backgroundColorR, backgroundColorG, backgroundColorB, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  var lastUpdateTime = (new Date).getTime();

  var objectVertices = Array();
  var objectNormals = Array();
  var objectIndices = Array();
  var objectTexCoords = Array();

  objectVertices[0] = catModel.vertices;
  objectNormals[0] = catModel.vertexNormals;
  objectIndices[0] = catModel.indices;
  objectTexCoords[0] = catModel.textures;

  objectVertices[1] = tailModel.vertices;
  objectNormals[1] = tailModel.vertexNormals;
  objectIndices[1] = tailModel.indices;

  objectVertices[2] = eye1Model.vertices;
  objectNormals[2] = eye1Model.vertexNormals;
  objectIndices[2] = eye1Model.indices;
  objectTexCoords[2] = eye1Model.textures;

  objectVertices[3] = eye2Model.vertices;
  objectNormals[3] = eye2Model.vertexNormals;
  objectIndices[3] = eye2Model.indices;
  objectTexCoords[3] = eye2Model.textures;

  objectVertices[4] = clockHand1Model.vertices;
  objectNormals[4] = clockHand1Model.vertexNormals;
  objectIndices[4] = clockHand1Model.indices;

  objectVertices[5] = clockHand2Model.vertices;
  objectNormals[5] = clockHand2Model.vertexNormals;
  objectIndices[5] = clockHand2Model.indices;


    var positionAttributeLocation = new Array();
    var normalAttributeLocation = new Array();
    var materialHandle = new Array();
    var lightDirectionHandle = new Array();
    var lightColorHandle = new Array();
    var normalMatrixPositionHandle = new Array();
    var uvAttributeLocation = new Array();
    var matrixLocation = new Array();
    var textLocation = new Array();
    var specColor = new Array();
    var dirObservator = new Array();
    var specShine = new Array();
    var materialDiffColorHandle = new Array();
    var ambientLightUniform = new Array();
    var specularTipolgy= new Array();
    var diffuseType= new Array();
    var worldMatrixAttributeLocation = new Array();


    objectNormalMatrix = utils.invertMatrix(utils.transposeMatrix(objectWorldMatrix));
    eye1NormalMatrix = utils.invertMatrix(utils.transposeMatrix(eye1LocalMatrix));
    eye2NormalMatrix = utils.invertMatrix(utils.transposeMatrix(eye2LocalMatrix));
    tailNormalMatrix = utils.invertMatrix(utils.transposeMatrix(tailLocalMatrix));
    clockHand1NormalMatrix = utils.invertMatrix(utils.transposeMatrix(clockHand1LocalMatrix));
    clockHand2NormalMatrix = utils.invertMatrix(utils.transposeMatrix(clockHand2LocalMatrix));

    //BODY AND EYES
    worldMatrixAttributeLocation[0] = gl.getUniformLocation(programs[0], "worldMatrix");

    positionAttributeLocation[0] = gl.getAttribLocation(programs[0], "a_position");
    normalAttributeLocation[0] = gl.getAttribLocation(programs[0], "inNormal");
    uvAttributeLocation[0] = gl.getAttribLocation(programs[0], "a_uv");
    matrixLocation[0] = gl.getUniformLocation(programs[0], "matrix");
    textLocation[0] = gl.getUniformLocation(programs[0], "u_texture");
    lightDirectionHandle[0] = gl.getUniformLocation(programs[0], 'lightDirection');
    lightColorHandle[0] = gl.getUniformLocation(programs[0], 'lightColor');
    normalMatrixPositionHandle[0] = gl.getUniformLocation(programs[0], 'nMatrix');
    specColor[0] = gl.getUniformLocation(programs[0], 'specularColor');
    dirObservator[0] = gl.getUniformLocation(programs[0], 'eyePos');
    specShine[0] = gl.getUniformLocation(programs[0], 'specShine');
    ambientLightUniform[0] = gl.getUniformLocation(programs[0], "ambientLight");

    specularTipolgy[0] = gl.getUniformLocation(programs[0], 'specType');
    diffuseType[0] = gl.getUniformLocation(programs[0], 'diffType');


    worldMatrixAttributeLocation[2] = gl.getUniformLocation(programs[0], "worldMatrix");


    positionAttributeLocation[2] = gl.getAttribLocation(programs[0], "a_position");
    normalAttributeLocation[2] = gl.getAttribLocation(programs[0], "inNormal");
    uvAttributeLocation[2] = gl.getAttribLocation(programs[0], "a_uv");
    matrixLocation[2] = gl.getUniformLocation(programs[0], "matrix");
    textLocation[2] = gl.getUniformLocation(programs[0], "u_texture");
    lightDirectionHandle[2] = gl.getUniformLocation(programs[0], 'lightDirection');
    lightColorHandle[2] = gl.getUniformLocation(programs[0], 'lightColor');
    normalMatrixPositionHandle[2] = gl.getUniformLocation(programs[0], 'nMatrix');
    specColor[2] = gl.getUniformLocation(programs[0], 'specularColor');
    dirObservator[2] = gl.getUniformLocation(programs[0], 'eyePos');
    specShine[2] = gl.getUniformLocation(programs[0], 'specShine');
    ambientLightUniform[2] = gl.getUniformLocation(programs[0], "ambientLight");
    specularTipolgy[2] = gl.getUniformLocation(programs[0], 'specType');
    diffuseType[2] = gl.getUniformLocation(programs[0], 'diffType');

    worldMatrixAttributeLocation[3] = gl.getUniformLocation(programs[0], "worldMatrix");


    positionAttributeLocation[3] = gl.getAttribLocation(programs[0], "a_position");
    normalAttributeLocation[3] = gl.getAttribLocation(programs[0], "inNormal");
    uvAttributeLocation[3] = gl.getAttribLocation(programs[0], "a_uv");
    matrixLocation[3] = gl.getUniformLocation(programs[0], "matrix");
    textLocation[3] = gl.getUniformLocation(programs[0], "u_texture");
    lightDirectionHandle[3] = gl.getUniformLocation(programs[0], 'lightDirection');
    lightColorHandle[3] = gl.getUniformLocation(programs[0], 'lightColor');
    normalMatrixPositionHandle[3] = gl.getUniformLocation(programs[0], 'nMatrix');
    specColor[3] = gl.getUniformLocation(programs[0], 'specularColor');
    dirObservator[3] = gl.getUniformLocation(programs[0], 'eyePos');
    specShine[3] = gl.getUniformLocation(programs[0], 'specShine');
    ambientLightUniform[3] = gl.getUniformLocation(programs[0], "ambientLight");
    specularTipolgy[3] = gl.getUniformLocation(programs[0], 'specType');
    diffuseType[3] = gl.getUniformLocation(programs[0], 'diffType');

    //Lambert TAIL AND CLOCKHANDS

    worldMatrixAttributeLocation[1] = gl.getUniformLocation(programs[1], "worldMatrix");

    positionAttributeLocation[1] = gl.getAttribLocation(programs[1], "a_position");
    normalAttributeLocation[1] = gl.getAttribLocation(programs[1], "inNormal");
    matrixLocation[1] = gl.getUniformLocation(programs[1], "matrix");
    materialDiffColorHandle[1] = gl.getUniformLocation(programs[1], 'mDiffColor');
    lightDirectionHandle[1] = gl.getUniformLocation(programs[1], 'lightDirection');
    lightColorHandle[1] = gl.getUniformLocation(programs[1], 'lightColor');
    normalMatrixPositionHandle[1] = gl.getUniformLocation(programs[1], 'nMatrix');
    specColor[1] = gl.getUniformLocation(programs[1], 'specularColor');
    dirObservator[1] = gl.getUniformLocation(programs[1], 'eyePos');
    specShine[1] = gl.getUniformLocation(programs[1], 'specShine');
    ambientLightUniform[1] = gl.getUniformLocation(programs[1], "ambientLight");
    specularTipolgy[1] = gl.getUniformLocation(programs[1], 'specType');
    diffuseType[1] = gl.getUniformLocation(programs[1], 'diffType');


    worldMatrixAttributeLocation[4] = gl.getUniformLocation(programs[1], "worldMatrix");

    positionAttributeLocation[4] = gl.getAttribLocation(programs[1], "a_position");
    normalAttributeLocation[4] = gl.getAttribLocation(programs[1], "inNormal");
    matrixLocation[4] = gl.getUniformLocation(programs[1], "matrix");
    materialDiffColorHandle[4] = gl.getUniformLocation(programs[1], 'mDiffColor');
    lightDirectionHandle[4] = gl.getUniformLocation(programs[1], 'lightDirection');
    lightColorHandle[4] = gl.getUniformLocation(programs[1], 'lightColor');
    normalMatrixPositionHandle[4] = gl.getUniformLocation(programs[1], 'nMatrix');
    specColor[4] = gl.getUniformLocation(programs[1], 'specularColor');
    dirObservator[4] = gl.getUniformLocation(programs[1], 'eyePos');
    specShine[4] = gl.getUniformLocation(programs[1], 'specShine');
    ambientLightUniform[4] = gl.getUniformLocation(programs[1], "ambientLight");
    specularTipolgy[4] = gl.getUniformLocation(programs[1], 'specType');
    diffuseType[4] = gl.getUniformLocation(programs[1], 'diffType');

    worldMatrixAttributeLocation[5] = gl.getUniformLocation(programs[1], "worldMatrix");

    positionAttributeLocation[5] = gl.getAttribLocation(programs[1], "a_position");
    normalAttributeLocation[5] = gl.getAttribLocation(programs[1], "inNormal");
    matrixLocation[5] = gl.getUniformLocation(programs[1], "matrix");
    materialDiffColorHandle[5] = gl.getUniformLocation(programs[1], 'mDiffColor');
    lightDirectionHandle[5] = gl.getUniformLocation(programs[1], 'lightDirection');
    lightColorHandle[5] = gl.getUniformLocation(programs[1], 'lightColor');
    normalMatrixPositionHandle[5] = gl.getUniformLocation(programs[1], 'nMatrix');
    specColor[5] = gl.getUniformLocation(programs[1], 'specularColor');
    dirObservator[5] = gl.getUniformLocation(programs[1], 'eyePos');
    specShine[5] = gl.getUniformLocation(programs[1], 'specShine');
    ambientLightUniform[5] = gl.getUniformLocation(programs[1], "ambientLight");
    specularTipolgy[5] = gl.getUniformLocation(programs[1], 'specType');
    diffuseType[5] = gl.getUniformLocation(programs[1], 'diffType');




    perspectiveMatrix = utils.MakePerspective(fieldOfViewDeg, gl.canvas.width/gl.canvas.height, zNear, zFar);
    viewMatrix = utils.MakeLookAt(camera, target, upVector);


    var vaos = new Array();

    for (i = 0; i < 6; i++) {
      vaos[i] = gl.createVertexArray();
      gl.bindVertexArray(vaos[i]);

      var positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objectVertices[i]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(positionAttributeLocation[i]);
      gl.vertexAttribPointer(positionAttributeLocation[i], 3, gl.FLOAT, false, 0, 0);

      if(i == 0 || i == 2 || i == 3) {
        var uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objectTexCoords[i]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(uvAttributeLocation[i]);
        gl.vertexAttribPointer(uvAttributeLocation[i], 2, gl.FLOAT, false, 0, 0);
      }

        var normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objectNormals[i]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(normalAttributeLocation[i]);
        gl.vertexAttribPointer(normalAttributeLocation[i], 3, gl.FLOAT, false, 0, 0);


      var indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(objectIndices[i]), gl.STATIC_DRAW);

      if(i == 0 || i == 2 || i == 3){

        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture[i]);

        var image = new Image();
        image.src = baseDir + modelTexture[0];
        image.onload = function () {
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.generateMipmap(gl.TEXTURE_2D);
        };
      }
  }


  drawScene();


	function animate(){
    var currentTime = (new Date).getTime();

    var deltaC = (25 * (currentTime - lastUpdateTime)) / 1000.0;
    //console.log(deltaC);
    if(first == 1){
      if(counter%50 == 0){
        if(flag == 1){
          flag = 0;
          first = 0;
          counter = 1;
        }else{
          flag = 1;
        }
      }
    }

    if(first == 0){
      if(counter%300 == 0){
        if(flag == 1){
          flag = 0;

        }else{
          flag = 1;
        }
      }
    }

    delta= deltaC/3.5;

    if(flag == 1){
		  var rotateZ = utils.MakeRotateZMatrix(-deltaC);
      var translateX = utils.MakeRotateYMatrix(-delta);
    }else {
      var translateX = utils.MakeRotateYMatrix(delta);
        var rotateZ = utils.MakeRotateZMatrix(deltaC);
    }

    tailLocalMatrix = utils.multiplyMatrices(tailLocalMatrix,rotateZ);


    eye1LocalMatrix = utils.multiplyMatrices(eye1LocalMatrix,translateX);
    eye2LocalMatrix = utils.multiplyMatrices(eye2LocalMatrix,translateX);

   var currentMinute = (new Date).getMinutes();
   var currentHours = (new Date).getHours();
   var diff = (currentMinute - pastMinute) * 6;

   if( initial == 0 ){
    if(currentHours > 12){
      var diff2 = (currentHours - 12 ) * 30 + (currentMinute - pastMinute) * 0.5;
    }else{
      var diff2 = (currentHours * 30) + (currentMinute - pastMinute) * 0.5;
    }
    initial = 1;
  }else{
    if(currentMinute == "0"){
      if(mid == 0){
      diff2= 0.5;
      mid = 1;
    }
    }else{
      var diff2 = (currentMinute - pastMinute) * 0.5;
      mid = 0;
    }
  }

   var rotateZH = utils.MakeRotateZMatrix(diff2);
   var rotateZ = utils.MakeRotateZMatrix(diff);
    clockHand2LocalMatrix = utils.multiplyMatrices(clockHand2LocalMatrix,rotateZH);
   clockHand1LocalMatrix = utils.multiplyMatrices(clockHand1LocalMatrix,rotateZ);
     pastMinute = currentMinute;
     counter++;
     lastUpdateTime = currentTime;
  }

  function drawScene() {

		animate();


    eyePos = [cx, cy, cz];

    //directional light
    dirLightAlpha = utils.degToRad(alpha);
    dirLightBeta  = utils.degToRad(beta);
    directionalLight = [Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
                Math.sin(dirLightAlpha), Math.cos(dirLightAlpha) * Math.sin(dirLightBeta)];

    // update WV matrix

  	angle = angle + rvy;
  	elevation = elevation + rvx;

  	cz = lookRadius * Math.cos(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
  	cx = lookRadius * Math.sin(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
  	cy = lookRadius * Math.sin(utils.degToRad(-elevation));

    perspectiveMatrix = utils.MakePerspective(fieldOfViewDeg, gl.canvas.width/gl.canvas.height, zNear, zFar);
    camera = [cx, cy, cz];

    viewMatrix = utils.MakeLookAt(camera, target, upVector);

    objectNormalMatrix = utils.invertMatrix(utils.transposeMatrix(objectWorldMatrix));
    eye1NormalMatrix = utils.invertMatrix(utils.transposeMatrix(eye1LocalMatrix));
    eye2NormalMatrix = utils.invertMatrix(utils.transposeMatrix(eye2LocalMatrix));
    tailNormalMatrix = utils.invertMatrix(utils.transposeMatrix(tailLocalMatrix));
    clockHand1NormalMatrix = utils.invertMatrix(utils.transposeMatrix(clockHand1LocalMatrix));
    clockHand2NormalMatrix = utils.invertMatrix(utils.transposeMatrix(clockHand2LocalMatrix));
    
    utils.resizeCanvasToDisplaySize(gl.canvas);
    gl.clearColor(backgroundColorR, backgroundColorG, backgroundColorB, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      gl.useProgram(programs[0]);
      var viewWorldMatrix = utils.multiplyMatrices(viewMatrix, objectWorldMatrix);
      var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);
      gl.uniformMatrix4fv(matrixLocation[0], gl.FALSE, utils.transposeMatrix(projectionMatrix));
      gl.uniformMatrix4fv(normalMatrixPositionHandle[0], gl.FALSE, utils.transposeMatrix(objectNormalMatrix));

      gl.uniformMatrix4fv(worldMatrixAttributeLocation[0], gl.FALSE, utils.transposeMatrix(objectWorldMatrix));


      gl.activeTexture(gl.TEXTURE0);

      gl.uniform1i(textLocation[0], texture);

      gl.uniform4fv(lightColorHandle[0],  directionalLightColor);
      gl.uniform3fv(lightDirectionHandle[0],  directionalLight);
      gl.uniform4fv(specColor[0], specularColor);
      gl.uniform1f(specShine[0],specularShine);
      gl.uniform3fv(dirObservator[0], eyePos);
      gl.uniform4fv(ambientLightUniform[0],ambientLight);
      gl.uniform1i(specularTipolgy[0],specType);
      gl.uniform1i(diffuseType[0],diffType);

      gl.bindVertexArray(vaos[0]);
      gl.drawElements(gl.TRIANGLES, objectIndices[0].length, gl.UNSIGNED_SHORT, 0);

      var viewWorldMatrix = utils.multiplyMatrices(viewMatrix, eye1LocalMatrix);
      var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);
      gl.uniformMatrix4fv(matrixLocation[2], gl.FALSE, utils.transposeMatrix(projectionMatrix));
      gl.uniformMatrix4fv(normalMatrixPositionHandle[2], gl.FALSE, utils.transposeMatrix(eye1NormalMatrix));
      gl.uniformMatrix4fv(worldMatrixAttributeLocation[2], gl.FALSE, utils.transposeMatrix(eye1LocalMatrix));
      gl.activeTexture(gl.TEXTURE0);

      gl.uniform1i(textLocation[2], texture);

      gl.uniform4fv(lightColorHandle[2],  directionalLightColor);
      gl.uniform3fv(lightDirectionHandle[2],  directionalLight);
      gl.uniform4fv(specColor[2], specularColor);
      gl.uniform1f(specShine[2],specularShine);
      gl.uniform3fv(dirObservator[2], eyePos);
      gl.uniform4fv(ambientLightUniform[2],ambientLight);
      gl.uniform1i(specularTipolgy[2],specType);
      gl.uniform1i(diffuseType[2],diffType);

      gl.bindVertexArray(vaos[2]);
      gl.drawElements(gl.TRIANGLES, objectIndices[2].length, gl.UNSIGNED_SHORT, 0);

      var viewWorldMatrix = utils.multiplyMatrices(viewMatrix, eye2LocalMatrix);
      var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);
      gl.uniformMatrix4fv(matrixLocation[3], gl.FALSE, utils.transposeMatrix(projectionMatrix));
      gl.uniformMatrix4fv(normalMatrixPositionHandle[3], gl.FALSE, utils.transposeMatrix(eye2NormalMatrix));
      gl.uniformMatrix4fv(worldMatrixAttributeLocation[3], gl.FALSE, utils.transposeMatrix(eye2LocalMatrix));
      gl.activeTexture(gl.TEXTURE0);

      gl.uniform1i(textLocation[3], texture);

      gl.uniform4fv(lightColorHandle[3],  directionalLightColor);
      gl.uniform3fv(lightDirectionHandle[3],  directionalLight);
      gl.uniform4fv(specColor[3], specularColor);
      gl.uniform1f(specShine[3],specularShine);
      gl.uniform3fv(dirObservator[3], eyePos);
      gl.uniform4fv(ambientLightUniform[3],ambientLight);
      gl.uniform1i(specularTipolgy[3],specType);
      gl.uniform1i(diffuseType[3],diffType);

      gl.bindVertexArray(vaos[3]);
      gl.drawElements(gl.TRIANGLES, objectIndices[3].length, gl.UNSIGNED_SHORT, 0);

      gl.useProgram(programs[1]);
      var viewWorldMatrix = utils.multiplyMatrices(viewMatrix, tailLocalMatrix);
      var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);
      gl.uniformMatrix4fv(matrixLocation[1], gl.FALSE, utils.transposeMatrix(projectionMatrix));


      gl.uniformMatrix4fv(normalMatrixPositionHandle[1], gl.FALSE, utils.transposeMatrix(tailNormalMatrix));
      gl.uniformMatrix4fv(worldMatrixAttributeLocation[1], gl.FALSE, utils.transposeMatrix(tailLocalMatrix));

      gl.uniform4fv(materialDiffColorHandle[1], tailMaterialColor);
      gl.uniform4fv(lightColorHandle[1],  directionalLightColor);
      gl.uniform3fv(lightDirectionHandle[1],  directionalLight);
      gl.uniform4fv(specColor[1], specularColor);
      gl.uniform1f(specShine[1],specularShine);
      gl.uniform3fv(dirObservator[1], eyePos);
      gl.uniform4fv(ambientLightUniform[1],ambientLight);
      gl.uniform1i(specularTipolgy[1],specType);
      gl.uniform1i(diffuseType[1],diffType);

      gl.bindVertexArray(vaos[1]);
      gl.drawElements(gl.TRIANGLES, objectIndices[1].length, gl.UNSIGNED_SHORT, 0);

      var viewWorldMatrix = utils.multiplyMatrices(viewMatrix, clockHand1LocalMatrix);
      var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);
      gl.uniformMatrix4fv(matrixLocation[4], gl.FALSE, utils.transposeMatrix(projectionMatrix));

      gl.uniformMatrix4fv(normalMatrixPositionHandle[4], gl.FALSE, utils.transposeMatrix(clockHand1NormalMatrix));
      gl.uniformMatrix4fv(worldMatrixAttributeLocation[4], gl.FALSE, utils.transposeMatrix(clockHand1LocalMatrix));

      gl.uniform4fv(materialDiffColorHandle[4], clockMaterialColor);
      gl.uniform4fv(lightColorHandle[4],  directionalLightColor);
      gl.uniform3fv(lightDirectionHandle[4],  directionalLight);
      gl.uniform4fv(specColor[4], specularColor);
      gl.uniform1f(specShine[4],specularShine);
      gl.uniform3fv(dirObservator[4], eyePos);
      gl.uniform4fv(ambientLightUniform[4],ambientLight);
      gl.uniform1i(specularTipolgy[4],specType);
      gl.uniform1i(diffuseType[4],diffType);

      gl.bindVertexArray(vaos[4]);
      gl.drawElements(gl.TRIANGLES, objectIndices[4].length, gl.UNSIGNED_SHORT, 0);

      var viewWorldMatrix = utils.multiplyMatrices(viewMatrix, clockHand2LocalMatrix);
      var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);
      gl.uniformMatrix4fv(matrixLocation[5], gl.FALSE, utils.transposeMatrix(projectionMatrix));

      gl.uniformMatrix4fv(normalMatrixPositionHandle[5], gl.FALSE, utils.transposeMatrix(clockHand2NormalMatrix));
      gl.uniformMatrix4fv(worldMatrixAttributeLocation[5], gl.FALSE, utils.transposeMatrix(clockHand2LocalMatrix));

      gl.uniform4fv(materialDiffColorHandle[5], clockMaterialColor);
      gl.uniform4fv(lightColorHandle[5],  directionalLightColor);
      gl.uniform3fv(lightDirectionHandle[5],  directionalLight);

      gl.uniform4fv(specColor[5], specularColor);
      gl.uniform1f(specShine[5],specularShine);
      gl.uniform3fv(dirObservator[5], eyePos);
      gl.uniform4fv(ambientLightUniform[5],ambientLight);
      gl.uniform1i(specularTipolgy[5],specType);
      gl.uniform1i(diffuseType[5],diffType);

      gl.bindVertexArray(vaos[5]);
      gl.drawElements(gl.TRIANGLES, objectIndices[5].length, gl.UNSIGNED_SHORT, 0);


    window.requestAnimationFrame(drawScene);
  }
}

async function init() {

  var path = window.location.pathname;
  var page = path.split("/").pop();
  baseDir = window.location.href.replace(page, '');
  shaderDir = baseDir + "shaders/";

  canvas = document.getElementById("my-canvas");

  gl = canvas.getContext("webgl2");
  if (!gl) {
    document.write("GL context not opened");
    return;
  }

  await utils.loadFiles([shaderDir + 'vs.glsl', shaderDir + 'fs.glsl'], function (shaderText) {
    var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
    var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
    programs[0] = utils.createProgram(gl, vertexShader, fragmentShader);

  });

  await utils.loadFiles([shaderDir + 'vs_2.glsl', shaderDir + 'fs_2.glsl'], function (shaderText) {
    var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
    var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
    programs[1] = utils.createProgram(gl, vertexShader, fragmentShader);

  });

  //###################################################################################
  //This loads the obj model in the catModel variable
  var catObjStr = await utils.get_objstr(baseDir + modelStr[0]);
  catModel = new OBJ.Mesh(catObjStr);

  var tailObjStr = await utils.get_objstr(baseDir + modelStr[1]);
  tailModel = new OBJ.Mesh(tailObjStr);

  var eye1ObjStr = await utils.get_objstr(baseDir + modelStr[2]);
  eye1Model = new OBJ.Mesh(eye1ObjStr);

  var eye2ObjStr = await utils.get_objstr(baseDir + modelStr[3]);
  eye2Model = new OBJ.Mesh(eye2ObjStr);

  var clockHand1ObjStr = await utils.get_objstr(baseDir + modelStr[4]);
  clockHand1Model = new OBJ.Mesh(clockHand1ObjStr);

  var clockHand2ObjStr = await utils.get_objstr(baseDir + modelStr[5]);
  clockHand2Model = new OBJ.Mesh(clockHand2ObjStr);
  //###################################################################################

  main();
}
function keyFunction(e){

      if (e.keyCode == 37) {  // Left arrow
        cx-=delta;
      }
      if (e.keyCode == 39) {  // Right arrow
        cx+=delta;
      }
      if (e.keyCode == 38) {  // Up arrow
        cz-=delta;
      }
      if (e.keyCode == 40) {  // Down arrow
        cz+=delta;
      }
      if (e.keyCode == 171) { // Add
        cy+=delta;
      }
      if (e.keyCode == 173) { // Subtract
        cy-=delta;
      }

      if (e.keyCode == 65) {  // a
        angle-=delta*10.0;
      }
      if (e.keyCode == 68) {  // d
        angle+=delta*10.0;
      }
      if (e.keyCode == 87) {  // w
        elevation+=delta*10.0;
      }
      if (e.keyCode == 83) {  // s
        elevation-=delta*10.0;
      }

}

function onSliderChange(value){
    specularShine = value;
}

function onSliderChange2(value){
    alpha = value;
}

function onSliderChange3(value){
    beta = value;
}

function onColorChange(value){
  	col = value.substring(1,7);
  R = parseInt(col.substring(0,2) ,16) / 255;
  G = parseInt(col.substring(2,4) ,16) / 255;
  B = parseInt(col.substring(4,6) ,16) / 255;
    specularColor = [R,G,B, 1.0];
    backgroundColorR =R;
    backgroundColorG = G;
    backgroundColorB = B;

}

function onCheckBoxChange(value){
    if(value == true){
      ambientLight = [0.1,0.1,0.1,1.0];
    }else{
      ambientLight = [0.0, 0.0, 0.0, 1.0];
    }
}

function onDropdownChange(value){
    specType = value;
    console.log("Drop-down value changed to "+value);
}

function onRadioButtonChange(value){
  diffType= value;
    console.log("Radio button value changed to "+value);
}



window.onload = init;

//'window' is a JavaScript object (if "canvas", it will not work)
window.addEventListener("keyup", keyFunction, false);// this permit to "read" the presing of the key
