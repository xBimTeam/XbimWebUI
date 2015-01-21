//this class holds pointers to textures, uniforms and data buffers which 
//make up a model in GPU

//gl: WebGL context
//model: xModelGeometry
//fpt: bool (floating point texture support)
function xModelHandle(gl, model, fpt) {
    if (typeof (gl) == 'undefined' || typeof (model) == 'undefined' || typeof (fpt) == 'undefined') {
        throw 'WebGL context and geometry model must be specified';
    }

    this._gl = gl;
    this._model = model;
    this._fpt = fpt;
    this._id = xModelHandle._instancesNum++;

    this.count = model.indices.length;

    //data structure 
    this.vertexTexture = gl.createTexture();
    this.matrixTexture = gl.createTexture();
    this.styleTexture = gl.createTexture();
    this.stateStyleTexture = gl.createTexture();

    this.vertexTextureSize = 0;
    this.matrixTextureSize = 0;
    this.styleTextureSize = 0;

    this.normalBuffer = gl.createBuffer();
    this.indexBuffer = gl.createBuffer();
    this.productBuffer = gl.createBuffer();
    this.styleBuffer = gl.createBuffer();
    this.stateBuffer = gl.createBuffer();
    this.transformationBuffer = gl.createBuffer();

    //small texture which can be used to overwrite appearance of the products
    this.stateStyle = new Uint8Array(15 * 15 * 4);
    this._feedCompleted = false;

    this.region = model.regions[0];
    //set the most populated region
    for (var i in model.regions) {
        var region = model.regions[i];
        if (region.population > this.region.population) this.region = region;
    }
    //set default region if no region is defined. This shouldn't ever happen if model contains any geometry.
    if (typeof (this.region) == 'undefined') {
        this.region = {
            population: 1,
            centre: [0.0, 0.0, 0.0],
            bbox: [0.0, 0.0, 0.0, 10 * model.meter, 10 * model.meter, 10 * model.meter]
        }
    }
}

xModelHandle._instancesNum = 0;
xModelHandle._activeInstance = -1;

//this function sets this model as an active one
//it needs an argument 'pointers' which contains pointers to
//shader attributes and uniforms which are to be set.
//pointers = {
//	normalAttrPointer: null,
//	indexlAttrPointer: null,
//	productAttrPointer: null,
//	stateAttrPointer: null,
//	styleAttrPointer: null,
//	transformationAttrPointer: null,
//
//	matrixSamplerUniform: null,
//	vertexSamplerUniform: null,
//	styleSamplerUniform: null,
//	stateStyleSamplerUniform: null,
//	
//	vertexTextureSizeUniform: null,
//	matrixTextureSizeUniform: null,
//	styleTextureSizeUniform: null,
//};
xModelHandle.prototype.setActive = function (pointers) {
    //check if this is not active already
    if (xModelHandle._activeInstance == this._id) return;

    var gl = this._gl;
    //set predefined textures
    if (this.vertexTextureSize > 0) {
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.vertexTexture);
    }

    if (this.matrixTextureSize > 0) {
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.matrixTexture);
    }

    if (this.styleTextureSize > 0) {
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, this.styleTexture);
    }

    //this texture has constant size
    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, this.stateStyleTexture);

    //set attributes and uniforms
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.vertexAttribPointer(pointers.normalAttrPointer, 2, gl.UNSIGNED_BYTE, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.indexBuffer);
    gl.vertexAttribPointer(pointers.indexlAttrPointer, 1, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.productBuffer);
    gl.vertexAttribPointer(pointers.productAttrPointer, 1, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.stateBuffer);
    gl.vertexAttribPointer(pointers.stateAttrPointer, 2, gl.UNSIGNED_BYTE, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.styleBuffer);
    gl.vertexAttribPointer(pointers.styleAttrPointer, 1, gl.UNSIGNED_SHORT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.transformationBuffer);
    gl.vertexAttribPointer(pointers.transformationAttrPointer, 1, gl.FLOAT, false, 0, 0);

    gl.uniform1i(pointers.vertexSamplerUniform, 1);
    gl.uniform1i(pointers.matrixSamplerUniform, 2);
    gl.uniform1i(pointers.styleSamplerUniform, 3);
    gl.uniform1i(pointers.stateStyleSamplerUniform, 4);
    gl.uniform1i(pointers.vertexTextureSizeUniform, this.vertexTextureSize);
    gl.uniform1i(pointers.matrixTextureSizeUniform, this.matrixTextureSize);
    gl.uniform1i(pointers.styleTextureSizeUniform, this.styleTextureSize);

    xModelHandle._activeInstance = this._id;
};

//this function must be called AFTER 'setActive()' function which sets up active buffers and uniforms
xModelHandle.prototype.draw = function () {
    //this.drawElement(480949);
    //return;

    var gl = this._gl;
    //draw image frame
    gl.drawArrays(gl.TRIANGLES, 0, this.count);
};

