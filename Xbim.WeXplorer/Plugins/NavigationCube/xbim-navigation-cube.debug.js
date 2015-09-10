function xNavigationCube (xviewer) {
    var self = this;
    this.viewer = xviewer;
    this.ratio = 0.1;
    this._stopped = true;
    var gl = this.viewer._gl;

    //create own shader 
    this._shader = null;
    this._initShader();

    //set own shader for init
    gl.useProgram(this._shader);

    //create uniform pointers
    this._pMatrixUniformPointer = gl.getUniformLocation(this._shader, "uPMatrix");
    this._mvMatrixUniformPointer = gl.getUniformLocation(this._shader, "uMVMatrix");
    this._vertexAttrPointer = gl.getAttribLocation(this._shader, "aVertex"),
    this._colourAttrPointer = gl.getAttribLocation(this._shader, "aColour"),
    gl.enableVertexAttribArray(this._vertexAttrPointer);
    gl.enableVertexAttribArray(this._colourAttrPointer);

    //feed data into the GPU and keep pointers
    this._indexBuffer = gl.createBuffer();
    this._vertexBuffer = gl.createBuffer();
    this._colourBuffer = gl.createBuffer();
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this._colourBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.colours, gl.STATIC_DRAW);

    //reset original shader program 
    gl.useProgram(this.viewer._shaderProgram);

    //set handle for xViewer frame event which means that this will execute in every frame
    this.viewer.on("frame", function() {
        self.draw();
    });
}

xNavigationCube.prototype.draw = function() {
    if (this._stopped) return;

    var gl = this.viewer._gl;
    var originalShader = this.viewer._shaderProgram;

    //set own shader
    gl.useProgram(this._shader);

    //set navigation data from xViewer to this shader
    var pMatrix = mat4.create();
    var height = 1.0 / this.ratio;
    var width = height / this.viewer._height * this.viewer._width;

    mat4.ortho(pMatrix,
        (this.ratio - 1.0) * width, //left
        this.ratio * width, //right
        this.ratio * -1.0 * height, //bottom
        (1.0 - this.ratio) * height,  //top
        -1,  //near
        1 ); //far

    gl.uniformMatrix4fv(this._pMatrixUniformPointer, false, pMatrix);
    gl.uniformMatrix4fv(this._mvMatrixUniformPointer, false, this.viewer._mvMatrix);

    //bind data buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
    gl.vertexAttribPointer(this._vertexAttrPointer, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this._colourBuffer);
    gl.vertexAttribPointer(this._colourAttrPointer, 4, gl.FLOAT, false, 0, 0);

    //draw the cube as an element array
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);

    //set original xViewer shader for it's next loop
    gl.useProgram(originalShader);
};

xNavigationCube.prototype.start = function() {
    this._stopped = false;
};

xNavigationCube.prototype.stop = function () {
    this._stopped = true;
};

xNavigationCube.prototype._initShader = function () {

    var gl = this.viewer._gl;
    var viewer = this.viewer;
    var compile = function (shader, code) {
        gl.shaderSource(shader, code);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            viewer._error(gl.getShaderInfoLog(shader));
            return null;
        }
    }

    //fragment shader
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    compile(fragmentShader, xShaders.cube_fshader);

    //vertex shader (the more complicated one)
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    compile(vertexShader, xShaders.cube_vshader);

    //link program
    this._shader = gl.createProgram();
    gl.attachShader(this._shader, vertexShader);
    gl.attachShader(this._shader, fragmentShader);
    gl.linkProgram(this._shader);

    if (!gl.getProgramParameter(this._shader, gl.LINK_STATUS)) {
        viewer._error('Could not initialise shaders for a navigation cube plugin');
    }
};

xNavigationCube.prototype.vertices = new Float32Array([
      // Front face
      -0.5, -0.5, 0.5,
       0.5, -0.5, 0.5,
       0.5, 0.5, 0.5,
      -0.5, 0.5, 0.5,

      // Back face
      -0.5, -0.5, -0.5,
      -0.5, 0.5, -0.5,
       0.5, 0.5, -0.5,
       0.5, -0.5, -0.5,

      // Top face
      -0.5, 0.5, -0.5,
      -0.5, 0.5, 0.5,
       0.5, 0.5, 0.5,
       0.5, 0.5, -0.5,

      // Bottom face
      -0.5, -0.5, -0.5,
       0.5, -0.5, -0.5,
       0.5, -0.5, 0.5,
      -0.5, -0.5, 0.5,

      // Right face
       0.5, -0.5, -0.5,
       0.5, 0.5, -0.5,
       0.5, 0.5, 0.5,
       0.5, -0.5, 0.5,

      // Left face
      -0.5, -0.5, -0.5,
      -0.5, -0.5, 0.5,
      -0.5, 0.5, 0.5,
      -0.5, 0.5, -0.5
]);

xNavigationCube.prototype.indices = new Uint16Array([
    0, 1, 2, 0, 2, 3, // Front face
    4, 5, 6, 4, 6, 7, // Back face
    8, 9, 10, 8, 10, 11, // Top face
    12, 13, 14, 12, 14, 15, // Bottom face
    16, 17, 18, 16, 18, 19, // Right face
    20, 21, 22, 20, 22, 23 // Left face
]);

xNavigationCube.prototype.colours = new Float32Array([
      1.0, 0.0, 0.0, 1.0,     // Front face
      1.0, 0.0, 0.0, 1.0,     
      1.0, 0.0, 0.0, 1.0,     
      1.0, 0.0, 0.0, 1.0,     

      1.0, 1.0, 0.0, 1.0,     // Back face
      1.0, 1.0, 0.0, 1.0,     
      1.0, 1.0, 0.0, 1.0,     
      1.0, 1.0, 0.0, 1.0,     

      0.0, 1.0, 0.0, 1.0,     // Top face
      0.0, 1.0, 0.0, 1.0,     
      0.0, 1.0, 0.0, 1.0,     
      0.0, 1.0, 0.0, 1.0,     

      1.0, 0.5, 0.5, 1.0,     // Bottom face
      1.0, 0.5, 0.5, 1.0,     
      1.0, 0.5, 0.5, 1.0,     
      1.0, 0.5, 0.5, 1.0,     

      1.0, 0.0, 1.0, 1.0,     // Right face
      1.0, 0.0, 1.0, 1.0,     
      1.0, 0.0, 1.0, 1.0,     
      1.0, 0.0, 1.0, 1.0,     

      0.0, 0.0, 1.0, 1.0,     // Left face
      0.0, 0.0, 1.0, 1.0,     
      0.0, 0.0, 1.0, 1.0,     
      0.0, 0.0, 1.0, 1.0      
]);
