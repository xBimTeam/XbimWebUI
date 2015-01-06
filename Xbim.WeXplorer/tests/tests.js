QUnit.module("Binary reader tests");
QUnit.asyncTest( "Reading all implemented data types.", function( assert ) {
	var br = new xBinaryReader();
	br.onloaded = function(){
		assert.deepEqual(br.read(br.BYTE), 64, 'Test of Byte');
		assert.deepEqual(br.read(br.INT16), 64, 'Test of INT16');
		assert.deepEqual(br.read(br.UINT16), 64, 'Test of UINT16');
		assert.deepEqual(br.read(br.INT32), 64, 'Test of INT32');
		assert.deepEqual(br.read(br.UINT32), 64, 'Test of UINT32');
		assert.deepEqual(br.read(br.FLOAT32), 64.0, 'Test of FLOAT32');
		assert.deepEqual(br.read(br.FLOAT64), 64.0, 'Test of FLOAT64');
		assert.deepEqual(br.read(br.CHAR), 'A', 'Test of CHAR');
		assert.deepEqual(br.read(br.POINT), new Float32Array([1.0, 2.0, 3.0]), 'Test of POINT');
		assert.deepEqual(br.read(br.RGBA), new Uint8Array([255,255,255,255]), 'Test of RGBA');
		assert.deepEqual(br.read(br.PACKED_NORMAL), new Uint8Array([126,126]), 'Test of PACKED_NORMAL');
		assert.deepEqual(br.read(br.MATRIX4x4), new Float32Array([10.0,10.0,10.0,10.0,10.0,10.0,10.0,10.0,10.0,10.0,10.0,10.0,10.0,10.0,10.0,10.0]), 'Test of matrix 4x4');
		QUnit.start();
	};
	br.load('data/data.dat');
});

QUnit.module("Geometry loading tests");
QUnit.asyncTest( "Loading Lakeside restaurant", function( assert ) {
	var model = new xModelGeometry();
	model.onloaded = function(){
		assert.ok(true, 'Model loaded with no exception');
		QUnit.start();
	};
	model.load('data/LakesideRestaurant.wexbim');
});

QUnit.asyncTest( "Creation and initialization of model handle", function( assert ) {
	var canvas = document.createElement('canvas');
	var gl = canvas.getContext('experimental-webgl');
	var model = new xModelGeometry();
	model.onloaded = function(){
		var fpt = (
		gl.getExtension('OES_texture_float') ||
		gl.getExtension('MOZ_OES_texture_float') ||
		gl.getExtension('WEBKIT_OES_texture_float')
		);
		var handle = new xModelHandle(gl, model, fpt != null);
		handle.feedGPU();
		assert.ok(true, 'Model loaded with no exception');
		QUnit.start();
	};
	model.load('data/LakesideRestaurant.wexbim');
});


QUnit.asyncTest( "Creation and initialization of model handle within viewer", function( assert ) {
	var canvas = document.createElement('canvas');
	var viewer = new xViewer(canvas);
	
	var model = new xModelGeometry();
	model.onloaded = function(){
		var fpt = (
		viewer._gl.getExtension('OES_texture_float') ||
		viewer._gl.getExtension('MOZ_OES_texture_float') ||
		viewer._gl.getExtension('WEBKIT_OES_texture_float')
		);
		var handle = new xModelHandle(viewer._gl, model, fpt != null);
		handle.feedGPU();
		handle.setActive(viewer._pointers);
		assert.ok(true, 'Model loaded with no exception');
		QUnit.start();
	};
	model.load('data/LakesideRestaurant.wexbim');
});