xModelHandle.prototype.drawProduct = function (ID) {
    var gl = this._gl;
    var map = this.getProductMap(ID);
    if (map != null) {
        for (var i in map.spans) {
            var span = map.spans[i];
            gl.drawArrays(gl.TRIANGLES, span[0], span[1] - span[0]);
        }
    }
};

xModelHandle.prototype.getProductMap = function (ID) {
    return this._model.productMap.filter(function (m) { return m.productID == ID }).pop();
};

xModelHandle.prototype.feedGPU = function () {
    if (this._feedCompleted) {
        throw 'GPU can bee fed only once. It discards unnecessary data which cannot be restored again.';
    }

    var gl = this._gl;
    var model = this._model;

    //fill all buffers
    this._bufferData(this.normalBuffer, model.normals);
    this._bufferData(this.indexBuffer, model.indices);
    this._bufferData(this.productBuffer, model.products);
    this._bufferData(this.stateBuffer, model.states);
    this._bufferData(this.transformationBuffer, model.transformations);
    this._bufferData(this.styleBuffer, model.styleIndices);

    //fill in all textures
    this.vertexTextureSize = this._bufferTexture(this.vertexTexture, model.vertices, 3);
    this.matrixTextureSize = this._bufferTexture(this.matrixTexture, model.matrices, 4);
    this.styleTextureSize = this._bufferTexture(this.styleTexture, model.styles);
    //this has a constant size 15 which is defined in vertex shader
    this._bufferTexture(this.stateStyleTexture, this.stateStyle);

    //Forget everything except for states and styles (this should save some RAM).
    //data is already loaded to GPU by now
    model.normals = null;
    model.indices = null;
    model.products = null;
    model.transformations = null;
    model.styleIndices = null;
    
    model.vertices = null;
    model.matrices = null;

    this._feedCompleted = true;
};

xModelHandle.prototype.refreshStyles = function () {
    this._bufferTexture(this.stateStyleTexture, this.stateStyle);
};

xModelHandle.prototype._bufferData = function (pointer, data) {
    var gl = this._gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, pointer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
};

xModelHandle.prototype._bufferTexture = function (pointer, data, arity) {
    var gl = this._gl;
    if (data.length == 0) return 0;

    //detect floating point texture support and data type
    var fp = this._fpt && data instanceof Float32Array;

    //compute size of the image (length should be correct already)
    var size = 0;
    var maxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    if (fp) {
        //recompute to smaller size
        size = Math.ceil(Math.sqrt(data.length / arity));
    }
    else {
        var dim = Math.sqrt(data.byteLength / 4);
        size = Math.ceil(dim);
    }

    if (size == 0) return 0;
    if (size > maxSize) throw 'Too much data! It cannot fit into the texture.';

    gl.bindTexture(gl.TEXTURE_2D, pointer);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); //this is our convention
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);  //this should preserve values of alpha
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);  //this should preserve values of colours

    if (fp) {
        //create new data buffer and fill it in with data
        var image = null;
        if (size * size * arity != data.length) {
            image = new Float32Array(size * size * arity);
            image.set(data);
        }
        else {
            image = data;
        }
        var type = null;
        switch (arity) {
            case 1: type = gl.ALPHA; break;
            case 3: type = gl.RGB; break;
            case 4: type = gl.RGBA; break;
        }
        gl.texImage2D(gl.TEXTURE_2D, 0, type, size, size, 0, type, gl.FLOAT, image);
    }
    else {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(data.buffer));
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating).
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating).

    return size;
};

xModelHandle.prototype.setState = function (state, args) {
    if (typeof (state) != 'number' && state < 0 && state > 255) throw 'You have to specify state as an ID of state or index in style pallete.';
    if (typeof (args) == 'undefined') throw 'You have to specify products as an array of product IDs or as a product type ID';

    var maps = [];
    //it is type
    if (typeof (args) == 'number') {
        maps = this._model.productMap.filter(function (m) { return m.type == args });
    }
        //it is list of IDs
    else {
        maps = this._model.productMap.filter(function (m) { return args.indexOf(m.productID) != -1 });
    }

    //shift +1 if it is an overlay colour style or 0 if it is a state.
    var shift = state <= 225 ? 1 : 0;
    for (var i in maps) {
        var map = maps[i];
        for (var j in map.spans) {
            var span = map.spans[j]
            //set state or style
            for (var k = span[0]; k < span[1]; k++) {
                this._model.states[k*2 + shift] = state;
            }
        }
    }

    //buffer data to GPU
    this._bufferData(this.stateBuffer, this._model.states);
};

xModelHandle.prototype.resetStates = function () {
    for (var i = 0; i < this._model.states.length; i += 2) {
        this._model.states[i] = xState.UNDEFINED;
    }
    //buffer data to GPU
    this._bufferData(this.stateBuffer, this._model.states);
};

xModelHandle.prototype.resetStyles = function () {
    for (var i = 0; i < this._model.states.length; i += 2) {
        this._model.states[i + 1] = xState.UNSTYLED;
    }
    //buffer data to GPU
    this._bufferData(this.stateBuffer, this._model.states);
};
