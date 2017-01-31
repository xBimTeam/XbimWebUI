

/* Copyright (c) 2016, xBIM Team, Northumbria University. All rights reserved.

This javascript library is part of xBIM project. It is provided under the same 
Common Development and Distribution License (CDDL) as the xBIM Toolkit. For 
more information see http://www.openbim.org

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["xbim-webui"] = factory();
	else
		root["xbim-webui"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	__webpack_require__(28);
	module.exports = __webpack_require__(30);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	// Viewer
	__export(__webpack_require__(2));
	__export(__webpack_require__(3));
	__export(__webpack_require__(7));
	__export(__webpack_require__(8));
	__export(__webpack_require__(5));
	__export(__webpack_require__(9));
	__export(__webpack_require__(4));
	__export(__webpack_require__(6));
	__export(__webpack_require__(10));
	// Plugins
	__export(__webpack_require__(13));
	__export(__webpack_require__(14));
	__export(__webpack_require__(15));
	__export(__webpack_require__(16));
	__export(__webpack_require__(17));
	// Browser
	__export(__webpack_require__(18));
	__export(__webpack_require__(19));
	__export(__webpack_require__(27));
	__export(__webpack_require__(22));
	__export(__webpack_require__(24));
	__export(__webpack_require__(25));
	__export(__webpack_require__(23));
	__export(__webpack_require__(21));
	__export(__webpack_require__(26));
	__export(__webpack_require__(20));


/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";
	var xBinaryReader = (function () {
	    function xBinaryReader() {
	        this._buffer = null;
	        this._position = 0;
	    }
	    xBinaryReader.prototype.onloaded = function () { };
	    xBinaryReader.prototype.onerror = function (message) { };
	    xBinaryReader.prototype.load = function (source) {
	        this._position = 0;
	        var self = this;
	        if (typeof (source) == 'undefined' || source == null)
	            throw 'Source must be defined';
	        if (typeof (source) == 'string') {
	            var xhr;
	            xhr = new XMLHttpRequest();
	            xhr.open("GET", source, true);
	            xhr.onreadystatechange = function () {
	                if (xhr.readyState == 4 && xhr.status == 200) {
	                    var fReader = new FileReader();
	                    fReader.onloadend = function () {
	                        if (fReader.result) {
	                            //set data buffer for next processing
	                            self._buffer = fReader.result;
	                            //do predefined processing of the data
	                            if (self.onloaded) {
	                                self.onloaded();
	                            }
	                        }
	                    };
	                    fReader.readAsArrayBuffer(xhr.response);
	                }
	                //throw exception as a warning
	                if (xhr.readyState == 4 && xhr.status != 200) {
	                    var msg = 'Failed to fetch binary data from server. Server code: ' +
	                        xhr.status +
	                        '. This might be due to CORS policy of your browser if you run this as a local file.';
	                    if (self.onerror)
	                        self.onerror(msg);
	                    throw msg;
	                }
	            };
	            xhr.responseType = 'blob';
	            xhr.send();
	        }
	        else if (source instanceof Blob || source instanceof File) {
	            var fReader = new FileReader();
	            fReader.onloadend = function () {
	                if (fReader.result) {
	                    //set data buffer for next processing
	                    self._buffer = fReader.result;
	                    //do predefined processing of the data
	                    if (self.onloaded) {
	                        self.onloaded();
	                    }
	                }
	            };
	            fReader.readAsArrayBuffer(source);
	        }
	        else if (source instanceof ArrayBuffer) {
	            this._buffer = source;
	        }
	    };
	    xBinaryReader.prototype.getIsEOF = function (type, count) {
	        if (typeof (this._position) === "undefined")
	            throw "Position is not defined";
	        return this._position == this._buffer.byteLength;
	    };
	    xBinaryReader.prototype.read = function (arity, count, ctor) {
	        if (typeof (count) === "undefined")
	            count = 1;
	        var length = arity * count;
	        var offset = this._position;
	        this._position += length;
	        var result;
	        return count === 1
	            ? new ctor(this._buffer.slice(offset, offset + length))[0]
	            : new ctor(this._buffer.slice(offset, offset + length));
	    };
	    xBinaryReader.prototype.readByte = function (count) {
	        return this.read(1, count, Uint8Array);
	    };
	    xBinaryReader.prototype.readUint8 = function (count) {
	        return this.read(1, count, Uint8Array);
	    };
	    xBinaryReader.prototype.readInt16 = function (count) {
	        return this.read(2, count, Int16Array);
	    };
	    xBinaryReader.prototype.readUint16 = function (count) {
	        return this.read(2, count, Uint16Array);
	    };
	    xBinaryReader.prototype.readInt32 = function (count) {
	        return this.read(4, count, Int32Array);
	    };
	    xBinaryReader.prototype.readUint32 = function (count) {
	        return this.read(4, count, Uint32Array);
	    };
	    xBinaryReader.prototype.readFloat32 = function (count) {
	        return this.read(4, count, Float32Array);
	    };
	    xBinaryReader.prototype.readFloat64 = function (count) {
	        return this.read(8, count, Float64Array);
	    };
	    //functions for a higher objects like points, colours and matrices
	    xBinaryReader.prototype.readChar = function (count) {
	        if (typeof (count) === "undefined")
	            count = 1;
	        var bytes = this.readByte(count);
	        var result = new Array(count);
	        for (var i in bytes) {
	            result[i] = String.fromCharCode(bytes[i]);
	        }
	        return count === 1 ? result[0] : result;
	    };
	    xBinaryReader.prototype.readPoint = function (count) {
	        if (typeof (count) === "undefined")
	            count = 1;
	        var coords = this.readFloat32(count * 3);
	        var result = new Array(count);
	        for (var i = 0; i < count; i++) {
	            var offset = i * 3 * 4;
	            //only create new view on the buffer so that no new memory is allocated
	            var point = new Float32Array(coords.buffer, offset, 3);
	            result[i] = point;
	        }
	        return count === 1 ? result[0] : result;
	    };
	    xBinaryReader.prototype.readRgba = function (count) {
	        if (typeof (count) === "undefined")
	            count = 1;
	        var values = this.readByte(count * 4);
	        var result = new Array(count);
	        for (var i = 0; i < count; i++) {
	            var offset = i * 4;
	            var colour = new Uint8Array(values.buffer, offset, 4);
	            result[i] = colour;
	        }
	        return count === 1 ? result[0] : result;
	    };
	    xBinaryReader.prototype.readPackedNormal = function (count) {
	        if (typeof (count) === "undefined")
	            count = 1;
	        var values = this.readUint8(count * 2);
	        var result = new Array(count);
	        for (var i = 0; i < count; i++) {
	            var uv = new Uint8Array(values.buffer, i * 2, 2);
	            result[i] = uv;
	        }
	        return count === 1 ? result[0] : result;
	    };
	    xBinaryReader.prototype.readMatrix4x4 = function (count) {
	        if (typeof (count) === "undefined")
	            count = 1;
	        var values = this.readFloat32(count * 16);
	        var result = new Array(count);
	        for (var i = 0; i < count; i++) {
	            var offset = i * 16 * 4;
	            var matrix = new Float32Array(values.buffer, offset, 16);
	            result[i] = matrix;
	        }
	        return count === 1 ? result[0] : result;
	    };
	    xBinaryReader.prototype.readMatrix4x4_64 = function (count) {
	        if (typeof (count) === "undefined")
	            count = 1;
	        var values = this.readFloat64(count * 16);
	        var result = new Array(count);
	        for (var i = 0; i < count; i++) {
	            var offset = i * 16 * 8;
	            var matrix = new Float64Array(values.buffer, offset, 16);
	            result[i] = matrix;
	        }
	        return count === 1 ? result[0] : result;
	    };
	    return xBinaryReader;
	}());
	exports.xBinaryReader = xBinaryReader;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var xbim_state_1 = __webpack_require__(4);
	var xbim_product_type_1 = __webpack_require__(5);
	var xbim_triangulated_shape_1 = __webpack_require__(6);
	var xbim_binary_reader_1 = __webpack_require__(2);
	var xModelGeometry = (function () {
	    function xModelGeometry() {
	        this.meter = 1000;
	        //this will be used to change appearance of the objects
	        //map objects have a format: 
	        //map = {
	        //	productID: int,
	        //	type: int,
	        //	bBox: Float32Array(6),
	        //	spans: [Int32Array([int, int]),Int32Array([int, int]), ...] //spanning indexes defining shapes of product and it's state
	        //};
	        this.productMap = {};
	    }
	    xModelGeometry.prototype.parse = function (binReader) {
	        var br = binReader;
	        var magicNumber = br.readInt32();
	        if (magicNumber != 94132117)
	            throw 'Magic number mismatch.';
	        var version = br.readByte();
	        var numShapes = br.readInt32();
	        var numVertices = br.readInt32();
	        var numTriangles = br.readInt32();
	        var numMatrices = br.readInt32();
	        ;
	        var numProducts = br.readInt32();
	        ;
	        var numStyles = br.readInt32();
	        ;
	        this.meter = br.readFloat32();
	        ;
	        var numRegions = br.readInt16();
	        //set size of arrays to be square usable for texture data
	        //TODO: reflect support for floating point textures
	        var square = function (arity, count) {
	            if (typeof (arity) == 'undefined' || typeof (count) == 'undefined') {
	                throw 'Wrong arguments';
	            }
	            if (count == 0)
	                return 0;
	            var byteLength = count * arity;
	            var imgSide = Math.ceil(Math.sqrt(byteLength / 4));
	            //clamp to parity
	            while ((imgSide * 4) % arity != 0) {
	                imgSide++;
	            }
	            var result = imgSide * imgSide * 4 / arity;
	            return result;
	        };
	        //create target buffers of correct size (avoid reallocation of memory)
	        this.vertices = new Float32Array(square(4, numVertices * 3));
	        this.normals = new Uint8Array(numTriangles * 6);
	        this.indices = new Float32Array(numTriangles * 3);
	        this.styleIndices = new Uint16Array(numTriangles * 3);
	        this.styles = new Uint8Array(square(1, (numStyles + 1) * 4)); //+1 is for a default style
	        this.products = new Float32Array(numTriangles * 3);
	        this.states = new Uint8Array(numTriangles * 3 * 2); //place for state and restyling
	        this.transformations = new Float32Array(numTriangles * 3);
	        this.matrices = new Float32Array(square(4, numMatrices * 16));
	        this.productMap = {};
	        this.regions = new Array(numRegions);
	        var iVertex = 0;
	        var iIndexForward = 0;
	        var iIndexBackward = numTriangles * 3;
	        var iTransform = 0;
	        var iMatrix = 0;
	        var stateEnum = xbim_state_1.xState;
	        var typeEnum = xbim_product_type_1.xProductType;
	        for (var i = 0; i < numRegions; i++) {
	            this.regions[i] = {
	                population: br.readInt32(),
	                centre: br.readFloat32(3),
	                bbox: br.readFloat32(6)
	            };
	        }
	        var styleMap = [];
	        styleMap['getStyle'] = function (id) {
	            for (var i = 0; i < this.length; i++) {
	                var item = this[i];
	                if (item.id == id)
	                    return item;
	            }
	            return null;
	        };
	        var iStyle = 0;
	        for (iStyle; iStyle < numStyles; iStyle++) {
	            var styleId = br.readInt32();
	            var R = br.readFloat32() * 255;
	            var G = br.readFloat32() * 255;
	            var B = br.readFloat32() * 255;
	            var A = br.readFloat32() * 255;
	            this.styles.set([R, G, B, A], iStyle * 4);
	            styleMap.push({ id: styleId, index: iStyle, transparent: A < 254 });
	        }
	        this.styles.set([255, 255, 255, 255], iStyle * 4);
	        var defaultStyle = { id: -1, index: iStyle, transparent: A < 254 };
	        styleMap.push(defaultStyle);
	        for (var i = 0; i < numProducts; i++) {
	            var productLabel = br.readInt32();
	            var prodType = br.readInt16();
	            var bBox = br.readFloat32(6);
	            var map = {
	                productID: productLabel,
	                type: prodType,
	                bBox: bBox,
	                spans: []
	            };
	            this.productMap[productLabel] = map;
	        }
	        for (var iShape = 0; iShape < numShapes; iShape++) {
	            var repetition = br.readInt32();
	            var shapeList = [];
	            for (var iProduct = 0; iProduct < repetition; iProduct++) {
	                var prodLabel = br.readInt32();
	                var instanceTypeId = br.readInt16();
	                var instanceLabel = br.readInt32();
	                var styleId = br.readInt32();
	                var transformation = null;
	                if (repetition > 1) {
	                    transformation = version === 1 ? br.readFloat32(16) : br.readFloat64(16);
	                    this.matrices.set(transformation, iMatrix);
	                    iMatrix += 16;
	                }
	                var styleItem = styleMap['getStyle'](styleId);
	                if (styleItem === null)
	                    styleItem = defaultStyle;
	                shapeList.push({
	                    pLabel: prodLabel,
	                    iLabel: instanceLabel,
	                    style: styleItem.index,
	                    transparent: styleItem.transparent,
	                    transform: transformation != null ? iTransform++ : 0xFFFF
	                });
	            }
	            //read shape geometry
	            var shapeGeom = new xbim_triangulated_shape_1.xTriangulatedShape();
	            shapeGeom.parse(br);
	            //copy shape data into inner array and set to null so it can be garbage collected
	            shapeList.forEach(function (shape) {
	                var iIndex = 0;
	                //set iIndex according to transparency either from beginning or at the end
	                if (shape.transparent) {
	                    iIndex = iIndexBackward - shapeGeom.indices.length;
	                }
	                else {
	                    iIndex = iIndexForward;
	                }
	                var begin = iIndex;
	                var map = this.productMap[shape.pLabel];
	                if (typeof (map) === "undefined") {
	                    //throw "Product hasn't been defined before.";
	                    map = {
	                        productID: 0,
	                        type: typeEnum.IFCOPENINGELEMENT,
	                        bBox: new Float32Array(6),
	                        spans: []
	                    };
	                    this.productMap[shape.pLabel] = map;
	                }
	                this.normals.set(shapeGeom.normals, iIndex * 2);
	                //switch spaces and openings off by default 
	                var state = map.type == typeEnum.IFCSPACE || map.type == typeEnum.IFCOPENINGELEMENT
	                    ? stateEnum.HIDDEN
	                    : 0xFF; //0xFF is for the default state
	                //fix indices to right absolute position. It is relative to the shape.
	                for (var i = 0; i < shapeGeom.indices.length; i++) {
	                    this.indices[iIndex] = shapeGeom.indices[i] + iVertex / 3;
	                    this.products[iIndex] = shape.pLabel;
	                    this.styleIndices[iIndex] = shape.style;
	                    this.transformations[iIndex] = shape.transform;
	                    this.states[2 * iIndex] = state; //set state
	                    this.states[2 * iIndex + 1] = 0xFF; //default style
	                    iIndex++;
	                }
	                var end = iIndex;
	                map.spans.push(new Int32Array([begin, end]));
	                if (shape.transparent)
	                    iIndexBackward -= shapeGeom.indices.length;
	                else
	                    iIndexForward += shapeGeom.indices.length;
	            }, this);
	            //copy geometry and keep track of amount so that we can fix indices to right position
	            //this must be the last step to have correct iVertex number above
	            this.vertices.set(shapeGeom.vertices, iVertex);
	            iVertex += shapeGeom.vertices.length;
	            shapeGeom = null;
	        }
	        //binary reader should be at the end by now
	        if (!br.getIsEOF()) {
	        }
	        this.transparentIndex = iIndexForward;
	    };
	    //Source has to be either URL of wexBIM file or Blob representing wexBIM file
	    xModelGeometry.prototype.load = function (source) {
	        //binary reading
	        var br = new xbim_binary_reader_1.xBinaryReader();
	        var self = this;
	        br.onloaded = function () {
	            self.parse(br);
	            if (self.onloaded) {
	                self.onloaded();
	            }
	        };
	        br.onerror = function (msg) {
	            if (self.onerror)
	                self.onerror(msg);
	        };
	        br.load(source);
	    };
	    xModelGeometry.prototype.onloaded = function () { };
	    xModelGeometry.prototype.onerror = function (message) { };
	    return xModelGeometry;
	}());
	exports.xModelGeometry = xModelGeometry;


/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";
	/**
	    * Enumeration for object states.
	    * @readonly
	    * @enum {number}
	    */
	exports.xState = {
	    UNDEFINED: 255,
	    HIDDEN: 254,
	    HIGHLIGHTED: 253,
	    XRAYVISIBLE: 252,
	    UNSTYLED: 225
	};


/***/ },
/* 5 */
/***/ function(module, exports) {

	"use strict";
	/**
	* Enumeration of product types.
	* @readonly
	* @enum {number}
	*/
	exports.xProductType = {
	    IFCDISTRIBUTIONELEMENT: 44,
	    IFCDISTRIBUTIONFLOWELEMENT: 45,
	    IFCDISTRIBUTIONCHAMBERELEMENT: 180,
	    IFCENERGYCONVERSIONDEVICE: 175,
	    IFCAIRTOAIRHEATRECOVERY: 1097,
	    IFCBOILER: 1105,
	    IFCBURNER: 1109,
	    IFCCHILLER: 1119,
	    IFCCOIL: 1124,
	    IFCCONDENSER: 1132,
	    IFCCOOLEDBEAM: 1141,
	    IFCCOOLINGTOWER: 1142,
	    IFCENGINE: 1164,
	    IFCEVAPORATIVECOOLER: 1166,
	    IFCEVAPORATOR: 1167,
	    IFCHEATEXCHANGER: 1187,
	    IFCHUMIDIFIER: 1188,
	    IFCTUBEBUNDLE: 1305,
	    IFCUNITARYEQUIPMENT: 1310,
	    IFCELECTRICGENERATOR: 1160,
	    IFCELECTRICMOTOR: 1161,
	    IFCMOTORCONNECTION: 1216,
	    IFCSOLARDEVICE: 1270,
	    IFCTRANSFORMER: 1303,
	    IFCFLOWCONTROLLER: 121,
	    IFCELECTRICDISTRIBUTIONPOINT: 242,
	    IFCAIRTERMINALBOX: 1096,
	    IFCDAMPER: 1148,
	    IFCFLOWMETER: 1182,
	    IFCVALVE: 1311,
	    IFCELECTRICDISTRIBUTIONBOARD: 1157,
	    IFCELECTRICTIMECONTROL: 1162,
	    IFCPROTECTIVEDEVICE: 1235,
	    IFCSWITCHINGDEVICE: 1290,
	    IFCFLOWFITTING: 467,
	    IFCDUCTFITTING: 1153,
	    IFCPIPEFITTING: 1222,
	    IFCCABLECARRIERFITTING: 1111,
	    IFCCABLEFITTING: 1113,
	    IFCJUNCTIONBOX: 1195,
	    IFCFLOWMOVINGDEVICE: 502,
	    IFCCOMPRESSOR: 1131,
	    IFCFAN: 1177,
	    IFCPUMP: 1238,
	    IFCFLOWSEGMENT: 574,
	    IFCDUCTSEGMENT: 1154,
	    IFCPIPESEGMENT: 1223,
	    IFCCABLECARRIERSEGMENT: 1112,
	    IFCCABLESEGMENT: 1115,
	    IFCFLOWSTORAGEDEVICE: 371,
	    IFCTANK: 1293,
	    IFCELECTRICFLOWSTORAGEDEVICE: 1159,
	    IFCFLOWTERMINAL: 46,
	    IFCFIRESUPPRESSIONTERMINAL: 1179,
	    IFCSANITARYTERMINAL: 1262,
	    IFCSTACKTERMINAL: 1277,
	    IFCWASTETERMINAL: 1315,
	    IFCAIRTERMINAL: 1095,
	    IFCMEDICALDEVICE: 1212,
	    IFCSPACEHEATER: 1272,
	    IFCAUDIOVISUALAPPLIANCE: 1099,
	    IFCCOMMUNICATIONSAPPLIANCE: 1127,
	    IFCELECTRICAPPLIANCE: 1156,
	    IFCLAMP: 1198,
	    IFCLIGHTFIXTURE: 1199,
	    IFCOUTLET: 1219,
	    IFCFLOWTREATMENTDEVICE: 425,
	    IFCINTERCEPTOR: 1193,
	    IFCDUCTSILENCER: 1155,
	    IFCFILTER: 1178,
	    IFCDISTRIBUTIONCONTROLELEMENT: 468,
	    IFCPROTECTIVEDEVICETRIPPINGUNIT: 1236,
	    IFCACTUATOR: 1091,
	    IFCALARM: 1098,
	    IFCCONTROLLER: 1139,
	    IFCFLOWINSTRUMENT: 1181,
	    IFCSENSOR: 1264,
	    IFCUNITARYCONTROLELEMENT: 1308,
	    IFCDISCRETEACCESSORY: 423,
	    IFCFASTENER: 535,
	    IFCMECHANICALFASTENER: 536,
	    IFCREINFORCINGBAR: 571,
	    IFCREINFORCINGMESH: 531,
	    IFCTENDON: 261,
	    IFCTENDONANCHOR: 675,
	    IFCBUILDINGELEMENTPART: 220,
	    IFCVIBRATIONISOLATOR: 1312,
	    IFCCHAMFEREDGEFEATURE: 765,
	    IFCROUNDEDEDGEFEATURE: 766,
	    IFCOPENINGELEMENT: 498,
	    IFCOPENINGSTANDARDCASE: 1217,
	    IFCVOIDINGFEATURE: 1313,
	    IFCPROJECTIONELEMENT: 384,
	    IFCSURFACEFEATURE: 1287,
	    IFCFOOTING: 120,
	    IFCPILE: 572,
	    IFCBEAM: 171,
	    IFCBEAMSTANDARDCASE: 1104,
	    IFCCOLUMN: 383,
	    IFCCOLUMNSTANDARDCASE: 1126,
	    IFCCURTAINWALL: 456,
	    IFCDOOR: 213,
	    IFCDOORSTANDARDCASE: 1151,
	    IFCMEMBER: 310,
	    IFCMEMBERSTANDARDCASE: 1214,
	    IFCPLATE: 351,
	    IFCPLATESTANDARDCASE: 1224,
	    IFCRAILING: 350,
	    IFCRAMP: 414,
	    IFCRAMPFLIGHT: 348,
	    IFCROOF: 347,
	    IFCSLAB: 99,
	    IFCSLABELEMENTEDCASE: 1268,
	    IFCSLABSTANDARDCASE: 1269,
	    IFCSTAIR: 346,
	    IFCSTAIRFLIGHT: 25,
	    IFCWALL: 452,
	    IFCWALLSTANDARDCASE: 453,
	    IFCWALLELEMENTEDCASE: 1314,
	    IFCWINDOW: 667,
	    IFCWINDOWSTANDARDCASE: 1316,
	    IFCBUILDINGELEMENTPROXY: 560,
	    IFCCOVERING: 382,
	    IFCCHIMNEY: 1120,
	    IFCSHADINGDEVICE: 1265,
	    IFCELEMENTASSEMBLY: 18,
	    IFCFURNISHINGELEMENT: 253,
	    IFCFURNITURE: 1184,
	    IFCSYSTEMFURNITUREELEMENT: 1291,
	    IFCTRANSPORTELEMENT: 416,
	    IFCVIRTUALELEMENT: 168,
	    IFCELECTRICALELEMENT: 23,
	    IFCEQUIPMENTELEMENT: 212,
	    IFCCIVILELEMENT: 1122,
	    IFCGEOGRAPHICELEMENT: 1185,
	    IFCDISTRIBUTIONPORT: 178,
	    IFCPROXY: 447,
	    IFCSTRUCTURALLINEARACTION: 463,
	    IFCSTRUCTURALLINEARACTIONVARYING: 464,
	    IFCSTRUCTURALPLANARACTION: 39,
	    IFCSTRUCTURALPLANARACTIONVARYING: 357,
	    IFCSTRUCTURALPOINTACTION: 356,
	    IFCSTRUCTURALCURVEACTION: 1279,
	    IFCSTRUCTURALSURFACEACTION: 1284,
	    IFCSTRUCTURALPOINTREACTION: 354,
	    IFCSTRUCTURALCURVEREACTION: 1280,
	    IFCSTRUCTURALSURFACEREACTION: 1285,
	    IFCSTRUCTURALCURVECONNECTION: 534,
	    IFCSTRUCTURALPOINTCONNECTION: 533,
	    IFCSTRUCTURALSURFACECONNECTION: 264,
	    IFCSTRUCTURALCURVEMEMBER: 224,
	    IFCSTRUCTURALCURVEMEMBERVARYING: 227,
	    IFCSTRUCTURALSURFACEMEMBER: 420,
	    IFCSTRUCTURALSURFACEMEMBERVARYING: 421,
	    IFCANNOTATION: 634,
	    IFCBUILDING: 169,
	    IFCBUILDINGSTOREY: 459,
	    IFCSITE: 349,
	    IFCSPACE: 454,
	    IFCGRID: 564,
	    IFCEXTERNALSPATIALELEMENT: 1174,
	    IFCSPATIALZONE: 1275
	};


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var xbim_binary_reader_1 = __webpack_require__(2);
	var xTriangulatedShape = (function () {
	    function xTriangulatedShape() {
	        //This would load only shape data from binary file
	        this.load = function (source) {
	            //binary reading
	            var br = new xbim_binary_reader_1.xBinaryReader();
	            var self = this;
	            br.onloaded = function () {
	                self.parse(br);
	                if (self.onloaded) {
	                    self.onloaded();
	                }
	            };
	            br.load(source);
	        };
	        this.vertices = [];
	    }
	    //this will get xBinaryReader on the current position and will parse it's content to fill itself with vertices, normals and vertex indices
	    xTriangulatedShape.prototype.parse = function (binReader) {
	        var self = this;
	        var version = binReader.readByte();
	        var numVertices = binReader.readInt32();
	        var numOfTriangles = binReader.readInt32();
	        self.vertices = binReader.readFloat32(numVertices * 3);
	        //allocate memory of defined size (to avoid reallocation of memory)
	        self.indices = new Uint32Array(numOfTriangles * 3);
	        self.normals = new Uint8Array(numOfTriangles * 6);
	        //indices for incremental adding of indices and normals
	        var iIndex = 0;
	        var readIndex;
	        if (numVertices <= 0xFF) {
	            readIndex = function (count) { return binReader.readByte(count); };
	        }
	        else if (numVertices <= 0xFFFF) {
	            readIndex = function (count) { return binReader.readUint16(count); };
	        }
	        else {
	            readIndex = function (count) { return binReader.readInt32(count); };
	        }
	        var numFaces = binReader.readInt32();
	        if (numVertices === 0 || numOfTriangles === 0)
	            return;
	        for (var i = 0; i < numFaces; i++) {
	            var numTrianglesInFace = binReader.readInt32();
	            if (numTrianglesInFace == 0)
	                continue;
	            var isPlanar = numTrianglesInFace > 0;
	            numTrianglesInFace = Math.abs(numTrianglesInFace);
	            if (isPlanar) {
	                var normal = binReader.readByte(2);
	                //read and set all indices
	                var planarIndices = readIndex(3 * numTrianglesInFace);
	                self.indices.set(planarIndices, iIndex);
	                for (var j = 0; j < numTrianglesInFace * 3; j++) {
	                    //add three identical normals because this is planar but needs to be expanded for WebGL
	                    self.normals[iIndex * 2] = normal[0];
	                    self.normals[iIndex * 2 + 1] = normal[1];
	                    iIndex++;
	                }
	            }
	            else {
	                for (var j = 0; j < numTrianglesInFace; j++) {
	                    self.indices[iIndex] = readIndex(); //a
	                    self.normals.set(binReader.readByte(2), iIndex * 2);
	                    iIndex++;
	                    self.indices[iIndex] = readIndex(); //b
	                    self.normals.set(binReader.readByte(2), iIndex * 2);
	                    iIndex++;
	                    self.indices[iIndex] = readIndex(); //c
	                    self.normals.set(binReader.readByte(2), iIndex * 2);
	                    iIndex++;
	                }
	            }
	        }
	    };
	    //this function will get called when loading is finished.
	    //This won't get called after parse which is supposed to happen in large operation.
	    xTriangulatedShape.prototype.onloaded = function () { };
	    return xTriangulatedShape;
	}());
	exports.xTriangulatedShape = xTriangulatedShape;


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var xbim_state_1 = __webpack_require__(4);
	//this class holds pointers to textures, uniforms and data buffers which 
	//make up a model in GPU
	var xModelHandle = (function () {
	    function xModelHandle(gl, model, fpt) {
	        if (typeof (gl) == 'undefined' || typeof (model) == 'undefined' || typeof (fpt) == 'undefined') {
	            throw 'WebGL context and geometry model must be specified';
	        }
	        this._gl = gl;
	        this._model = model;
	        this._fpt = fpt;
	        /**
	         * unique ID which can be used to identify this handle
	         */
	        this.id = xModelHandle._instancesNum++;
	        /**
	         * indicates if this model should be used in a rendering loop or not.
	         */
	        this.stopped = false;
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
	        model.regions.forEach(function (region) {
	            if (region.population > this.region.population) {
	                this.region = region;
	            }
	        }, this);
	        //set default region if no region is defined. This shouldn't ever happen if model contains any geometry.
	        if (typeof (this.region) == 'undefined') {
	            this.region = {
	                population: 1,
	                centre: [0.0, 0.0, 0.0],
	                bbox: [0.0, 0.0, 0.0, 10 * model.meter, 10 * model.meter, 10 * model.meter]
	            };
	        }
	    }
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
	        if (this.stopped)
	            return;
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
	    };
	    //this function must be called AFTER 'setActive()' function which sets up active buffers and uniforms
	    xModelHandle.prototype.draw = function (mode) {
	        if (this.stopped)
	            return;
	        var gl = this._gl;
	        if (typeof (mode) === 'undefined') {
	            //draw image frame
	            gl.drawArrays(gl.TRIANGLES, 0, this.count);
	            return;
	        }
	        if (mode === 'solid') {
	            gl.drawArrays(gl.TRIANGLES, 0, this._model.transparentIndex);
	            return;
	        }
	        if (mode === 'transparent') {
	            gl.drawArrays(gl.TRIANGLES, this._model.transparentIndex, this.count - this._model.transparentIndex);
	            return;
	        }
	    };
	    xModelHandle.prototype.drawProduct = function (ID) {
	        if (this.stopped)
	            return;
	        var gl = this._gl;
	        var map = this.getProductMap(ID);
	        //var i = 3; //3 is for a glass panel
	        //gl.drawArrays(gl.TRIANGLES, map.spans[i][0], map.spans[i][1] - map.spans[i][0]);
	        if (map != null) {
	            map.spans.forEach(function (span) {
	                gl.drawArrays(gl.TRIANGLES, span[0], span[1] - span[0]);
	            }, this);
	        }
	    };
	    xModelHandle.prototype.getProductMap = function (ID) {
	        var map = this._model.productMap[ID];
	        if (typeof (map) !== 'undefined')
	            return map;
	        return null;
	    };
	    xModelHandle.prototype.unload = function () {
	        var gl = this._gl;
	        gl.deleteTexture(this.vertexTexture);
	        gl.deleteTexture(this.matrixTexture);
	        gl.deleteTexture(this.styleTexture);
	        gl.deleteTexture(this.stateStyleTexture);
	        gl.deleteBuffer(this.normalBuffer);
	        gl.deleteBuffer(this.indexBuffer);
	        gl.deleteBuffer(this.productBuffer);
	        gl.deleteBuffer(this.styleBuffer);
	        gl.deleteBuffer(this.stateBuffer);
	        gl.deleteBuffer(this.transformationBuffer);
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
	        if (data.length == 0)
	            return 0;
	        //detect floating point texture support and data type
	        var fp = this._fpt && data instanceof Float32Array;
	        //compute size of the image (length should be correct already)
	        var size = 0;
	        var maxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
	        if (fp) {
	            //recompute to smaller size, but make it +1 to make sure it is all right
	            size = Math.ceil(Math.sqrt(Math.ceil(data.length / arity))) + 1;
	        }
	        else {
	            var dim = Math.sqrt(data.byteLength / 4);
	            size = Math.ceil(dim);
	        }
	        if (size == 0)
	            return 0;
	        if (size > maxSize)
	            throw 'Too much data! It cannot fit into the texture.';
	        gl.bindTexture(gl.TEXTURE_2D, pointer);
	        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); //this is our convention
	        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false); //this should preserve values of alpha
	        gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, 0); //this should preserve values of colours
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
	                case 1:
	                    type = gl.ALPHA;
	                    break;
	                case 3:
	                    type = gl.RGB;
	                    break;
	                case 4:
	                    type = gl.RGBA;
	                    break;
	            }
	            gl.texImage2D(gl.TEXTURE_2D, 0, type, size, size, 0, type, gl.FLOAT, image);
	        }
	        else {
	            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(data.buffer));
	        }
	        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	        gl.texParameteri(gl
	            .TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating).
	        gl.texParameteri(gl
	            .TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating).
	        return size;
	    };
	    xModelHandle.prototype.getState = function (id) {
	        if (typeof (id) === 'undefined')
	            throw 'id must be defined';
	        var map = this.getProductMap(id);
	        if (map === null)
	            return null;
	        var span = map.spans[0];
	        if (typeof (span) == 'undefined')
	            return null;
	        return this._model.states[span[0] * 2];
	    };
	    xModelHandle.prototype.getStyle = function (id) {
	        if (typeof (id) === 'undefined')
	            throw 'id must be defined';
	        var map = this.getProductMap(id);
	        if (map === null)
	            return null;
	        var span = map.spans[0];
	        if (typeof (span) == 'undefined')
	            return null;
	        return this._model.states[span[0] * 2 + 1];
	    };
	    xModelHandle.prototype.setState = function (state, args) {
	        if (typeof (state) != 'number' && state < 0 && state > 255)
	            throw 'You have to specify state as an ID of state or index in style pallete.';
	        if (typeof (args) == 'undefined')
	            throw 'You have to specify products as an array of product IDs or as a product type ID';
	        var maps = [];
	        //it is type
	        if (typeof (args) == 'number') {
	            for (var n in this._model.productMap) {
	                var map = this._model.productMap[n];
	                if (map.type == args)
	                    maps.push(map);
	            }
	        }
	        else {
	            for (var l = 0; l < args.length; l++) {
	                var id = args[l];
	                var map = this.getProductMap(id);
	                if (map != null)
	                    maps.push(map);
	            }
	        }
	        //shift +1 if it is an overlay colour style or 0 if it is a state.
	        var shift = state <= 225 ? 1 : 0;
	        maps.forEach(function (map) {
	            map.spans.forEach(function (span) {
	                //set state or style
	                for (var k = span[0]; k < span[1]; k++) {
	                    this._model.states[k * 2 + shift] = state;
	                }
	            }, this);
	        }, this);
	        //buffer data to GPU
	        this._bufferData(this.stateBuffer, this._model.states);
	    };
	    xModelHandle.prototype.resetStates = function () {
	        for (var i = 0; i < this._model.states.length; i += 2) {
	            this._model.states[i] = xbim_state_1.xState.UNDEFINED;
	        }
	        //buffer data to GPU
	        this._bufferData(this.stateBuffer, this._model.states);
	    };
	    xModelHandle.prototype.resetStyles = function () {
	        for (var i = 0; i < this._model.states.length; i += 2) {
	            this._model.states[i + 1] = xbim_state_1.xState.UNSTYLED;
	        }
	        //buffer data to GPU
	        this._bufferData(this.stateBuffer, this._model.states);
	    };
	    ;
	    xModelHandle.prototype.getModelState = function () {
	        var result = [];
	        var products = this._model.productMap;
	        for (var i in products) {
	            if (!products.hasOwnProperty(i)) {
	                continue;
	            }
	            var map = products[i];
	            var span = map.spans[0];
	            if (typeof (span) == 'undefined')
	                continue;
	            var state = this._model.states[span[0] * 2];
	            var style = this._model.states[span[0] * 2 + 1];
	            result.push([map.productID, state + (style << 8)]);
	        }
	        return result;
	    };
	    xModelHandle.prototype.restoreModelState = function (state) {
	        state.forEach(function (s) {
	            var id = s[0];
	            var style = s[1] >> 8;
	            var state = s[1] - (style << 8);
	            var map = this.getProductMap(id);
	            if (map != null) {
	                map.spans.forEach(function (span) {
	                    //set state or style
	                    for (var k = span[0]; k < span[1]; k++) {
	                        this._model.states[k * 2] = state;
	                        this._model.states[k * 2 + 1] = style;
	                    }
	                }, this);
	            }
	        }, this);
	        //buffer data to GPU
	        this._bufferData(this.stateBuffer, this._model.states);
	    };
	    return xModelHandle;
	}());
	/**
	 * Static counter to keep unique ID of the model handles
	 */
	xModelHandle._instancesNum = 0;
	exports.xModelHandle = xModelHandle;


/***/ },
/* 8 */
/***/ function(module, exports) {

	"use strict";
	exports.xProductInheritance = {
	    name: "IfcProduct",
	    id: 20,
	    abs: true,
	    children: [
	        {
	            name: "IfcElement",
	            id: 19,
	            abs: true,
	            children: [
	                {
	                    name: "IfcDistributionElement",
	                    id: 44,
	                    abs: false,
	                    children: [
	                        {
	                            name: "IfcDistributionFlowElement",
	                            id: 45,
	                            abs: false,
	                            children: [
	                                { name: "IfcDistributionChamberElement", id: 180, abs: false },
	                                {
	                                    name: "IfcEnergyConversionDevice",
	                                    id: 175,
	                                    abs: false,
	                                    children: [
	                                        { name: "IfcAirToAirHeatRecovery", id: 1097, abs: false },
	                                        { name: "IfcBoiler", id: 1105, abs: false },
	                                        { name: "IfcBurner", id: 1109, abs: false },
	                                        { name: "IfcChiller", id: 1119, abs: false },
	                                        { name: "IfcCoil", id: 1124, abs: false },
	                                        { name: "IfcCondenser", id: 1132, abs: false },
	                                        { name: "IfcCooledBeam", id: 1141, abs: false },
	                                        { name: "IfcCoolingTower", id: 1142, abs: false },
	                                        { name: "IfcEngine", id: 1164, abs: false },
	                                        { name: "IfcEvaporativeCooler", id: 1166, abs: false },
	                                        { name: "IfcEvaporator", id: 1167, abs: false },
	                                        { name: "IfcHeatExchanger", id: 1187, abs: false },
	                                        { name: "IfcHumidifier", id: 1188, abs: false },
	                                        { name: "IfcTubeBundle", id: 1305, abs: false },
	                                        { name: "IfcUnitaryEquipment", id: 1310, abs: false },
	                                        { name: "IfcElectricGenerator", id: 1160, abs: false },
	                                        { name: "IfcElectricMotor", id: 1161, abs: false },
	                                        { name: "IfcMotorConnection", id: 1216, abs: false },
	                                        { name: "IfcSolarDevice", id: 1270, abs: false },
	                                        { name: "IfcTransformer", id: 1303, abs: false }
	                                    ]
	                                }, {
	                                    name: "IfcFlowController",
	                                    id: 121,
	                                    abs: false,
	                                    children: [
	                                        { name: "IfcElectricDistributionPoint", id: 242, abs: false },
	                                        { name: "IfcAirTerminalBox", id: 1096, abs: false },
	                                        { name: "IfcDamper", id: 1148, abs: false },
	                                        { name: "IfcFlowMeter", id: 1182, abs: false },
	                                        { name: "IfcValve", id: 1311, abs: false },
	                                        { name: "IfcElectricDistributionBoard", id: 1157, abs: false },
	                                        { name: "IfcElectricTimeControl", id: 1162, abs: false },
	                                        { name: "IfcProtectiveDevice", id: 1235, abs: false },
	                                        { name: "IfcSwitchingDevice", id: 1290, abs: false }
	                                    ]
	                                }, {
	                                    name: "IfcFlowFitting",
	                                    id: 467,
	                                    abs: false,
	                                    children: [
	                                        { name: "IfcDuctFitting", id: 1153, abs: false },
	                                        { name: "IfcPipeFitting", id: 1222, abs: false },
	                                        { name: "IfcCableCarrierFitting", id: 1111, abs: false },
	                                        { name: "IfcCableFitting", id: 1113, abs: false },
	                                        { name: "IfcJunctionBox", id: 1195, abs: false }
	                                    ]
	                                }, {
	                                    name: "IfcFlowMovingDevice",
	                                    id: 502,
	                                    abs: false,
	                                    children: [
	                                        { name: "IfcCompressor", id: 1131, abs: false },
	                                        { name: "IfcFan", id: 1177, abs: false },
	                                        { name: "IfcPump", id: 1238, abs: false }
	                                    ]
	                                }, {
	                                    name: "IfcFlowSegment",
	                                    id: 574,
	                                    abs: false,
	                                    children: [
	                                        { name: "IfcDuctSegment", id: 1154, abs: false },
	                                        { name: "IfcPipeSegment", id: 1223, abs: false },
	                                        { name: "IfcCableCarrierSegment", id: 1112, abs: false },
	                                        { name: "IfcCableSegment", id: 1115, abs: false }
	                                    ]
	                                }, {
	                                    name: "IfcFlowStorageDevice",
	                                    id: 371,
	                                    abs: false,
	                                    children: [
	                                        { name: "IfcTank", id: 1293, abs: false },
	                                        { name: "IfcElectricFlowStorageDevice", id: 1159, abs: false }
	                                    ]
	                                }, {
	                                    name: "IfcFlowTerminal",
	                                    id: 46,
	                                    abs: false,
	                                    children: [
	                                        { name: "IfcFireSuppressionTerminal", id: 1179, abs: false },
	                                        { name: "IfcSanitaryTerminal", id: 1262, abs: false },
	                                        { name: "IfcStackTerminal", id: 1277, abs: false },
	                                        { name: "IfcWasteTerminal", id: 1315, abs: false },
	                                        { name: "IfcAirTerminal", id: 1095, abs: false },
	                                        { name: "IfcMedicalDevice", id: 1212, abs: false },
	                                        { name: "IfcSpaceHeater", id: 1272, abs: false },
	                                        { name: "IfcAudioVisualAppliance", id: 1099, abs: false },
	                                        { name: "IfcCommunicationsAppliance", id: 1127, abs: false },
	                                        { name: "IfcElectricAppliance", id: 1156, abs: false },
	                                        { name: "IfcLamp", id: 1198, abs: false },
	                                        { name: "IfcLightFixture", id: 1199, abs: false },
	                                        { name: "IfcOutlet", id: 1219, abs: false }
	                                    ]
	                                }, {
	                                    name: "IfcFlowTreatmentDevice",
	                                    id: 425,
	                                    abs: false,
	                                    children: [
	                                        { name: "IfcInterceptor", id: 1193, abs: false },
	                                        { name: "IfcDuctSilencer", id: 1155, abs: false },
	                                        { name: "IfcFilter", id: 1178, abs: false }
	                                    ]
	                                }
	                            ]
	                        }, {
	                            name: "IfcDistributionControlElement",
	                            id: 468,
	                            abs: false,
	                            children: [
	                                { name: "IfcProtectiveDeviceTrippingUnit", id: 1236, abs: false },
	                                { name: "IfcActuator", id: 1091, abs: false },
	                                { name: "IfcAlarm", id: 1098, abs: false },
	                                { name: "IfcController", id: 1139, abs: false },
	                                { name: "IfcFlowInstrument", id: 1181, abs: false },
	                                { name: "IfcSensor", id: 1264, abs: false },
	                                { name: "IfcUnitaryControlElement", id: 1308, abs: false }
	                            ]
	                        }
	                    ]
	                }, {
	                    name: "IfcElementComponent",
	                    id: 424,
	                    abs: true,
	                    children: [
	                        { name: "IfcDiscreteAccessory", id: 423, abs: false },
	                        {
	                            name: "IfcFastener",
	                            id: 535,
	                            abs: false,
	                            children: [{ name: "IfcMechanicalFastener", id: 536, abs: false }]
	                        }, {
	                            name: "IfcReinforcingElement",
	                            id: 262,
	                            abs: true,
	                            children: [
	                                { name: "IfcReinforcingBar", id: 571, abs: false },
	                                { name: "IfcReinforcingMesh", id: 531, abs: false },
	                                { name: "IfcTendon", id: 261, abs: false },
	                                { name: "IfcTendonAnchor", id: 675, abs: false }
	                            ]
	                        }, { name: "IfcBuildingElementPart", id: 220, abs: false },
	                        { name: "IfcMechanicalFastener", id: 536, abs: false },
	                        { name: "IfcVibrationIsolator", id: 1312, abs: false }
	                    ]
	                }, {
	                    name: "IfcFeatureElement",
	                    id: 386,
	                    abs: true,
	                    children: [
	                        {
	                            name: "IfcFeatureElementSubtraction",
	                            id: 499,
	                            abs: true,
	                            children: [
	                                {
	                                    name: "IfcEdgeFeature",
	                                    id: 764,
	                                    abs: true,
	                                    children: [
	                                        { name: "IfcChamferEdgeFeature", id: 765, abs: false },
	                                        { name: "IfcRoundedEdgeFeature", id: 766, abs: false }
	                                    ]
	                                }, {
	                                    name: "IfcOpeningElement",
	                                    id: 498,
	                                    abs: false,
	                                    children: [{ name: "IfcOpeningStandardCase", id: 1217, abs: false }]
	                                }, { name: "IfcVoidingFeature", id: 1313, abs: false }
	                            ]
	                        }, {
	                            name: "IfcFeatureElementAddition",
	                            id: 385,
	                            abs: true,
	                            children: [{ name: "IfcProjectionElement", id: 384, abs: false }]
	                        }, { name: "IfcSurfaceFeature", id: 1287, abs: false }
	                    ]
	                }, {
	                    name: "IfcBuildingElement",
	                    id: 26,
	                    abs: true,
	                    children: [
	                        {
	                            name: "IfcBuildingElementComponent",
	                            id: 221,
	                            abs: true,
	                            children: [
	                                { name: "IfcBuildingElementPart", id: 220, abs: false },
	                                {
	                                    name: "IfcReinforcingElement",
	                                    id: 262,
	                                    abs: true,
	                                    children: [
	                                        { name: "IfcReinforcingBar", id: 571, abs: false },
	                                        { name: "IfcReinforcingMesh", id: 531, abs: false },
	                                        { name: "IfcTendon", id: 261, abs: false },
	                                        { name: "IfcTendonAnchor", id: 675, abs: false }
	                                    ]
	                                }
	                            ]
	                        }, { name: "IfcFooting", id: 120, abs: false }, { name: "IfcPile", id: 572, abs: false },
	                        {
	                            name: "IfcBeam",
	                            id: 171,
	                            abs: false,
	                            children: [{ name: "IfcBeamStandardCase", id: 1104, abs: false }]
	                        },
	                        {
	                            name: "IfcColumn",
	                            id: 383,
	                            abs: false,
	                            children: [{ name: "IfcColumnStandardCase", id: 1126, abs: false }]
	                        }, { name: "IfcCurtainWall", id: 456, abs: false },
	                        {
	                            name: "IfcDoor",
	                            id: 213,
	                            abs: false,
	                            children: [{ name: "IfcDoorStandardCase", id: 1151, abs: false }]
	                        },
	                        {
	                            name: "IfcMember",
	                            id: 310,
	                            abs: false,
	                            children: [{ name: "IfcMemberStandardCase", id: 1214, abs: false }]
	                        }, {
	                            name: "IfcPlate",
	                            id: 351,
	                            abs: false,
	                            children: [{ name: "IfcPlateStandardCase", id: 1224, abs: false }]
	                        }, { name: "IfcRailing", id: 350, abs: false }, { name: "IfcRamp", id: 414, abs: false },
	                        { name: "IfcRampFlight", id: 348, abs: false }, { name: "IfcRoof", id: 347, abs: false },
	                        {
	                            name: "IfcSlab",
	                            id: 99,
	                            abs: false,
	                            children: [
	                                { name: "IfcSlabElementedCase", id: 1268, abs: false },
	                                { name: "IfcSlabStandardCase", id: 1269, abs: false }
	                            ]
	                        }, { name: "IfcStair", id: 346, abs: false }, { name: "IfcStairFlight", id: 25, abs: false },
	                        {
	                            name: "IfcWall",
	                            id: 452,
	                            abs: false,
	                            children: [
	                                { name: "IfcWallStandardCase", id: 453, abs: false },
	                                { name: "IfcWallElementedCase", id: 1314, abs: false }
	                            ]
	                        }, {
	                            name: "IfcWindow",
	                            id: 667,
	                            abs: false,
	                            children: [{ name: "IfcWindowStandardCase", id: 1316, abs: false }]
	                        }, { name: "IfcBuildingElementProxy", id: 560, abs: false },
	                        { name: "IfcCovering", id: 382, abs: false },
	                        { name: "IfcChimney", id: 1120, abs: false }, { name: "IfcShadingDevice", id: 1265, abs: false }
	                    ]
	                }, { name: "IfcElementAssembly", id: 18, abs: false },
	                {
	                    name: "IfcFurnishingElement",
	                    id: 253,
	                    abs: false,
	                    children: [
	                        { name: "IfcFurniture", id: 1184, abs: false },
	                        { name: "IfcSystemFurnitureElement", id: 1291, abs: false }
	                    ]
	                }, { name: "IfcTransportElement", id: 416, abs: false },
	                { name: "IfcVirtualElement", id: 168, abs: false },
	                { name: "IfcElectricalElement", id: 23, abs: false },
	                { name: "IfcEquipmentElement", id: 212, abs: false },
	                { name: "IfcCivilElement", id: 1122, abs: false },
	                { name: "IfcGeographicElement", id: 1185, abs: false }
	            ]
	        }, { name: "IfcPort", id: 179, abs: true, children: [{ name: "IfcDistributionPort", id: 178, abs: false }] },
	        { name: "IfcProxy", id: 447, abs: false }, {
	            name: "IfcStructuralActivity",
	            id: 41,
	            abs: true,
	            children: [
	                {
	                    name: "IfcStructuralAction",
	                    id: 40,
	                    abs: true,
	                    children: [
	                        {
	                            name: "IfcStructuralLinearAction",
	                            id: 463,
	                            abs: false,
	                            children: [{ name: "IfcStructuralLinearActionVarying", id: 464, abs: false }]
	                        }, {
	                            name: "IfcStructuralPlanarAction",
	                            id: 39,
	                            abs: false,
	                            children: [{ name: "IfcStructuralPlanarActionVarying", id: 357, abs: false }]
	                        }, { name: "IfcStructuralPointAction", id: 356, abs: false },
	                        {
	                            name: "IfcStructuralCurveAction",
	                            id: 1279,
	                            abs: false,
	                            children: [{ name: "IfcStructuralLinearAction", id: 463, abs: false }]
	                        }, {
	                            name: "IfcStructuralSurfaceAction",
	                            id: 1284,
	                            abs: false,
	                            children: [{ name: "IfcStructuralPlanarAction", id: 39, abs: false }]
	                        }
	                    ]
	                }, {
	                    name: "IfcStructuralReaction",
	                    id: 355,
	                    abs: true,
	                    children: [
	                        { name: "IfcStructuralPointReaction", id: 354, abs: false },
	                        { name: "IfcStructuralCurveReaction", id: 1280, abs: false },
	                        { name: "IfcStructuralSurfaceReaction", id: 1285, abs: false }
	                    ]
	                }
	            ]
	        }, {
	            name: "IfcStructuralItem",
	            id: 226,
	            abs: true,
	            children: [
	                {
	                    name: "IfcStructuralConnection",
	                    id: 265,
	                    abs: true,
	                    children: [
	                        { name: "IfcStructuralCurveConnection", id: 534, abs: false },
	                        { name: "IfcStructuralPointConnection", id: 533, abs: false },
	                        { name: "IfcStructuralSurfaceConnection", id: 264, abs: false }
	                    ]
	                }, {
	                    name: "IfcStructuralMember",
	                    id: 225,
	                    abs: true,
	                    children: [
	                        {
	                            name: "IfcStructuralCurveMember",
	                            id: 224,
	                            abs: false,
	                            children: [{ name: "IfcStructuralCurveMemberVarying", id: 227, abs: false }]
	                        }, {
	                            name: "IfcStructuralSurfaceMember",
	                            id: 420,
	                            abs: false,
	                            children: [{ name: "IfcStructuralSurfaceMemberVarying", id: 421, abs: false }]
	                        }
	                    ]
	                }
	            ]
	        }, { name: "IfcAnnotation", id: 634, abs: false }, {
	            name: "IfcSpatialStructureElement",
	            id: 170,
	            abs: true,
	            children: [
	                { name: "IfcBuilding", id: 169, abs: false }, { name: "IfcBuildingStorey", id: 459, abs: false },
	                { name: "IfcSite", id: 349, abs: false }, { name: "IfcSpace", id: 454, abs: false }
	            ]
	        }, { name: "IfcGrid", id: 564, abs: false }, {
	            name: "IfcSpatialElement",
	            id: 1273,
	            abs: true,
	            children: [
	                {
	                    name: "IfcSpatialStructureElement",
	                    id: 170,
	                    abs: true,
	                    children: [
	                        { name: "IfcBuilding", id: 169, abs: false },
	                        { name: "IfcBuildingStorey", id: 459, abs: false },
	                        { name: "IfcSite", id: 349, abs: false }, { name: "IfcSpace", id: 454, abs: false }
	                    ]
	                }, {
	                    name: "IfcExternalSpatialStructureElement",
	                    id: 1175,
	                    abs: true,
	                    children: [{ name: "IfcExternalSpatialElement", id: 1174, abs: false }]
	                }, { name: "IfcSpatialZone", id: 1275, abs: false }
	            ]
	        }
	    ]
	};


/***/ },
/* 9 */
/***/ function(module, exports) {

	"use strict";
	/*
	* This file has been generated by spacker.exe utility. Do not change this file manualy as your changes
	* will get lost when the file is regenerated. Original content is located in *.c files.
	*/
	exports.xShaders = {
	    fragment_shader: ' precision mediump float; uniform vec4 uClippingPlane; varying vec4 vFrontColor; varying vec4 vBackColor; varying vec3 vPosition; varying float vDiscard; void main(void) { if ( vDiscard > 0.001) discard; if (length(uClippingPlane) > 0.001) { vec4 p = uClippingPlane; vec3 x = vPosition; float distance = (dot(p.xyz, x) + p.w) / length(p.xyz); if (distance < 0.0){ discard; } } gl_FragColor = gl_FrontFacing ? vFrontColor : vBackColor; }',
	    vertex_shader: ' attribute highp float aVertexIndex; attribute highp float aTransformationIndex; attribute highp float aStyleIndex; attribute highp float aProduct; attribute highp vec2 aState; attribute highp vec2 aNormal; uniform mat4 uMVMatrix; uniform mat4 uPMatrix; uniform vec4 ulightA; uniform vec4 ulightB; uniform vec4 uHighlightColour; uniform float uMeter; uniform bool uColorCoding; uniform int uRenderingMode; uniform highp sampler2D uVertexSampler; uniform int uVertexTextureSize; uniform highp sampler2D uMatrixSampler; uniform int uMatrixTextureSize; uniform highp sampler2D uStyleSampler; uniform int uStyleTextureSize; uniform highp sampler2D uStateStyleSampler; varying vec4 vFrontColor; varying vec4 vBackColor; varying vec3 vPosition; varying float vDiscard; vec3 getNormal(){ float U = aNormal[0]; float V = aNormal[1]; float PI = 3.1415926535897932384626433832795; float lon = U / 252.0 * 2.0 * PI; float lat = V / 252.0 * PI; float x = sin(lon) * sin(lat); float z = cos(lon) * sin(lat); float y = cos(lat); return normalize(vec3(x, y, z)); } vec4 getIdColor(){ float product = floor(aProduct + 0.5); float B = floor (product/(256.0*256.0)); float G = floor((product  - B * 256.0*256.0)/256.0); float R = mod(product, 256.0); return vec4(R/255.0, G/255.0, B/255.0, 1.0); } vec2 getTextureCoordinates(int index, int size) { float x = float(index - (index / size) * size); float y = float(index / size); float pixelSize = 1.0 / float(size); return vec2((x + 0.5) * pixelSize, (y + 0.5) * pixelSize); } vec4 getColor(){ int restyle = int(floor(aState[1] + 0.5)); if (restyle > 224){ int index = int (floor(aStyleIndex + 0.5)); vec2 coords = getTextureCoordinates(index, uStyleTextureSize); return texture2D(uStyleSampler, coords); } vec2 coords = getTextureCoordinates(restyle, 15); return texture2D(uStateStyleSampler, coords); } vec3 getVertexPosition(){ int index = int (floor(aVertexIndex +0.5)); vec2 coords = getTextureCoordinates(index, uVertexTextureSize); vec3 point = vec3(texture2D(uVertexSampler, coords)); int tIndex = int(floor(aTransformationIndex + 0.5)); if (tIndex != 65535) { tIndex *=4; mat4 transform = mat4( texture2D(uMatrixSampler, getTextureCoordinates(tIndex, uMatrixTextureSize)), texture2D(uMatrixSampler, getTextureCoordinates(tIndex+1, uMatrixTextureSize)), texture2D(uMatrixSampler, getTextureCoordinates(tIndex+2, uMatrixTextureSize)), texture2D(uMatrixSampler, getTextureCoordinates(tIndex+3, uMatrixTextureSize)) ); return vec3(transform * vec4(point, 1.0)); } return point; } void main(void) { int state = int(floor(aState[0] + 0.5)); vDiscard = 0.0; if (state == 254) { vDiscard = 1.0; vFrontColor = vec4(0.0, 0.0, 0.0, 0.0); vBackColor = vec4(0.0, 0.0, 0.0, 0.0); vPosition = vec3(0.0, 0.0, 0.0); gl_Position = vec4(0.0, 0.0, 0.0, 1.0); return; } vec3 vertex = getVertexPosition(); vec3 normal = getNormal(); vec3 backNormal = normal * -1.0; if (uColorCoding){ vec4 idColor = getIdColor(); vFrontColor = idColor; vBackColor = idColor; } else{ float lightAIntensity = ulightA[3]; vec3 lightADirection = normalize(ulightA.xyz - vertex); float lightBIntensity = ulightB[3]; vec3 lightBDirection = normalize(ulightB.xyz - vertex); float lightWeightA = max(dot(normal, lightADirection ) * lightAIntensity, 0.0); float lightWeightB = max(dot(normal, lightBDirection ) * lightBIntensity, 0.0); float backLightWeightA = max(dot(backNormal, lightADirection) * lightAIntensity, 0.0); float backLightWeightB = max(dot(backNormal, lightBDirection) * lightBIntensity, 0.0); float lightWeighting = lightWeightA + lightWeightB + 0.4; float backLightWeighting = backLightWeightA + backLightWeightB + 0.4; vec4 baseColor = vec4(1.0, 1.0, 1.0, 1.0); if (uRenderingMode == 2){ if (state == 252){ baseColor = getColor(); } else{ baseColor = vec4(0.0, 0.0, 0.3, 0.5); } } if (state == 253) { baseColor = uHighlightColour; } if (uRenderingMode != 2 && state != 253){ baseColor = getColor(); } if (baseColor.a < 0.98 && uRenderingMode == 0) { vec3 trans = -0.002 * uMeter * normalize(normal); vertex = vertex + trans; } vFrontColor = vec4(baseColor.rgb * lightWeighting, baseColor.a); vBackColor = vec4(baseColor.rgb * backLightWeighting, baseColor.a); } vPosition = vertex; gl_Position = uPMatrix * uMVMatrix * vec4(vertex, 1.0); }',
	    vertex_shader_noFPT: ' attribute highp float aVertexIndex; attribute highp float aTransformationIndex; attribute highp float aStyleIndex; attribute highp float aProduct; attribute highp float aState; attribute highp vec2 aNormal; uniform mat4 uMVMatrix; uniform mat4 uPMatrix; uniform vec4 ulightA; uniform vec4 ulightB; uniform bool uColorCoding; uniform bool uFloatingPoint; uniform highp sampler2D uVertexSampler; uniform int uVertexTextureSize; uniform highp sampler2D uMatrixSampler; uniform int uMatrixTextureSize; uniform highp sampler2D uStyleSampler; uniform int uStyleTextureSize; uniform highp sampler2D uStateStyleSampler; int stateStyleTextureSize = 15; varying vec4 vColor; varying vec3 vPosition; vec3 getNormal(){ float U = aNormal[0]; float V = aNormal[1]; float PI = 3.1415926535897932384626433832795; float u = ((U / 252.0) * (2.0 * PI)) - PI; float v = ((V / 252.0) * (2.0 * PI)) - PI; float x = sin(v) * cos(u); float y = sin(v) * sin(u); float z = cos(v); return normalize(vec3(x, y, z)); } vec4 getIdColor(){ float R = mod(aProduct, 256.0) / 255.0; float G = floor(aProduct/256.0) / 255.0; float B = floor (aProduct/(256.0*256.0)) / 255.0; return vec4(R, G, B, 1.0); } vec2 getVertexTextureCoordinates(int index, int size) { float x = float(index - (index / size) * size); float y = float(index / size); float pixelSize = 1.0 / float(size); return vec2((x + 0.5) * pixelSize, (y + 0.5) * pixelSize); } int getByteFromScale(float base) { float result = base * 255.0; int correction = fract(result) >= 0.5 ? 1 : 0; return int(result) + correction; } ivec4 getPixel(int index, sampler2D sampler, int size) { vec2 coords = getVertexTextureCoordinates(index, size); vec4 pixel = texture2D(sampler, coords); return ivec4( getByteFromScale(pixel.r), getByteFromScale(pixel.g), getByteFromScale(pixel.b), getByteFromScale(pixel.a) ); } void getBits(ivec4 pixel, out int result[32]) { for (int i = 0; i < 4; i++) { int actualByte = pixel[i]; for (int j = 0; j < 8; j++) { result[31 - (j + i * 8)] =  actualByte - (actualByte / 2) * 2; actualByte /= 2; } } } float getFloatFromPixel(ivec4 pixel) { int bits[32]; getBits(pixel, bits); float sign =  bits[0] == 0 ? 1.0 : -1.0; highp float fraction = 1.0; highp float exponent = 0.0; for (int i = 1; i < 9; i++) { exponent += float(bits[9 - i]) * exp2(float (i - 1)); } exponent -= 127.0; for (int i = 9; i < 32; i++) { fraction += float(bits[i]) * exp2(float((-1)*(i-8))); } return sign * fraction * exp2(exponent); } float getFloatFromPixel(int index, sampler2D sampler, int size) { ivec4 pixel = getPixel(index, sampler, size); return getFloatFromPixel(pixel); } vec4 getColor(){ if (floor(aState + 0.5) == 0.0){ int index = int (floor(aStyleIndex + 0.5)); vec2 coords = getVertexTextureCoordinates(index, uStyleTextureSize); return texture2D(uStyleSampler, coords); } else{ return vec4(1.0,1.0,1.0,1.0); } } vec3 getVertexPosition(){ int index = int (floor(aVertexIndex +0.5))* 3; vec3 position = vec3( getFloatFromPixel(index, uVertexSampler, uVertexTextureSize), getFloatFromPixel(index + 1, uVertexSampler, uVertexTextureSize), getFloatFromPixel(index + 2, uVertexSampler, uVertexTextureSize) ); int tIndex = int(floor(aTransformationIndex + 0.5)); if (tIndex != 65535) { tIndex *= 16; mat4 transform = mat4( getFloatFromPixel(tIndex + 0, uMatrixSampler, uMatrixTextureSize), getFloatFromPixel(tIndex + 1, uMatrixSampler, uMatrixTextureSize), getFloatFromPixel(tIndex + 2, uMatrixSampler, uMatrixTextureSize), getFloatFromPixel(tIndex + 3, uMatrixSampler, uMatrixTextureSize), getFloatFromPixel(tIndex + 4, uMatrixSampler, uMatrixTextureSize), getFloatFromPixel(tIndex + 5, uMatrixSampler, uMatrixTextureSize), getFloatFromPixel(tIndex + 6, uMatrixSampler, uMatrixTextureSize), getFloatFromPixel(tIndex + 7, uMatrixSampler, uMatrixTextureSize), getFloatFromPixel(tIndex + 8, uMatrixSampler, uMatrixTextureSize), getFloatFromPixel(tIndex + 9, uMatrixSampler, uMatrixTextureSize), getFloatFromPixel(tIndex + 10, uMatrixSampler, uMatrixTextureSize), getFloatFromPixel(tIndex + 11, uMatrixSampler, uMatrixTextureSize), getFloatFromPixel(tIndex + 12, uMatrixSampler, uMatrixTextureSize), getFloatFromPixel(tIndex + 13, uMatrixSampler, uMatrixTextureSize), getFloatFromPixel(tIndex + 14, uMatrixSampler, uMatrixTextureSize), getFloatFromPixel(tIndex + 15, uMatrixSampler, uMatrixTextureSize) ); vec4 transformedPosition = transform * vec4(position, 1.0); return vec3(transformedPosition); } return position; } void main(void) { vec3 vertex = getVertexPosition(); vPosition = vertex; gl_Position = uPMatrix * uMVMatrix * vec4(vertex, 1.0); if (uColorCoding){ vColor = getIdColor(); } else{ vec3 normal = getNormal(); float lightAIntensity = ulightA[3]; vec3 lightADirection = normalize(ulightA.xyz - vPosition); float lightBIntensity = ulightB[3]; vec3 lightBDirection = normalize(ulightB.xyz - vPosition); float lightWeightA = max(dot(normal, lightADirection ) * lightAIntensity, 0.0); float lightWeightB = max(dot(normal, lightBDirection ) * lightBIntensity, 0.0); float lightWeighting = lightWeightA + lightWeightB + 0.4; vec4 baseColor = getColor(); vColor = vec4(baseColor.rgb * lightWeighting, baseColor.a); } }'
	};


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var xbim_state_1 = __webpack_require__(4);
	var xbim_product_type_1 = __webpack_require__(5);
	var xbim_model_geometry_1 = __webpack_require__(3);
	var xbim_model_handle_1 = __webpack_require__(7);
	var xbim_shaders_1 = __webpack_require__(9);
	var glMatrix = __webpack_require__(11);
	__webpack_require__(12);
	var xViewer = (function () {
	    /**
	    * This is constructor of the xBIM Viewer. It gets HTMLCanvasElement or string ID as an argument. Viewer will than be initialized
	    * in the context of specified canvas. Any other argument will throw exception.
	    * @name xViewer
	    * @constructor
	    * @classdesc This is the main and the only class you need to load and render IFC models in wexBIM format. This viewer is part of
	    * xBIM toolkit which can be used to create wexBIM files from IFC, ifcZIP and ifcXML. WexBIM files are highly optimized for
	    * transmition over internet and rendering performance. Viewer uses WebGL technology for hardware accelerated 3D rendering and SVG for
	    * certain kinds of user interaction. This means that it won't work with obsolete and non-standard-compliant browsers like IE10 and less.
	    *
	    * @param {string | HTMLCanvasElement} canvas - string ID of the canvas or HTML canvas element.
	    */
	    function xViewer(canvas) {
	        if (typeof (canvas) == 'undefined') {
	            throw 'Canvas has to be defined';
	        }
	        if (typeof (canvas['nodeName']) != 'undefined' && canvas['nodeName'] === 'CANVAS') {
	            this._canvas = canvas;
	        }
	        if (typeof (canvas) == 'string') {
	            this._canvas = document.getElementById(canvas);
	        }
	        if (this._canvas == null) {
	            throw 'You have to specify canvas either as an ID of HTML element or the element itself';
	        }
	        /**
	        * This is a structure that holds settings of perspective camera.
	        * @member {PerspectiveCamera} xViewer#perspectiveCamera
	        */
	        /**
	        * This is only a structure. Don't call the constructor.
	        * @classdesc This is a structure that holds settings of perspective camera. If you want
	        * to switch viewer to use perspective camera set {@link xViewer#camera camera} to 'perspective'.
	        * You can modify this but it is not necessary because sensible values are
	        * defined when geometry model is loaded with {@link xViewer#load load()} method. If you want to
	        * change these values you have to do it after geometry is loaded.
	        * @class
	        * @name PerspectiveCamera
	        */
	        this.perspectiveCamera = {
	            /** @member {Number} PerspectiveCamera#fov - Field of view*/
	            fov: 45,
	            /** @member {Number} PerspectiveCamera#near - Near cutting plane*/
	            near: 0,
	            /** @member {Number} PerspectiveCamera#far - Far cutting plane*/
	            far: 0
	        };
	        /**
	        * This is a structure that holds settings of orthogonal camera. You can modify this but it is not necessary because sensible values are
	        * defined when geometry model is loaded with {@link xViewer#load load()} method. If you want to change these values you have to do it after geometry is loaded.
	        * @member {OrthogonalCamera} xViewer#orthogonalCamera
	        */
	        /**
	        * This is only a structure. Don't call the constructor.
	        * @classdesc This is a structure that holds settings of orthogonal camera. If you want to switch viewer to use orthogonal camera set {@link xViewer#camera camera} to 'orthogonal'.
	        * @class
	        * @name OrthogonalCamera
	        */
	        this.orthogonalCamera = {
	            /** @member {Number} OrthogonalCamera#left*/
	            left: 0,
	            /** @member {Number} OrthogonalCamera#right*/
	            right: 0,
	            /** @member {Number} OrthogonalCamera#top*/
	            top: 0,
	            /** @member {Number} OrthogonalCamera#bottom*/
	            bottom: 0,
	            /** @member {Number} OrthogonalCamera#near*/
	            near: 0,
	            /** @member {Number} OrthogonalCamera#far*/
	            far: 0
	        };
	        /**
	        * Type of camera to be used. Available values are <strong>'perspective'</strong> and <strong>'orthogonal'</strong> You can change this value at any time with instant effect.
	        * @member {string} xViewer#camera
	        */
	        this.camera = 'perspective';
	        /**
	        * Array of four integers between 0 and 255 representing RGBA colour components. This defines background colour of the viewer. You can change this value at any time with instant effect.
	        * @member {Number[]} xViewer#background
	        */
	        this.background = [230, 230, 230, 255];
	        /**
	        * Array of four integers between 0 and 255 representing RGBA colour components. This defines colour for highlighted elements. You can change this value at any time with instant effect.
	        * @member {Number[]} xViewer#highlightingColour
	        */
	        this.highlightingColour = [255, 173, 33, 255];
	        /**
	        * Array of four floats. It represents Light A's position <strong>XYZ</strong> and intensity <strong>I</strong> as [X, Y, Z, I]. Intensity should be in range 0.0 - 1.0.
	        * @member {Number[]} xViewer#lightA
	        */
	        this.lightA = [0, 1000000, 200000, 0.8];
	        /**
	        * Array of four floats. It represents Light B's position <strong>XYZ</strong> and intensity <strong>I</strong> as [X, Y, Z, I]. Intensity should be in range 0.0 - 1.0.
	        * @member {Number[]} xViewer#lightB
	        */
	        this.lightB = [0, -500000, 50000, 0.2];
	        /**
	        * Switch between different navigation modes for left mouse button. Allowed values: <strong> 'pan', 'zoom', 'orbit' (or 'fixed-orbit') , 'free-orbit' and 'none'</strong>. Default value is <strong>'orbit'</strong>;
	        * @member {String} xViewer#navigationMode
	        */
	        this.navigationMode = 'orbit';
	        /**
	        * Switch between different rendering modes. Allowed values: <strong> 'normal', 'x-ray'</strong>. Default value is <strong>'normal'</strong>;
	        * Only products with state set to state.HIGHLIGHTED or xState.XRAYVISIBLE will be rendered highlighted or in a normal colours. All other products
	        * will be rendered semi-transparent and single sided.
	        * @member {String} xViewer#renderingMode
	        */
	        this.renderingMode = 'normal';
	        /**
	        * Clipping plane [a, b, c, d] defined as normal equation of the plane ax + by + cz + d = 0. [0,0,0,0] is for no clipping plane.
	        * @member {Number[]} xViewer#clippingPlane
	        */
	        this.clippingPlane = [0, 0, 0, 0];
	        this._lastClippingPoint = [0, 0, 0];
	        //*************************** Do all the set up of WebGL **************************
	        var gl = WebGLUtils.setupWebGL(this._canvas);
	        //do not even initialize this object if WebGL is not supported
	        if (!gl) {
	            return;
	        }
	        this._gl = gl;
	        //detect floating point texture support
	        this._fpt = (gl.getExtension('OES_texture_float') ||
	            gl.getExtension('MOZ_OES_texture_float') ||
	            gl.getExtension('WEBKIT_OES_texture_float'));
	        //set up DEPTH_TEST and BLEND so that transparent objects look right
	        //this is not 100% perfect as it would be necessary to sort all objects from back to
	        //front when rendering them. We have sacrificed this for the sake of performance.
	        //Objects with no transparency in their default style are drawn first and semi-transparent last.
	        //This gives 90% right when there is not too much of transparency. It may not look right if you
	        //have a look through two windows or if you have a look from inside of the building out.
	        //It is granted to be alright when looking from outside of the building inside through one
	        //semi-transparent object like curtain wall panel or window which is the case most of the time.
	        //This is known limitation but there is no plan to change this behaviour.
	        gl.enable(gl.DEPTH_TEST);
	        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	        gl.enable(gl.BLEND);
	        //cache canvas width and height and change it only when size change
	        // it is better to cache this value because it is used frequently and it takes a time to get a value from HTML
	        this._width = this._canvas.width = this._canvas.offsetWidth;
	        this._height = this._canvas.height = this._canvas.offsetHeight;
	        this._geometryLoaded = false;
	        //number of active models is used to indicate that state has changed
	        this._numberOfActiveModels = 0;
	        //this object is used to identify if anything changed before two frames (hence if it is necessary to redraw)
	        this._lastStates = {};
	        this._visualStateAttributes = [
	            'perspectiveCamera', 'orthogonalCamera', 'camera', 'background', 'lightA', 'lightB',
	            'renderingMode', 'clippingPlane', '_mvMatrix', '_pMatrix', '_distance', '_origin', 'highlightingColour',
	            '_numberOfActiveModels'
	        ];
	        this._stylingChanged = true;
	        //this is to indicate that user has done some interaction
	        this._userAction = true;
	        //dictionary of named events which can be registered and unregistered by using '.on('eventname', callback)'
	        // and '.off('eventname', callback)'. Registered call-backs are triggered by the viewer when important events occur.
	        this._events = {};
	        //array of plugins which can implement certain methods which get called at certain points like before draw, after draw and others.
	        this._plugins = [];
	        //pointers to uniforms in shaders
	        this._mvMatrixUniformPointer = null;
	        this._pMatrixUniformPointer = null;
	        this._lightAUniformPointer = null;
	        this._lightBUniformPointer = null;
	        this._colorCodingUniformPointer = null;
	        this._clippingPlaneUniformPointer = null;
	        this._meterUniformPointer = null;
	        this._renderingModeUniformPointer = null;
	        this._highlightingColourUniformPointer = null;
	        //transformation matrices
	        this._mvMatrix = glMatrix.mat4.create(); //world matrix
	        this._pMatrix = glMatrix.mat4.create(); //camera matrix (this can be either perspective or orthogonal camera)
	        //Navigation settings - coordinates in the WCS of the origin used for orbiting and panning
	        this._origin = [0, 0, 0];
	        //Default distance for default views (top, bottom, left, right, front, back)
	        this._distance = 0;
	        //shader program used for rendering
	        this._shaderProgram = null;
	        //Array of handles which can eventually contain handles to one or more models.
	        //Models are loaded using 'load()' function.
	        this._handles = [];
	        //This array keeps data for overlay styles.
	        this._stateStyles = new Uint8Array(15 * 15 * 4);
	        //This is a switch which can stop animation.
	        this._isRunning = true;
	        //********************** Run all the initialize functions *****************************
	        //compile shaders for use
	        this._initShaders();
	        //initialize vertex attribute and uniform pointers
	        this._initAttributesAndUniforms();
	        //initialize mouse events to capture user interaction
	        this._initMouseEvents();
	        //initialize touch events to capute user interaction on touch devices
	        this._initTouchNavigationEvents();
	        this._initTouchTapEvents();
	    }
	    /**
	    * This is a static function which should always be called before xViewer is instantiated.
	    * It will check all prerequisites of the viewer and will report all issues. If Prerequisities.errors contain
	    * any messages viewer won't work. If Prerequisities.warnings contain any messages it will work but some
	    * functions may be restricted or may not work or it may have poor performance.
	    * @function xViewer.check
	    * @return {Prerequisites}
	    */
	    xViewer.check = function () {
	        /**
	        * This is a structure reporting errors and warnings about prerequisites of {@link xViewer xViewer}. It is result of {@link xViewer.checkPrerequisities checkPrerequisities()} static method.
	        *
	        * @name Prerequisites
	        * @class
	        */
	        var result = {
	            /**
	            * If this array contains any warnings xViewer will work but it might be slow or may not support full functionality.
	            * @member {string[]}  Prerequisites#warnings
	            */
	            warnings: [],
	            /**
	            * If this array contains any errors xViewer won't work at all or won't work as expected.
	            * You can use messages in this array to report problems to user. However, user won't probably
	            * be able to do to much with it except trying to use different browser. IE10- are not supported for example.
	            * The latest version of IE should be all right.
	            * @member {string[]}  Prerequisites#errors
	            */
	            errors: [],
	            /**
	            * If false xViewer won't work at all or won't work as expected.
	            * You can use messages in {@link Prerequisites#errors errors array} to report problems to user. However, user won't probably
	            * be able to do to much with it except trying to use different browser. IE10- are not supported for example.
	            * The latest version of IE should be all right.
	            * @member {string[]}  Prerequisites#noErrors
	            */
	            noErrors: false,
	            /**
	            * If false xViewer will work but it might be slow or may not support full functionality. Use {@link Prerequisites#warnings warnings array} to report problems.
	            * @member {string[]}  Prerequisites#noWarnings
	            */
	            noWarnings: false
	        };
	        //check WebGL support
	        var canvas = document.createElement('canvas');
	        if (!canvas)
	            result.errors.push("Browser doesn't have support for HTMLCanvasElement. This is critical.");
	        else {
	            var gl = WebGLUtils.setupWebGL(canvas);
	            if (gl == null)
	                result.errors.push("Browser doesn't support WebGL. This is critical.");
	            else {
	                //check floating point extension availability
	                var fpt = (gl.getExtension('OES_texture_float') ||
	                    gl.getExtension('MOZ_OES_texture_float') ||
	                    gl.getExtension('WEBKIT_OES_texture_float'));
	                if (!fpt)
	                    result.warnings
	                        .push('Floating point texture extension is not supported. Performance of the viewer will be very bad. But it should work.');
	                //check number of supported vertex shader textures. Minimum is 5 but standard requires 0.
	                var vertTextUnits = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
	                if (vertTextUnits < 4)
	                    result.errors.push('Browser supports only ' +
	                        vertTextUnits +
	                        ' vertex texture image units but minimal requirement for the viewer is 4.');
	            }
	        }
	        //check FileReader and Blob support
	        if (!window['File'] ||
	            !window['FileReader'] ||
	            !window.Blob)
	            result.errors.push("Browser doesn't support 'File', 'FileReader' or 'Blob' objects.");
	        //check for typed arrays
	        if (!window['Int32Array'] || !window['Float32Array'])
	            result.errors
	                .push("Browser doesn't support TypedArrays. These are crucial for binary parsing and for comunication with GPU.");
	        //check SVG support
	        if (!document.implementation
	            .hasFeature('http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1'))
	            result.warnings
	                .push("Browser doesn't support SVG. This is used for user interaction like interactive clipping. Functions using SVG shouldn't crash but they won't work as expected.");
	        //set boolean members for convenience
	        if (result.errors.length == 0)
	            result.noErrors = true;
	        if (result.warnings.length == 0)
	            result.noWarnings = true;
	        return result;
	    };
	    /**
	    * Adds plugin to the viewer. Plugins can implement certain methods which get called in certain moments in time like
	    * before draw, after draw etc. This makes it possible to implement functionality tightly integrated into xViewer like navigation cube or others.
	    * @function xViewer#addPlugin
	    * @param {object} plugin - plug-in object
	    */
	    xViewer.prototype.addPlugin = function (plugin) {
	        this._plugins.push(plugin);
	        if (!plugin.init)
	            return;
	        plugin.init(this);
	    };
	    /**
	    * Removes plugin from the viewer. Plugins can implement certain methods which get called in certain moments in time like
	    * before draw, after draw etc. This makes it possible to implement functionality tightly integrated into xViewer like navigation cube or others.
	    * @function xViewer#removePlugin
	    * @param {object} plugin - plug-in object
	    */
	    xViewer.prototype.removePlugin = function (plugin) {
	        var index = this._plugins.indexOf(plugin, 0);
	        if (index < 0)
	            return;
	        this._plugins.splice(index, 1);
	    };
	    /**
	    * Use this function to define up to 224 optional styles which you can use to change appearance of products and types if you pass the index specified in this function to {@link xViewer#setState setState()} function.
	    * @function xViewer#defineStyle
	    * @param {Number} index - Index of the style to be defined. This has to be in range 0 - 224. Index can than be passed to change appearance of the products in model
	    * @param {Number[]} colour - Array of four numbers in range 0 - 255 representing RGBA colour. If there are less or more numbers exception is thrown.
	    */
	    xViewer.prototype.defineStyle = function (index, colour) {
	        if (typeof (index) == 'undefined' || (index < 0 && index > 224))
	            throw 'Style index has to be defined as a number 0-224';
	        if (typeof (colour) == 'undefined' || !colour.length || colour.length != 4)
	            throw 'Colour must be defined as an array of 4 bytes';
	        this._stylingChanged = true;
	        //set style to style texture via model handle
	        var colData = new Uint8Array(colour);
	        this._stateStyles.set(colData, index * 4);
	        //if there are some handles already set this style in there
	        this._handles.forEach(function (handle) {
	            handle.stateStyle = this._stateStyles;
	            handle.refreshStyles();
	        }, this);
	    };
	    /**
	    * You can use this function to change state of products in the model. State has to have one of values from {@link xState xState} enumeration.
	    * Target is either enumeration from {@link xProductType xProductType} or array of product IDs. If you specify type it will effect all elements of the type.
	    *
	    * @function xViewer#setState
	    * @param {Number} state - One of {@link xState xState} enumeration values.
	    * @param {Number[] | Number} target - Target of the change. It can either be array of product IDs or product type from {@link xProductType xProductType}.
	    */
	    xViewer.prototype.setState = function (state, target) {
	        if (typeof (state) == 'undefined' || !(state >= 225 && state <= 255))
	            throw 'State has to be defined as 225 - 255. Use xState enum.';
	        this._handles.forEach(function (handle) {
	            handle.setState(state, target);
	        }, this);
	        this._stylingChanged = true;
	    };
	    /**
	    * Use this function to get state of the products in the model. You can compare result of this function
	    * with one of values from {@link xState xState} enumeration. 0xFF is the default value.
	    *
	    * @function xViewer#getState
	    * @param {Number} id - Id of the product. You would typically get the id from {@link xViewer#event:pick pick event} or similar event.
	    */
	    xViewer.prototype.getState = function (id) {
	        var state = null;
	        this._handles.forEach(function (handle) {
	            state = handle.getState(id);
	            if (state !== null) {
	                return;
	            }
	        }, this);
	        return state;
	    };
	    /**
	    * Use this function to reset state of all products to 'UNDEFINED' which means visible and not highlighted.
	    * You can use optional hideSpaces parameter if you also want to show spaces. They will be hidden by default.
	    *
	    * @function xViewer#resetStates
	    * @param {Bool} [hideSpaces = true] - Default state is UNDEFINED which would also show spaces. That is often not
	    * desired so it can be excluded with this parameter.
	    */
	    xViewer.prototype.resetStates = function (hideSpaces) {
	        this._handles.forEach(function (handle) {
	            handle.resetStates();
	        }, this);
	        //hide spaces
	        hideSpaces = typeof (hideSpaces) != 'undefined' ? hideSpaces : true;
	        if (hideSpaces) {
	            this._handles.forEach(function (handle) {
	                handle.setState(xbim_state_1.xState.HIDDEN, xbim_product_type_1.xProductType.IFCSPACE);
	            }, this);
	        }
	        this._stylingChanged = true;
	    };
	    /**
	     * Gets complete model state and style. Resulting object can be used to restore the state later on.
	     *
	     * @param {Number} id - Model ID which you can get from {@link xViewer#event:loaded loaded} event.
	     * @returns {Array} - Array representing model state in compact form suitable for serialization
	     */
	    xViewer.prototype.getModelState = function (id) {
	        var handle = this._handles[id];
	        if (typeof (handle) === 'undefined') {
	            throw "Model doesn't exist";
	        }
	        return handle.getModelState();
	    };
	    /**
	     * Restores model state from the data previously captured with {@link xViewer#getModelState getModelState()} function
	     * @param {Number} id - ID of the model
	     * @param {Array} state - State of the model as obtained from {@link xViewer#getModelState getModelState()} function
	     */
	    xViewer.prototype.restoreModelState = function (id, state) {
	        var handle = this._handles[id];
	        if (typeof (handle) === 'undefined') {
	            throw "Model doesn't exist";
	        }
	        handle.restoreModelState(state);
	        this._stylingChanged = true;
	    };
	    /**
	    * Use this method for restyling of the model. This doesn't change the default appearance of the products so you can think about it as an overlay. You can
	    * remove the overlay if you set the style to {@link xState#UNSTYLED xState.UNSTYLED} value. You can combine restyling and hiding in this way.
	    * Use {@link xViewer#defineStyle defineStyle()} to define styling first.
	    *
	    * @function xViewer#setStyle
	    * @param style - style defined in {@link xViewer#defineStyle defineStyle()} method
	    * @param {Number[] | Number} target - Target of the change. It can either be array of product IDs or product type from {@link xProductType xProductType}.
	    */
	    xViewer.prototype.setStyle = function (style, target) {
	        if (typeof (style) == 'undefined' || !(style >= 0 && style <= 225))
	            throw 'Style has to be defined as 0 - 225 where 225 is for default style.';
	        var c = [
	            this._stateStyles[style * 4],
	            this._stateStyles[style * 4 + 1],
	            this._stateStyles[style * 4 + 2],
	            this._stateStyles[style * 4 + 3]
	        ];
	        if (c[0] == 0 && c[1] == 0 && c[2] == 0 && c[3] == 0 && console && console.warn)
	            console
	                .warn('You have used undefined colour for restyling. Elements with this style will have transparent black colour and hence will be invisible.');
	        this._handles.forEach(function (handle) {
	            handle.setState(style, target);
	        }, this);
	        this._stylingChanged = true;
	    };
	    /**
	    * Use this function to get overriding colour style of the products in the model. The number you get is the index of
	    * your custom colour which you have defined in {@link xViewer#defineStyle defineStyle()} function. 0xFF is the default value.
	    *
	    * @function xViewer#getStyle
	    * @param {Number} id - Id of the product. You would typically get the id from {@link xViewer#event:pick pick event} or similar event.
	    */
	    xViewer.prototype.getStyle = function (id) {
	        this._handles.forEach(function (handle) {
	            var style = handle.getStyle(id);
	            if (style !== null) {
	                return style;
	            }
	        }, this);
	        return null;
	    };
	    /**
	    * Use this function to reset appearance of all products to their default styles.
	    *
	    * @function xViewer#resetStyles
	    */
	    xViewer.prototype.resetStyles = function () {
	        this._handles.forEach(function (handle) {
	            handle.resetStyles();
	        }, this);
	        this._stylingChanged = true;
	    };
	    /**
	    *
	    * @function xViewer#getProductType
	    * @return {Number} Product type ID. This is either null if no type is identified or one of {@link xProductType type ids}.
	    * @param {Number} prodID - Product ID. You can get this value either from semantic structure of the model or by listening to {@link xViewer#event:pick pick} event.
	    */
	    xViewer.prototype.getProductType = function (prodId) {
	        var pType = null;
	        this._handles.forEach(function (handle) {
	            var map = handle.getProductMap(prodId);
	            if (map)
	                pType = map.type;
	        }, this);
	        return pType;
	    };
	    /**
	    * Use this method to set position of camera. Use it after {@link xViewer#setCameraTarget setCameraTarget()} to get desired result.
	    *
	    * @function xViewer#setCameraPosition
	    * @param {Number[]} coordinates - 3D coordinates of the camera in WCS
	    */
	    xViewer.prototype.setCameraPosition = function (coordinates) {
	        if (typeof (coordinates) == 'undefined')
	            throw 'Parameter coordinates must be defined';
	        glMatrix.mat4.lookAt(this._mvMatrix, coordinates, this._origin, [0, 0, 1]);
	    };
	    /**
	    * This method sets navigation origin to the centroid of specified product's bounding box or to the centre of model if no product ID is specified.
	    * This method doesn't affect the view itself but it has an impact on navigation. Navigation origin is used as a centre for orbiting and it is used
	    * if you call functions like {@link xViewer.show show()} or {@link xViewer#zoomTo zoomTo()}.
	    * @function xViewer#setCameraTarget
	    * @param {Number} prodId [optional] Product ID. You can get ID either from semantic structure of the model or from {@link xViewer#event:pick pick event}.
	    * @return {Bool} True if the target exists and is set, False otherwise
	    */
	    xViewer.prototype.setCameraTarget = function (prodId) {
	        var viewer = this;
	        //helper function for setting of the distance based on camera field of view and size of the product's bounding box
	        var setDistance = function (bBox) {
	            var size = Math.max(bBox[3], bBox[4], bBox[5]);
	            var ratio = Math.max(viewer._width, viewer._height) / Math.min(viewer._width, viewer._height);
	            viewer._distance = size / Math.tan(viewer.perspectiveCamera.fov * Math.PI / 180.0) * ratio * 1.0;
	        };
	        //set navigation origin and default distance to the product BBox
	        if (typeof (prodId) != 'undefined' && prodId != null) {
	            //get product BBox and set it's centre as a navigation origin
	            var bbox = null;
	            this._handles.every(function (handle) {
	                var map = handle.getProductMap(prodId);
	                if (map) {
	                    bbox = map.bBox;
	                    return false;
	                }
	                return true;
	            });
	            if (bbox) {
	                this._origin = [bbox[0] + bbox[3] / 2.0, bbox[1] + bbox[4] / 2.0, bbox[2] + bbox[5] / 2.0];
	                setDistance(bbox);
	                return true;
	            }
	            else
	                return false;
	        }
	        else {
	            //get region extent and set it's centre as a navigation origin
	            var handle = this._handles[0];
	            if (handle) {
	                var region = handle.region;
	                if (region) {
	                    this._origin = [region.centre[0], region.centre[1], region.centre[2]];
	                    setDistance(region.bbox);
	                }
	            }
	            return true;
	        }
	    };
	    /**
	    * This method can be used for batch setting of viewer members. It doesn't check validity of the input.
	    * @function xViewer#set
	    * @param {Object} settings - Object containing key - value pairs
	    */
	    xViewer.prototype.set = function (settings) {
	        for (var key in settings) {
	            this[key] = settings[key];
	        }
	    };
	    ;
	    /**
	    * This method is used to load model data into viewer. Model has to be either URL to wexBIM file or Blob or File representing wexBIM file binary data. Any other type of argument will throw an exception.
	    * Region extend is determined based on the region of the model
	    * Default view if 'front'. If you want to define different view you have to set it up in handler of {@link xViewer#event:loaded loaded} event. <br>
	    * You can load more than one model if they occupy the same space, use the same scale and have unique product IDs. Duplicated IDs won't affect
	    * visualization itself but would cause unexpected user interaction (picking, zooming, ...)
	    * @function xViewer#load
	    * @param {String | Blob | File} model - Model has to be either URL to wexBIM file or Blob or File representing wexBIM file binary data.
	    * @param {Any} tag [optional] - Tag to be used to identify the model in {@link xViewer#event:loaded loaded} event.
	    * @fires xViewer#loaded
	    */
	    xViewer.prototype.load = function (model, tag) {
	        if (typeof (model) == 'undefined')
	            throw 'You have to specify model to load.';
	        if (typeof (model) != 'string' && !(model instanceof Blob))
	            throw 'Model has to be specified either as a URL to wexBIM file or Blob object representing the wexBIM file.';
	        var viewer = this;
	        var geometry = new xbim_model_geometry_1.xModelGeometry();
	        geometry.onloaded = function () {
	            viewer._addHandle(geometry, tag);
	        };
	        geometry.onerror = function (msg) {
	            viewer._error(msg);
	        };
	        geometry.load(model);
	    };
	    //this is a private function used to add loaded geometry as a new handle and to set up camera and 
	    //default view if this is the first geometry loaded
	    xViewer.prototype._addHandle = function (geometry, tag) {
	        var viewer = this;
	        var gl = this._gl;
	        var handle = new xbim_model_handle_1.xModelHandle(viewer._gl, geometry, viewer._fpt != null);
	        viewer._handles.push(handle);
	        handle.stateStyle = viewer._stateStyles;
	        handle.feedGPU();
	        //get one meter size from model and set it to shader
	        var meter = handle._model.meter;
	        gl.uniform1f(viewer._meterUniformPointer, meter);
	        //only set camera parameters and the view if this is the first model
	        if (viewer._handles.length === 1) {
	            //set centre and default distance based on the most populated region in the model
	            viewer.setCameraTarget();
	            //set perspective camera near and far based on 1 meter dimension and size of the model
	            var region = handle.region;
	            var maxSize = Math.max(region.bbox[3], region.bbox[4], region.bbox[5]);
	            viewer.perspectiveCamera.far = maxSize * 50;
	            viewer.perspectiveCamera.near = meter / 10.0;
	            //set orthogonalCamera boundaries so that it makes a sense
	            viewer.orthogonalCamera.far = viewer.perspectiveCamera.far;
	            viewer.orthogonalCamera.near = viewer.perspectiveCamera.near;
	            var ratio = 1.8;
	            viewer.orthogonalCamera.top = maxSize / ratio;
	            viewer.orthogonalCamera.bottom = maxSize / ratio * -1;
	            viewer.orthogonalCamera.left = maxSize / ratio * -1 * viewer._width / viewer._height;
	            viewer.orthogonalCamera.right = maxSize / ratio * viewer._width / viewer._height;
	            //set default view
	            viewer.setCameraTarget();
	            var dist = Math.sqrt(viewer._distance * viewer._distance / 3.0);
	            viewer.setCameraPosition([
	                region.centre[0] + dist * -1.0, region.centre[1] + dist * -1.0, region.centre[2] + dist
	            ]);
	        }
	        /**
	         * Occurs when geometry model is loaded into the viewer. This event returns object containing ID of the model.
	         * This ID can later be used to unload or temporarily stop the model.
	         *
	         * @event xViewer#loaded
	         * @type {object}
	         * @param {Number} id - model ID
	         * @param {Any} tag - tag which was passed to 'xViewer.load()' function
	         *
	        */
	        viewer._fire('loaded', { id: handle.id, tag: tag });
	        viewer._geometryLoaded = true;
	    };
	    ;
	    /**
	     * Unloads model from the GPU. This action is not reversible.
	     *
	     * @param {Number} modelId - ID of the model which you can get from {@link xViewer#event:loaded loaded} event.
	     */
	    xViewer.prototype.unload = function (modelId) {
	        var handle = this._handles.filter(function (h) { return h.id === modelId; }).pop();
	        if (typeof (handle) === 'undefined')
	            throw 'Model with id: ' + modelId + " doesn't exist or was unloaded already.";
	        //stop for start so it doesn't interfere with the rendering loop
	        handle.stopped = true;
	        //remove from the array
	        var index = this._handles.indexOf(handle);
	        this._handles.splice(index, 1);
	        this._numberOfActiveModels = this._handles.length;
	        //unload and delete
	        handle.unload();
	        //delete handle; // TODO -> TS1102 error: delete cannot be called for a variable in strict mode -> is it necessary here / are there any other references left?
	    };
	    //this function should be only called once during initialization
	    //or when shader set-up changes
	    xViewer.prototype._initShaders = function () {
	        var gl = this._gl;
	        var viewer = this;
	        var compile = function (shader, code) {
	            gl.shaderSource(shader, code);
	            gl.compileShader(shader);
	            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
	                viewer._error(gl.getShaderInfoLog(shader));
	                return null;
	            }
	        };
	        //fragment shader
	        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	        compile(fragmentShader, xbim_shaders_1.xShaders.fragment_shader);
	        //vertex shader (the more complicated one)
	        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	        if (this._fpt != null)
	            compile(vertexShader, xbim_shaders_1.xShaders.vertex_shader);
	        else
	            compile(vertexShader, xbim_shaders_1.xShaders.vertex_shader_noFPT);
	        //link program
	        this._shaderProgram = gl.createProgram();
	        gl.attachShader(this._shaderProgram, vertexShader);
	        gl.attachShader(this._shaderProgram, fragmentShader);
	        gl.linkProgram(this._shaderProgram);
	        if (!gl.getProgramParameter(this._shaderProgram, gl.LINK_STATUS)) {
	            this._error('Could not initialise shaders ');
	        }
	        gl.useProgram(this._shaderProgram);
	    };
	    xViewer.prototype._initAttributesAndUniforms = function () {
	        var gl = this._gl;
	        //create pointers to uniform variables for transformations
	        this._pMatrixUniformPointer = gl.getUniformLocation(this._shaderProgram, 'uPMatrix');
	        this._mvMatrixUniformPointer = gl.getUniformLocation(this._shaderProgram, 'uMVMatrix');
	        this._lightAUniformPointer = gl.getUniformLocation(this._shaderProgram, 'ulightA');
	        this._lightBUniformPointer = gl.getUniformLocation(this._shaderProgram, 'ulightB');
	        this._colorCodingUniformPointer = gl.getUniformLocation(this._shaderProgram, 'uColorCoding');
	        this._clippingPlaneUniformPointer = gl.getUniformLocation(this._shaderProgram, 'uClippingPlane');
	        this._meterUniformPointer = gl.getUniformLocation(this._shaderProgram, 'uMeter');
	        this._renderingModeUniformPointer = gl.getUniformLocation(this._shaderProgram, 'uRenderingMode');
	        this._highlightingColourUniformPointer = gl.getUniformLocation(this._shaderProgram, 'uHighlightColour');
	        this._pointers = {
	            normalAttrPointer: gl.getAttribLocation(this._shaderProgram, 'aNormal'),
	            indexlAttrPointer: gl.getAttribLocation(this._shaderProgram, 'aVertexIndex'),
	            productAttrPointer: gl.getAttribLocation(this._shaderProgram, 'aProduct'),
	            stateAttrPointer: gl.getAttribLocation(this._shaderProgram, 'aState'),
	            styleAttrPointer: gl.getAttribLocation(this._shaderProgram, 'aStyleIndex'),
	            transformationAttrPointer: gl.getAttribLocation(this._shaderProgram, 'aTransformationIndex'),
	            vertexSamplerUniform: gl.getUniformLocation(this._shaderProgram, 'uVertexSampler'),
	            matrixSamplerUniform: gl.getUniformLocation(this._shaderProgram, 'uMatrixSampler'),
	            styleSamplerUniform: gl.getUniformLocation(this._shaderProgram, 'uStyleSampler'),
	            stateStyleSamplerUniform: gl.getUniformLocation(this._shaderProgram, 'uStateStyleSampler'),
	            vertexTextureSizeUniform: gl.getUniformLocation(this._shaderProgram, 'uVertexTextureSize'),
	            matrixTextureSizeUniform: gl.getUniformLocation(this._shaderProgram, 'uMatrixTextureSize'),
	            styleTextureSizeUniform: gl.getUniformLocation(this._shaderProgram, 'uStyleTextureSize')
	        };
	        //enable vertex attributes arrays
	        gl.enableVertexAttribArray(this._pointers.normalAttrPointer);
	        gl.enableVertexAttribArray(this._pointers.indexlAttrPointer);
	        gl.enableVertexAttribArray(this._pointers.productAttrPointer);
	        gl.enableVertexAttribArray(this._pointers.stateAttrPointer);
	        gl.enableVertexAttribArray(this._pointers.styleAttrPointer);
	        gl.enableVertexAttribArray(this._pointers.transformationAttrPointer);
	    };
	    xViewer.prototype._initMouseEvents = function () {
	        var _this = this;
	        var viewer = this;
	        var mouseDown = false;
	        var lastMouseX = null;
	        var lastMouseY = null;
	        var startX = null;
	        var startY = null;
	        var button = 'L';
	        var id = -1;
	        //set initial conditions so that different gestures can be identified
	        var handleMouseDown = function (event) {
	            mouseDown = true;
	            lastMouseX = event.clientX;
	            lastMouseY = event.clientY;
	            startX = event.clientX;
	            startY = event.clientY;
	            //get coordinates within canvas (with the right orientation)
	            var r = viewer._canvas.getBoundingClientRect();
	            var viewX = startX - r.left;
	            var viewY = viewer._height - (startY - r.top);
	            //this is for picking
	            id = viewer._getID(viewX, viewY);
	            /**
	            * Occurs when mousedown event happens on underlying canvas.
	            *
	            * @event xViewer#mouseDown
	            * @type {object}
	            * @param {Number} id - product ID of the element or null if there wasn't any product under mouse
	            */
	            viewer._fire('mouseDown', { id: id });
	            //keep information about the mouse button
	            switch (event.button) {
	                case 0:
	                    button = 'left';
	                    break;
	                case 1:
	                    button = 'middle';
	                    break;
	                case 2:
	                    button = 'right';
	                    break;
	                default:
	                    button = 'left';
	                    break;
	            }
	            viewer._disableTextSelection();
	        };
	        var handleMouseUp = function (event) {
	            mouseDown = false;
	            var endX = event.clientX;
	            var endY = event.clientY;
	            var deltaX = Math.abs(endX - startX);
	            var deltaY = Math.abs(endY - startY);
	            //if it was a longer movement do not perform picking
	            if (deltaX < 3 && deltaY < 3 && button === 'left') {
	                var handled = false;
	                viewer._plugins.forEach(function (plugin) {
	                    if (!plugin.onBeforePick) {
	                        return;
	                    }
	                    handled = handled || plugin.onBeforePick(id);
	                }, _this);
	                /**
	                * Occurs when user click on model.
	                *
	                * @event xViewer#pick
	                * @type {object}
	                * @param {Number} id - product ID of the element or null if there wasn't any product under mouse
	                */
	                if (!handled)
	                    viewer._fire('pick', { id: id });
	            }
	            viewer._enableTextSelection();
	        };
	        var handleMouseMove = function (event) {
	            if (!mouseDown) {
	                return;
	            }
	            if (viewer.navigationMode === 'none') {
	                return;
	            }
	            var newX = event.clientX;
	            var newY = event.clientY;
	            var deltaX = newX - lastMouseX;
	            var deltaY = newY - lastMouseY;
	            lastMouseX = newX;
	            lastMouseY = newY;
	            if (button === 'left') {
	                switch (viewer.navigationMode) {
	                    case 'free-orbit':
	                        _this.navigate('free-orbit', deltaX, deltaY);
	                        break;
	                    case 'fixed-orbit':
	                    case 'orbit':
	                        _this.navigate('orbit', deltaX, deltaY);
	                        break;
	                    case 'pan':
	                        _this.navigate('pan', deltaX, deltaY);
	                        break;
	                    case 'zoom':
	                        _this.navigate('zoom', deltaX, deltaY);
	                        break;
	                    default:
	                        break;
	                }
	            }
	            if (button === 'middle') {
	                _this.navigate('pan', deltaX, deltaY);
	            }
	        };
	        var handleMouseScroll = function (event) {
	            if (viewer.navigationMode === 'none') {
	                return;
	            }
	            if (event.stopPropagation) {
	                event.stopPropagation();
	            }
	            if (event.preventDefault) {
	                event.preventDefault();
	            }
	            var sign = function (x) {
	                x = +x; // convert to a number
	                if (x === 0 || isNaN(x))
	                    return x;
	                return x > 0 ? 1 : -1;
	            };
	            //deltaX and deltaY have very different values in different web browsers so fixed value is used for constant functionality.
	            _this.navigate('zoom', sign(event.deltaX) * -1.0, sign(event.deltaY) * -1.0);
	        };
	        //watch resizing of canvas every 500ms
	        var elementHeight = viewer.height;
	        var elementWidth = viewer.width;
	        setInterval(function () {
	            if (viewer._canvas.offsetHeight !== elementHeight || viewer._canvas.offsetWidth !== elementWidth) {
	                elementHeight = viewer._height = viewer._canvas.height = viewer._canvas.offsetHeight;
	                elementWidth = viewer._width = viewer._canvas.width = viewer._canvas.offsetWidth;
	            }
	        }, 500);
	        //attach callbacks
	        this._canvas.addEventListener('mousedown', function (event) { return handleMouseDown(event); }, true);
	        this._canvas.addEventListener('wheel', function (event) { return handleMouseScroll(event); }, true);
	        window.addEventListener('mouseup', function (event) { return handleMouseUp(event); }, true);
	        window.addEventListener('mousemove', function (event) { return handleMouseMove(event); }, true);
	        this._canvas.addEventListener('mousemove', function () {
	            viewer._userAction = true;
	        }, true);
	        /**
	        * Occurs when user double clicks on model.
	        *
	        * @event xViewer#dblclick
	        * @type {object}
	        * @param {Number} id - product ID of the element or null if there wasn't any product under mouse
	        */
	        this._canvas.addEventListener('dblclick', function () { viewer._fire('dblclick', { id: id }); }, true);
	    };
	    xViewer.prototype._initTouchNavigationEvents = function () {
	        var _this = this;
	        var lastTouchX_1;
	        var lastTouchY_1;
	        var lastTouchX_2;
	        var lastTouchY_2;
	        var lastTouchX_3;
	        var lastTouchY_3;
	        var handleTouchStart = function (event) {
	            event.preventDefault();
	            if (event.touches.length >= 1) {
	                lastTouchX_1 = event.touches[0].clientX;
	                lastTouchY_1 = event.touches[0].clientY;
	            }
	            if (event.touches.length >= 2) {
	                lastTouchX_2 = event.touches[1].clientX;
	                lastTouchY_2 = event.touches[1].clientY;
	            }
	            if (event.touches.length >= 3) {
	                lastTouchX_3 = event.touches[2].clientX;
	                lastTouchY_3 = event.touches[2].clientY;
	            }
	        };
	        var handleTouchMove = function (event) {
	            event.preventDefault();
	            if (_this.navigationMode === 'none' || !event.touches) {
	                return;
	            }
	            if (event.touches.length === 1) {
	                // touch move with single finger -> orbit
	                var deltaX = event.touches[0].clientX - lastTouchX_1;
	                var deltaY = event.touches[0].clientY - lastTouchY_1;
	                lastTouchX_1 = event.touches[0].clientX;
	                lastTouchY_1 = event.touches[0].clientY;
	                // force-setting navigation mode to 'free-orbit' currently for touch navigation since regular orbit
	                // feels awkward and un-intuitive on touch devices
	                _this.navigate('free-orbit', deltaX, deltaY);
	            }
	            else if (event.touches.length === 2) {
	                // touch move with two fingers -> zoom
	                var distanceBefore = Math.sqrt((lastTouchX_1 - lastTouchX_2) * (lastTouchX_1 - lastTouchX_2) +
	                    (lastTouchY_1 - lastTouchY_2) * (lastTouchY_1 - lastTouchY_2));
	                lastTouchX_1 = event.touches[0].clientX;
	                lastTouchY_1 = event.touches[0].clientY;
	                lastTouchX_2 = event.touches[1].clientX;
	                lastTouchY_2 = event.touches[1].clientY;
	                var distanceAfter = Math.sqrt((lastTouchX_1 - lastTouchX_2) * (lastTouchX_1 - lastTouchX_2) +
	                    (lastTouchY_1 - lastTouchY_2) * (lastTouchY_1 - lastTouchY_2));
	                if (distanceBefore > distanceAfter) {
	                    _this.navigate('zoom', -1, -1); // Zooming out, fingers are getting closer together
	                }
	                else {
	                    _this.navigate('zoom', 1, 1); // zooming in, fingers are getting further apart
	                }
	            }
	            else if (event.touches.length === 3) {
	                // touch move with three fingers -> pan
	                var directionX = ((event.touches[0]
	                    .clientX +
	                    event.touches[1].clientX +
	                    event.touches[2].clientX) /
	                    3) -
	                    ((lastTouchX_1 + lastTouchX_2 + lastTouchX_3) / 3);
	                var directionY = ((event.touches[0]
	                    .clientY +
	                    event.touches[1].clientY +
	                    event.touches[2].clientY) /
	                    3) -
	                    ((lastTouchY_1 + lastTouchY_2 + lastTouchY_3) / 3);
	                lastTouchX_1 = event.touches[0].clientX;
	                lastTouchY_1 = event.touches[0].clientY;
	                lastTouchX_2 = event.touches[1].clientX;
	                lastTouchY_2 = event.touches[1].clientY;
	                lastTouchY_3 = event.touches[2].clientX;
	                lastTouchY_3 = event.touches[2].clientY;
	                // pan seems to be too fast, just adding a factor here
	                var panFactor = 0.2;
	                _this.navigate('pan', panFactor * directionX, panFactor * directionY);
	            }
	        };
	        this._canvas.addEventListener('touchstart', function (event) { return handleTouchStart(event); }, true);
	        this._canvas.addEventListener('touchmove', function (event) { return handleTouchMove(event); }, true);
	    };
	    xViewer.prototype._initTouchTapEvents = function () {
	        var _this = this;
	        var touchDown = false;
	        var lastTouchX;
	        var lastTouchY;
	        var maximumLengthBetweenDoubleTaps = 200;
	        var lastTap = new Date();
	        var id = -1;
	        //set initial conditions so that different gestures can be identified
	        var handleTouchStart = function (event) {
	            if (event.touches.length !== 1) {
	                return;
	            }
	            touchDown = true;
	            lastTouchX = event.touches[0].clientX;
	            lastTouchY = event.touches[0].clientY;
	            //get coordinates within canvas (with the right orientation)
	            var r = _this._canvas.getBoundingClientRect();
	            var viewX = lastTouchX - r.left;
	            var viewY = _this._height - (lastTouchY - r.top);
	            //this is for picking
	            id = _this._getID(viewX, viewY);
	            var now = new Date();
	            var isDoubleTap = (now.getTime() - lastTap.getTime()) < maximumLengthBetweenDoubleTaps;
	            if (isDoubleTap) {
	                _this._fire('dblclick', { id: id });
	            }
	            ;
	            lastTap = now;
	            /**
	            * Occurs when mousedown event happens on underlying canvas.
	            *
	            * @event xViewer#mouseDown
	            * @type {object}
	            * @param {Number} id - product ID of the element or null if there wasn't any product under mouse
	            */
	            _this._fire('mouseDown', { id: id });
	            _this._disableTextSelection();
	        };
	        var handleTouchEnd = function (event) {
	            if (!touchDown) {
	                return;
	            }
	            touchDown = false;
	            var endX = event.changedTouches[0].clientX;
	            var endY = event.changedTouches[0].clientY;
	            var deltaX = Math.abs(endX - lastTouchX);
	            var deltaY = Math.abs(endY - lastTouchY);
	            //if it was a longer movement do not perform picking
	            if (deltaX < 3 && deltaY < 3) {
	                var handled = false;
	                _this._plugins.forEach(function (plugin) {
	                    if (!plugin.onBeforePick) {
	                        return;
	                    }
	                    handled = handled || plugin.onBeforePick(id);
	                }, _this);
	                /**
	                * Occurs when user click on model.
	                *
	                * @event xViewer#pick
	                * @type {object}
	                * @param {Number} id - product ID of the element or null if there wasn't any product under mouse
	                */
	                if (!handled)
	                    _this._fire('pick', { id: id });
	            }
	            _this._enableTextSelection();
	        };
	        this._canvas.addEventListener('touchstart', function (event) { return handleTouchStart(event); }, true);
	        this._canvas.addEventListener('touchend', function (event) { return handleTouchEnd(event); }, true);
	    };
	    xViewer.prototype.navigate = function (type, deltaX, deltaY) {
	        if (!this._handles || !this._handles[0])
	            return;
	        //translation in WCS is position from [0, 0, 0]
	        var origin = this._origin;
	        var camera = this.getCameraPosition();
	        //get origin coordinates in view space
	        var mvOrigin = glMatrix.vec3.transformMat4(glMatrix.vec3.create(), origin, this._mvMatrix);
	        //movement factor needs to be dependant on the distance but one meter is a minimum so that movement wouldn't stop when camera is in 0 distance from navigation origin
	        var distanceVec = glMatrix.vec3.subtract(glMatrix.vec3.create(), origin, camera);
	        var distance = Math.max(glMatrix.vec3.length(distanceVec), this._handles[0]._model.meter);
	        //move to the navigation origin in view space
	        var transform = glMatrix.mat4.translate(glMatrix.mat4.create(), glMatrix.mat4.create(), mvOrigin);
	        //function for conversion from degrees to radians
	        function degToRad(deg) {
	            return deg * Math.PI / 180.0;
	        }
	        switch (type) {
	            case 'free-orbit':
	                transform = glMatrix.mat4.rotate(glMatrix.mat4.create(), transform, degToRad(deltaY / 4), [1, 0, 0]);
	                transform = glMatrix.mat4.rotate(glMatrix.mat4.create(), transform, degToRad(deltaX / 4), [0, 1, 0]);
	                break;
	            case 'fixed-orbit':
	            case 'orbit':
	                glMatrix.mat4.rotate(transform, transform, degToRad(deltaY / 4), [1, 0, 0]);
	                //z rotation around model z axis
	                var mvZ = glMatrix.vec3.transformMat3(glMatrix.vec3.create(), [0, 0, 1], glMatrix.mat3.fromMat4(glMatrix.mat3.create(), this._mvMatrix));
	                mvZ = glMatrix.vec3.normalize(glMatrix.vec3.create(), mvZ);
	                transform = glMatrix.mat4.rotate(glMatrix.mat4.create(), transform, degToRad(deltaX / 4), mvZ);
	                break;
	            case 'pan':
	                glMatrix.mat4.translate(transform, transform, [deltaX * distance / 150, 0, 0]);
	                glMatrix.mat4.translate(transform, transform, [0, (-1.0 * deltaY) * distance / 150, 0]);
	                break;
	            case 'zoom':
	                glMatrix.mat4.translate(transform, transform, [0, 0, deltaX * distance / 20]);
	                glMatrix.mat4.translate(transform, transform, [0, 0, deltaY * distance / 20]);
	                break;
	            default:
	                break;
	        }
	        //reverse the translation in view space and leave only navigation changes
	        var translation = glMatrix.vec3.negate(glMatrix.vec3.create(), mvOrigin);
	        transform = glMatrix.mat4.translate(glMatrix.mat4.create(), transform, translation);
	        //apply transformation in right order
	        this._mvMatrix = glMatrix.mat4.multiply(glMatrix.mat4.create(), transform, this._mvMatrix);
	    };
	    /**
	    * This is a static draw method. You can use it if you just want to render model once with no navigation and interaction.
	    * If you want interactive model call {@link xViewer#start start()} method. {@link xViewer#frame Frame event} is fired when draw call is finished.
	    * @function xViewer#draw
	    * @fires xViewer#frame
	    */
	    xViewer.prototype.draw = function () {
	        if (!this._geometryLoaded || this._handles.length == 0 || !(this._stylingChanged || this._isChanged())) {
	            if (!this._userAction)
	                return;
	        }
	        this._userAction = false;
	        //call all before-draw plugins
	        this._plugins.forEach(function (plugin) {
	            if (!plugin.onBeforeDraw) {
	                return;
	            }
	            plugin.onBeforeDraw();
	        }, this);
	        //styles are up to date when new frame is drawn
	        this._stylingChanged = false;
	        var gl = this._gl;
	        var width = this._width;
	        var height = this._height;
	        gl.useProgram(this._shaderProgram);
	        gl.viewport(0, 0, width, height);
	        gl.clearColor(this.background[0] / 255, this.background[1] / 255, this.background[2] / 255, this.background[3] / 255);
	        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	        //set up camera
	        switch (this.camera) {
	            case 'perspective':
	                glMatrix.mat4.perspective(this._pMatrix, this.perspectiveCamera.fov * Math.PI / 180.0, this._width / this._height, this.perspectiveCamera.near, this.perspectiveCamera.far);
	                break;
	            case 'orthogonal':
	                glMatrix.mat4.ortho(this._pMatrix, this.orthogonalCamera.left, this.orthogonalCamera.right, this.orthogonalCamera.bottom, this.orthogonalCamera.top, this.orthogonalCamera.near, this.orthogonalCamera.far);
	                break;
	            default:
	                glMatrix.mat4.perspective(this._pMatrix, this.perspectiveCamera.fov * Math.PI / 180.0, this._width / this._height, this.perspectiveCamera.near, this.perspectiveCamera.far);
	                break;
	        }
	        //set uniforms (these may quickly change between calls to draw)
	        gl.uniformMatrix4fv(this._pMatrixUniformPointer, false, this._pMatrix);
	        gl.uniformMatrix4fv(this._mvMatrixUniformPointer, false, this._mvMatrix);
	        gl.uniform4fv(this._lightAUniformPointer, new Float32Array(this.lightA));
	        gl.uniform4fv(this._lightBUniformPointer, new Float32Array(this.lightB));
	        gl.uniform4fv(this._clippingPlaneUniformPointer, new Float32Array(this.clippingPlane));
	        //use normal colour representation (1 would cause shader to use colour coding of IDs)
	        gl.uniform1i(this._colorCodingUniformPointer, 0);
	        //update highlighting colour
	        gl.uniform4fv(this._highlightingColourUniformPointer, new Float32Array([
	            this.highlightingColour[0] / 255.0,
	            this.highlightingColour[1] / 255.0,
	            this.highlightingColour[2] / 255.0,
	            this.highlightingColour[3] / 255.0
	        ]));
	        //check for x-ray mode
	        if (this.renderingMode == 'x-ray') {
	            //two passes - first one for non-transparent objects, second one for all the others
	            gl.uniform1i(this._renderingModeUniformPointer, 2);
	            gl.disable(gl.CULL_FACE);
	            this._handles.forEach(function (handle) {
	                if (!handle.stopped) {
	                    handle.setActive(this._pointers);
	                    handle.draw('solid');
	                }
	            }, this);
	            //transparent objects should have only one side so that they are even more transparent.
	            gl.uniform1i(this._renderingModeUniformPointer, 2);
	            gl.enable(gl.CULL_FACE);
	            this._handles.forEach(function (handle) {
	                if (!handle.stopped) {
	                    handle.setActive(this._pointers);
	                    handle.draw('transparent');
	                }
	            }, this);
	            gl.uniform1i(this._renderingModeUniformPointer, 0);
	        }
	        else {
	            gl.uniform1i(this._renderingModeUniformPointer, 0);
	            gl.disable(gl.CULL_FACE);
	            //two runs, first for solids from all models, second for transparent objects from all models
	            //this makes sure that transparent objects are always rendered at the end.
	            this._handles.forEach(function (handle) {
	                if (!handle.stopped) {
	                    handle.setActive(this._pointers);
	                    handle.draw('solid');
	                }
	            }, this);
	            this._handles.forEach(function (handle) {
	                if (!handle.stopped) {
	                    handle.setActive(this._pointers);
	                    handle.draw('transparent');
	                }
	            }, this);
	        }
	        //call all after-draw plugins
	        this._plugins.forEach(function (plugin) {
	            if (!plugin.onAfterDraw) {
	                return;
	            }
	            plugin.onAfterDraw();
	        }, this);
	        /**
	         * Occurs after every frame in animation. Don't do anything heavy weighted in here as it will happen about 60 times in a second all the time.
	         *
	         * @event xViewer#frame
	         * @type {object}
	         */
	        this._fire('frame', {});
	    };
	    ;
	    xViewer.prototype._isChanged = function () {
	        var theSame = true;
	        this._visualStateAttributes.forEach(function (visualStateAttribute) {
	            var state = JSON.stringify(this[visualStateAttribute]);
	            var lastState = this._lastStates[visualStateAttribute];
	            this._lastStates[visualStateAttribute] = state;
	            theSame = theSame && (state === lastState);
	        }, this);
	        return !theSame;
	    };
	    /**
	    * Use this method get actual camera position.
	    * @function xViewer#getCameraPosition
	    */
	    xViewer.prototype.getCameraPosition = function () {
	        var transform = glMatrix.mat4.create();
	        glMatrix.mat4.multiply(transform, this._pMatrix, this._mvMatrix);
	        var inv = glMatrix.mat4.create();
	        glMatrix.mat4.invert(inv, transform);
	        var eye = glMatrix.vec3.create();
	        glMatrix.vec3.transformMat4(eye, glMatrix.vec3.create(), inv);
	        return eye;
	    };
	    /**
	    * Use this method to zoom to specified element. If you don't specify a product ID it will zoom to full extent.
	    * @function xViewer#zoomTo
	    * @param {Number} [id] Product ID
	    * @return {Bool} True if target exists and zoom was successful, False otherwise
	    */
	    xViewer.prototype.zoomTo = function (id) {
	        var found = this.setCameraTarget(id);
	        if (!found)
	            return false;
	        var eye = this.getCameraPosition();
	        var dir = glMatrix.vec3.create();
	        glMatrix.vec3.subtract(dir, eye, this._origin);
	        dir = glMatrix.vec3.normalize(glMatrix.vec3.create(), dir);
	        var translation = glMatrix.vec3.create();
	        glMatrix.vec3.scale(translation, dir, this._distance);
	        glMatrix.vec3.add(eye, translation, this._origin);
	        glMatrix.mat4.lookAt(this._mvMatrix, eye, this._origin, [0, 0, 1]);
	        return true;
	    };
	    /**
	    * Use this function to show default views.
	    *
	    * @function xViewer#show
	    * @param {String} type - Type of view. Allowed values are <strong>'top', 'bottom', 'front', 'back', 'left', 'right'</strong>.
	    * Directions of this views are defined by the coordinate system. Target and distance are defined by {@link xViewer#setCameraTarget setCameraTarget()} method to certain product ID
	    * or to the model extent if {@link xViewer#setCameraTarget setCameraTarget()} is called with no arguments.
	    */
	    xViewer.prototype.show = function (type) {
	        var origin = this._origin;
	        var distance = this._distance;
	        var camera = [0, 0, 0];
	        var heading = [0, 0, 1];
	        switch (type) {
	            //top and bottom are different because these are singular points for look-at function if heading is [0,0,1]
	            case 'top':
	                //only move to origin and up (negative values because we move camera against model)
	                glMatrix.mat4.translate(this._mvMatrix, glMatrix.mat4.create(), [origin[0] * -1.0, origin[1] * -1.0, (distance + origin[2]) * -1.0]);
	                return;
	            case 'bottom':
	                //only move to origin and up and rotate 180 degrees around Y axis
	                var toOrigin = glMatrix.mat4.translate(glMatrix.mat4.create(), glMatrix.mat4.create(), [origin[0] * -1.0, origin[1] * +1.0, (origin[2] + distance) * -1]);
	                var rotationY = glMatrix.mat4.rotateY(glMatrix.mat4.create(), toOrigin, Math.PI);
	                var rotationZ = glMatrix.mat4.rotateZ(glMatrix.mat4.create(), rotationY, Math.PI);
	                this
	                    ._mvMatrix = rotationZ;
	                // glMatrix.mat4.translate(glMatrix.mat4.create(), rotationZ, [0, 0, -1.0 * distance]);
	                return;
	            case 'front':
	                camera = [origin[0], origin[1] - distance, origin[2]];
	                break;
	            case 'back':
	                camera = [origin[0], origin[1] + distance, origin[2]];
	                break;
	            case 'left':
	                camera = [origin[0] - distance, origin[1], origin[2]];
	                break;
	            case 'right':
	                camera = [origin[0] + distance, origin[1], origin[2]];
	                break;
	            default:
	                break;
	        }
	        //use look-at function to set up camera and target
	        glMatrix.mat4.lookAt(this._mvMatrix, camera, origin, heading);
	    };
	    xViewer.prototype._error = function (msg) {
	        /**
	        * Occurs when viewer encounters error. You should listen to this because it might also report asynchronous errors which you would miss otherwise.
	        *
	        * @event xViewer#error
	        * @type {object}
	        * @param {string} message - Error message
	        */
	        this._fire('error', { message: msg });
	    };
	    //this renders the colour coded model into the memory buffer
	    //not to the canvas and use it to identify ID of the object from that
	    xViewer.prototype._getID = function (x, y) {
	        //call all before-drawId plugins
	        this._plugins.forEach(function (plugin) {
	            if (!plugin.onBeforeDrawId) {
	                return;
	            }
	            plugin.onBeforeDrawId();
	        }, this);
	        //it is not necessary to render the image in full resolution so this factor is used for less resolution. 
	        var factor = 2;
	        var gl = this._gl;
	        var width = this._width / factor;
	        var height = this._height / factor;
	        x = x / factor;
	        y = y / factor;
	        //create framebuffer
	        var frameBuffer = gl.createFramebuffer();
	        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
	        // create renderbuffer
	        var renderBuffer = gl.createRenderbuffer();
	        gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer);
	        // allocate renderbuffer
	        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
	        var texture = gl.createTexture();
	        gl.activeTexture(gl.TEXTURE0);
	        gl.bindTexture(gl.TEXTURE_2D, texture);
	        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	        // Set the parameters so we can render any image size.        
	        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	        // attach renderbuffer and texture
	        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderBuffer);
	        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
	        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
	            this._error('this combination of attachments does not work');
	            return null;
	        }
	        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
	        gl.viewport(0, 0, width, height);
	        gl.enable(gl.DEPTH_TEST); //we don't use any kind of blending or transparency
	        gl.disable(gl.BLEND);
	        gl.clearColor(0, 0, 0, 0); //zero colour for no-values
	        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	        //set uniform for colour coding
	        gl.uniform1i(this._colorCodingUniformPointer, 1);
	        //render colour coded image using latest buffered data
	        this._handles.forEach(function (handle) {
	            if (!handle.stopped) {
	                handle.setActive(this._pointers);
	                handle.draw();
	            }
	        }, this);
	        //call all after-drawId plugins
	        this._plugins.forEach(function (plugin) {
	            if (!plugin.onAfterDrawId) {
	                return;
	            }
	            plugin.onAfterDrawId();
	        }, this);
	        //get colour in of the pixel
	        var result = new Uint8Array(4);
	        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, result);
	        //reset framebuffer to render into canvas again
	        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	        //free GPU memory
	        gl.deleteTexture(texture);
	        gl.deleteRenderbuffer(renderBuffer);
	        gl.deleteFramebuffer(frameBuffer);
	        //set back blending
	        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	        gl.enable(gl.BLEND);
	        //decode ID (bit shifting by multiplication)
	        var hasValue = result[3] != 0; //0 transparency is only for no-values
	        if (hasValue) {
	            var id = result[0] + result[1] * 256 + result[2] * 256 * 256;
	            var handled = false;
	            this._plugins.forEach(function (plugin) {
	                if (!plugin.onBeforeGetId) {
	                    return;
	                }
	                handled = handled || plugin.onBeforeGetId(id);
	            }, this);
	            if (!handled)
	                return id;
	            else
	                return null;
	        }
	        else {
	            return null;
	        }
	    };
	    /**
	    * Use this function to start animation of the model. If you start animation before geometry is loaded it will wait for content to render it.
	    * This function is bound to browser framerate of the screen so it will stop consuming any resources if you switch to another tab.
	    *
	    * @function xViewer#start
	    * @param {Number} id [optional] - Optional ID of the model to be stopped. You can get this ID from {@link xViewer#event:loaded loaded} event.
	    */
	    xViewer.prototype.start = function (id) {
	        if (typeof (id) !== 'undefined') {
	            var model = this._handles.filter(function (h) { return h.id === id; }).pop();
	            if (typeof (model) === 'undefined')
	                throw "Model doesn't exist.";
	            model.stopped = false;
	            this._numberOfActiveModels++;
	            return;
	        }
	        this._isRunning = true;
	        var viewer = this;
	        var lastTime = new Date();
	        var counter = 0;
	        function tick() {
	            counter++;
	            if (counter == 30) {
	                counter = 0;
	                var newTime = new Date();
	                var span = newTime.getTime() - lastTime.getTime();
	                lastTime = newTime;
	                var fps = 1000 / span * 30;
	                /**
	                * Occurs after every 30th frame in animation. Use this event if you want to report FPS to the user. It might also be interesting performance measure.
	                *
	                * @event xViewer#fps
	                * @type {Number}
	                */
	                viewer._fire('fps', Math.floor(fps));
	            }
	            if (viewer._isRunning) {
	                // requestAnimFrame is globally attached to the window by the webgl utils
	                window['requestAnimFrame'](tick);
	                viewer.draw();
	            }
	        }
	        tick();
	    };
	    /**
	    * Use this function to stop animation of the model. User will still be able to see the latest state of the model. You can
	    * switch animation of the model on again by calling {@link xViewer#start start()}.
	    *
	    * @function xViewer#stop
	    * @param {Number} id [optional] - Optional ID of the model to be stopped. You can get this ID from {@link xViewer#event:loaded loaded} event.
	    */
	    xViewer.prototype.stop = function (id) {
	        if (typeof (id) == 'undefined') {
	            this._isRunning = false;
	            return;
	        }
	        var model = this._handles.filter(function (h) { return h.id === id; }).pop();
	        if (typeof (model) === 'undefined')
	            throw "Model doesn't exist.";
	        model.stopped = true;
	        this._numberOfActiveModels--;
	    };
	    /**
	     * Use this method to register to events of the viewer like {@link xViewer#event:pick pick}, {@link xViewer#event:mouseDown mouseDown},
	     * {@link xViewer#event:loaded loaded} and others. You can define arbitrary number
	     * of event handlers for any event. You can remove handler by calling {@link xViewer#off off()} method.
	     *
	     * @function xViewer#on
	     * @param {String} eventName - Name of the event you would like to listen to.
	     * @param {Object} callback - Callback handler of the event which will consume arguments and perform any custom action.
	    */
	    xViewer.prototype.on = function (eventName, callback) {
	        var events = this._events;
	        if (!events[eventName]) {
	            events[eventName] = [];
	        }
	        events[eventName].push(callback);
	    };
	    /**
	    * Use this method to unregister handlers from events. You can add event handlers by calling the {@link xViewer#on on()} method.
	    *
	    * @function xViewer#off
	    * @param {String} eventName - Name of the event
	    * @param {Object} callback - Handler to be removed
	    */
	    xViewer.prototype.off = function (eventName, callback) {
	        var events = this._events;
	        var callbacks = events[eventName];
	        if (!callbacks) {
	            return;
	        }
	        var index = callbacks.indexOf(callback);
	        if (index >= 0) {
	            callbacks.splice(index, 1);
	        }
	    };
	    //executes all handlers bound to event name
	    xViewer.prototype._fire = function (eventName, args) {
	        var handlers = this._events[eventName];
	        if (!handlers) {
	            return;
	        }
	        //cal the callbacks
	        handlers.forEach(function (handler) {
	            handler(args);
	        }, this);
	    };
	    xViewer.prototype._disableTextSelection = function () {
	        //disable text selection
	        document.documentElement.style['-webkit-touch-callout'] = 'none';
	        document.documentElement.style['-webkit-user-select'] = 'none';
	        document.documentElement.style['-khtml-user-select'] = 'none';
	        document.documentElement.style['-moz-user-select'] = 'none';
	        document.documentElement.style['-ms-user-select'] = 'none';
	        document.documentElement.style['user-select'] = 'none';
	    };
	    xViewer.prototype._enableTextSelection = function () {
	        //enable text selection again
	        document.documentElement.style['-webkit-touch-callout'] = 'text';
	        document.documentElement.style['-webkit-user-select'] = 'text';
	        document.documentElement.style['-khtml-user-select'] = 'text';
	        document.documentElement.style['-moz-user-select'] = 'text';
	        document.documentElement.style['-ms-user-select'] = 'text';
	        document.documentElement.style['user-select'] = 'text';
	    };
	    xViewer.prototype._getSVGOverlay = function () {
	        //check support for SVG
	        if (!document.implementation
	            .hasFeature('http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1'))
	            return false;
	        var ns = 'http://www.w3.org/2000/svg';
	        function getOffsetRect(elem) {
	            var box = elem.getBoundingClientRect();
	            var body = document.body;
	            var docElem = document.documentElement;
	            var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
	            var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
	            var clientTop = docElem.clientTop || body.clientTop || 0;
	            var clientLeft = docElem.clientLeft || body.clientLeft || 0;
	            var clientBottom = docElem['clientBottom'] || body['clientBottom'] || 0;
	            var clientRight = docElem['clientRight'] || body['clientRight'] || 0;
	            var top = Math.round(box.top + scrollTop - clientTop);
	            var left = Math.round(box.left + scrollLeft - clientLeft);
	            var bottom = Math.round(box.top + scrollTop - clientBottom);
	            var right = Math.round(box.left + scrollLeft - clientRight);
	            return { top: top, left: left, width: right - left, height: bottom - top };
	        }
	        //create SVG overlay
	        var svg = document.createElementNS(ns, 'svg');
	        //document.body.appendChild(svg);
	        var cRect = getOffsetRect(this._canvas);
	        svg['style'].position = 'absolute';
	        svg['style'].top = cRect.top + 'px';
	        svg['style'].left = cRect.left + 'px';
	        svg['style']['z-index'] = 100;
	        svg.setAttribute('width', this._width.toString());
	        svg.setAttribute('height', this._height.toString());
	        return svg;
	    };
	    /**
	    * This method can be used to get parameter of the current clipping plane. If no clipping plane is active
	    * this returns [[0,0,0],[0,0,0]];
	    *
	    * @function xViewer#getClip
	    * @return  {Number[][]} Point and normal defining current clipping plane
	    */
	    xViewer.prototype.getClip = function () {
	        var cp = this.clippingPlane;
	        if (cp.every(function (e) { return e === 0; })) {
	            return [[0, 0, 0], [0, 0, 0]];
	        }
	        var normal = glMatrix.vec3.normalize([0.0, 0.0, 0.0], [cp[0], cp[1], cp[2]]);
	        //test if the last clipping point fits in the condition
	        var lp = this._lastClippingPoint;
	        var test = lp[0] * cp[0] + lp[1] * cp[1] + lp[2] * cp[2] + cp[3];
	        if (Math.abs(test) < 1e-5) {
	            return [lp, normal];
	        }
	        //find the point on the plane
	        var x = cp[0] !== 0 ? -1.0 * cp[3] / cp[0] : 0.0;
	        var y = cp[1] !== 0 ? -1.0 * cp[3] / cp[1] : 0.0;
	        var z = cp[2] !== 0 ? -1.0 * cp[3] / cp[2] : 0.0;
	        return [[x, y, z], normal];
	    };
	    /**
	    * Use this method to clip the model. If you call the function with no arguments interactive clipping will start. This is based on SVG overlay
	    * so SVG support is necessary for it. But as WebGL is more advanced technology than SVG it is sound assumption that it is present in the browser.
	    * Use {@link xViewer.check xViewer.check()} to make sure it is supported at the very beginning of using of xViewer. Use {@link xViewer#unclip unclip()} method to
	    * unset clipping plane.
	    *
	    * @function xViewer#clip
	    * @param {Number[]} [point] - point in clipping plane
	    * @param {Number[]} [normal] - normal pointing to the half space which will be hidden
	    * @fires xViewer#clipped
	    */
	    xViewer.prototype.clip = function (point, normal) {
	        //non interactive clipping, all information is there
	        if (typeof (point) != 'undefined' && typeof (normal) != 'undefined') {
	            this._lastClippingPoint = point;
	            //compute normal equation of the plane
	            var d = 0.0 - normal[0] * point[0] - normal[1] * point[1] - normal[2] * point[2];
	            //set clipping plane
	            this.clippingPlane = [normal[0], normal[1], normal[2], d];
	            /**
	            * Occurs when model is clipped. This event has empty object.
	            *
	            * @event xViewer#clipped
	            * @type {object}
	            */
	            this._fire('clipped', {});
	            return;
	        }
	        //********************************************** Interactive clipping ********************************************//
	        var ns = 'http://www.w3.org/2000/svg';
	        var svg = this._getSVGOverlay();
	        var viewer = this;
	        var position = {};
	        var down = false;
	        var g = {};
	        var handleMouseDown = function (event) {
	            if (down)
	                return;
	            down = true;
	            viewer._disableTextSelection();
	            var r = svg.getBoundingClientRect();
	            position.x = event.clientX - r.left;
	            position.y = event.clientY - r.top;
	            position.angle = 0.0;
	            //create very long vertical line going through the point
	            g = document.createElementNS(ns, 'g');
	            g['setAttribute']('id', 'section');
	            svg.appendChild(g);
	            var line = document.createElementNS(ns, 'line');
	            g['appendChild'](line);
	            line.setAttribute('style', 'stroke:rgb(255,0,0);stroke-width:2');
	            line.setAttribute('x1', position.x.toString());
	            line.setAttribute('y1', '99999');
	            line.setAttribute('x2', position.x.toString());
	            line.setAttribute('y2', '-99999');
	        };
	        var handleMouseUp = function (event) {
	            if (!down)
	                return;
	            //check if the points are not identical. 
	            var r = svg.getBoundingClientRect();
	            if (position.x == event.clientX - r.left && position.y == event.clientY - r.top) {
	                return;
	            }
	            down = false;
	            viewer._enableTextSelection();
	            //get inverse transformation
	            var transform = glMatrix.mat4.create();
	            glMatrix.mat4.multiply(transform, viewer._pMatrix, viewer._mvMatrix);
	            var inverse = glMatrix.mat4.create();
	            glMatrix.mat4.invert(inverse, transform);
	            //get normalized coordinates the point in WebGL CS
	            var x1 = position.x / (viewer._width / 2.0) - 1.0;
	            var y1 = 1.0 - position.y / (viewer._height / 2.0);
	            //First point in WCS
	            var A = glMatrix.vec3.create();
	            glMatrix.vec3.transformMat4(A, [x1, y1, -1], inverse); //near clipping plane
	            //Second point in WCS
	            var B = glMatrix.vec3.create();
	            glMatrix.vec3.transformMat4(B, [x1, y1, 1], inverse); //far clipping plane
	            //Compute third point on plane
	            var angle = position.angle * Math.PI / 180.0;
	            var x2 = x1 + Math.cos(angle);
	            var y2 = y1 + Math.sin(angle);
	            //Third point in WCS
	            var C = glMatrix.vec3.create();
	            glMatrix.vec3.transformMat4(C, [x2, y2, 1], inverse); // far clipping plane
	            //Compute normal in WCS
	            var BA = glMatrix.vec3.subtract(glMatrix.vec3.create(), A, B);
	            var BC = glMatrix.vec3.subtract(glMatrix.vec3.create(), C, B);
	            var N = glMatrix.vec3.cross(glMatrix.vec3.create(), BA, BC);
	            viewer.clip(B, N);
	            //clean
	            svg.parentNode.removeChild(svg);
	            svg.removeEventListener('mousedown', handleMouseDown, true);
	            window.removeEventListener('mouseup', handleMouseUp, true);
	            window.removeEventListener('mousemove', handleMouseMove, true);
	        };
	        var handleMouseMove = function (event) {
	            if (!down)
	                return;
	            var r = svg.getBoundingClientRect();
	            var x = event.clientX - r.left;
	            var y = event.clientY - r.top;
	            //rotate
	            var dX = x - position.x;
	            var dY = y - position.y;
	            var angle = Math.atan2(dX, dY) * -180.0 / Math.PI + 90.0;
	            //round to 5 DEG
	            angle = Math.round(angle / 5.0) * 5.0;
	            position.angle = 360.0 - angle + 90;
	            g['setAttribute']('transform', 'rotate(' + angle + ' ' + position.x + ' ' + position.y + ')');
	        };
	        //this._canvas.parentNode.appendChild(svg);
	        document.documentElement.appendChild(svg);
	        svg.addEventListener('mousedown', handleMouseDown, true);
	        window.addEventListener('mouseup', handleMouseUp, true);
	        window.addEventListener('mousemove', handleMouseMove, true);
	        this.stopClipping = function () {
	            svg.parentNode.removeChild(svg);
	            svg.removeEventListener('mousedown', handleMouseDown, true);
	            window.removeEventListener('mouseup', handleMouseUp, true);
	            window.removeEventListener('mousemove', handleMouseMove, true);
	            //clear also itself
	            viewer.stopClipping = function () { };
	        };
	    };
	    /**
	    * This method is only active when interactive clipping is active. It stops interactive clipping operation.
	    *
	    * @function xViewer#stopClipping
	    */
	    //this is only a placeholder. It is actually created only when interactive clipping is active.
	    xViewer.prototype.stopClipping = function () { };
	    /**
	    * This method will cancel any clipping plane if it is defined. Use {@link xViewer#clip clip()}
	    * method to define clipping by point and normal of the plane or interactively if you call it with no arguments.
	    * @function xViewer#unclip
	    * @fires xViewer#unclipped
	    */
	    xViewer.prototype.unclip = function () {
	        this.clippingPlane = [0, 0, 0, 0];
	        /**
	          * Occurs when clipping of the model is dismissed. This event has empty object.
	          *
	          * @event xViewer#unclipped
	          * @type {object}
	          */
	        this._fire('unclipped', {});
	    };
	    return xViewer;
	}());
	exports.xViewer = xViewer;


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview gl-matrix - High performance matrix and vector operations
	 * @author Brandon Jones
	 * @author Colin MacKenzie IV
	 * @version 2.2.2
	 */
	
	/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.
	
	Redistribution and use in source and binary forms, with or without modification,
	are permitted provided that the following conditions are met:
	
	  * Redistributions of source code must retain the above copyright notice, this
	    list of conditions and the following disclaimer.
	  * Redistributions in binary form must reproduce the above copyright notice,
	    this list of conditions and the following disclaimer in the documentation
	    and/or other materials provided with the distribution.
	
	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
	ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
	WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
	DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
	ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
	ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
	SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */
	
	
	(function(_global) {
	  "use strict";
	
	  var shim = {};
	  if (false) {
	    if(typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
	      shim.exports = {};
	      define(function() {
	        return shim.exports;
	      });
	    } else {
	      // gl-matrix lives in a browser, define its namespaces in global
	      shim.exports = typeof(window) !== 'undefined' ? window : _global;
	    }
	  }
	  else {
	    // gl-matrix lives in commonjs, define its namespaces in exports
	    shim.exports = exports;
	  }
	
	  (function(exports) {
	    /* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.
	
	Redistribution and use in source and binary forms, with or without modification,
	are permitted provided that the following conditions are met:
	
	  * Redistributions of source code must retain the above copyright notice, this
	    list of conditions and the following disclaimer.
	  * Redistributions in binary form must reproduce the above copyright notice,
	    this list of conditions and the following disclaimer in the documentation 
	    and/or other materials provided with the distribution.
	
	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
	ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
	WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
	DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
	ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
	ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
	SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */
	
	
	if(!GLMAT_EPSILON) {
	    var GLMAT_EPSILON = 0.000001;
	}
	
	if(!GLMAT_ARRAY_TYPE) {
	    var GLMAT_ARRAY_TYPE = (typeof Float32Array !== 'undefined') ? Float32Array : Array;
	}
	
	if(!GLMAT_RANDOM) {
	    var GLMAT_RANDOM = Math.random;
	}
	
	/**
	 * @class Common utilities
	 * @name glMatrix
	 */
	var glMatrix = {};
	
	/**
	 * Sets the type of array used when creating new vectors and matrices
	 *
	 * @param {Type} type Array type, such as Float32Array or Array
	 */
	glMatrix.setMatrixArrayType = function(type) {
	    GLMAT_ARRAY_TYPE = type;
	}
	
	if(typeof(exports) !== 'undefined') {
	    exports.glMatrix = glMatrix;
	}
	
	var degree = Math.PI / 180;
	
	/**
	* Convert Degree To Radian
	*
	* @param {Number} Angle in Degrees
	*/
	glMatrix.toRadian = function(a){
	     return a * degree;
	}
	;
	/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.
	
	Redistribution and use in source and binary forms, with or without modification,
	are permitted provided that the following conditions are met:
	
	  * Redistributions of source code must retain the above copyright notice, this
	    list of conditions and the following disclaimer.
	  * Redistributions in binary form must reproduce the above copyright notice,
	    this list of conditions and the following disclaimer in the documentation 
	    and/or other materials provided with the distribution.
	
	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
	ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
	WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
	DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
	ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
	ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
	SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */
	
	/**
	 * @class 2 Dimensional Vector
	 * @name vec2
	 */
	
	var vec2 = {};
	
	/**
	 * Creates a new, empty vec2
	 *
	 * @returns {vec2} a new 2D vector
	 */
	vec2.create = function() {
	    var out = new GLMAT_ARRAY_TYPE(2);
	    out[0] = 0;
	    out[1] = 0;
	    return out;
	};
	
	/**
	 * Creates a new vec2 initialized with values from an existing vector
	 *
	 * @param {vec2} a vector to clone
	 * @returns {vec2} a new 2D vector
	 */
	vec2.clone = function(a) {
	    var out = new GLMAT_ARRAY_TYPE(2);
	    out[0] = a[0];
	    out[1] = a[1];
	    return out;
	};
	
	/**
	 * Creates a new vec2 initialized with the given values
	 *
	 * @param {Number} x X component
	 * @param {Number} y Y component
	 * @returns {vec2} a new 2D vector
	 */
	vec2.fromValues = function(x, y) {
	    var out = new GLMAT_ARRAY_TYPE(2);
	    out[0] = x;
	    out[1] = y;
	    return out;
	};
	
	/**
	 * Copy the values from one vec2 to another
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the source vector
	 * @returns {vec2} out
	 */
	vec2.copy = function(out, a) {
	    out[0] = a[0];
	    out[1] = a[1];
	    return out;
	};
	
	/**
	 * Set the components of a vec2 to the given values
	 *
	 * @param {vec2} out the receiving vector
	 * @param {Number} x X component
	 * @param {Number} y Y component
	 * @returns {vec2} out
	 */
	vec2.set = function(out, x, y) {
	    out[0] = x;
	    out[1] = y;
	    return out;
	};
	
	/**
	 * Adds two vec2's
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @returns {vec2} out
	 */
	vec2.add = function(out, a, b) {
	    out[0] = a[0] + b[0];
	    out[1] = a[1] + b[1];
	    return out;
	};
	
	/**
	 * Subtracts vector b from vector a
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @returns {vec2} out
	 */
	vec2.subtract = function(out, a, b) {
	    out[0] = a[0] - b[0];
	    out[1] = a[1] - b[1];
	    return out;
	};
	
	/**
	 * Alias for {@link vec2.subtract}
	 * @function
	 */
	vec2.sub = vec2.subtract;
	
	/**
	 * Multiplies two vec2's
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @returns {vec2} out
	 */
	vec2.multiply = function(out, a, b) {
	    out[0] = a[0] * b[0];
	    out[1] = a[1] * b[1];
	    return out;
	};
	
	/**
	 * Alias for {@link vec2.multiply}
	 * @function
	 */
	vec2.mul = vec2.multiply;
	
	/**
	 * Divides two vec2's
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @returns {vec2} out
	 */
	vec2.divide = function(out, a, b) {
	    out[0] = a[0] / b[0];
	    out[1] = a[1] / b[1];
	    return out;
	};
	
	/**
	 * Alias for {@link vec2.divide}
	 * @function
	 */
	vec2.div = vec2.divide;
	
	/**
	 * Returns the minimum of two vec2's
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @returns {vec2} out
	 */
	vec2.min = function(out, a, b) {
	    out[0] = Math.min(a[0], b[0]);
	    out[1] = Math.min(a[1], b[1]);
	    return out;
	};
	
	/**
	 * Returns the maximum of two vec2's
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @returns {vec2} out
	 */
	vec2.max = function(out, a, b) {
	    out[0] = Math.max(a[0], b[0]);
	    out[1] = Math.max(a[1], b[1]);
	    return out;
	};
	
	/**
	 * Scales a vec2 by a scalar number
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the vector to scale
	 * @param {Number} b amount to scale the vector by
	 * @returns {vec2} out
	 */
	vec2.scale = function(out, a, b) {
	    out[0] = a[0] * b;
	    out[1] = a[1] * b;
	    return out;
	};
	
	/**
	 * Adds two vec2's after scaling the second operand by a scalar value
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @param {Number} scale the amount to scale b by before adding
	 * @returns {vec2} out
	 */
	vec2.scaleAndAdd = function(out, a, b, scale) {
	    out[0] = a[0] + (b[0] * scale);
	    out[1] = a[1] + (b[1] * scale);
	    return out;
	};
	
	/**
	 * Calculates the euclidian distance between two vec2's
	 *
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @returns {Number} distance between a and b
	 */
	vec2.distance = function(a, b) {
	    var x = b[0] - a[0],
	        y = b[1] - a[1];
	    return Math.sqrt(x*x + y*y);
	};
	
	/**
	 * Alias for {@link vec2.distance}
	 * @function
	 */
	vec2.dist = vec2.distance;
	
	/**
	 * Calculates the squared euclidian distance between two vec2's
	 *
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @returns {Number} squared distance between a and b
	 */
	vec2.squaredDistance = function(a, b) {
	    var x = b[0] - a[0],
	        y = b[1] - a[1];
	    return x*x + y*y;
	};
	
	/**
	 * Alias for {@link vec2.squaredDistance}
	 * @function
	 */
	vec2.sqrDist = vec2.squaredDistance;
	
	/**
	 * Calculates the length of a vec2
	 *
	 * @param {vec2} a vector to calculate length of
	 * @returns {Number} length of a
	 */
	vec2.length = function (a) {
	    var x = a[0],
	        y = a[1];
	    return Math.sqrt(x*x + y*y);
	};
	
	/**
	 * Alias for {@link vec2.length}
	 * @function
	 */
	vec2.len = vec2.length;
	
	/**
	 * Calculates the squared length of a vec2
	 *
	 * @param {vec2} a vector to calculate squared length of
	 * @returns {Number} squared length of a
	 */
	vec2.squaredLength = function (a) {
	    var x = a[0],
	        y = a[1];
	    return x*x + y*y;
	};
	
	/**
	 * Alias for {@link vec2.squaredLength}
	 * @function
	 */
	vec2.sqrLen = vec2.squaredLength;
	
	/**
	 * Negates the components of a vec2
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a vector to negate
	 * @returns {vec2} out
	 */
	vec2.negate = function(out, a) {
	    out[0] = -a[0];
	    out[1] = -a[1];
	    return out;
	};
	
	/**
	 * Returns the inverse of the components of a vec2
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a vector to invert
	 * @returns {vec2} out
	 */
	vec2.inverse = function(out, a) {
	  out[0] = 1.0 / a[0];
	  out[1] = 1.0 / a[1];
	  return out;
	};
	
	/**
	 * Normalize a vec2
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a vector to normalize
	 * @returns {vec2} out
	 */
	vec2.normalize = function(out, a) {
	    var x = a[0],
	        y = a[1];
	    var len = x*x + y*y;
	    if (len > 0) {
	        //TODO: evaluate use of glm_invsqrt here?
	        len = 1 / Math.sqrt(len);
	        out[0] = a[0] * len;
	        out[1] = a[1] * len;
	    }
	    return out;
	};
	
	/**
	 * Calculates the dot product of two vec2's
	 *
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @returns {Number} dot product of a and b
	 */
	vec2.dot = function (a, b) {
	    return a[0] * b[0] + a[1] * b[1];
	};
	
	/**
	 * Computes the cross product of two vec2's
	 * Note that the cross product must by definition produce a 3D vector
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @returns {vec3} out
	 */
	vec2.cross = function(out, a, b) {
	    var z = a[0] * b[1] - a[1] * b[0];
	    out[0] = out[1] = 0;
	    out[2] = z;
	    return out;
	};
	
	/**
	 * Performs a linear interpolation between two vec2's
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @param {Number} t interpolation amount between the two inputs
	 * @returns {vec2} out
	 */
	vec2.lerp = function (out, a, b, t) {
	    var ax = a[0],
	        ay = a[1];
	    out[0] = ax + t * (b[0] - ax);
	    out[1] = ay + t * (b[1] - ay);
	    return out;
	};
	
	/**
	 * Generates a random vector with the given scale
	 *
	 * @param {vec2} out the receiving vector
	 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
	 * @returns {vec2} out
	 */
	vec2.random = function (out, scale) {
	    scale = scale || 1.0;
	    var r = GLMAT_RANDOM() * 2.0 * Math.PI;
	    out[0] = Math.cos(r) * scale;
	    out[1] = Math.sin(r) * scale;
	    return out;
	};
	
	/**
	 * Transforms the vec2 with a mat2
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the vector to transform
	 * @param {mat2} m matrix to transform with
	 * @returns {vec2} out
	 */
	vec2.transformMat2 = function(out, a, m) {
	    var x = a[0],
	        y = a[1];
	    out[0] = m[0] * x + m[2] * y;
	    out[1] = m[1] * x + m[3] * y;
	    return out;
	};
	
	/**
	 * Transforms the vec2 with a mat2d
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the vector to transform
	 * @param {mat2d} m matrix to transform with
	 * @returns {vec2} out
	 */
	vec2.transformMat2d = function(out, a, m) {
	    var x = a[0],
	        y = a[1];
	    out[0] = m[0] * x + m[2] * y + m[4];
	    out[1] = m[1] * x + m[3] * y + m[5];
	    return out;
	};
	
	/**
	 * Transforms the vec2 with a mat3
	 * 3rd vector component is implicitly '1'
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the vector to transform
	 * @param {mat3} m matrix to transform with
	 * @returns {vec2} out
	 */
	vec2.transformMat3 = function(out, a, m) {
	    var x = a[0],
	        y = a[1];
	    out[0] = m[0] * x + m[3] * y + m[6];
	    out[1] = m[1] * x + m[4] * y + m[7];
	    return out;
	};
	
	/**
	 * Transforms the vec2 with a mat4
	 * 3rd vector component is implicitly '0'
	 * 4th vector component is implicitly '1'
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the vector to transform
	 * @param {mat4} m matrix to transform with
	 * @returns {vec2} out
	 */
	vec2.transformMat4 = function(out, a, m) {
	    var x = a[0], 
	        y = a[1];
	    out[0] = m[0] * x + m[4] * y + m[12];
	    out[1] = m[1] * x + m[5] * y + m[13];
	    return out;
	};
	
	/**
	 * Perform some operation over an array of vec2s.
	 *
	 * @param {Array} a the array of vectors to iterate over
	 * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
	 * @param {Number} offset Number of elements to skip at the beginning of the array
	 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
	 * @param {Function} fn Function to call for each vector in the array
	 * @param {Object} [arg] additional argument to pass to fn
	 * @returns {Array} a
	 * @function
	 */
	vec2.forEach = (function() {
	    var vec = vec2.create();
	
	    return function(a, stride, offset, count, fn, arg) {
	        var i, l;
	        if(!stride) {
	            stride = 2;
	        }
	
	        if(!offset) {
	            offset = 0;
	        }
	        
	        if(count) {
	            l = Math.min((count * stride) + offset, a.length);
	        } else {
	            l = a.length;
	        }
	
	        for(i = offset; i < l; i += stride) {
	            vec[0] = a[i]; vec[1] = a[i+1];
	            fn(vec, vec, arg);
	            a[i] = vec[0]; a[i+1] = vec[1];
	        }
	        
	        return a;
	    };
	})();
	
	/**
	 * Returns a string representation of a vector
	 *
	 * @param {vec2} vec vector to represent as a string
	 * @returns {String} string representation of the vector
	 */
	vec2.str = function (a) {
	    return 'vec2(' + a[0] + ', ' + a[1] + ')';
	};
	
	if(typeof(exports) !== 'undefined') {
	    exports.vec2 = vec2;
	}
	;
	/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.
	
	Redistribution and use in source and binary forms, with or without modification,
	are permitted provided that the following conditions are met:
	
	  * Redistributions of source code must retain the above copyright notice, this
	    list of conditions and the following disclaimer.
	  * Redistributions in binary form must reproduce the above copyright notice,
	    this list of conditions and the following disclaimer in the documentation 
	    and/or other materials provided with the distribution.
	
	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
	ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
	WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
	DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
	ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
	ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
	SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */
	
	/**
	 * @class 3 Dimensional Vector
	 * @name vec3
	 */
	
	var vec3 = {};
	
	/**
	 * Creates a new, empty vec3
	 *
	 * @returns {vec3} a new 3D vector
	 */
	vec3.create = function() {
	    var out = new GLMAT_ARRAY_TYPE(3);
	    out[0] = 0;
	    out[1] = 0;
	    out[2] = 0;
	    return out;
	};
	
	/**
	 * Creates a new vec3 initialized with values from an existing vector
	 *
	 * @param {vec3} a vector to clone
	 * @returns {vec3} a new 3D vector
	 */
	vec3.clone = function(a) {
	    var out = new GLMAT_ARRAY_TYPE(3);
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    return out;
	};
	
	/**
	 * Creates a new vec3 initialized with the given values
	 *
	 * @param {Number} x X component
	 * @param {Number} y Y component
	 * @param {Number} z Z component
	 * @returns {vec3} a new 3D vector
	 */
	vec3.fromValues = function(x, y, z) {
	    var out = new GLMAT_ARRAY_TYPE(3);
	    out[0] = x;
	    out[1] = y;
	    out[2] = z;
	    return out;
	};
	
	/**
	 * Copy the values from one vec3 to another
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the source vector
	 * @returns {vec3} out
	 */
	vec3.copy = function(out, a) {
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    return out;
	};
	
	/**
	 * Set the components of a vec3 to the given values
	 *
	 * @param {vec3} out the receiving vector
	 * @param {Number} x X component
	 * @param {Number} y Y component
	 * @param {Number} z Z component
	 * @returns {vec3} out
	 */
	vec3.set = function(out, x, y, z) {
	    out[0] = x;
	    out[1] = y;
	    out[2] = z;
	    return out;
	};
	
	/**
	 * Adds two vec3's
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {vec3} out
	 */
	vec3.add = function(out, a, b) {
	    out[0] = a[0] + b[0];
	    out[1] = a[1] + b[1];
	    out[2] = a[2] + b[2];
	    return out;
	};
	
	/**
	 * Subtracts vector b from vector a
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {vec3} out
	 */
	vec3.subtract = function(out, a, b) {
	    out[0] = a[0] - b[0];
	    out[1] = a[1] - b[1];
	    out[2] = a[2] - b[2];
	    return out;
	};
	
	/**
	 * Alias for {@link vec3.subtract}
	 * @function
	 */
	vec3.sub = vec3.subtract;
	
	/**
	 * Multiplies two vec3's
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {vec3} out
	 */
	vec3.multiply = function(out, a, b) {
	    out[0] = a[0] * b[0];
	    out[1] = a[1] * b[1];
	    out[2] = a[2] * b[2];
	    return out;
	};
	
	/**
	 * Alias for {@link vec3.multiply}
	 * @function
	 */
	vec3.mul = vec3.multiply;
	
	/**
	 * Divides two vec3's
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {vec3} out
	 */
	vec3.divide = function(out, a, b) {
	    out[0] = a[0] / b[0];
	    out[1] = a[1] / b[1];
	    out[2] = a[2] / b[2];
	    return out;
	};
	
	/**
	 * Alias for {@link vec3.divide}
	 * @function
	 */
	vec3.div = vec3.divide;
	
	/**
	 * Returns the minimum of two vec3's
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {vec3} out
	 */
	vec3.min = function(out, a, b) {
	    out[0] = Math.min(a[0], b[0]);
	    out[1] = Math.min(a[1], b[1]);
	    out[2] = Math.min(a[2], b[2]);
	    return out;
	};
	
	/**
	 * Returns the maximum of two vec3's
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {vec3} out
	 */
	vec3.max = function(out, a, b) {
	    out[0] = Math.max(a[0], b[0]);
	    out[1] = Math.max(a[1], b[1]);
	    out[2] = Math.max(a[2], b[2]);
	    return out;
	};
	
	/**
	 * Scales a vec3 by a scalar number
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the vector to scale
	 * @param {Number} b amount to scale the vector by
	 * @returns {vec3} out
	 */
	vec3.scale = function(out, a, b) {
	    out[0] = a[0] * b;
	    out[1] = a[1] * b;
	    out[2] = a[2] * b;
	    return out;
	};
	
	/**
	 * Adds two vec3's after scaling the second operand by a scalar value
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @param {Number} scale the amount to scale b by before adding
	 * @returns {vec3} out
	 */
	vec3.scaleAndAdd = function(out, a, b, scale) {
	    out[0] = a[0] + (b[0] * scale);
	    out[1] = a[1] + (b[1] * scale);
	    out[2] = a[2] + (b[2] * scale);
	    return out;
	};
	
	/**
	 * Calculates the euclidian distance between two vec3's
	 *
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {Number} distance between a and b
	 */
	vec3.distance = function(a, b) {
	    var x = b[0] - a[0],
	        y = b[1] - a[1],
	        z = b[2] - a[2];
	    return Math.sqrt(x*x + y*y + z*z);
	};
	
	/**
	 * Alias for {@link vec3.distance}
	 * @function
	 */
	vec3.dist = vec3.distance;
	
	/**
	 * Calculates the squared euclidian distance between two vec3's
	 *
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {Number} squared distance between a and b
	 */
	vec3.squaredDistance = function(a, b) {
	    var x = b[0] - a[0],
	        y = b[1] - a[1],
	        z = b[2] - a[2];
	    return x*x + y*y + z*z;
	};
	
	/**
	 * Alias for {@link vec3.squaredDistance}
	 * @function
	 */
	vec3.sqrDist = vec3.squaredDistance;
	
	/**
	 * Calculates the length of a vec3
	 *
	 * @param {vec3} a vector to calculate length of
	 * @returns {Number} length of a
	 */
	vec3.length = function (a) {
	    var x = a[0],
	        y = a[1],
	        z = a[2];
	    return Math.sqrt(x*x + y*y + z*z);
	};
	
	/**
	 * Alias for {@link vec3.length}
	 * @function
	 */
	vec3.len = vec3.length;
	
	/**
	 * Calculates the squared length of a vec3
	 *
	 * @param {vec3} a vector to calculate squared length of
	 * @returns {Number} squared length of a
	 */
	vec3.squaredLength = function (a) {
	    var x = a[0],
	        y = a[1],
	        z = a[2];
	    return x*x + y*y + z*z;
	};
	
	/**
	 * Alias for {@link vec3.squaredLength}
	 * @function
	 */
	vec3.sqrLen = vec3.squaredLength;
	
	/**
	 * Negates the components of a vec3
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a vector to negate
	 * @returns {vec3} out
	 */
	vec3.negate = function(out, a) {
	    out[0] = -a[0];
	    out[1] = -a[1];
	    out[2] = -a[2];
	    return out;
	};
	
	/**
	 * Returns the inverse of the components of a vec3
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a vector to invert
	 * @returns {vec3} out
	 */
	vec3.inverse = function(out, a) {
	  out[0] = 1.0 / a[0];
	  out[1] = 1.0 / a[1];
	  out[2] = 1.0 / a[2];
	  return out;
	};
	
	/**
	 * Normalize a vec3
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a vector to normalize
	 * @returns {vec3} out
	 */
	vec3.normalize = function(out, a) {
	    var x = a[0],
	        y = a[1],
	        z = a[2];
	    var len = x*x + y*y + z*z;
	    if (len > 0) {
	        //TODO: evaluate use of glm_invsqrt here?
	        len = 1 / Math.sqrt(len);
	        out[0] = a[0] * len;
	        out[1] = a[1] * len;
	        out[2] = a[2] * len;
	    }
	    return out;
	};
	
	/**
	 * Calculates the dot product of two vec3's
	 *
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {Number} dot product of a and b
	 */
	vec3.dot = function (a, b) {
	    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	};
	
	/**
	 * Computes the cross product of two vec3's
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {vec3} out
	 */
	vec3.cross = function(out, a, b) {
	    var ax = a[0], ay = a[1], az = a[2],
	        bx = b[0], by = b[1], bz = b[2];
	
	    out[0] = ay * bz - az * by;
	    out[1] = az * bx - ax * bz;
	    out[2] = ax * by - ay * bx;
	    return out;
	};
	
	/**
	 * Performs a linear interpolation between two vec3's
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @param {Number} t interpolation amount between the two inputs
	 * @returns {vec3} out
	 */
	vec3.lerp = function (out, a, b, t) {
	    var ax = a[0],
	        ay = a[1],
	        az = a[2];
	    out[0] = ax + t * (b[0] - ax);
	    out[1] = ay + t * (b[1] - ay);
	    out[2] = az + t * (b[2] - az);
	    return out;
	};
	
	/**
	 * Generates a random vector with the given scale
	 *
	 * @param {vec3} out the receiving vector
	 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
	 * @returns {vec3} out
	 */
	vec3.random = function (out, scale) {
	    scale = scale || 1.0;
	
	    var r = GLMAT_RANDOM() * 2.0 * Math.PI;
	    var z = (GLMAT_RANDOM() * 2.0) - 1.0;
	    var zScale = Math.sqrt(1.0-z*z) * scale;
	
	    out[0] = Math.cos(r) * zScale;
	    out[1] = Math.sin(r) * zScale;
	    out[2] = z * scale;
	    return out;
	};
	
	/**
	 * Transforms the vec3 with a mat4.
	 * 4th vector component is implicitly '1'
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the vector to transform
	 * @param {mat4} m matrix to transform with
	 * @returns {vec3} out
	 */
	vec3.transformMat4 = function(out, a, m) {
	    var x = a[0], y = a[1], z = a[2],
	        w = m[3] * x + m[7] * y + m[11] * z + m[15];
	    w = w || 1.0;
	    out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
	    out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
	    out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
	    return out;
	};
	
	/**
	 * Transforms the vec3 with a mat3.
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the vector to transform
	 * @param {mat4} m the 3x3 matrix to transform with
	 * @returns {vec3} out
	 */
	vec3.transformMat3 = function(out, a, m) {
	    var x = a[0], y = a[1], z = a[2];
	    out[0] = x * m[0] + y * m[3] + z * m[6];
	    out[1] = x * m[1] + y * m[4] + z * m[7];
	    out[2] = x * m[2] + y * m[5] + z * m[8];
	    return out;
	};
	
	/**
	 * Transforms the vec3 with a quat
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the vector to transform
	 * @param {quat} q quaternion to transform with
	 * @returns {vec3} out
	 */
	vec3.transformQuat = function(out, a, q) {
	    // benchmarks: http://jsperf.com/quaternion-transform-vec3-implementations
	
	    var x = a[0], y = a[1], z = a[2],
	        qx = q[0], qy = q[1], qz = q[2], qw = q[3],
	
	        // calculate quat * vec
	        ix = qw * x + qy * z - qz * y,
	        iy = qw * y + qz * x - qx * z,
	        iz = qw * z + qx * y - qy * x,
	        iw = -qx * x - qy * y - qz * z;
	
	    // calculate result * inverse quat
	    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
	    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
	    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
	    return out;
	};
	
	/**
	 * Rotate a 3D vector around the x-axis
	 * @param {vec3} out The receiving vec3
	 * @param {vec3} a The vec3 point to rotate
	 * @param {vec3} b The origin of the rotation
	 * @param {Number} c The angle of rotation
	 * @returns {vec3} out
	 */
	vec3.rotateX = function(out, a, b, c){
	   var p = [], r=[];
		  //Translate point to the origin
		  p[0] = a[0] - b[0];
		  p[1] = a[1] - b[1];
	  	p[2] = a[2] - b[2];
	
		  //perform rotation
		  r[0] = p[0];
		  r[1] = p[1]*Math.cos(c) - p[2]*Math.sin(c);
		  r[2] = p[1]*Math.sin(c) + p[2]*Math.cos(c);
	
		  //translate to correct position
		  out[0] = r[0] + b[0];
		  out[1] = r[1] + b[1];
		  out[2] = r[2] + b[2];
	
	  	return out;
	};
	
	/**
	 * Rotate a 3D vector around the y-axis
	 * @param {vec3} out The receiving vec3
	 * @param {vec3} a The vec3 point to rotate
	 * @param {vec3} b The origin of the rotation
	 * @param {Number} c The angle of rotation
	 * @returns {vec3} out
	 */
	vec3.rotateY = function(out, a, b, c){
	  	var p = [], r=[];
	  	//Translate point to the origin
	  	p[0] = a[0] - b[0];
	  	p[1] = a[1] - b[1];
	  	p[2] = a[2] - b[2];
	  
	  	//perform rotation
	  	r[0] = p[2]*Math.sin(c) + p[0]*Math.cos(c);
	  	r[1] = p[1];
	  	r[2] = p[2]*Math.cos(c) - p[0]*Math.sin(c);
	  
	  	//translate to correct position
	  	out[0] = r[0] + b[0];
	  	out[1] = r[1] + b[1];
	  	out[2] = r[2] + b[2];
	  
	  	return out;
	};
	
	/**
	 * Rotate a 3D vector around the z-axis
	 * @param {vec3} out The receiving vec3
	 * @param {vec3} a The vec3 point to rotate
	 * @param {vec3} b The origin of the rotation
	 * @param {Number} c The angle of rotation
	 * @returns {vec3} out
	 */
	vec3.rotateZ = function(out, a, b, c){
	  	var p = [], r=[];
	  	//Translate point to the origin
	  	p[0] = a[0] - b[0];
	  	p[1] = a[1] - b[1];
	  	p[2] = a[2] - b[2];
	  
	  	//perform rotation
	  	r[0] = p[0]*Math.cos(c) - p[1]*Math.sin(c);
	  	r[1] = p[0]*Math.sin(c) + p[1]*Math.cos(c);
	  	r[2] = p[2];
	  
	  	//translate to correct position
	  	out[0] = r[0] + b[0];
	  	out[1] = r[1] + b[1];
	  	out[2] = r[2] + b[2];
	  
	  	return out;
	};
	
	/**
	 * Perform some operation over an array of vec3s.
	 *
	 * @param {Array} a the array of vectors to iterate over
	 * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
	 * @param {Number} offset Number of elements to skip at the beginning of the array
	 * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
	 * @param {Function} fn Function to call for each vector in the array
	 * @param {Object} [arg] additional argument to pass to fn
	 * @returns {Array} a
	 * @function
	 */
	vec3.forEach = (function() {
	    var vec = vec3.create();
	
	    return function(a, stride, offset, count, fn, arg) {
	        var i, l;
	        if(!stride) {
	            stride = 3;
	        }
	
	        if(!offset) {
	            offset = 0;
	        }
	        
	        if(count) {
	            l = Math.min((count * stride) + offset, a.length);
	        } else {
	            l = a.length;
	        }
	
	        for(i = offset; i < l; i += stride) {
	            vec[0] = a[i]; vec[1] = a[i+1]; vec[2] = a[i+2];
	            fn(vec, vec, arg);
	            a[i] = vec[0]; a[i+1] = vec[1]; a[i+2] = vec[2];
	        }
	        
	        return a;
	    };
	})();
	
	/**
	 * Returns a string representation of a vector
	 *
	 * @param {vec3} vec vector to represent as a string
	 * @returns {String} string representation of the vector
	 */
	vec3.str = function (a) {
	    return 'vec3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ')';
	};
	
	if(typeof(exports) !== 'undefined') {
	    exports.vec3 = vec3;
	}
	;
	/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.
	
	Redistribution and use in source and binary forms, with or without modification,
	are permitted provided that the following conditions are met:
	
	  * Redistributions of source code must retain the above copyright notice, this
	    list of conditions and the following disclaimer.
	  * Redistributions in binary form must reproduce the above copyright notice,
	    this list of conditions and the following disclaimer in the documentation 
	    and/or other materials provided with the distribution.
	
	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
	ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
	WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
	DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
	ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
	ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
	SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */
	
	/**
	 * @class 4 Dimensional Vector
	 * @name vec4
	 */
	
	var vec4 = {};
	
	/**
	 * Creates a new, empty vec4
	 *
	 * @returns {vec4} a new 4D vector
	 */
	vec4.create = function() {
	    var out = new GLMAT_ARRAY_TYPE(4);
	    out[0] = 0;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    return out;
	};
	
	/**
	 * Creates a new vec4 initialized with values from an existing vector
	 *
	 * @param {vec4} a vector to clone
	 * @returns {vec4} a new 4D vector
	 */
	vec4.clone = function(a) {
	    var out = new GLMAT_ARRAY_TYPE(4);
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    return out;
	};
	
	/**
	 * Creates a new vec4 initialized with the given values
	 *
	 * @param {Number} x X component
	 * @param {Number} y Y component
	 * @param {Number} z Z component
	 * @param {Number} w W component
	 * @returns {vec4} a new 4D vector
	 */
	vec4.fromValues = function(x, y, z, w) {
	    var out = new GLMAT_ARRAY_TYPE(4);
	    out[0] = x;
	    out[1] = y;
	    out[2] = z;
	    out[3] = w;
	    return out;
	};
	
	/**
	 * Copy the values from one vec4 to another
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the source vector
	 * @returns {vec4} out
	 */
	vec4.copy = function(out, a) {
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    return out;
	};
	
	/**
	 * Set the components of a vec4 to the given values
	 *
	 * @param {vec4} out the receiving vector
	 * @param {Number} x X component
	 * @param {Number} y Y component
	 * @param {Number} z Z component
	 * @param {Number} w W component
	 * @returns {vec4} out
	 */
	vec4.set = function(out, x, y, z, w) {
	    out[0] = x;
	    out[1] = y;
	    out[2] = z;
	    out[3] = w;
	    return out;
	};
	
	/**
	 * Adds two vec4's
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the first operand
	 * @param {vec4} b the second operand
	 * @returns {vec4} out
	 */
	vec4.add = function(out, a, b) {
	    out[0] = a[0] + b[0];
	    out[1] = a[1] + b[1];
	    out[2] = a[2] + b[2];
	    out[3] = a[3] + b[3];
	    return out;
	};
	
	/**
	 * Subtracts vector b from vector a
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the first operand
	 * @param {vec4} b the second operand
	 * @returns {vec4} out
	 */
	vec4.subtract = function(out, a, b) {
	    out[0] = a[0] - b[0];
	    out[1] = a[1] - b[1];
	    out[2] = a[2] - b[2];
	    out[3] = a[3] - b[3];
	    return out;
	};
	
	/**
	 * Alias for {@link vec4.subtract}
	 * @function
	 */
	vec4.sub = vec4.subtract;
	
	/**
	 * Multiplies two vec4's
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the first operand
	 * @param {vec4} b the second operand
	 * @returns {vec4} out
	 */
	vec4.multiply = function(out, a, b) {
	    out[0] = a[0] * b[0];
	    out[1] = a[1] * b[1];
	    out[2] = a[2] * b[2];
	    out[3] = a[3] * b[3];
	    return out;
	};
	
	/**
	 * Alias for {@link vec4.multiply}
	 * @function
	 */
	vec4.mul = vec4.multiply;
	
	/**
	 * Divides two vec4's
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the first operand
	 * @param {vec4} b the second operand
	 * @returns {vec4} out
	 */
	vec4.divide = function(out, a, b) {
	    out[0] = a[0] / b[0];
	    out[1] = a[1] / b[1];
	    out[2] = a[2] / b[2];
	    out[3] = a[3] / b[3];
	    return out;
	};
	
	/**
	 * Alias for {@link vec4.divide}
	 * @function
	 */
	vec4.div = vec4.divide;
	
	/**
	 * Returns the minimum of two vec4's
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the first operand
	 * @param {vec4} b the second operand
	 * @returns {vec4} out
	 */
	vec4.min = function(out, a, b) {
	    out[0] = Math.min(a[0], b[0]);
	    out[1] = Math.min(a[1], b[1]);
	    out[2] = Math.min(a[2], b[2]);
	    out[3] = Math.min(a[3], b[3]);
	    return out;
	};
	
	/**
	 * Returns the maximum of two vec4's
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the first operand
	 * @param {vec4} b the second operand
	 * @returns {vec4} out
	 */
	vec4.max = function(out, a, b) {
	    out[0] = Math.max(a[0], b[0]);
	    out[1] = Math.max(a[1], b[1]);
	    out[2] = Math.max(a[2], b[2]);
	    out[3] = Math.max(a[3], b[3]);
	    return out;
	};
	
	/**
	 * Scales a vec4 by a scalar number
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the vector to scale
	 * @param {Number} b amount to scale the vector by
	 * @returns {vec4} out
	 */
	vec4.scale = function(out, a, b) {
	    out[0] = a[0] * b;
	    out[1] = a[1] * b;
	    out[2] = a[2] * b;
	    out[3] = a[3] * b;
	    return out;
	};
	
	/**
	 * Adds two vec4's after scaling the second operand by a scalar value
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the first operand
	 * @param {vec4} b the second operand
	 * @param {Number} scale the amount to scale b by before adding
	 * @returns {vec4} out
	 */
	vec4.scaleAndAdd = function(out, a, b, scale) {
	    out[0] = a[0] + (b[0] * scale);
	    out[1] = a[1] + (b[1] * scale);
	    out[2] = a[2] + (b[2] * scale);
	    out[3] = a[3] + (b[3] * scale);
	    return out;
	};
	
	/**
	 * Calculates the euclidian distance between two vec4's
	 *
	 * @param {vec4} a the first operand
	 * @param {vec4} b the second operand
	 * @returns {Number} distance between a and b
	 */
	vec4.distance = function(a, b) {
	    var x = b[0] - a[0],
	        y = b[1] - a[1],
	        z = b[2] - a[2],
	        w = b[3] - a[3];
	    return Math.sqrt(x*x + y*y + z*z + w*w);
	};
	
	/**
	 * Alias for {@link vec4.distance}
	 * @function
	 */
	vec4.dist = vec4.distance;
	
	/**
	 * Calculates the squared euclidian distance between two vec4's
	 *
	 * @param {vec4} a the first operand
	 * @param {vec4} b the second operand
	 * @returns {Number} squared distance between a and b
	 */
	vec4.squaredDistance = function(a, b) {
	    var x = b[0] - a[0],
	        y = b[1] - a[1],
	        z = b[2] - a[2],
	        w = b[3] - a[3];
	    return x*x + y*y + z*z + w*w;
	};
	
	/**
	 * Alias for {@link vec4.squaredDistance}
	 * @function
	 */
	vec4.sqrDist = vec4.squaredDistance;
	
	/**
	 * Calculates the length of a vec4
	 *
	 * @param {vec4} a vector to calculate length of
	 * @returns {Number} length of a
	 */
	vec4.length = function (a) {
	    var x = a[0],
	        y = a[1],
	        z = a[2],
	        w = a[3];
	    return Math.sqrt(x*x + y*y + z*z + w*w);
	};
	
	/**
	 * Alias for {@link vec4.length}
	 * @function
	 */
	vec4.len = vec4.length;
	
	/**
	 * Calculates the squared length of a vec4
	 *
	 * @param {vec4} a vector to calculate squared length of
	 * @returns {Number} squared length of a
	 */
	vec4.squaredLength = function (a) {
	    var x = a[0],
	        y = a[1],
	        z = a[2],
	        w = a[3];
	    return x*x + y*y + z*z + w*w;
	};
	
	/**
	 * Alias for {@link vec4.squaredLength}
	 * @function
	 */
	vec4.sqrLen = vec4.squaredLength;
	
	/**
	 * Negates the components of a vec4
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a vector to negate
	 * @returns {vec4} out
	 */
	vec4.negate = function(out, a) {
	    out[0] = -a[0];
	    out[1] = -a[1];
	    out[2] = -a[2];
	    out[3] = -a[3];
	    return out;
	};
	
	/**
	 * Returns the inverse of the components of a vec4
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a vector to invert
	 * @returns {vec4} out
	 */
	vec4.inverse = function(out, a) {
	  out[0] = 1.0 / a[0];
	  out[1] = 1.0 / a[1];
	  out[2] = 1.0 / a[2];
	  out[3] = 1.0 / a[3];
	  return out;
	};
	
	/**
	 * Normalize a vec4
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a vector to normalize
	 * @returns {vec4} out
	 */
	vec4.normalize = function(out, a) {
	    var x = a[0],
	        y = a[1],
	        z = a[2],
	        w = a[3];
	    var len = x*x + y*y + z*z + w*w;
	    if (len > 0) {
	        len = 1 / Math.sqrt(len);
	        out[0] = a[0] * len;
	        out[1] = a[1] * len;
	        out[2] = a[2] * len;
	        out[3] = a[3] * len;
	    }
	    return out;
	};
	
	/**
	 * Calculates the dot product of two vec4's
	 *
	 * @param {vec4} a the first operand
	 * @param {vec4} b the second operand
	 * @returns {Number} dot product of a and b
	 */
	vec4.dot = function (a, b) {
	    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
	};
	
	/**
	 * Performs a linear interpolation between two vec4's
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the first operand
	 * @param {vec4} b the second operand
	 * @param {Number} t interpolation amount between the two inputs
	 * @returns {vec4} out
	 */
	vec4.lerp = function (out, a, b, t) {
	    var ax = a[0],
	        ay = a[1],
	        az = a[2],
	        aw = a[3];
	    out[0] = ax + t * (b[0] - ax);
	    out[1] = ay + t * (b[1] - ay);
	    out[2] = az + t * (b[2] - az);
	    out[3] = aw + t * (b[3] - aw);
	    return out;
	};
	
	/**
	 * Generates a random vector with the given scale
	 *
	 * @param {vec4} out the receiving vector
	 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
	 * @returns {vec4} out
	 */
	vec4.random = function (out, scale) {
	    scale = scale || 1.0;
	
	    //TODO: This is a pretty awful way of doing this. Find something better.
	    out[0] = GLMAT_RANDOM();
	    out[1] = GLMAT_RANDOM();
	    out[2] = GLMAT_RANDOM();
	    out[3] = GLMAT_RANDOM();
	    vec4.normalize(out, out);
	    vec4.scale(out, out, scale);
	    return out;
	};
	
	/**
	 * Transforms the vec4 with a mat4.
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the vector to transform
	 * @param {mat4} m matrix to transform with
	 * @returns {vec4} out
	 */
	vec4.transformMat4 = function(out, a, m) {
	    var x = a[0], y = a[1], z = a[2], w = a[3];
	    out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
	    out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
	    out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
	    out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
	    return out;
	};
	
	/**
	 * Transforms the vec4 with a quat
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the vector to transform
	 * @param {quat} q quaternion to transform with
	 * @returns {vec4} out
	 */
	vec4.transformQuat = function(out, a, q) {
	    var x = a[0], y = a[1], z = a[2],
	        qx = q[0], qy = q[1], qz = q[2], qw = q[3],
	
	        // calculate quat * vec
	        ix = qw * x + qy * z - qz * y,
	        iy = qw * y + qz * x - qx * z,
	        iz = qw * z + qx * y - qy * x,
	        iw = -qx * x - qy * y - qz * z;
	
	    // calculate result * inverse quat
	    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
	    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
	    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
	    return out;
	};
	
	/**
	 * Perform some operation over an array of vec4s.
	 *
	 * @param {Array} a the array of vectors to iterate over
	 * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
	 * @param {Number} offset Number of elements to skip at the beginning of the array
	 * @param {Number} count Number of vec4s to iterate over. If 0 iterates over entire array
	 * @param {Function} fn Function to call for each vector in the array
	 * @param {Object} [arg] additional argument to pass to fn
	 * @returns {Array} a
	 * @function
	 */
	vec4.forEach = (function() {
	    var vec = vec4.create();
	
	    return function(a, stride, offset, count, fn, arg) {
	        var i, l;
	        if(!stride) {
	            stride = 4;
	        }
	
	        if(!offset) {
	            offset = 0;
	        }
	        
	        if(count) {
	            l = Math.min((count * stride) + offset, a.length);
	        } else {
	            l = a.length;
	        }
	
	        for(i = offset; i < l; i += stride) {
	            vec[0] = a[i]; vec[1] = a[i+1]; vec[2] = a[i+2]; vec[3] = a[i+3];
	            fn(vec, vec, arg);
	            a[i] = vec[0]; a[i+1] = vec[1]; a[i+2] = vec[2]; a[i+3] = vec[3];
	        }
	        
	        return a;
	    };
	})();
	
	/**
	 * Returns a string representation of a vector
	 *
	 * @param {vec4} vec vector to represent as a string
	 * @returns {String} string representation of the vector
	 */
	vec4.str = function (a) {
	    return 'vec4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
	};
	
	if(typeof(exports) !== 'undefined') {
	    exports.vec4 = vec4;
	}
	;
	/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.
	
	Redistribution and use in source and binary forms, with or without modification,
	are permitted provided that the following conditions are met:
	
	  * Redistributions of source code must retain the above copyright notice, this
	    list of conditions and the following disclaimer.
	  * Redistributions in binary form must reproduce the above copyright notice,
	    this list of conditions and the following disclaimer in the documentation 
	    and/or other materials provided with the distribution.
	
	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
	ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
	WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
	DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
	ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
	ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
	SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */
	
	/**
	 * @class 2x2 Matrix
	 * @name mat2
	 */
	
	var mat2 = {};
	
	/**
	 * Creates a new identity mat2
	 *
	 * @returns {mat2} a new 2x2 matrix
	 */
	mat2.create = function() {
	    var out = new GLMAT_ARRAY_TYPE(4);
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 1;
	    return out;
	};
	
	/**
	 * Creates a new mat2 initialized with values from an existing matrix
	 *
	 * @param {mat2} a matrix to clone
	 * @returns {mat2} a new 2x2 matrix
	 */
	mat2.clone = function(a) {
	    var out = new GLMAT_ARRAY_TYPE(4);
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    return out;
	};
	
	/**
	 * Copy the values from one mat2 to another
	 *
	 * @param {mat2} out the receiving matrix
	 * @param {mat2} a the source matrix
	 * @returns {mat2} out
	 */
	mat2.copy = function(out, a) {
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    return out;
	};
	
	/**
	 * Set a mat2 to the identity matrix
	 *
	 * @param {mat2} out the receiving matrix
	 * @returns {mat2} out
	 */
	mat2.identity = function(out) {
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 1;
	    return out;
	};
	
	/**
	 * Transpose the values of a mat2
	 *
	 * @param {mat2} out the receiving matrix
	 * @param {mat2} a the source matrix
	 * @returns {mat2} out
	 */
	mat2.transpose = function(out, a) {
	    // If we are transposing ourselves we can skip a few steps but have to cache some values
	    if (out === a) {
	        var a1 = a[1];
	        out[1] = a[2];
	        out[2] = a1;
	    } else {
	        out[0] = a[0];
	        out[1] = a[2];
	        out[2] = a[1];
	        out[3] = a[3];
	    }
	    
	    return out;
	};
	
	/**
	 * Inverts a mat2
	 *
	 * @param {mat2} out the receiving matrix
	 * @param {mat2} a the source matrix
	 * @returns {mat2} out
	 */
	mat2.invert = function(out, a) {
	    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
	
	        // Calculate the determinant
	        det = a0 * a3 - a2 * a1;
	
	    if (!det) {
	        return null;
	    }
	    det = 1.0 / det;
	    
	    out[0] =  a3 * det;
	    out[1] = -a1 * det;
	    out[2] = -a2 * det;
	    out[3] =  a0 * det;
	
	    return out;
	};
	
	/**
	 * Calculates the adjugate of a mat2
	 *
	 * @param {mat2} out the receiving matrix
	 * @param {mat2} a the source matrix
	 * @returns {mat2} out
	 */
	mat2.adjoint = function(out, a) {
	    // Caching this value is nessecary if out == a
	    var a0 = a[0];
	    out[0] =  a[3];
	    out[1] = -a[1];
	    out[2] = -a[2];
	    out[3] =  a0;
	
	    return out;
	};
	
	/**
	 * Calculates the determinant of a mat2
	 *
	 * @param {mat2} a the source matrix
	 * @returns {Number} determinant of a
	 */
	mat2.determinant = function (a) {
	    return a[0] * a[3] - a[2] * a[1];
	};
	
	/**
	 * Multiplies two mat2's
	 *
	 * @param {mat2} out the receiving matrix
	 * @param {mat2} a the first operand
	 * @param {mat2} b the second operand
	 * @returns {mat2} out
	 */
	mat2.multiply = function (out, a, b) {
	    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
	    var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
	    out[0] = a0 * b0 + a2 * b1;
	    out[1] = a1 * b0 + a3 * b1;
	    out[2] = a0 * b2 + a2 * b3;
	    out[3] = a1 * b2 + a3 * b3;
	    return out;
	};
	
	/**
	 * Alias for {@link mat2.multiply}
	 * @function
	 */
	mat2.mul = mat2.multiply;
	
	/**
	 * Rotates a mat2 by the given angle
	 *
	 * @param {mat2} out the receiving matrix
	 * @param {mat2} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat2} out
	 */
	mat2.rotate = function (out, a, rad) {
	    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
	        s = Math.sin(rad),
	        c = Math.cos(rad);
	    out[0] = a0 *  c + a2 * s;
	    out[1] = a1 *  c + a3 * s;
	    out[2] = a0 * -s + a2 * c;
	    out[3] = a1 * -s + a3 * c;
	    return out;
	};
	
	/**
	 * Scales the mat2 by the dimensions in the given vec2
	 *
	 * @param {mat2} out the receiving matrix
	 * @param {mat2} a the matrix to rotate
	 * @param {vec2} v the vec2 to scale the matrix by
	 * @returns {mat2} out
	 **/
	mat2.scale = function(out, a, v) {
	    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
	        v0 = v[0], v1 = v[1];
	    out[0] = a0 * v0;
	    out[1] = a1 * v0;
	    out[2] = a2 * v1;
	    out[3] = a3 * v1;
	    return out;
	};
	
	/**
	 * Returns a string representation of a mat2
	 *
	 * @param {mat2} mat matrix to represent as a string
	 * @returns {String} string representation of the matrix
	 */
	mat2.str = function (a) {
	    return 'mat2(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
	};
	
	/**
	 * Returns Frobenius norm of a mat2
	 *
	 * @param {mat2} a the matrix to calculate Frobenius norm of
	 * @returns {Number} Frobenius norm
	 */
	mat2.frob = function (a) {
	    return(Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2)))
	};
	
	/**
	 * Returns L, D and U matrices (Lower triangular, Diagonal and Upper triangular) by factorizing the input matrix
	 * @param {mat2} L the lower triangular matrix 
	 * @param {mat2} D the diagonal matrix 
	 * @param {mat2} U the upper triangular matrix 
	 * @param {mat2} a the input matrix to factorize
	 */
	
	mat2.LDU = function (L, D, U, a) { 
	    L[2] = a[2]/a[0]; 
	    U[0] = a[0]; 
	    U[1] = a[1]; 
	    U[3] = a[3] - L[2] * U[1]; 
	    return [L, D, U];       
	}; 
	
	if(typeof(exports) !== 'undefined') {
	    exports.mat2 = mat2;
	}
	;
	/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.
	
	Redistribution and use in source and binary forms, with or without modification,
	are permitted provided that the following conditions are met:
	
	  * Redistributions of source code must retain the above copyright notice, this
	    list of conditions and the following disclaimer.
	  * Redistributions in binary form must reproduce the above copyright notice,
	    this list of conditions and the following disclaimer in the documentation 
	    and/or other materials provided with the distribution.
	
	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
	ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
	WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
	DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
	ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
	ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
	SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */
	
	/**
	 * @class 2x3 Matrix
	 * @name mat2d
	 * 
	 * @description 
	 * A mat2d contains six elements defined as:
	 * <pre>
	 * [a, c, tx,
	 *  b, d, ty]
	 * </pre>
	 * This is a short form for the 3x3 matrix:
	 * <pre>
	 * [a, c, tx,
	 *  b, d, ty,
	 *  0, 0, 1]
	 * </pre>
	 * The last row is ignored so the array is shorter and operations are faster.
	 */
	
	var mat2d = {};
	
	/**
	 * Creates a new identity mat2d
	 *
	 * @returns {mat2d} a new 2x3 matrix
	 */
	mat2d.create = function() {
	    var out = new GLMAT_ARRAY_TYPE(6);
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 1;
	    out[4] = 0;
	    out[5] = 0;
	    return out;
	};
	
	/**
	 * Creates a new mat2d initialized with values from an existing matrix
	 *
	 * @param {mat2d} a matrix to clone
	 * @returns {mat2d} a new 2x3 matrix
	 */
	mat2d.clone = function(a) {
	    var out = new GLMAT_ARRAY_TYPE(6);
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    out[4] = a[4];
	    out[5] = a[5];
	    return out;
	};
	
	/**
	 * Copy the values from one mat2d to another
	 *
	 * @param {mat2d} out the receiving matrix
	 * @param {mat2d} a the source matrix
	 * @returns {mat2d} out
	 */
	mat2d.copy = function(out, a) {
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    out[4] = a[4];
	    out[5] = a[5];
	    return out;
	};
	
	/**
	 * Set a mat2d to the identity matrix
	 *
	 * @param {mat2d} out the receiving matrix
	 * @returns {mat2d} out
	 */
	mat2d.identity = function(out) {
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 1;
	    out[4] = 0;
	    out[5] = 0;
	    return out;
	};
	
	/**
	 * Inverts a mat2d
	 *
	 * @param {mat2d} out the receiving matrix
	 * @param {mat2d} a the source matrix
	 * @returns {mat2d} out
	 */
	mat2d.invert = function(out, a) {
	    var aa = a[0], ab = a[1], ac = a[2], ad = a[3],
	        atx = a[4], aty = a[5];
	
	    var det = aa * ad - ab * ac;
	    if(!det){
	        return null;
	    }
	    det = 1.0 / det;
	
	    out[0] = ad * det;
	    out[1] = -ab * det;
	    out[2] = -ac * det;
	    out[3] = aa * det;
	    out[4] = (ac * aty - ad * atx) * det;
	    out[5] = (ab * atx - aa * aty) * det;
	    return out;
	};
	
	/**
	 * Calculates the determinant of a mat2d
	 *
	 * @param {mat2d} a the source matrix
	 * @returns {Number} determinant of a
	 */
	mat2d.determinant = function (a) {
	    return a[0] * a[3] - a[1] * a[2];
	};
	
	/**
	 * Multiplies two mat2d's
	 *
	 * @param {mat2d} out the receiving matrix
	 * @param {mat2d} a the first operand
	 * @param {mat2d} b the second operand
	 * @returns {mat2d} out
	 */
	mat2d.multiply = function (out, a, b) {
	    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5],
	        b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5];
	    out[0] = a0 * b0 + a2 * b1;
	    out[1] = a1 * b0 + a3 * b1;
	    out[2] = a0 * b2 + a2 * b3;
	    out[3] = a1 * b2 + a3 * b3;
	    out[4] = a0 * b4 + a2 * b5 + a4;
	    out[5] = a1 * b4 + a3 * b5 + a5;
	    return out;
	};
	
	/**
	 * Alias for {@link mat2d.multiply}
	 * @function
	 */
	mat2d.mul = mat2d.multiply;
	
	
	/**
	 * Rotates a mat2d by the given angle
	 *
	 * @param {mat2d} out the receiving matrix
	 * @param {mat2d} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat2d} out
	 */
	mat2d.rotate = function (out, a, rad) {
	    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5],
	        s = Math.sin(rad),
	        c = Math.cos(rad);
	    out[0] = a0 *  c + a2 * s;
	    out[1] = a1 *  c + a3 * s;
	    out[2] = a0 * -s + a2 * c;
	    out[3] = a1 * -s + a3 * c;
	    out[4] = a4;
	    out[5] = a5;
	    return out;
	};
	
	/**
	 * Scales the mat2d by the dimensions in the given vec2
	 *
	 * @param {mat2d} out the receiving matrix
	 * @param {mat2d} a the matrix to translate
	 * @param {vec2} v the vec2 to scale the matrix by
	 * @returns {mat2d} out
	 **/
	mat2d.scale = function(out, a, v) {
	    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5],
	        v0 = v[0], v1 = v[1];
	    out[0] = a0 * v0;
	    out[1] = a1 * v0;
	    out[2] = a2 * v1;
	    out[3] = a3 * v1;
	    out[4] = a4;
	    out[5] = a5;
	    return out;
	};
	
	/**
	 * Translates the mat2d by the dimensions in the given vec2
	 *
	 * @param {mat2d} out the receiving matrix
	 * @param {mat2d} a the matrix to translate
	 * @param {vec2} v the vec2 to translate the matrix by
	 * @returns {mat2d} out
	 **/
	mat2d.translate = function(out, a, v) {
	    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5],
	        v0 = v[0], v1 = v[1];
	    out[0] = a0;
	    out[1] = a1;
	    out[2] = a2;
	    out[3] = a3;
	    out[4] = a0 * v0 + a2 * v1 + a4;
	    out[5] = a1 * v0 + a3 * v1 + a5;
	    return out;
	};
	
	/**
	 * Returns a string representation of a mat2d
	 *
	 * @param {mat2d} a matrix to represent as a string
	 * @returns {String} string representation of the matrix
	 */
	mat2d.str = function (a) {
	    return 'mat2d(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + 
	                    a[3] + ', ' + a[4] + ', ' + a[5] + ')';
	};
	
	/**
	 * Returns Frobenius norm of a mat2d
	 *
	 * @param {mat2d} a the matrix to calculate Frobenius norm of
	 * @returns {Number} Frobenius norm
	 */
	mat2d.frob = function (a) { 
	    return(Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) + Math.pow(a[4], 2) + Math.pow(a[5], 2) + 1))
	}; 
	
	if(typeof(exports) !== 'undefined') {
	    exports.mat2d = mat2d;
	}
	;
	/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.
	
	Redistribution and use in source and binary forms, with or without modification,
	are permitted provided that the following conditions are met:
	
	  * Redistributions of source code must retain the above copyright notice, this
	    list of conditions and the following disclaimer.
	  * Redistributions in binary form must reproduce the above copyright notice,
	    this list of conditions and the following disclaimer in the documentation 
	    and/or other materials provided with the distribution.
	
	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
	ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
	WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
	DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
	ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
	ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
	SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */
	
	/**
	 * @class 3x3 Matrix
	 * @name mat3
	 */
	
	var mat3 = {};
	
	/**
	 * Creates a new identity mat3
	 *
	 * @returns {mat3} a new 3x3 matrix
	 */
	mat3.create = function() {
	    var out = new GLMAT_ARRAY_TYPE(9);
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 1;
	    out[5] = 0;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 1;
	    return out;
	};
	
	/**
	 * Copies the upper-left 3x3 values into the given mat3.
	 *
	 * @param {mat3} out the receiving 3x3 matrix
	 * @param {mat4} a   the source 4x4 matrix
	 * @returns {mat3} out
	 */
	mat3.fromMat4 = function(out, a) {
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[4];
	    out[4] = a[5];
	    out[5] = a[6];
	    out[6] = a[8];
	    out[7] = a[9];
	    out[8] = a[10];
	    return out;
	};
	
	/**
	 * Creates a new mat3 initialized with values from an existing matrix
	 *
	 * @param {mat3} a matrix to clone
	 * @returns {mat3} a new 3x3 matrix
	 */
	mat3.clone = function(a) {
	    var out = new GLMAT_ARRAY_TYPE(9);
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    out[4] = a[4];
	    out[5] = a[5];
	    out[6] = a[6];
	    out[7] = a[7];
	    out[8] = a[8];
	    return out;
	};
	
	/**
	 * Copy the values from one mat3 to another
	 *
	 * @param {mat3} out the receiving matrix
	 * @param {mat3} a the source matrix
	 * @returns {mat3} out
	 */
	mat3.copy = function(out, a) {
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    out[4] = a[4];
	    out[5] = a[5];
	    out[6] = a[6];
	    out[7] = a[7];
	    out[8] = a[8];
	    return out;
	};
	
	/**
	 * Set a mat3 to the identity matrix
	 *
	 * @param {mat3} out the receiving matrix
	 * @returns {mat3} out
	 */
	mat3.identity = function(out) {
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 1;
	    out[5] = 0;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 1;
	    return out;
	};
	
	/**
	 * Transpose the values of a mat3
	 *
	 * @param {mat3} out the receiving matrix
	 * @param {mat3} a the source matrix
	 * @returns {mat3} out
	 */
	mat3.transpose = function(out, a) {
	    // If we are transposing ourselves we can skip a few steps but have to cache some values
	    if (out === a) {
	        var a01 = a[1], a02 = a[2], a12 = a[5];
	        out[1] = a[3];
	        out[2] = a[6];
	        out[3] = a01;
	        out[5] = a[7];
	        out[6] = a02;
	        out[7] = a12;
	    } else {
	        out[0] = a[0];
	        out[1] = a[3];
	        out[2] = a[6];
	        out[3] = a[1];
	        out[4] = a[4];
	        out[5] = a[7];
	        out[6] = a[2];
	        out[7] = a[5];
	        out[8] = a[8];
	    }
	    
	    return out;
	};
	
	/**
	 * Inverts a mat3
	 *
	 * @param {mat3} out the receiving matrix
	 * @param {mat3} a the source matrix
	 * @returns {mat3} out
	 */
	mat3.invert = function(out, a) {
	    var a00 = a[0], a01 = a[1], a02 = a[2],
	        a10 = a[3], a11 = a[4], a12 = a[5],
	        a20 = a[6], a21 = a[7], a22 = a[8],
	
	        b01 = a22 * a11 - a12 * a21,
	        b11 = -a22 * a10 + a12 * a20,
	        b21 = a21 * a10 - a11 * a20,
	
	        // Calculate the determinant
	        det = a00 * b01 + a01 * b11 + a02 * b21;
	
	    if (!det) { 
	        return null; 
	    }
	    det = 1.0 / det;
	
	    out[0] = b01 * det;
	    out[1] = (-a22 * a01 + a02 * a21) * det;
	    out[2] = (a12 * a01 - a02 * a11) * det;
	    out[3] = b11 * det;
	    out[4] = (a22 * a00 - a02 * a20) * det;
	    out[5] = (-a12 * a00 + a02 * a10) * det;
	    out[6] = b21 * det;
	    out[7] = (-a21 * a00 + a01 * a20) * det;
	    out[8] = (a11 * a00 - a01 * a10) * det;
	    return out;
	};
	
	/**
	 * Calculates the adjugate of a mat3
	 *
	 * @param {mat3} out the receiving matrix
	 * @param {mat3} a the source matrix
	 * @returns {mat3} out
	 */
	mat3.adjoint = function(out, a) {
	    var a00 = a[0], a01 = a[1], a02 = a[2],
	        a10 = a[3], a11 = a[4], a12 = a[5],
	        a20 = a[6], a21 = a[7], a22 = a[8];
	
	    out[0] = (a11 * a22 - a12 * a21);
	    out[1] = (a02 * a21 - a01 * a22);
	    out[2] = (a01 * a12 - a02 * a11);
	    out[3] = (a12 * a20 - a10 * a22);
	    out[4] = (a00 * a22 - a02 * a20);
	    out[5] = (a02 * a10 - a00 * a12);
	    out[6] = (a10 * a21 - a11 * a20);
	    out[7] = (a01 * a20 - a00 * a21);
	    out[8] = (a00 * a11 - a01 * a10);
	    return out;
	};
	
	/**
	 * Calculates the determinant of a mat3
	 *
	 * @param {mat3} a the source matrix
	 * @returns {Number} determinant of a
	 */
	mat3.determinant = function (a) {
	    var a00 = a[0], a01 = a[1], a02 = a[2],
	        a10 = a[3], a11 = a[4], a12 = a[5],
	        a20 = a[6], a21 = a[7], a22 = a[8];
	
	    return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
	};
	
	/**
	 * Multiplies two mat3's
	 *
	 * @param {mat3} out the receiving matrix
	 * @param {mat3} a the first operand
	 * @param {mat3} b the second operand
	 * @returns {mat3} out
	 */
	mat3.multiply = function (out, a, b) {
	    var a00 = a[0], a01 = a[1], a02 = a[2],
	        a10 = a[3], a11 = a[4], a12 = a[5],
	        a20 = a[6], a21 = a[7], a22 = a[8],
	
	        b00 = b[0], b01 = b[1], b02 = b[2],
	        b10 = b[3], b11 = b[4], b12 = b[5],
	        b20 = b[6], b21 = b[7], b22 = b[8];
	
	    out[0] = b00 * a00 + b01 * a10 + b02 * a20;
	    out[1] = b00 * a01 + b01 * a11 + b02 * a21;
	    out[2] = b00 * a02 + b01 * a12 + b02 * a22;
	
	    out[3] = b10 * a00 + b11 * a10 + b12 * a20;
	    out[4] = b10 * a01 + b11 * a11 + b12 * a21;
	    out[5] = b10 * a02 + b11 * a12 + b12 * a22;
	
	    out[6] = b20 * a00 + b21 * a10 + b22 * a20;
	    out[7] = b20 * a01 + b21 * a11 + b22 * a21;
	    out[8] = b20 * a02 + b21 * a12 + b22 * a22;
	    return out;
	};
	
	/**
	 * Alias for {@link mat3.multiply}
	 * @function
	 */
	mat3.mul = mat3.multiply;
	
	/**
	 * Translate a mat3 by the given vector
	 *
	 * @param {mat3} out the receiving matrix
	 * @param {mat3} a the matrix to translate
	 * @param {vec2} v vector to translate by
	 * @returns {mat3} out
	 */
	mat3.translate = function(out, a, v) {
	    var a00 = a[0], a01 = a[1], a02 = a[2],
	        a10 = a[3], a11 = a[4], a12 = a[5],
	        a20 = a[6], a21 = a[7], a22 = a[8],
	        x = v[0], y = v[1];
	
	    out[0] = a00;
	    out[1] = a01;
	    out[2] = a02;
	
	    out[3] = a10;
	    out[4] = a11;
	    out[5] = a12;
	
	    out[6] = x * a00 + y * a10 + a20;
	    out[7] = x * a01 + y * a11 + a21;
	    out[8] = x * a02 + y * a12 + a22;
	    return out;
	};
	
	/**
	 * Rotates a mat3 by the given angle
	 *
	 * @param {mat3} out the receiving matrix
	 * @param {mat3} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat3} out
	 */
	mat3.rotate = function (out, a, rad) {
	    var a00 = a[0], a01 = a[1], a02 = a[2],
	        a10 = a[3], a11 = a[4], a12 = a[5],
	        a20 = a[6], a21 = a[7], a22 = a[8],
	
	        s = Math.sin(rad),
	        c = Math.cos(rad);
	
	    out[0] = c * a00 + s * a10;
	    out[1] = c * a01 + s * a11;
	    out[2] = c * a02 + s * a12;
	
	    out[3] = c * a10 - s * a00;
	    out[4] = c * a11 - s * a01;
	    out[5] = c * a12 - s * a02;
	
	    out[6] = a20;
	    out[7] = a21;
	    out[8] = a22;
	    return out;
	};
	
	/**
	 * Scales the mat3 by the dimensions in the given vec2
	 *
	 * @param {mat3} out the receiving matrix
	 * @param {mat3} a the matrix to rotate
	 * @param {vec2} v the vec2 to scale the matrix by
	 * @returns {mat3} out
	 **/
	mat3.scale = function(out, a, v) {
	    var x = v[0], y = v[1];
	
	    out[0] = x * a[0];
	    out[1] = x * a[1];
	    out[2] = x * a[2];
	
	    out[3] = y * a[3];
	    out[4] = y * a[4];
	    out[5] = y * a[5];
	
	    out[6] = a[6];
	    out[7] = a[7];
	    out[8] = a[8];
	    return out;
	};
	
	/**
	 * Copies the values from a mat2d into a mat3
	 *
	 * @param {mat3} out the receiving matrix
	 * @param {mat2d} a the matrix to copy
	 * @returns {mat3} out
	 **/
	mat3.fromMat2d = function(out, a) {
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = 0;
	
	    out[3] = a[2];
	    out[4] = a[3];
	    out[5] = 0;
	
	    out[6] = a[4];
	    out[7] = a[5];
	    out[8] = 1;
	    return out;
	};
	
	/**
	* Calculates a 3x3 matrix from the given quaternion
	*
	* @param {mat3} out mat3 receiving operation result
	* @param {quat} q Quaternion to create matrix from
	*
	* @returns {mat3} out
	*/
	mat3.fromQuat = function (out, q) {
	    var x = q[0], y = q[1], z = q[2], w = q[3],
	        x2 = x + x,
	        y2 = y + y,
	        z2 = z + z,
	
	        xx = x * x2,
	        yx = y * x2,
	        yy = y * y2,
	        zx = z * x2,
	        zy = z * y2,
	        zz = z * z2,
	        wx = w * x2,
	        wy = w * y2,
	        wz = w * z2;
	
	    out[0] = 1 - yy - zz;
	    out[3] = yx - wz;
	    out[6] = zx + wy;
	
	    out[1] = yx + wz;
	    out[4] = 1 - xx - zz;
	    out[7] = zy - wx;
	
	    out[2] = zx - wy;
	    out[5] = zy + wx;
	    out[8] = 1 - xx - yy;
	
	    return out;
	};
	
	/**
	* Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
	*
	* @param {mat3} out mat3 receiving operation result
	* @param {mat4} a Mat4 to derive the normal matrix from
	*
	* @returns {mat3} out
	*/
	mat3.normalFromMat4 = function (out, a) {
	    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
	        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
	        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
	        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],
	
	        b00 = a00 * a11 - a01 * a10,
	        b01 = a00 * a12 - a02 * a10,
	        b02 = a00 * a13 - a03 * a10,
	        b03 = a01 * a12 - a02 * a11,
	        b04 = a01 * a13 - a03 * a11,
	        b05 = a02 * a13 - a03 * a12,
	        b06 = a20 * a31 - a21 * a30,
	        b07 = a20 * a32 - a22 * a30,
	        b08 = a20 * a33 - a23 * a30,
	        b09 = a21 * a32 - a22 * a31,
	        b10 = a21 * a33 - a23 * a31,
	        b11 = a22 * a33 - a23 * a32,
	
	        // Calculate the determinant
	        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
	
	    if (!det) { 
	        return null; 
	    }
	    det = 1.0 / det;
	
	    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
	    out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
	    out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
	
	    out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
	    out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
	    out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
	
	    out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
	    out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
	    out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
	
	    return out;
	};
	
	/**
	 * Returns a string representation of a mat3
	 *
	 * @param {mat3} mat matrix to represent as a string
	 * @returns {String} string representation of the matrix
	 */
	mat3.str = function (a) {
	    return 'mat3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + 
	                    a[3] + ', ' + a[4] + ', ' + a[5] + ', ' + 
	                    a[6] + ', ' + a[7] + ', ' + a[8] + ')';
	};
	
	/**
	 * Returns Frobenius norm of a mat3
	 *
	 * @param {mat3} a the matrix to calculate Frobenius norm of
	 * @returns {Number} Frobenius norm
	 */
	mat3.frob = function (a) {
	    return(Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) + Math.pow(a[4], 2) + Math.pow(a[5], 2) + Math.pow(a[6], 2) + Math.pow(a[7], 2) + Math.pow(a[8], 2)))
	};
	
	
	if(typeof(exports) !== 'undefined') {
	    exports.mat3 = mat3;
	}
	;
	/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.
	
	Redistribution and use in source and binary forms, with or without modification,
	are permitted provided that the following conditions are met:
	
	  * Redistributions of source code must retain the above copyright notice, this
	    list of conditions and the following disclaimer.
	  * Redistributions in binary form must reproduce the above copyright notice,
	    this list of conditions and the following disclaimer in the documentation 
	    and/or other materials provided with the distribution.
	
	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
	ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
	WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
	DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
	ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
	ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
	SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */
	
	/**
	 * @class 4x4 Matrix
	 * @name mat4
	 */
	
	var mat4 = {};
	
	/**
	 * Creates a new identity mat4
	 *
	 * @returns {mat4} a new 4x4 matrix
	 */
	mat4.create = function() {
	    var out = new GLMAT_ARRAY_TYPE(16);
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 0;
	    out[5] = 1;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 0;
	    out[9] = 0;
	    out[10] = 1;
	    out[11] = 0;
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = 0;
	    out[15] = 1;
	    return out;
	};
	
	/**
	 * Creates a new mat4 initialized with values from an existing matrix
	 *
	 * @param {mat4} a matrix to clone
	 * @returns {mat4} a new 4x4 matrix
	 */
	mat4.clone = function(a) {
	    var out = new GLMAT_ARRAY_TYPE(16);
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    out[4] = a[4];
	    out[5] = a[5];
	    out[6] = a[6];
	    out[7] = a[7];
	    out[8] = a[8];
	    out[9] = a[9];
	    out[10] = a[10];
	    out[11] = a[11];
	    out[12] = a[12];
	    out[13] = a[13];
	    out[14] = a[14];
	    out[15] = a[15];
	    return out;
	};
	
	/**
	 * Copy the values from one mat4 to another
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the source matrix
	 * @returns {mat4} out
	 */
	mat4.copy = function(out, a) {
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    out[4] = a[4];
	    out[5] = a[5];
	    out[6] = a[6];
	    out[7] = a[7];
	    out[8] = a[8];
	    out[9] = a[9];
	    out[10] = a[10];
	    out[11] = a[11];
	    out[12] = a[12];
	    out[13] = a[13];
	    out[14] = a[14];
	    out[15] = a[15];
	    return out;
	};
	
	/**
	 * Set a mat4 to the identity matrix
	 *
	 * @param {mat4} out the receiving matrix
	 * @returns {mat4} out
	 */
	mat4.identity = function(out) {
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 0;
	    out[5] = 1;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 0;
	    out[9] = 0;
	    out[10] = 1;
	    out[11] = 0;
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = 0;
	    out[15] = 1;
	    return out;
	};
	
	/**
	 * Transpose the values of a mat4
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the source matrix
	 * @returns {mat4} out
	 */
	mat4.transpose = function(out, a) {
	    // If we are transposing ourselves we can skip a few steps but have to cache some values
	    if (out === a) {
	        var a01 = a[1], a02 = a[2], a03 = a[3],
	            a12 = a[6], a13 = a[7],
	            a23 = a[11];
	
	        out[1] = a[4];
	        out[2] = a[8];
	        out[3] = a[12];
	        out[4] = a01;
	        out[6] = a[9];
	        out[7] = a[13];
	        out[8] = a02;
	        out[9] = a12;
	        out[11] = a[14];
	        out[12] = a03;
	        out[13] = a13;
	        out[14] = a23;
	    } else {
	        out[0] = a[0];
	        out[1] = a[4];
	        out[2] = a[8];
	        out[3] = a[12];
	        out[4] = a[1];
	        out[5] = a[5];
	        out[6] = a[9];
	        out[7] = a[13];
	        out[8] = a[2];
	        out[9] = a[6];
	        out[10] = a[10];
	        out[11] = a[14];
	        out[12] = a[3];
	        out[13] = a[7];
	        out[14] = a[11];
	        out[15] = a[15];
	    }
	    
	    return out;
	};
	
	/**
	 * Inverts a mat4
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the source matrix
	 * @returns {mat4} out
	 */
	mat4.invert = function(out, a) {
	    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
	        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
	        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
	        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],
	
	        b00 = a00 * a11 - a01 * a10,
	        b01 = a00 * a12 - a02 * a10,
	        b02 = a00 * a13 - a03 * a10,
	        b03 = a01 * a12 - a02 * a11,
	        b04 = a01 * a13 - a03 * a11,
	        b05 = a02 * a13 - a03 * a12,
	        b06 = a20 * a31 - a21 * a30,
	        b07 = a20 * a32 - a22 * a30,
	        b08 = a20 * a33 - a23 * a30,
	        b09 = a21 * a32 - a22 * a31,
	        b10 = a21 * a33 - a23 * a31,
	        b11 = a22 * a33 - a23 * a32,
	
	        // Calculate the determinant
	        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
	
	    if (!det) { 
	        return null; 
	    }
	    det = 1.0 / det;
	
	    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
	    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
	    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
	    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
	    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
	    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
	    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
	    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
	    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
	    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
	    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
	    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
	    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
	    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
	    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
	    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
	
	    return out;
	};
	
	/**
	 * Calculates the adjugate of a mat4
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the source matrix
	 * @returns {mat4} out
	 */
	mat4.adjoint = function(out, a) {
	    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
	        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
	        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
	        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
	
	    out[0]  =  (a11 * (a22 * a33 - a23 * a32) - a21 * (a12 * a33 - a13 * a32) + a31 * (a12 * a23 - a13 * a22));
	    out[1]  = -(a01 * (a22 * a33 - a23 * a32) - a21 * (a02 * a33 - a03 * a32) + a31 * (a02 * a23 - a03 * a22));
	    out[2]  =  (a01 * (a12 * a33 - a13 * a32) - a11 * (a02 * a33 - a03 * a32) + a31 * (a02 * a13 - a03 * a12));
	    out[3]  = -(a01 * (a12 * a23 - a13 * a22) - a11 * (a02 * a23 - a03 * a22) + a21 * (a02 * a13 - a03 * a12));
	    out[4]  = -(a10 * (a22 * a33 - a23 * a32) - a20 * (a12 * a33 - a13 * a32) + a30 * (a12 * a23 - a13 * a22));
	    out[5]  =  (a00 * (a22 * a33 - a23 * a32) - a20 * (a02 * a33 - a03 * a32) + a30 * (a02 * a23 - a03 * a22));
	    out[6]  = -(a00 * (a12 * a33 - a13 * a32) - a10 * (a02 * a33 - a03 * a32) + a30 * (a02 * a13 - a03 * a12));
	    out[7]  =  (a00 * (a12 * a23 - a13 * a22) - a10 * (a02 * a23 - a03 * a22) + a20 * (a02 * a13 - a03 * a12));
	    out[8]  =  (a10 * (a21 * a33 - a23 * a31) - a20 * (a11 * a33 - a13 * a31) + a30 * (a11 * a23 - a13 * a21));
	    out[9]  = -(a00 * (a21 * a33 - a23 * a31) - a20 * (a01 * a33 - a03 * a31) + a30 * (a01 * a23 - a03 * a21));
	    out[10] =  (a00 * (a11 * a33 - a13 * a31) - a10 * (a01 * a33 - a03 * a31) + a30 * (a01 * a13 - a03 * a11));
	    out[11] = -(a00 * (a11 * a23 - a13 * a21) - a10 * (a01 * a23 - a03 * a21) + a20 * (a01 * a13 - a03 * a11));
	    out[12] = -(a10 * (a21 * a32 - a22 * a31) - a20 * (a11 * a32 - a12 * a31) + a30 * (a11 * a22 - a12 * a21));
	    out[13] =  (a00 * (a21 * a32 - a22 * a31) - a20 * (a01 * a32 - a02 * a31) + a30 * (a01 * a22 - a02 * a21));
	    out[14] = -(a00 * (a11 * a32 - a12 * a31) - a10 * (a01 * a32 - a02 * a31) + a30 * (a01 * a12 - a02 * a11));
	    out[15] =  (a00 * (a11 * a22 - a12 * a21) - a10 * (a01 * a22 - a02 * a21) + a20 * (a01 * a12 - a02 * a11));
	    return out;
	};
	
	/**
	 * Calculates the determinant of a mat4
	 *
	 * @param {mat4} a the source matrix
	 * @returns {Number} determinant of a
	 */
	mat4.determinant = function (a) {
	    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
	        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
	        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
	        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],
	
	        b00 = a00 * a11 - a01 * a10,
	        b01 = a00 * a12 - a02 * a10,
	        b02 = a00 * a13 - a03 * a10,
	        b03 = a01 * a12 - a02 * a11,
	        b04 = a01 * a13 - a03 * a11,
	        b05 = a02 * a13 - a03 * a12,
	        b06 = a20 * a31 - a21 * a30,
	        b07 = a20 * a32 - a22 * a30,
	        b08 = a20 * a33 - a23 * a30,
	        b09 = a21 * a32 - a22 * a31,
	        b10 = a21 * a33 - a23 * a31,
	        b11 = a22 * a33 - a23 * a32;
	
	    // Calculate the determinant
	    return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
	};
	
	/**
	 * Multiplies two mat4's
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the first operand
	 * @param {mat4} b the second operand
	 * @returns {mat4} out
	 */
	mat4.multiply = function (out, a, b) {
	    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
	        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
	        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
	        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
	
	    // Cache only the current line of the second matrix
	    var b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];  
	    out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
	    out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
	    out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
	    out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
	
	    b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
	    out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
	    out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
	    out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
	    out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
	
	    b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
	    out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
	    out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
	    out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
	    out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
	
	    b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
	    out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
	    out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
	    out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
	    out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
	    return out;
	};
	
	/**
	 * Alias for {@link mat4.multiply}
	 * @function
	 */
	mat4.mul = mat4.multiply;
	
	/**
	 * Translate a mat4 by the given vector
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to translate
	 * @param {vec3} v vector to translate by
	 * @returns {mat4} out
	 */
	mat4.translate = function (out, a, v) {
	    var x = v[0], y = v[1], z = v[2],
	        a00, a01, a02, a03,
	        a10, a11, a12, a13,
	        a20, a21, a22, a23;
	
	    if (a === out) {
	        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
	        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
	        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
	        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
	    } else {
	        a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
	        a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
	        a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];
	
	        out[0] = a00; out[1] = a01; out[2] = a02; out[3] = a03;
	        out[4] = a10; out[5] = a11; out[6] = a12; out[7] = a13;
	        out[8] = a20; out[9] = a21; out[10] = a22; out[11] = a23;
	
	        out[12] = a00 * x + a10 * y + a20 * z + a[12];
	        out[13] = a01 * x + a11 * y + a21 * z + a[13];
	        out[14] = a02 * x + a12 * y + a22 * z + a[14];
	        out[15] = a03 * x + a13 * y + a23 * z + a[15];
	    }
	
	    return out;
	};
	
	/**
	 * Scales the mat4 by the dimensions in the given vec3
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to scale
	 * @param {vec3} v the vec3 to scale the matrix by
	 * @returns {mat4} out
	 **/
	mat4.scale = function(out, a, v) {
	    var x = v[0], y = v[1], z = v[2];
	
	    out[0] = a[0] * x;
	    out[1] = a[1] * x;
	    out[2] = a[2] * x;
	    out[3] = a[3] * x;
	    out[4] = a[4] * y;
	    out[5] = a[5] * y;
	    out[6] = a[6] * y;
	    out[7] = a[7] * y;
	    out[8] = a[8] * z;
	    out[9] = a[9] * z;
	    out[10] = a[10] * z;
	    out[11] = a[11] * z;
	    out[12] = a[12];
	    out[13] = a[13];
	    out[14] = a[14];
	    out[15] = a[15];
	    return out;
	};
	
	/**
	 * Rotates a mat4 by the given angle
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @param {vec3} axis the axis to rotate around
	 * @returns {mat4} out
	 */
	mat4.rotate = function (out, a, rad, axis) {
	    var x = axis[0], y = axis[1], z = axis[2],
	        len = Math.sqrt(x * x + y * y + z * z),
	        s, c, t,
	        a00, a01, a02, a03,
	        a10, a11, a12, a13,
	        a20, a21, a22, a23,
	        b00, b01, b02,
	        b10, b11, b12,
	        b20, b21, b22;
	
	    if (Math.abs(len) < GLMAT_EPSILON) { return null; }
	    
	    len = 1 / len;
	    x *= len;
	    y *= len;
	    z *= len;
	
	    s = Math.sin(rad);
	    c = Math.cos(rad);
	    t = 1 - c;
	
	    a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
	    a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
	    a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];
	
	    // Construct the elements of the rotation matrix
	    b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
	    b10 = x * y * t - z * s; b11 = y * y * t + c; b12 = z * y * t + x * s;
	    b20 = x * z * t + y * s; b21 = y * z * t - x * s; b22 = z * z * t + c;
	
	    // Perform rotation-specific matrix multiplication
	    out[0] = a00 * b00 + a10 * b01 + a20 * b02;
	    out[1] = a01 * b00 + a11 * b01 + a21 * b02;
	    out[2] = a02 * b00 + a12 * b01 + a22 * b02;
	    out[3] = a03 * b00 + a13 * b01 + a23 * b02;
	    out[4] = a00 * b10 + a10 * b11 + a20 * b12;
	    out[5] = a01 * b10 + a11 * b11 + a21 * b12;
	    out[6] = a02 * b10 + a12 * b11 + a22 * b12;
	    out[7] = a03 * b10 + a13 * b11 + a23 * b12;
	    out[8] = a00 * b20 + a10 * b21 + a20 * b22;
	    out[9] = a01 * b20 + a11 * b21 + a21 * b22;
	    out[10] = a02 * b20 + a12 * b21 + a22 * b22;
	    out[11] = a03 * b20 + a13 * b21 + a23 * b22;
	
	    if (a !== out) { // If the source and destination differ, copy the unchanged last row
	        out[12] = a[12];
	        out[13] = a[13];
	        out[14] = a[14];
	        out[15] = a[15];
	    }
	    return out;
	};
	
	/**
	 * Rotates a matrix by the given angle around the X axis
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat4} out
	 */
	mat4.rotateX = function (out, a, rad) {
	    var s = Math.sin(rad),
	        c = Math.cos(rad),
	        a10 = a[4],
	        a11 = a[5],
	        a12 = a[6],
	        a13 = a[7],
	        a20 = a[8],
	        a21 = a[9],
	        a22 = a[10],
	        a23 = a[11];
	
	    if (a !== out) { // If the source and destination differ, copy the unchanged rows
	        out[0]  = a[0];
	        out[1]  = a[1];
	        out[2]  = a[2];
	        out[3]  = a[3];
	        out[12] = a[12];
	        out[13] = a[13];
	        out[14] = a[14];
	        out[15] = a[15];
	    }
	
	    // Perform axis-specific matrix multiplication
	    out[4] = a10 * c + a20 * s;
	    out[5] = a11 * c + a21 * s;
	    out[6] = a12 * c + a22 * s;
	    out[7] = a13 * c + a23 * s;
	    out[8] = a20 * c - a10 * s;
	    out[9] = a21 * c - a11 * s;
	    out[10] = a22 * c - a12 * s;
	    out[11] = a23 * c - a13 * s;
	    return out;
	};
	
	/**
	 * Rotates a matrix by the given angle around the Y axis
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat4} out
	 */
	mat4.rotateY = function (out, a, rad) {
	    var s = Math.sin(rad),
	        c = Math.cos(rad),
	        a00 = a[0],
	        a01 = a[1],
	        a02 = a[2],
	        a03 = a[3],
	        a20 = a[8],
	        a21 = a[9],
	        a22 = a[10],
	        a23 = a[11];
	
	    if (a !== out) { // If the source and destination differ, copy the unchanged rows
	        out[4]  = a[4];
	        out[5]  = a[5];
	        out[6]  = a[6];
	        out[7]  = a[7];
	        out[12] = a[12];
	        out[13] = a[13];
	        out[14] = a[14];
	        out[15] = a[15];
	    }
	
	    // Perform axis-specific matrix multiplication
	    out[0] = a00 * c - a20 * s;
	    out[1] = a01 * c - a21 * s;
	    out[2] = a02 * c - a22 * s;
	    out[3] = a03 * c - a23 * s;
	    out[8] = a00 * s + a20 * c;
	    out[9] = a01 * s + a21 * c;
	    out[10] = a02 * s + a22 * c;
	    out[11] = a03 * s + a23 * c;
	    return out;
	};
	
	/**
	 * Rotates a matrix by the given angle around the Z axis
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat4} out
	 */
	mat4.rotateZ = function (out, a, rad) {
	    var s = Math.sin(rad),
	        c = Math.cos(rad),
	        a00 = a[0],
	        a01 = a[1],
	        a02 = a[2],
	        a03 = a[3],
	        a10 = a[4],
	        a11 = a[5],
	        a12 = a[6],
	        a13 = a[7];
	
	    if (a !== out) { // If the source and destination differ, copy the unchanged last row
	        out[8]  = a[8];
	        out[9]  = a[9];
	        out[10] = a[10];
	        out[11] = a[11];
	        out[12] = a[12];
	        out[13] = a[13];
	        out[14] = a[14];
	        out[15] = a[15];
	    }
	
	    // Perform axis-specific matrix multiplication
	    out[0] = a00 * c + a10 * s;
	    out[1] = a01 * c + a11 * s;
	    out[2] = a02 * c + a12 * s;
	    out[3] = a03 * c + a13 * s;
	    out[4] = a10 * c - a00 * s;
	    out[5] = a11 * c - a01 * s;
	    out[6] = a12 * c - a02 * s;
	    out[7] = a13 * c - a03 * s;
	    return out;
	};
	
	/**
	 * Creates a matrix from a quaternion rotation and vector translation
	 * This is equivalent to (but much faster than):
	 *
	 *     mat4.identity(dest);
	 *     mat4.translate(dest, vec);
	 *     var quatMat = mat4.create();
	 *     quat4.toMat4(quat, quatMat);
	 *     mat4.multiply(dest, quatMat);
	 *
	 * @param {mat4} out mat4 receiving operation result
	 * @param {quat4} q Rotation quaternion
	 * @param {vec3} v Translation vector
	 * @returns {mat4} out
	 */
	mat4.fromRotationTranslation = function (out, q, v) {
	    // Quaternion math
	    var x = q[0], y = q[1], z = q[2], w = q[3],
	        x2 = x + x,
	        y2 = y + y,
	        z2 = z + z,
	
	        xx = x * x2,
	        xy = x * y2,
	        xz = x * z2,
	        yy = y * y2,
	        yz = y * z2,
	        zz = z * z2,
	        wx = w * x2,
	        wy = w * y2,
	        wz = w * z2;
	
	    out[0] = 1 - (yy + zz);
	    out[1] = xy + wz;
	    out[2] = xz - wy;
	    out[3] = 0;
	    out[4] = xy - wz;
	    out[5] = 1 - (xx + zz);
	    out[6] = yz + wx;
	    out[7] = 0;
	    out[8] = xz + wy;
	    out[9] = yz - wx;
	    out[10] = 1 - (xx + yy);
	    out[11] = 0;
	    out[12] = v[0];
	    out[13] = v[1];
	    out[14] = v[2];
	    out[15] = 1;
	    
	    return out;
	};
	
	mat4.fromQuat = function (out, q) {
	    var x = q[0], y = q[1], z = q[2], w = q[3],
	        x2 = x + x,
	        y2 = y + y,
	        z2 = z + z,
	
	        xx = x * x2,
	        yx = y * x2,
	        yy = y * y2,
	        zx = z * x2,
	        zy = z * y2,
	        zz = z * z2,
	        wx = w * x2,
	        wy = w * y2,
	        wz = w * z2;
	
	    out[0] = 1 - yy - zz;
	    out[1] = yx + wz;
	    out[2] = zx - wy;
	    out[3] = 0;
	
	    out[4] = yx - wz;
	    out[5] = 1 - xx - zz;
	    out[6] = zy + wx;
	    out[7] = 0;
	
	    out[8] = zx + wy;
	    out[9] = zy - wx;
	    out[10] = 1 - xx - yy;
	    out[11] = 0;
	
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = 0;
	    out[15] = 1;
	
	    return out;
	};
	
	/**
	 * Generates a frustum matrix with the given bounds
	 *
	 * @param {mat4} out mat4 frustum matrix will be written into
	 * @param {Number} left Left bound of the frustum
	 * @param {Number} right Right bound of the frustum
	 * @param {Number} bottom Bottom bound of the frustum
	 * @param {Number} top Top bound of the frustum
	 * @param {Number} near Near bound of the frustum
	 * @param {Number} far Far bound of the frustum
	 * @returns {mat4} out
	 */
	mat4.frustum = function (out, left, right, bottom, top, near, far) {
	    var rl = 1 / (right - left),
	        tb = 1 / (top - bottom),
	        nf = 1 / (near - far);
	    out[0] = (near * 2) * rl;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 0;
	    out[5] = (near * 2) * tb;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = (right + left) * rl;
	    out[9] = (top + bottom) * tb;
	    out[10] = (far + near) * nf;
	    out[11] = -1;
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = (far * near * 2) * nf;
	    out[15] = 0;
	    return out;
	};
	
	/**
	 * Generates a perspective projection matrix with the given bounds
	 *
	 * @param {mat4} out mat4 frustum matrix will be written into
	 * @param {number} fovy Vertical field of view in radians
	 * @param {number} aspect Aspect ratio. typically viewport width/height
	 * @param {number} near Near bound of the frustum
	 * @param {number} far Far bound of the frustum
	 * @returns {mat4} out
	 */
	mat4.perspective = function (out, fovy, aspect, near, far) {
	    var f = 1.0 / Math.tan(fovy / 2),
	        nf = 1 / (near - far);
	    out[0] = f / aspect;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 0;
	    out[5] = f;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 0;
	    out[9] = 0;
	    out[10] = (far + near) * nf;
	    out[11] = -1;
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = (2 * far * near) * nf;
	    out[15] = 0;
	    return out;
	};
	
	/**
	 * Generates a orthogonal projection matrix with the given bounds
	 *
	 * @param {mat4} out mat4 frustum matrix will be written into
	 * @param {number} left Left bound of the frustum
	 * @param {number} right Right bound of the frustum
	 * @param {number} bottom Bottom bound of the frustum
	 * @param {number} top Top bound of the frustum
	 * @param {number} near Near bound of the frustum
	 * @param {number} far Far bound of the frustum
	 * @returns {mat4} out
	 */
	mat4.ortho = function (out, left, right, bottom, top, near, far) {
	    var lr = 1 / (left - right),
	        bt = 1 / (bottom - top),
	        nf = 1 / (near - far);
	    out[0] = -2 * lr;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 0;
	    out[5] = -2 * bt;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 0;
	    out[9] = 0;
	    out[10] = 2 * nf;
	    out[11] = 0;
	    out[12] = (left + right) * lr;
	    out[13] = (top + bottom) * bt;
	    out[14] = (far + near) * nf;
	    out[15] = 1;
	    return out;
	};
	
	/**
	 * Generates a look-at matrix with the given eye position, focal point, and up axis
	 *
	 * @param {mat4} out mat4 frustum matrix will be written into
	 * @param {vec3} eye Position of the viewer
	 * @param {vec3} center Point the viewer is looking at
	 * @param {vec3} up vec3 pointing up
	 * @returns {mat4} out
	 */
	mat4.lookAt = function (out, eye, center, up) {
	    var x0, x1, x2, y0, y1, y2, z0, z1, z2, len,
	        eyex = eye[0],
	        eyey = eye[1],
	        eyez = eye[2],
	        upx = up[0],
	        upy = up[1],
	        upz = up[2],
	        centerx = center[0],
	        centery = center[1],
	        centerz = center[2];
	
	    if (Math.abs(eyex - centerx) < GLMAT_EPSILON &&
	        Math.abs(eyey - centery) < GLMAT_EPSILON &&
	        Math.abs(eyez - centerz) < GLMAT_EPSILON) {
	        return mat4.identity(out);
	    }
	
	    z0 = eyex - centerx;
	    z1 = eyey - centery;
	    z2 = eyez - centerz;
	
	    len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
	    z0 *= len;
	    z1 *= len;
	    z2 *= len;
	
	    x0 = upy * z2 - upz * z1;
	    x1 = upz * z0 - upx * z2;
	    x2 = upx * z1 - upy * z0;
	    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
	    if (!len) {
	        x0 = 0;
	        x1 = 0;
	        x2 = 0;
	    } else {
	        len = 1 / len;
	        x0 *= len;
	        x1 *= len;
	        x2 *= len;
	    }
	
	    y0 = z1 * x2 - z2 * x1;
	    y1 = z2 * x0 - z0 * x2;
	    y2 = z0 * x1 - z1 * x0;
	
	    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
	    if (!len) {
	        y0 = 0;
	        y1 = 0;
	        y2 = 0;
	    } else {
	        len = 1 / len;
	        y0 *= len;
	        y1 *= len;
	        y2 *= len;
	    }
	
	    out[0] = x0;
	    out[1] = y0;
	    out[2] = z0;
	    out[3] = 0;
	    out[4] = x1;
	    out[5] = y1;
	    out[6] = z1;
	    out[7] = 0;
	    out[8] = x2;
	    out[9] = y2;
	    out[10] = z2;
	    out[11] = 0;
	    out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
	    out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
	    out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
	    out[15] = 1;
	
	    return out;
	};
	
	/**
	 * Returns a string representation of a mat4
	 *
	 * @param {mat4} mat matrix to represent as a string
	 * @returns {String} string representation of the matrix
	 */
	mat4.str = function (a) {
	    return 'mat4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ', ' +
	                    a[4] + ', ' + a[5] + ', ' + a[6] + ', ' + a[7] + ', ' +
	                    a[8] + ', ' + a[9] + ', ' + a[10] + ', ' + a[11] + ', ' + 
	                    a[12] + ', ' + a[13] + ', ' + a[14] + ', ' + a[15] + ')';
	};
	
	/**
	 * Returns Frobenius norm of a mat4
	 *
	 * @param {mat4} a the matrix to calculate Frobenius norm of
	 * @returns {Number} Frobenius norm
	 */
	mat4.frob = function (a) {
	    return(Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) + Math.pow(a[4], 2) + Math.pow(a[5], 2) + Math.pow(a[6], 2) + Math.pow(a[7], 2) + Math.pow(a[8], 2) + Math.pow(a[9], 2) + Math.pow(a[10], 2) + Math.pow(a[11], 2) + Math.pow(a[12], 2) + Math.pow(a[13], 2) + Math.pow(a[14], 2) + Math.pow(a[15], 2) ))
	};
	
	
	if(typeof(exports) !== 'undefined') {
	    exports.mat4 = mat4;
	}
	;
	/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.
	
	Redistribution and use in source and binary forms, with or without modification,
	are permitted provided that the following conditions are met:
	
	  * Redistributions of source code must retain the above copyright notice, this
	    list of conditions and the following disclaimer.
	  * Redistributions in binary form must reproduce the above copyright notice,
	    this list of conditions and the following disclaimer in the documentation 
	    and/or other materials provided with the distribution.
	
	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
	ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
	WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
	DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
	ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
	ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
	SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */
	
	/**
	 * @class Quaternion
	 * @name quat
	 */
	
	var quat = {};
	
	/**
	 * Creates a new identity quat
	 *
	 * @returns {quat} a new quaternion
	 */
	quat.create = function() {
	    var out = new GLMAT_ARRAY_TYPE(4);
	    out[0] = 0;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 1;
	    return out;
	};
	
	/**
	 * Sets a quaternion to represent the shortest rotation from one
	 * vector to another.
	 *
	 * Both vectors are assumed to be unit length.
	 *
	 * @param {quat} out the receiving quaternion.
	 * @param {vec3} a the initial vector
	 * @param {vec3} b the destination vector
	 * @returns {quat} out
	 */
	quat.rotationTo = (function() {
	    var tmpvec3 = vec3.create();
	    var xUnitVec3 = vec3.fromValues(1,0,0);
	    var yUnitVec3 = vec3.fromValues(0,1,0);
	
	    return function(out, a, b) {
	        var dot = vec3.dot(a, b);
	        if (dot < -0.999999) {
	            vec3.cross(tmpvec3, xUnitVec3, a);
	            if (vec3.length(tmpvec3) < 0.000001)
	                vec3.cross(tmpvec3, yUnitVec3, a);
	            vec3.normalize(tmpvec3, tmpvec3);
	            quat.setAxisAngle(out, tmpvec3, Math.PI);
	            return out;
	        } else if (dot > 0.999999) {
	            out[0] = 0;
	            out[1] = 0;
	            out[2] = 0;
	            out[3] = 1;
	            return out;
	        } else {
	            vec3.cross(tmpvec3, a, b);
	            out[0] = tmpvec3[0];
	            out[1] = tmpvec3[1];
	            out[2] = tmpvec3[2];
	            out[3] = 1 + dot;
	            return quat.normalize(out, out);
	        }
	    };
	})();
	
	/**
	 * Sets the specified quaternion with values corresponding to the given
	 * axes. Each axis is a vec3 and is expected to be unit length and
	 * perpendicular to all other specified axes.
	 *
	 * @param {vec3} view  the vector representing the viewing direction
	 * @param {vec3} right the vector representing the local "right" direction
	 * @param {vec3} up    the vector representing the local "up" direction
	 * @returns {quat} out
	 */
	quat.setAxes = (function() {
	    var matr = mat3.create();
	
	    return function(out, view, right, up) {
	        matr[0] = right[0];
	        matr[3] = right[1];
	        matr[6] = right[2];
	
	        matr[1] = up[0];
	        matr[4] = up[1];
	        matr[7] = up[2];
	
	        matr[2] = -view[0];
	        matr[5] = -view[1];
	        matr[8] = -view[2];
	
	        return quat.normalize(out, quat.fromMat3(out, matr));
	    };
	})();
	
	/**
	 * Creates a new quat initialized with values from an existing quaternion
	 *
	 * @param {quat} a quaternion to clone
	 * @returns {quat} a new quaternion
	 * @function
	 */
	quat.clone = vec4.clone;
	
	/**
	 * Creates a new quat initialized with the given values
	 *
	 * @param {Number} x X component
	 * @param {Number} y Y component
	 * @param {Number} z Z component
	 * @param {Number} w W component
	 * @returns {quat} a new quaternion
	 * @function
	 */
	quat.fromValues = vec4.fromValues;
	
	/**
	 * Copy the values from one quat to another
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {quat} a the source quaternion
	 * @returns {quat} out
	 * @function
	 */
	quat.copy = vec4.copy;
	
	/**
	 * Set the components of a quat to the given values
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {Number} x X component
	 * @param {Number} y Y component
	 * @param {Number} z Z component
	 * @param {Number} w W component
	 * @returns {quat} out
	 * @function
	 */
	quat.set = vec4.set;
	
	/**
	 * Set a quat to the identity quaternion
	 *
	 * @param {quat} out the receiving quaternion
	 * @returns {quat} out
	 */
	quat.identity = function(out) {
	    out[0] = 0;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 1;
	    return out;
	};
	
	/**
	 * Sets a quat from the given angle and rotation axis,
	 * then returns it.
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {vec3} axis the axis around which to rotate
	 * @param {Number} rad the angle in radians
	 * @returns {quat} out
	 **/
	quat.setAxisAngle = function(out, axis, rad) {
	    rad = rad * 0.5;
	    var s = Math.sin(rad);
	    out[0] = s * axis[0];
	    out[1] = s * axis[1];
	    out[2] = s * axis[2];
	    out[3] = Math.cos(rad);
	    return out;
	};
	
	/**
	 * Adds two quat's
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {quat} a the first operand
	 * @param {quat} b the second operand
	 * @returns {quat} out
	 * @function
	 */
	quat.add = vec4.add;
	
	/**
	 * Multiplies two quat's
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {quat} a the first operand
	 * @param {quat} b the second operand
	 * @returns {quat} out
	 */
	quat.multiply = function(out, a, b) {
	    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
	        bx = b[0], by = b[1], bz = b[2], bw = b[3];
	
	    out[0] = ax * bw + aw * bx + ay * bz - az * by;
	    out[1] = ay * bw + aw * by + az * bx - ax * bz;
	    out[2] = az * bw + aw * bz + ax * by - ay * bx;
	    out[3] = aw * bw - ax * bx - ay * by - az * bz;
	    return out;
	};
	
	/**
	 * Alias for {@link quat.multiply}
	 * @function
	 */
	quat.mul = quat.multiply;
	
	/**
	 * Scales a quat by a scalar number
	 *
	 * @param {quat} out the receiving vector
	 * @param {quat} a the vector to scale
	 * @param {Number} b amount to scale the vector by
	 * @returns {quat} out
	 * @function
	 */
	quat.scale = vec4.scale;
	
	/**
	 * Rotates a quaternion by the given angle about the X axis
	 *
	 * @param {quat} out quat receiving operation result
	 * @param {quat} a quat to rotate
	 * @param {number} rad angle (in radians) to rotate
	 * @returns {quat} out
	 */
	quat.rotateX = function (out, a, rad) {
	    rad *= 0.5; 
	
	    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
	        bx = Math.sin(rad), bw = Math.cos(rad);
	
	    out[0] = ax * bw + aw * bx;
	    out[1] = ay * bw + az * bx;
	    out[2] = az * bw - ay * bx;
	    out[3] = aw * bw - ax * bx;
	    return out;
	};
	
	/**
	 * Rotates a quaternion by the given angle about the Y axis
	 *
	 * @param {quat} out quat receiving operation result
	 * @param {quat} a quat to rotate
	 * @param {number} rad angle (in radians) to rotate
	 * @returns {quat} out
	 */
	quat.rotateY = function (out, a, rad) {
	    rad *= 0.5; 
	
	    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
	        by = Math.sin(rad), bw = Math.cos(rad);
	
	    out[0] = ax * bw - az * by;
	    out[1] = ay * bw + aw * by;
	    out[2] = az * bw + ax * by;
	    out[3] = aw * bw - ay * by;
	    return out;
	};
	
	/**
	 * Rotates a quaternion by the given angle about the Z axis
	 *
	 * @param {quat} out quat receiving operation result
	 * @param {quat} a quat to rotate
	 * @param {number} rad angle (in radians) to rotate
	 * @returns {quat} out
	 */
	quat.rotateZ = function (out, a, rad) {
	    rad *= 0.5; 
	
	    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
	        bz = Math.sin(rad), bw = Math.cos(rad);
	
	    out[0] = ax * bw + ay * bz;
	    out[1] = ay * bw - ax * bz;
	    out[2] = az * bw + aw * bz;
	    out[3] = aw * bw - az * bz;
	    return out;
	};
	
	/**
	 * Calculates the W component of a quat from the X, Y, and Z components.
	 * Assumes that quaternion is 1 unit in length.
	 * Any existing W component will be ignored.
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {quat} a quat to calculate W component of
	 * @returns {quat} out
	 */
	quat.calculateW = function (out, a) {
	    var x = a[0], y = a[1], z = a[2];
	
	    out[0] = x;
	    out[1] = y;
	    out[2] = z;
	    out[3] = Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
	    return out;
	};
	
	/**
	 * Calculates the dot product of two quat's
	 *
	 * @param {quat} a the first operand
	 * @param {quat} b the second operand
	 * @returns {Number} dot product of a and b
	 * @function
	 */
	quat.dot = vec4.dot;
	
	/**
	 * Performs a linear interpolation between two quat's
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {quat} a the first operand
	 * @param {quat} b the second operand
	 * @param {Number} t interpolation amount between the two inputs
	 * @returns {quat} out
	 * @function
	 */
	quat.lerp = vec4.lerp;
	
	/**
	 * Performs a spherical linear interpolation between two quat
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {quat} a the first operand
	 * @param {quat} b the second operand
	 * @param {Number} t interpolation amount between the two inputs
	 * @returns {quat} out
	 */
	quat.slerp = function (out, a, b, t) {
	    // benchmarks:
	    //    http://jsperf.com/quaternion-slerp-implementations
	
	    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
	        bx = b[0], by = b[1], bz = b[2], bw = b[3];
	
	    var        omega, cosom, sinom, scale0, scale1;
	
	    // calc cosine
	    cosom = ax * bx + ay * by + az * bz + aw * bw;
	    // adjust signs (if necessary)
	    if ( cosom < 0.0 ) {
	        cosom = -cosom;
	        bx = - bx;
	        by = - by;
	        bz = - bz;
	        bw = - bw;
	    }
	    // calculate coefficients
	    if ( (1.0 - cosom) > 0.000001 ) {
	        // standard case (slerp)
	        omega  = Math.acos(cosom);
	        sinom  = Math.sin(omega);
	        scale0 = Math.sin((1.0 - t) * omega) / sinom;
	        scale1 = Math.sin(t * omega) / sinom;
	    } else {        
	        // "from" and "to" quaternions are very close 
	        //  ... so we can do a linear interpolation
	        scale0 = 1.0 - t;
	        scale1 = t;
	    }
	    // calculate final values
	    out[0] = scale0 * ax + scale1 * bx;
	    out[1] = scale0 * ay + scale1 * by;
	    out[2] = scale0 * az + scale1 * bz;
	    out[3] = scale0 * aw + scale1 * bw;
	    
	    return out;
	};
	
	/**
	 * Calculates the inverse of a quat
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {quat} a quat to calculate inverse of
	 * @returns {quat} out
	 */
	quat.invert = function(out, a) {
	    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
	        dot = a0*a0 + a1*a1 + a2*a2 + a3*a3,
	        invDot = dot ? 1.0/dot : 0;
	    
	    // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0
	
	    out[0] = -a0*invDot;
	    out[1] = -a1*invDot;
	    out[2] = -a2*invDot;
	    out[3] = a3*invDot;
	    return out;
	};
	
	/**
	 * Calculates the conjugate of a quat
	 * If the quaternion is normalized, this function is faster than quat.inverse and produces the same result.
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {quat} a quat to calculate conjugate of
	 * @returns {quat} out
	 */
	quat.conjugate = function (out, a) {
	    out[0] = -a[0];
	    out[1] = -a[1];
	    out[2] = -a[2];
	    out[3] = a[3];
	    return out;
	};
	
	/**
	 * Calculates the length of a quat
	 *
	 * @param {quat} a vector to calculate length of
	 * @returns {Number} length of a
	 * @function
	 */
	quat.length = vec4.length;
	
	/**
	 * Alias for {@link quat.length}
	 * @function
	 */
	quat.len = quat.length;
	
	/**
	 * Calculates the squared length of a quat
	 *
	 * @param {quat} a vector to calculate squared length of
	 * @returns {Number} squared length of a
	 * @function
	 */
	quat.squaredLength = vec4.squaredLength;
	
	/**
	 * Alias for {@link quat.squaredLength}
	 * @function
	 */
	quat.sqrLen = quat.squaredLength;
	
	/**
	 * Normalize a quat
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {quat} a quaternion to normalize
	 * @returns {quat} out
	 * @function
	 */
	quat.normalize = vec4.normalize;
	
	/**
	 * Creates a quaternion from the given 3x3 rotation matrix.
	 *
	 * NOTE: The resultant quaternion is not normalized, so you should be sure
	 * to renormalize the quaternion yourself where necessary.
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {mat3} m rotation matrix
	 * @returns {quat} out
	 * @function
	 */
	quat.fromMat3 = function(out, m) {
	    // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
	    // article "Quaternion Calculus and Fast Animation".
	    var fTrace = m[0] + m[4] + m[8];
	    var fRoot;
	
	    if ( fTrace > 0.0 ) {
	        // |w| > 1/2, may as well choose w > 1/2
	        fRoot = Math.sqrt(fTrace + 1.0);  // 2w
	        out[3] = 0.5 * fRoot;
	        fRoot = 0.5/fRoot;  // 1/(4w)
	        out[0] = (m[5]-m[7])*fRoot;
	        out[1] = (m[6]-m[2])*fRoot;
	        out[2] = (m[1]-m[3])*fRoot;
	    } else {
	        // |w| <= 1/2
	        var i = 0;
	        if ( m[4] > m[0] )
	          i = 1;
	        if ( m[8] > m[i*3+i] )
	          i = 2;
	        var j = (i+1)%3;
	        var k = (i+2)%3;
	        
	        fRoot = Math.sqrt(m[i*3+i]-m[j*3+j]-m[k*3+k] + 1.0);
	        out[i] = 0.5 * fRoot;
	        fRoot = 0.5 / fRoot;
	        out[3] = (m[j*3+k] - m[k*3+j]) * fRoot;
	        out[j] = (m[j*3+i] + m[i*3+j]) * fRoot;
	        out[k] = (m[k*3+i] + m[i*3+k]) * fRoot;
	    }
	    
	    return out;
	};
	
	/**
	 * Returns a string representation of a quatenion
	 *
	 * @param {quat} vec vector to represent as a string
	 * @returns {String} string representation of the vector
	 */
	quat.str = function (a) {
	    return 'quat(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
	};
	
	if(typeof(exports) !== 'undefined') {
	    exports.quat = quat;
	}
	;
	
	
	
	
	
	
	
	
	
	
	
	
	
	  })(shim.exports);
	})(this);


/***/ },
/* 12 */
/***/ function(module, exports) {

	/*
	 * Copyright 2010, Google Inc.
	 * All rights reserved.
	 *
	 * Redistribution and use in source and binary forms, with or without
	 * modification, are permitted provided that the following conditions are
	 * met:
	 *
	 *     * Redistributions of source code must retain the above copyright
	 * notice, this list of conditions and the following disclaimer.
	 *     * Redistributions in binary form must reproduce the above
	 * copyright notice, this list of conditions and the following disclaimer
	 * in the documentation and/or other materials provided with the
	 * distribution.
	 *     * Neither the name of Google Inc. nor the names of its
	 * contributors may be used to endorse or promote products derived from
	 * this software without specific prior written permission.
	 *
	 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
	 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
	 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
	 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
	 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
	 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
	 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
	 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
	 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */
	
	
	/**
	 * @fileoverview This file contains functions every webgl program will need
	 * a version of one way or another.
	 *
	 * Instead of setting up a context manually it is recommended to
	 * use. This will check for success or failure. On failure it
	 * will attempt to present an approriate message to the user.
	 *
	 *       gl = WebGLUtils.setupWebGL(canvas);
	 *
	 * For animated WebGL apps use of setTimeout or setInterval are
	 * discouraged. It is recommended you structure your rendering
	 * loop like this.
	 *
	 *       function render() {
	 *         window.requestAnimFrame(render, canvas);
	 *
	 *         // do rendering
	 *         ...
	 *       }
	 *       render();
	 *
	 * This will call your rendering function up to the refresh rate
	 * of your display but will stop rendering if your app is not
	 * visible.
	 */
	
	WebGLUtils = function() {
	
	/**
	 * Creates the HTLM for a failure message
	 * @param {string} canvasContainerId id of container of th
	 *        canvas.
	 * @return {string} The html.
	 */
	var makeFailHTML = function(msg) {
	  return '' +
	    '<table style="background-color: #8CE; width: 100%; height: 100%;"><tr>' +
	    '<td align="center">' +
	    '<div style="display: table-cell; vertical-align: middle;">' +
	    '<div style="">' + msg + '</div>' +
	    '</div>' +
	    '</td></tr></table>';
	};
	
	/**
	 * Mesasge for getting a webgl browser
	 * @type {string}
	 */
	var GET_A_WEBGL_BROWSER = '' +
	  'This page requires a browser that supports WebGL.<br/>' +
	  '<a href="http://get.webgl.org">Click here to upgrade your browser.</a>';
	
	/**
	 * Mesasge for need better hardware
	 * @type {string}
	 */
	var OTHER_PROBLEM = '' +
	  "It doesn't appear your computer can support WebGL.<br/>" +
	  '<a href="http://get.webgl.org/troubleshooting/">Click here for more information.</a>';
	
	/**
	 * Creates a webgl context. If creation fails it will
	 * change the contents of the container of the <canvas>
	 * tag to an error message with the correct links for WebGL.
	 * @param {Element} canvas. The canvas element to create a
	 *     context from.
	 * @param {WebGLContextCreationAttirbutes} opt_attribs Any
	 *     creation attributes you want to pass in.
	 * @param {function:(msg)} opt_onError An function to call
	 *     if there is an error during creation.
	 * @return {WebGLRenderingContext} The created context.
	 */
	var setupWebGL = function(canvas, opt_attribs, opt_onError) {
	  function handleCreationError(msg) {
	    var container = canvas.parentNode;
	    if (container) {
	      var str = window.WebGLRenderingContext ?
	           OTHER_PROBLEM :
	           GET_A_WEBGL_BROWSER;
	      if (msg) {
	        str += "<br/><br/>Status: " + msg;
	      }
	      container.innerHTML = makeFailHTML(str);
	    }
	  };
	
	  opt_onError = opt_onError || handleCreationError;
	
	  if (canvas.addEventListener) {
	    canvas.addEventListener("webglcontextcreationerror", function(event) {
	          opt_onError(event.statusMessage);
	        }, false);
	  }
	  var context = create3DContext(canvas, opt_attribs);
	  if (!context) {
	    if (!window.WebGLRenderingContext) {
	      opt_onError("");
	    }
	  }
	  return context;
	};
	
	/**
	 * Creates a webgl context.
	 * @param {!Canvas} canvas The canvas tag to get context
	 *     from. If one is not passed in one will be created.
	 * @return {!WebGLContext} The created context.
	 */
	var create3DContext = function(canvas, opt_attribs) {
	  var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
	  var context = null;
	  for (var ii = 0; ii < names.length; ++ii) {
	    try {
	      context = canvas.getContext(names[ii], opt_attribs);
	    } catch(e) {}
	    if (context) {
	      break;
	    }
	  }
	  return context;
	}
	
	return {
	  create3DContext: create3DContext,
	  setupWebGL: setupWebGL
	};
	}();
	
	/**
	 * Provides requestAnimationFrame in a cross browser way.
	 */
	window.requestAnimFrame = (function() {
	  return window.requestAnimationFrame ||
	         window.webkitRequestAnimationFrame ||
	         window.mozRequestAnimationFrame ||
	         window.oRequestAnimationFrame ||
	         window.msRequestAnimationFrame ||
	         function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
	           window.setTimeout(callback, 1000/60);
	         };
	})();
	


/***/ },
/* 13 */
/***/ function(module, exports) {

	"use strict";
	/*
	* This file has been generated by spacker.exe utility. Do not change this file manualy as your changes
	* will get lost when the file is regenerated. Original content is located in *.c files.
	*/
	exports.xCubeShaders = {
	    cube_fshader: ' precision mediump float; uniform float uAlpha; uniform sampler2D uTexture; uniform bool uColorCoding; uniform float uHighlighting; varying vec2 vTexCoord; varying vec4 vIdColor; void main(void) { if (uColorCoding) { gl_FragColor = vIdColor; } else { vec4 pixel = texture2D(uTexture, vTexCoord); if (vIdColor.x < 0.0) { gl_FragColor = vec4(pixel.rgb * uHighlighting, uAlpha); } else { gl_FragColor = vec4(pixel.rgb, uAlpha); } } }',
	    cube_vshader: ' attribute highp vec3 aVertex; attribute highp vec2 aTexCoord; attribute highp float aId; uniform mat3 uRotation; uniform mat4 uPMatrix; uniform bool uColorCoding; uniform float uSelection; varying vec2 vTexCoord; varying vec4 vIdColor; vec4 getIdColor(float id){ float product = floor(id + 0.5); float B = floor(product / (256.0*256.0)); float G = floor((product - B * 256.0*256.0) / 256.0); float R = mod(product, 256.0); return vec4(R / 255.0, G / 255.0, B / 255.0, 1.0); } void main(void) { vec4 point = vec4(uRotation * aVertex, 1.0); gl_Position = uPMatrix * point; vTexCoord = aTexCoord; if (uColorCoding) { vIdColor = getIdColor(aId); return; } bool isSelected = abs(uSelection - aId) < 0.1; if (isSelected){ vIdColor = vec4(-1.0, -1.0, -1.0, -1.0); } else{ vIdColor = vec4(1.0, 1.0, 1.0, 1.0); } }'
	};


/***/ },
/* 14 */
/***/ function(module, exports) {

	"use strict";
	exports.xCubeTextures = {
	    en: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAABHNCSVQICAgIfAhkiAAAIABJREFUeJzt3XmYXFWd//FPLd1d1WuWTtKdzgrICEpEhoAbLuiw+YDym1ERwXlEHEdmcEZkWBz8ufxQWQRcEPdlcEHHERSUbVARlCAICMhiWLKRpJP0vnetvz9Ox0TodJ3bXbdudX/fr+eppyI5595vS1P1ufeeJXbvLbcUBQAATIlHXQAAAKg8AgAAAAYRAAAAMIgAAACAQQQAAAAMIgAAAGAQAQAAAIMIAAAAGEQAAADAIAIAAAAGEQAAADCIAAAAgEEEAAAADCIAAABgEAEAAACDCAAAABhEAAAAwCACAAAABhEAAAAwiAAAAIBBBAAAAAwiAAAAYBABAAAAgwgAAAAYRAAAAMAgAgAAAAYRAAAAMIgAAACAQQQAAAAMIgAAAGAQAQAAAIMIAAAAGEQAAADAIAIAAAAGEQAAADCIAAAAgEEEAAAADCIAAABgEAEAAACDCAAAABhEAAAAwCACAAAABhEAAAAwiAAAAIBBBAAAAAwiAAAAYBABAAAAgwgAAAAYRAAAAMAgAgAAAAYRAAAAMIgAAACAQQQAAAAMIgAAAGAQAQAAAIMIAAAAGEQAAADAIAIAAAAGEQAAADCIAAAAgEEEAAAADCIAAABgEAEAAACDCAAAABhEAAAAwCACAAAABhEAAAAwiAAAAIBBBAAAAAwiAAAAYBABAAAAgwgAAAAYRAAAAMAgAgAAAAYRAAAAMIgAAACAQQQAAAAMIgAAAGAQAQAAAIMIAAAAGEQAAADAIAIAAAAGEQAAADCIAAAAgEEEAAAADCIAAABgEAEAAACDCAAAABhEAAAAwCACAAAABhEAAAAwiAAAAIBBBAAAAAwiAAAAYBABAAAAgwgAAAAYRAAAAMAgAgAAAAYRAAAAMIgAAACAQQQAAAAMIgAAAGAQAQAAAIMIAAAAGEQAAADAIAIAAAAGEQAAADCIAAAAgEEEAAAADCIAAABgEAEAAACDCAAAABhEAAAAwCACAAAABhEAAAAwiAAAAIBBBAAAAAwiAAAAYBABAAAAgwgAAAAYRAAAAMAgAgAAAAYRAAAAMIgAAACAQQQAAAAMIgAAAGAQAQAAAIMIAAAAGEQAAADAIAIAAAAGEQAAADCIAAAAgEEEAAAADCIAAABgEAEAAACDCAAAABhEAAAAwCACAAAABhEAAAAwiAAAAIBBBAAAAAwiAAAAYBABAAAAgwgAAAAYRAAAAMAgAgAAAAYRAAAAMIgAAACAQQQAAAAMIgAAAGAQAQAAAIMIAAAAGEQAAADAIAIAAAAGEQAAADCIAAAAgEEEAAAADCIAAABgEAEAAACDCAAAABhEAAAAwCACAAAABhEAAAAwiAAAAIBBBAAAAAwiAAAAYBABAAAAgwgAAAAYRAAAAMCgpLq710VdBFDKWDqZH2hKJqKuAygll2vI54r8rqL6xe498shi1EUApdz5+qXrbjh51SujrgMo5eHt/7BuLNvC7yqqHo8AAAAwiAAAAIBBBAAAAAwiAAAAYBABAAAAgwgAAAAYRAAAAMAgAgAAAAYRAAAAMIgAAACAQQQAAAAMIgAAAGAQAQAAAIMIAAAAGEQAAADAIAIAAAAGEQAAADCIAAAAgEEEAAAADCIAAABgEAEAAACDCAAAABhEAAAAwCACAAAABhEAAAAwiAAAAIBBBAAAAAwiAAAAYBABAAAAgwgAAAAYRAAAAMAgAgAAAAYRAAAAMIgAAACAQQQAAAAMIgAAAGAQAQAAAIMIAAAAGJSMuoCqF4spnkwqVlPjXrGYCpmMCuPjKubzUVcHAMC0zMkAEK+pUWr1aiXq65VIp5Wor1e8oWHPn+vr//J38d3v6fQL3uN1dYolEvs8T7FQUGF4WNn+fuX6+5Xr7dX49u0a27xZo1u2aPTpp5Xp6qrgT4654MUNy3Ra+9He7Yfyo7pkw49DrAgWnbK8RW/taIq6jKqzbTSncx7ujLqMspiTASC1YoUOufba0M8Ti8eVaGpSoqlJWrZs0jbjnZ0aeuQRDTz4oPp++1sCAUpaVNuiNy081Lt9b3aIAICyWzMvpXcsb4m6jKqzfjBDAICfurY21bW1aeExx0jFooaffFLd//u/2nXTTcoNDkZdHgDAKAJAJcViajjoIDUcdJCW/dM/qeu227Ttv/5L49u2RV0ZAMAYZgFEJJ5KafFb3qKX/ehHWvmhDynZ3Bx1SQAAQwgAEYvV1KjtHe/Qmh/8QPNe+cqoywEAGEEAqBI1ra36m6uu0op//VcpFou6HADAHEcAqDLtp52m/T/60SmnHwIAMFMEgCrUesIJ2u+ii6IuAwAwhxEAqlTr8cdr2fveF3UZAIA5igBQxTrOOEPNhx8edRkAgDmIdQAmDD36qDK7dinT3a1sV5eyPT3KDQ4qPzys4tiYYqmU4rW1itfVuVcqpdolS5Tq6FBdR4dSHR1KtpR51axYTPt95CN65F3vUmF0tLzHBoApfG9Tn+7rGanY+VpqEvrO2o5Aff75gW3aMZ4LqaLJDWYLFT1fmAgAE544+2wVxsZmdIyaBQvUvHatWo44Qi1r16p28eIZ11W3dKna3/lObf3Wt2Z8LADw9fjAuB4fGK/Y+RbXBf86un3HsDYMZ0KoxgYCQBlle3rUfdtt6r7tNklS05o1an/3uzX/1a+e0dS+tlNOUed11ynPXQAAQJkwBiBEg488ovXnnqtHTj1V/ffeO+3jJJubtejEE8tYGQDAOgJABYxu2KAnzzlH27773Wkfo/W448pYEQDAOgJApRQK2vKlL2nDZZdNq3vDwQcrtY8thwEACIoAUGE7r79evXfeOa2+LUccUd5iAABmEQAisOHSS5Xr6wvcr+llLwuhGgCARQSACGR7e7Xr5z8P3K/xkENCqAYAYBEBICLdt98euE9dW5viNTUhVAMAsIYAEJHh9es1tnlzsE7xuOo6gq2UBQDAZAgAERp59tnAfera20OoBABgDQEgQtmensB94vX1IVQCALCGABChaQWAVCqESgAA1hAAIlQYHg7cJ15bG0IlAABrCAARSjQ3B+6THxgIoRIAgDUEgAglW1oC98lOYwEhAACejwAQoZrpBIDe3hAqAQBYQwCIUE1ra+A+2e7uECoBAFhDAIhIvK5ODQcfHKjP+NatyvX3h1QRAMASAkBEmg49NPCyvgMPPhhSNQAAawgAEWlZuzZwn4GHHgqhEgCARQSACCTSabUef3ywToWCBv7wh3AKAgCYQwCIQPvpp6tm4cJAfXp/9ztldu4MqSIAgDUEgAqrXbJE7aeeGrhf53XXhVANAMAqAkAF1ba26sVf+ELg9fxH1q9nACAAoKwIABVS29amg77yFaVXrgzc97lvfCOEigAAliWjLmCui6dSajvlFC09/XQlGhoC9+/51a/Ue9ddIVQGALCMABCSVEeH5r/udWo79VTVTmPFP0nKDQxo42c/W+bKAAAgAPxFsrlZmbGxafWN19SobvlypVasUNNLXqJ5Rx2l9KpVM65p05VXKtvTM+PjAADwfASACS+/8UYVMhlldu1SZudOZbu7VRgfV3F8XIVsVsVsVrHaWiVSKcXTacXTaSXq61XX1qa6tjYpXt7hFNu/+1113XprWY8JAMBuBIC9xGtrleroUKqjI9I6um67TZuvuSbSGgAAcxuzAKpM/3336dmLL5aKxahLAQDMYdwBqCI7f/pTbbziChWz2ahLAQDMcQSAKlDM5bTpyiu14/rroy4FAGAEASBigw8/rE2f+5yGn3gi6lIAAIYQACIytnmzNl9zjXrvvDPqUgAABhEAKijb06OeX/9a3XfcocGHH5YKhahLAgAYRQCokGKhoCfOOkujGzdGXQoAAEwDrJRYPK5V550XdRkAAEjiDsBfrD/vPMVrapRoalKiqUnJhgb33tioRGOj4rW1itXUKFZTo/jEe3rVKikW8z5H82GHadGJJ2rXTTeF94MAAOCBADCh/777VAi4F8B+H/mIFp10UqA+K84+W32//a2yvb2B+gEAUE48ApiBzVdfrWxfX6A+yeZmrfz3fw+pIgAA/BAAZiA3MKDNX/hC4H4Ljz1WLUceGUJFAAD4IQDMUNfNN2vggQcC91t9/vmKp1IhVAQAQGkEgDLYcNllKgRcv79u6VIte+97Q6oIAICpEQDKYGzTJm2/9trA/dpOPVX1L3pRCBUBADA1AkCZbPvOdzS2ZUugPrFEQqsvvFCK868BAFBZfPOUSSGb1YbLLgvcr/Hgg9X2938fQkUAAOwbAaCMBu6/X1233hq437IPfEC1ixeHUBEAAJMjAJTZ5s9/XrnBwUB9EvX1WnXuuSFVBADACxEAyizb26stV18duN/8175WC17/+vIXBADAJAgAIdh5440afOSRwP1WnnuuEg0NIVQEAMBfIwCEoVjUhksvVTGXC9SttrVVy886K6SiAADYgwAQktFnntH2H/wgcL8lJ5+sxpe+NISKAADYgwAQoq3f/KbGt20L1ike1+oLL1QsyUaNAIDwEABCVBgf18bLLw/cr37//dX+rneFUBEAAA4BIGR969ap55e/DNyv473vVWrZshAqAgCAAFARG6+6Svnh4UB94rW1Wn3++SFVBACwjgBQAdmuLm35ylcC92teu1atJ5wQQkUAAOsIABWy4yc/0fDjjwfut/KDH1SypSWEigAAlhEAKqVQ0IZLLlGxUAjULTlvnlZ+8IMhFQUAsIoAUEHD69drx49+FLhf65vfrOa1a0OoCABgFQGgwp772teU2bkzcL/V55+veG1tCBUBACwiAFRYfnRUG6+4InC/1LJl6jjjjBAqAgBYRACIQO9vfqPeu+8O3K/9tNOU3n//ECoCAFhDAIjIxiuuUGF0NFCfWDKp/S64QIrFQqoKAGAFC85HJNPZqee+/nWtCDjCv/GQQ7Tk5JO14/rrQ6oMs00yntBhzQdEXcaUnh3Zrr5csMWwAISLABChzh/+UK3HHaf6Aw8M1G/5v/yLeu+6S5murpAqw2zSlEjrmoOqexvpC9Z/W3f2Php1GQD2wiOACBULBW249FIp4NoAiYYGrfzwh0OqCgBgAQEgYkOPPaYdN9wQuN+CN7xB8486KoSKAAAWEACqwJYvf1nZ7u7A/Vade64S6XQIFQEA5joCQBXIDw1p01VXBe5Xu2SJlv3zP4dQEQBgriMAVInuO+5Q/733Bu7X9ra3qeHgg0OoCAAwlxEAqsiGyy9XYXw8WKd4XPtdcIFiiUQ4RQEA5iQCQBUZ37pVW7/1rcD96g88UG3vfGcIFQEA5ioCQJXZ/v3va3TDhsD9lp15puqWLg2hIgDAXEQAqDLFXE4bLrlEKhYD9YunUlp93nkhVQUAmGtYCbAKDT78sHbddJMWnXRSoH4tr3iFFh5zjLpvvz2kylAJfblhPTTwTNRllBXLAKOUTKGo3+wK9nsylg+2iBr+2pwMAGPbtumJs4ItjVrIZEKqZno2ff7z6rr11sD9coODIVSDSnp0cKM+8MSXoi4DqKi+bF6vv3Nj1GWYMicDQGF0VAMPPhh1GTOSHx6e9T8DAKB6MQYAAACDCAAAABhEAAAAwCACAAAABhEAAAAwiAAAAIBBBAAAAAwiAAAAYBABAAAAgwgAAAAYRAAAAMAgAgAAAAYRAAAAMIgAAACAQQQAAAAMIgAAAGAQAQAAAIMIAAAAGEQAAADAIAIAAAAGEQAAADCIAAAAgEEEAAAADCIAAABgEAEAAACDCAAAABhEAAAAwCACAAAABhEAAAAwiAAAAIBBBAAAAAwiAAAAYBABAAAAgwgAAAAYRAAAAMAgAgAAAAYRAAAAMIgAAACAQbHR3771nqiLAEoZeG5k19jm3kVR1wGU8qf7v9RV7FzTGnUdQCnJVHvNK6MuAigl1Ztbp+FhfldR9TKbF60bH6zjdxVVj0cAAAAYRAAAAMAgAgAAAAYRAAAAMIgAAACAQQQAAAAMIgAAAGAQAQAAAIMIAAAAGEQAAADAIAIAAAAGEQAAADCIAAAAgEEEAAAADCIAAABgEAEAAACDCAAAABhEAAAAwCACAAAABhEAAAAwiAAAAIBBBAAAAAwiAAAAYBABAAAAgwgAAAAYRAAAAMAgAgAAAAYRAAAAMIgAAACAQQQAAAAMIgAAAGAQAQAAAIMIAAAAGEQAAADAIAIAAAAGEQAAADCIAAAAgEEEAAAADCIAAABgUDLqAgDs5bjzpZe+OeoqwvHYrdItn466CgATCABANalrkhoXRl1FOFKNUVcAYC88AgAAwCACAAAABhEAAAAwiAAAAIBBBAAAAAwiAAAAYFB1TQOMJaV4WorVuVd893tKitVOvO/9d0lJCff+lz9P/G9JKoxIhdE97/leaXyjlNsZ4Q8JAJWTOkhKHyzF6yc+XtN7/hxPS/GGvf5c7z5qd3+kxpKSklKsxr2kiY/TISk/KBWGpVy3NPakNPa4NPq4lNsV6Y+LAKorACz8R6n52PDPUxh2QSDzrDR0jzT+TPjnBIAItLxZan1P+Y6XaHKvmvY9/6z5TXv+nNslDdwh9d0gjT5WvvOi/KorAFRKvEFKv8S9Wk6UMpulwV9LQ3e5WAsAmJbkImnBO91r/Cmp93+knh9KxVzUleH5bAaA56td4e4+zH+71HOdNHCbpGLUVQGl/fFn0q2fiboKP/ls1BWgwupeJLVd6D5at31cGnkw6oqwNwLA3uJpqfUMqel10q6vSpmNUVcETC2fkca4a4XqVre/tPpaqfcn0vZPScVM1BVBYhbA5Or2lzoultKHRF0JAMwNMWn+P0grvujGcSN6BIB9idVKbecTAgCgjBpfI624mhBQDQgAU9kdAur2j7oSAJgzGl8ltV8UdRWYnWMAxjdI+Z6JCakTc/yLOUl5917Mu/UAdk96rVks1a6Ukq3BzxWrlVrfJ229UAwMBDBX9V7v5vLn+6X8wMSEqImPUxXcR2ssObFuQINU0yalDpRSL5bSh7qP3CDmn+xmCIw+HMZPAx+zMwB0fVUafzZ4v0Sz1PBKqem1bniqr7r9pOZjJmYHAMDc03+zNLxuen0T86WWY6TWM6WapZ6dYtLSi6Rn3iGpML3zYmZsPQLID7gv8a3/Ke24Qsp1+fddcAoPrQBgEvleqedH0tMnSl3f8u+XOthNukI0bAWAvQ3/3t3Wzzzn1z7eINWvCbcmAJjFCmPu2mrHVf599l5FEJVlNwBI7mHX9k+6ha191B8ebj0AMAd0fcMtB+yj6XXBxw+gPGwHAEnK97nV/3zUHy4pFmo5ADAXdF4mFT0Wf0zMl9LcXI0EAUCSBn/lZhKUkmia3kwCADAmu1Uavs+vbe2KcGvB5AgAkpvnMvqIX9vEvHBrAYA5YvDXfu24rooGAWA332mFSQIAAPgY3+jXjgAQDQLAbgXPDVW4AwAAXvI9fu2SC8OtA5MjAOxWGPNrV2TFCgDw4ftxWRgOtw5MbnauBBiGRJNfu3xvuHVMJt7g1tys6XDrbybmSfGUW5iomJWKY1J+WMrtlLI7pMyGifUNWLoYQHSS8/3aZXeEW4fkHjM0HCHVH+ZWK0wucK/EQikWl/JD7kZwftC9Z3dJo3+SRh+Vxp6cm1sYEwB2izf7tavEb6rk5sY0vVZqeIVbijjo9MPCsPvtHV4nDT8gFcdDKRMA9sX31v740yGcPOa+8JuPde91q6dunlwgacFf/7N5J7n3YlYae0Lq+7nU99O5c8eCALCbzzyU3C43tyXUOpa7TbMbXqEZrTkQb5AajnSvwqg0cLvU/3O3+BEAVED60NJtijlpaJp7EEwmMU+a91Zpwduk2lXlOWasxq1VkF4jLfmg1PtTqef7UmZzeY4fFQKA5JahSr+0dLvhP4RXQzwtLXy31HS0yr7YUDwtzXuL1HKc1PPf0sDNE1t8AUB4mo4q3Wb4nvJcUcfT0uKzw9+2Jd4oLTxNWvB2aftnpN7/Du9cYWMQoOQeCsXTU7cp5t0VdBhSfyMtu1JqeqNCXWkwVictPF1a+imG3QIIVcORbhf2UnZ+eebnanyNdMDPpIX/WLk922K10tKPSR2fcUOyZiMCQCwhLXhX6XaDd7hHAOXW9Hqp/WOV/UKu20/quCTYlsgA4CsutZ1futngL/3XYNuX2pXSyq+6MdJRmHeStPKbUmwW3k8nACw4tfQG1tlO//0Cgmg+Tlp0VjS/OYkWqf0iQgCAsmu/0N3YnEpup7Tt4zM/V2aTNPibmR9nJuoPlZb8R7Q1TIftADD/7VLLiVO3KWbc/paFkfKeu+kNUut7pt+/MOQGJOZ63Cia6Yinpfb/dAMPAWCGYgmp7Tx3XTWVYk7a8mH38VUOO68uz3FmYuFpUvPfRV1FMLPwpkUZ1LRLrf8kpV8ydbti1n35ZzaV9/ypg9z5gzzvz+2Shu6Whu6RsttfuM1WvEFKvdg9eKv/W/91DeL10pJzpa0X+G2IhOpSk5IaI1xHdagrunOjqtQf6p5mpg6cul1xXNryIWnkwfKde+xxt6db09Gl2xZGpJE/uo/1fJ+U63XvKu5ZF6B+jVT/8uDjCZZ+wn1M+64rFzU7ASCWkNIvc1fe9YeX3oC6mJE6L5dGHy5vHYl50pJz/DfALoxI3d+WBu/SlAv7FIalkQfcK1bjphK2nOR3npp2qfVMaecX/WpC9VhzontF5RMvlYosOGVRLOmGEzW+2n3UlPril9wiO1v+TRr+ffnr2fkl9/E+2XVV5jk3Wn/4PhcWfCZBxWqlluPdU9raZX41JFrc/xezZWbA7AwA89/uFuQpjLhXMSspP7HuZMF9Acbr3Su50M3xr+nwf9ae3SrtuCqcSZ6t73G/JT7GnpB2fkHKdQc7RzHrxiwMrZPazpWSi0v3aTzKRejRx4KdC8Cc0PEp91w+3+eWCylk5D5Wc+4LM17rpsAlGqXkIqnuAPdR62v0Mem5cyYWKQ3B2JPSwC+l5jft9c/WS13flAZuCT7zuZiR+n7mJn+1XVD6scZuC08jAISr/rBwjlvMSP23Sr0/DmflvPqXSw2v9Gs79mdp+6dnVkdmo7T9Ymnp//MLHQvPkJ47VywhDNhTs8S9yi3f576Eu7/7wieX5bbrS1LzGyf+/PWJm5oz3L6lmJe2f8pdhy0+u3T7uv2lxle5p7XVbnYGgHLLdrp7Uv03h7jWf8w/Qma2SJ2XlCeEZDulzk9LSy8uHddrl0sNh0vD98/8vADMKubd08iB26W+m9yY5UoYWy/13iAN/UYauKO8x971Vffx6HMN1/SG2REAbM8CkCaend/vRqTk+8I7T8MRfqtiqCDt/Fx5F5se3yD1/8Kv7by3lu+8AMyKJd1T2BqPJ5DltO2j5f/ylyQVpa0f83uUkD4khPOHgAAQb3BTAZd+Qlr5dWnR+/32BQiq5QS/dgO3uzsA5dZ3g98+AHUv8h/xAgCTiCXck9ol50gH3CS96Ba30nm8IerKZia7VRr6bel2qRe7QYTVjgCwt0SzW4532Wel9o+Wb6xBTbub+ldKYUjq+VF5zvmCY4+6ES0+Gl8XTg0ATKpd4VYGPPCX0pIPT+y8N0v13VC6TazGhYBqRwDYl/Qhbuhn24Vua96ZaHyNX7vBu8LdZ3LYc8uthsPDqwGAWYkmqfUMaf+fuW16Z6ORB/zazYYAMDsHAeYH3BVtMTvxyky8snuGmcbT7hVLuXkr0/0Sr3+5tPxKqesb0tDvpn8MH0N3T+/4vnLd0vgzbpjqVGo6XEQv1zJdAKre2BNSrksqjLvxx7vfixn3ZxUnZlc3SIkGKd4k1a2cWEk94B5myQXuY3XgNmnrf86uNchyPW4qY6knpcl5lalnJmZnAOj8tDT+bLA+8Xr3b6xmuVukumGt/wOpeIO0+N/cI4L+W4KdN9FU+gtXkrLb3Jdz2Eb+4FdP6iXhBxIAVaPzCv+bhHuLp91HSvoQd1Xf8LfyvrfcfKxbU2DT+8u/2nqYMptKB4B4Y2VqmYnZGQCmozDi5oiMrXdbUHUl3cqALSf4D9lc+B5JiWDbAtcdIK94PPKQ/zFnYuxpv3Z1qwgAs8FTd0u//15052cVQPMKo9Lon9yr5zr3hT7/bdKiM/2W0q0/zI2/3vS+6ggB8ZQUb3bXboVhd1fk+dut+Exr9F2NPUp2AsDzFXN7ls5tfLXbSDrhcc9m4bvdCoG+e1jWrvJrl9no126msp7LcNWwQdCsMNApPe0xLBmokNwuadc17jpp6cfd9iSl1B/qtiTZ/snQy3Nibhnj+kOl9Bp3DZhc6G7yvmD0ftHtFzD2mFtcdXidX1CJEwBmiaHfuXUkl17sfgtKWfR+6bkP++344DulMIxlhyeT63aRPZ6eul1tiS2SAWAKmc3uqn75VW5yVSkL3u6W7A1zHbKGtW4l+cajAlyhx9yYhcaj3EuS12KpiVnwCIBZALvlut2yufnB0m2Ti6T57/A7bnJR6TbFfHgLZE8mu610m8QCBR7ZAwB7Kebdtr9em//E3G6C5f7YSTS59fkPuEla9R331HfGt+d9avTc7y1KBIC9ZbdKPT/wa9v0xtJX0ZLfHYXCQPiLZO8tP1C6TSw5Ox5iAahqxay07eMvfI4+mbrVUqPndik+Wk6QDrjZzeau2698x50rCADPN/hrv6vxeMpvfr/PJjyVHvlS9NysejY8xAJQ9TKb3R5rPnxvrk6lpk1acY207PLZvehQ2AgAL1DwH+XfdHSJBjG/LYgrPQnWZ+yC5Pb/BIAy6Pm+X7umN7jBeNPV9AbpgBulJhY0LYlBgJMZfdivXd1qN89lX7v2+S4GXek7AL4BIMhm3wAwhfENUnZH6S2HYwk3Q3s6s5Bbjpc6LnXHmI5iXsp3u6ek+UH32KJmkZRc4vfEd7YhAEwm1+0GytWUGgkfdyFg7MnJ/zrmeYOlks//JUkeD+MkMQgQQDkNr/PbcLR+TfAAMO+t0tJPBv/yH3nY/8qOAAAKF0lEQVRAGrxbGv2jNProvq+Pajqk9EFuW5eW4z03d61yBIB9yWz2CAByC/3sKwD4frHHUv51lUPMM8oWM+HWAcAU3wVc02uCHbfpaKnjYnlfsxSzUu9PpJ4fSuNP+fXJbnWvgTvc0K4FBIA5zGc6oDT1/axiTm7CaInfyniFA4DvvazCPh5tAMA0+OxILvlde+2WXOB2c/f98h97Qtr6EbcorHUEgH0peAaAeH2J44yV/sKteADwPN9s2qEDQNXL9fq1CzIIsP3/+o/07/mB1HmJe9YPAsC++V79ltrxId9XOgBU+hGA1yZIRbc+AQCUie9TRd8lSJqOlpr/zq9t1zelHVf6tbWCaYD74vsbWOoOQL6v9DGS8/2mC5ZLTUfpNvkBYjKAsvJZFkVyk6t8JlEteJvf8Xr/hy//yRAA9sX7HlRh6r/O7vQ4Rlyqafc83wwl5vuFm9yu8GsBYIpvAJAklbj+SC6QGl5d+jDZbVLnpQHOawgBYF/ingGg1HNy313+akpsLl0u3psTbQq3DgDm+D6rL4yWvgHZ8ma/KX+dl1XHNsPViAAwqZhUt79f01LDWn2/SGsrtP1u6gC/dpXanRCAGfUv82uX6/I41t96HKfHre6OyREAJlO7wn8MQLZz6r8fe8rvWXr6EL/zzVTDK/za7WttAwCYhlidVH+YX1uf64+attJtBm7z24TIKgLAZIKsQlHqN7U4Lo17TDhNHeiez4epdpnf8lX5QWl8Y7i1ADCl4XAXAnyM/bl0G58AML7B73xWEQCeL5aUWo7zbFzwu1IeecjnxFLDEZ7nnSaf3QslafQRuQWMAKA8Ws/wbzu8buq/jyX8dlrPbvc/p0UEgOdreqOUXOTXduwpqTBcut3Q7+T1hdp0tEJbfz/RJDV7Bpuhu8KpAYBJDUf6P33MD0rDD0zdplh0r5K4jpkSAWBvNUuk+Z4TSyX/0SW5XW79yVLqVkuNr/I/fxDz3156zQJJyvdKI567IQJACYl5UvtF/u37f7HvDVb/ouC5xIrnrIMgYgmpbj+PdrPg23UWlFghiflS+0f95//nB6Xhe/yP33+zX7v5p0x/L8t9qV3pv1xW/60qubYBAHhINEkrv+b3hSlJKrgNenzkuku3SR3seV5fMbfjYMORpZsm5pX53CEgAEhuf8eln5CSi/379F2/730jJzN8v9tKqpSaJVLrmf7HLSUxT2o7X17/qgvD0sCt5Ts3ALPSL5FWXeveffXf7L87n8/wq8bXqKzfcu0X+W1nLPmNUYia7QCQbJUW/Yv78vcZUrpbZrObXxJI0e1E4aPpjdKCdwY8/iRidVLbBe7n9NF3AxsAAZiR5CL3sbP6Oje5yVd+MNhyvUN3l25Tu0yad6L/MfclnnJX/gtO8e+TWFD+m7nlZm8zoOQiqf7lLhqm/kaBB90Vs9LOL05vcunw/dLIg36TYeed7B5HdH/Pb6Dh89Wtlhad7f4L8JHZ4h6+AUAQMbd9b+MrpJYTJiYzTePScvvFUnaHf/uh38k9rSxxrrYL3da/PsOwJpNeIy27xG8G9d5iCSn9MveRX61mZwBYdJYbWJcf2PMqjrkd/IoZN/oilnaxLZ52t8FrV7iXz0C4fSpKO6+e2TK5XV+XOi7zW2io6Y1uuavu70nDv/cYGSO32HbzMdK8/+MfP4s5addX2PwHMGzpx9y6+bkeKd/j3gsjE8vyjkuKuY/PeIN7JedLdS9yi4uW2hS1lK6vS/0/D9Yn3y/13+KWBJ5Kokla9W1px+VS70/8j1+7wt2IXfCu6V/JN72WAFB+u7/MK6rofktLTVAtJdct7fyC1P4Red19SMyTFv+rVHyfNPJHN0c/1+1G6+cHJ/5LXOAeONUf7iJn0N/W7u/4P3gDMCfVLq/ciuR767lO2vG56fXd+UWp+djSm6kmmtwt/IXvcU86h/8gjf/5r4dxJZrcnmx1B0rzT54Y6DfDWdnNx0s7v+x37RaF2RkAKm33bf/he8tzvNGHpe5rpYX/6N8nVjcxmdZj+GkQ/b+QBm4v7zEBoJSJG6q7vjL9Q2S2uACx8HS/9nWrpSXn7PnfhVGpMORuFAe5i1HMS5kNUl2JrVVql0mLPzD9gBM224MAfYw/JT13Xvm+/Hfr/4XbpDpKA7dJ3f8VbQ0AzMlskTa+Z2Zf/rvtuEIaKbFw0L7E025YWNBHGNs/KW3/jF/bhWdIzW8KXlslEAD2pZiVer4nbf2o3/S96ej9b6nrW6r8vPuii81d36zweQGYVpC6vys981Y3Jrocillp879JmefKc7wpz5WTtn3MXbsN/97dzC0llpCWf05a9P7w6wuKAPB8xYxb4e+5/5D6blToX84Dt0rbP+UGNVZCvl/qvNw9CAOACijm3ZPGZ0+VOi8JtoSKj3yvtPHd0x/p7yO7Q9p05l43bovS1o95/iwxad5bwqttuhgDsFt2u/sNHbxzetPuZmL0UWnLOW4Z4pbjpFht+c9RzEtDd05/WiEABJTbJfX+WOr5sZTbGe65sjukDadJHZ9xE6HKpZh310s7PuvGXe9t/CnpuXOl5Z+v/jn/k7EbALLb3eTQ8fXuPbNZke4cURx3jxz6b5JaTpSaXuem9M1UYcRNmO2/MdgkWwAIKLtDGv3jnglLo49WdnZxYUza8iE3g3rJvwdYgniyYw1JfT+Xur899eOFwV9LG06Xln1aql01/fNFoboCwMiDbk5/ORXHpfyw+7dZGHHvua4XRrlqke93QaD3OrcCRf1hbkHr2mXynpOS3S6NPiaNPuT+SyxmQy0ZQPUavkcqlnGBz2Jx4mN1QCoM7lmKJbsz/Kt8X4O/dDc8m491dwMaX+VmTE+pII0/6/ZCG7pbGrzLf/re6MPS0ye54NFygtSwdnbsBVBlAeAh94KLzXv//xFPS8klbq+AeKMUr5ViNW5USjHjwk12h5Tt5BY/gL8Yuse9rCnm3d4C/Te7j8rUi92I/2SrlGjYs25crttd4We3zGxswu5xDgO3y62OuMStq5Bc7NakK2bK9qOVTXUFAOxbYVTKbHQvAIC3YtY9jqjcCd21WLazguecBmYBAABgEAEAAACDCAAAABhEAAAAwCACAAAABhEAAAAwiGmAQDX586+k/u3+7bf9KbxaAMxpBACgmjz5K/cCgJDxCAAAAIMIAAAAGEQAAADAIAIAAAAGEQAAADCIAAAAgEEEAAAADCIAAABgEAEAAACDCAAAABhEAAAAwCACAAAABhEAAAAwiAAAAIBBBAAAAAwiAAAAYBABAAAAgwgAAAAYRAAAAMAgAgAAAAYRAAAAMIgAAACAQQQAAAAMIgAAAGAQAQAAAIMIAAAAGEQAAADAIAIAAAAGEQAAADCIAAAAgEEEAAAADCIAAABgEAEAAACDCAAAABhEAAAAwCACAAAABhEAAAAwiAAAAIBBBAAAAAz6/xxM5q4tElQWAAAAAElFTkSuQmCC',
	};


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var xbim_navigation_cube_textures_1 = __webpack_require__(14);
	var xbim_navigation_cube_shaders_1 = __webpack_require__(13);
	var glMatrix = __webpack_require__(11);
	var xNavigationCube = (function () {
	    /**
	     * This is constructor of the Navigation Cube plugin for {@link xViewer xBIM Viewer}. It gets optional Image as an argument.
	     * The image will be used as a texture of the navigation cube. If you don't specify eny image default one will be used.
	     * Image has to be square and its size has to be power of 2.
	     * @name xNavigationCube
	     * @constructor
	     * @classdesc This is a plugin for xViewer which renders interactive navigation cube. It is customizable in terms of alpha
	     * behaviour and its position on the viewer canvas. Use of plugin:
	     *
	     *     var cube = new xNavigationCube();
	     *     viewer.addPlugin(cube);
	     *
	     * You can specify your own texture of the cube as an [Image](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image)
	     * object argumen in constructor. If you don't specify any image default texture will be used (you can also use this one and enhance it if you want):
	     *
	     * ![Cube texture](cube_texture.png)
	     *
	     * @param {Image} [image = null] - optional image to be used for a cube texture.
	    */
	    function xNavigationCube(image) {
	        this.TOP = 1600000;
	        this.BOTTOM = 1600001;
	        this.LEFT = 1600002;
	        this.RIGHT = 1600003;
	        this.FRONT = 1600004;
	        this.BACK = 1600005;
	        this.TOP_LEFT_FRONT = 1600006;
	        this.TOP_RIGHT_FRONT = 1600007;
	        this.TOP_LEFT_BACK = 1600008;
	        this.TOP_RIGHT_BACK = 1600009;
	        this.BOTTOM_LEFT_FRONT = 1600010;
	        this.BOTTOM_RIGHT_FRONT = 1600011;
	        this.BOTTOM_LEFT_BACK = 1600012;
	        this.BOTTOM_RIGHT_BACK = 1600013;
	        this.TOP_LEFT = 1600014;
	        this.TOP_RIGHT = 1600015;
	        this.TOP_FRONT = 1600016;
	        this.TOP_BACK = 1600017;
	        this.BOTTOM_LEFT = 1600018;
	        this.BOTTOM_RIGHT = 1600019;
	        this.BOTTOM_FRONT = 1600020;
	        this.BOTTOM_BACK = 1600021;
	        this.FRONT_RIGHT = 1600022;
	        this.FRONT_LEFT = 1600023;
	        this.BACK_RIGHT = 1600024;
	        this.BACK_LEFT = 1600025;
	        this._initialized = false;
	        /**
	        * Size of the cube relative to the size of viewer canvas. This has to be a positive number between [0,1] Default value is 0.15.
	        * @member {Number} xNavigationCube#ratio
	        */
	        this.ratio = 0.15;
	        /**
	        * Active parts of the navigation cube are highlighted so that user can recognize which part is active.
	        * This should be a positive number between [0,2]. If the value is less than 1 active area is darker.
	        * If the value is greater than 1 active area is lighter. Default value is 1.2.
	        * @member {Number} xNavigationCube#highlighting
	        */
	        this.highlighting = 1.2;
	        /**
	        * Navigation cube has two transparency states. One is when user hovers over the cube and the second when the cursor is anywhere else.
	        * This is for the hovering shate and it should be a positive number between [0,1]. If the value is less than 1 cube will be semitransparent
	        * when user hovers over. Default value is 1.0.
	        * @member {Number} xNavigationCube#activeAlpha
	        */
	        this.activeAlpha = 1.0;
	        /**
	        * Navigation cube has two transparency states. One is when user hovers over the cube and the second when the cursor is anywhere else.
	        * This is for the non-hovering shate and it should be a positive number between [0,1]. If the value is less than 1 cube will be semitransparent
	        * when user is not hovering over. Default value is 0.3.
	        * @member {Number} xNavigationCube#passiveAlpha
	        */
	        this.passiveAlpha = 0.3;
	        /**
	        * It is possible to place navigation cube to any of the corners of the canvas using this property. Default value is cube.BOTTOM_RIGHT.
	        * Allowed values are cube.BOTTOM_RIGHT, cube.BOTTOM_LEFT, cube.TOP_RIGHT and cube.TOP_LEFT.
	        * @member {Enum} xNavigationCube#position
	        */
	        this.position = this.BOTTOM_RIGHT;
	        this.vertices = new Float32Array([
	            // Front face
	            -0.3, -0.5, -0.3,
	            0.3, -0.5, -0.3,
	            0.3, -0.5, 0.3,
	            -0.3, -0.5, 0.3,
	            // Back face
	            -0.3, 0.5, -0.3,
	            -0.3, 0.5, 0.3,
	            0.3, 0.5, 0.3,
	            0.3, 0.5, -0.3,
	            // Top face
	            -0.3, -0.3, 0.5,
	            0.3, -0.3, 0.5,
	            0.3, 0.3, 0.5,
	            -0.3, 0.3, 0.5,
	            // Bottom face
	            -0.3, -0.3, -0.5,
	            -0.3, 0.3, -0.5,
	            0.3, 0.3, -0.5,
	            0.3, -0.3, -0.5,
	            // Right face
	            0.5, -0.3, -0.3,
	            0.5, 0.3, -0.3,
	            0.5, 0.3, 0.3,
	            0.5, -0.3, 0.3,
	            // Left face
	            -0.5, -0.3, -0.3,
	            -0.5, -0.3, 0.3,
	            -0.5, 0.3, 0.3,
	            -0.5, 0.3, -0.3,
	            //top - left - front (--+)
	            -0.5, -0.5, 0.5,
	            -0.3, -0.5, 0.5,
	            -0.3, -0.3, 0.5,
	            -0.5, -0.3, 0.5,
	            -0.5, -0.5, 0.3,
	            -0.5, -0.5, 0.5,
	            -0.5, -0.3, 0.5,
	            -0.5, -0.3, 0.3,
	            -0.5, -0.5, 0.3,
	            -0.3, -0.5, 0.3,
	            -0.3, -0.5, 0.5,
	            -0.5, -0.5, 0.5,
	            //top-right-front (+-+)
	            0.3, -0.5, 0.5,
	            0.5, -0.5, 0.5,
	            0.5, -0.3, 0.5,
	            0.3, -0.3, 0.5,
	            0.5, -0.5, 0.3,
	            0.5, -0.3, 0.3,
	            0.5, -0.3, 0.5,
	            0.5, -0.5, 0.5,
	            0.3, -0.5, 0.3,
	            0.5, -0.5, 0.3,
	            0.5, -0.5, 0.5,
	            0.3, -0.5, 0.5,
	            //top-left-back (-++)
	            -0.5, 0.3, 0.5,
	            -0.3, 0.3, 0.5,
	            -0.3, 0.5, 0.5,
	            -0.5, 0.5, 0.5,
	            -0.5, 0.3, 0.3,
	            -0.5, 0.3, 0.5,
	            -0.5, 0.5, 0.5,
	            -0.5, 0.5, 0.3,
	            -0.5, 0.5, 0.3,
	            -0.5, 0.5, 0.5,
	            -0.3, 0.5, 0.5,
	            -0.3, 0.5, 0.3,
	            //top-right-back (+++)
	            0.3, 0.3, 0.5,
	            0.5, 0.3, 0.5,
	            0.5, 0.5, 0.5,
	            0.3, 0.5, 0.5,
	            0.5, 0.3, 0.3,
	            0.5, 0.5, 0.3,
	            0.5, 0.5, 0.5,
	            0.5, 0.3, 0.5,
	            0.3, 0.5, 0.3,
	            0.3, 0.5, 0.5,
	            0.5, 0.5, 0.5,
	            0.5, 0.5, 0.3,
	            //bottom - left - front (---)
	            -0.5, -0.5, -0.5,
	            -0.3, -0.5, -0.5,
	            -0.3, -0.3, -0.5,
	            -0.5, -0.3, -0.5,
	            -0.5, -0.5, -0.5,
	            -0.5, -0.5, -0.3,
	            -0.5, -0.3, -0.3,
	            -0.5, -0.3, -0.5,
	            -0.5, -0.5, -0.5,
	            -0.3, -0.5, -0.5,
	            -0.3, -0.5, -0.3,
	            -0.5, -0.5, -0.3,
	            //bottom-right-front (+--)
	            0.3, -0.5, -0.5,
	            0.5, -0.5, -0.5,
	            0.5, -0.3, -0.5,
	            0.3, -0.3, -0.5,
	            0.5, -0.5, -0.5,
	            0.5, -0.3, -0.5,
	            0.5, -0.3, -0.3,
	            0.5, -0.5, -0.3,
	            0.3, -0.5, -0.5,
	            0.5, -0.5, -0.5,
	            0.5, -0.5, -0.3,
	            0.3, -0.5, -0.3,
	            //bottom-left-back (-+-)
	            -0.5, 0.3, -0.5,
	            -0.3, 0.3, -0.5,
	            -0.3, 0.5, -0.5,
	            -0.5, 0.5, -0.5,
	            -0.5, 0.3, -0.5,
	            -0.5, 0.3, -0.3,
	            -0.5, 0.5, -0.3,
	            -0.5, 0.5, -0.5,
	            -0.5, 0.5, -0.5,
	            -0.5, 0.5, -0.3,
	            -0.3, 0.5, -0.3,
	            -0.3, 0.5, -0.5,
	            //bottom-right-back (++-)
	            0.3, 0.3, -0.5,
	            0.5, 0.3, -0.5,
	            0.5, 0.5, -0.5,
	            0.3, 0.5, -0.5,
	            0.5, 0.3, -0.5,
	            0.5, 0.5, -0.5,
	            0.5, 0.5, -0.3,
	            0.5, 0.3, -0.3,
	            0.3, 0.5, -0.5,
	            0.3, 0.5, -0.3,
	            0.5, 0.5, -0.3,
	            0.5, 0.5, -0.5,
	            //top-right (+0+)
	            0.3, -0.3, 0.5,
	            0.5, -0.3, 0.5,
	            0.5, 0.3, 0.5,
	            0.3, 0.3, 0.5,
	            0.5, -0.3, 0.3,
	            0.5, 0.3, 0.3,
	            0.5, 0.3, 0.5,
	            0.5, -0.3, 0.5,
	            //top-left (-0+)
	            -0.5, -0.3, 0.5,
	            -0.3, -0.3, 0.5,
	            -0.3, 0.3, 0.5,
	            -0.5, 0.3, 0.5,
	            -0.5, -0.3, 0.3,
	            -0.5, -0.3, 0.5,
	            -0.5, 0.3, 0.5,
	            -0.5, 0.3, 0.3,
	            //top-front (0-+)
	            -0.3, -0.5, 0.5,
	            0.3, -0.5, 0.5,
	            0.3, -0.3, 0.5,
	            -0.3, -0.3, 0.5,
	            -0.3, -0.5, 0.3,
	            0.3, -0.5, 0.3,
	            0.3, -0.5, 0.5,
	            -0.3, -0.5, 0.5,
	            //top-back (0++)
	            -0.3, 0.3, 0.5,
	            0.3, 0.3, 0.5,
	            0.3, 0.5, 0.5,
	            -0.3, 0.5, 0.5,
	            -0.3, 0.5, 0.3,
	            -0.3, 0.5, 0.5,
	            0.3, 0.5, 0.5,
	            0.3, 0.5, 0.3,
	            //bottom-right (+0-)
	            0.3, -0.3, -0.5,
	            0.5, -0.3, -0.5,
	            0.5, 0.3, -0.5,
	            0.3, 0.3, -0.5,
	            0.5, -0.3, -0.5,
	            0.5, 0.3, -0.5,
	            0.5, 0.3, -0.3,
	            0.5, -0.3, -0.3,
	            //bottom-left (-0-)
	            -0.5, -0.3, -0.5,
	            -0.5, 0.3, -0.5,
	            -0.3, 0.3, -0.5,
	            -0.3, -0.3, -0.5,
	            -0.5, -0.3, -0.5,
	            -0.5, -0.3, -0.3,
	            -0.5, 0.3, -0.3,
	            -0.5, 0.3, -0.5,
	            //bottom-front (0--)
	            -0.3, -0.5, -0.5,
	            0.3, -0.5, -0.5,
	            0.3, -0.3, -0.5,
	            -0.3, -0.3, -0.5,
	            -0.3, -0.5, -0.5,
	            0.3, -0.5, -0.5,
	            0.3, -0.5, -0.3,
	            -0.3, -0.5, -0.3,
	            //bottom-back (0+-)
	            -0.3, 0.3, -0.5,
	            0.3, 0.3, -0.5,
	            0.3, 0.5, -0.5,
	            -0.3, 0.5, -0.5,
	            -0.3, 0.5, -0.5,
	            -0.3, 0.5, -0.3,
	            0.3, 0.5, -0.3,
	            0.3, 0.5, -0.5,
	            //front-right (+-0)
	            0.3, -0.5, -0.3,
	            0.5, -0.5, -0.3,
	            0.5, -0.5, 0.3,
	            0.3, -0.5, 0.3,
	            0.5, -0.5, -0.3,
	            0.5, -0.3, -0.3,
	            0.5, -0.3, 0.3,
	            0.5, -0.5, 0.3,
	            //front-left (--0)
	            -0.5, -0.5, -0.3,
	            -0.3, -0.5, -0.3,
	            -0.3, -0.5, 0.3,
	            -0.5, -0.5, 0.3,
	            -0.5, -0.5, -0.3,
	            -0.5, -0.5, 0.3,
	            -0.5, -0.3, 0.3,
	            -0.5, -0.3, -0.3,
	            //back-right (++0)
	            0.3, 0.5, -0.3,
	            0.3, 0.5, 0.3,
	            0.5, 0.5, 0.3,
	            0.5, 0.5, -0.3,
	            0.5, 0.3, -0.3,
	            0.5, 0.5, -0.3,
	            0.5, 0.5, 0.3,
	            0.5, 0.3, 0.3,
	            //back-left (-+0)
	            -0.5, 0.5, -0.3,
	            -0.5, 0.5, 0.3,
	            -0.3, 0.5, 0.3,
	            -0.3, 0.5, -0.3,
	            -0.5, 0.3, -0.3,
	            -0.5, 0.3, 0.3,
	            -0.5, 0.5, 0.3,
	            -0.5, 0.5, -0.3,
	        ]);
	        //// Front face
	        //-0.5, -0.5, -0.5,
	        // 0.5, -0.5, -0.5,
	        // 0.5, -0.5, 0.5,
	        //-0.5, -0.5, 0.5,
	        //
	        //// Back face
	        //-0.5, 0.5, -0.5,
	        //-0.5, 0.5, 0.5,
	        // 0.5, 0.5, 0.5,
	        // 0.5, 0.5, -0.5,
	        //
	        //// Top face
	        //-0.5, -0.5, 0.5,
	        // 0.5, -0.5, 0.5,
	        // 0.5, 0.5, 0.5,
	        //-0.5, 0.5, 0.5,
	        //
	        //// Bottom face
	        //-0.5, -0.5, -0.5,
	        //-0.5, 0.5, -0.5,
	        // 0.5, 0.5, -0.5,
	        // 0.5, -0.5, -0.5,
	        //
	        //// Right face
	        // 0.5, -0.5, -0.5,
	        // 0.5, 0.5, -0.5,
	        // 0.5, 0.5, 0.5,
	        // 0.5, -0.5, 0.5,
	        //
	        //// Left face
	        //-0.5, -0.5, -0.5,
	        //-0.5, -0.5, 0.5,
	        //-0.5, 0.5, 0.5,
	        //-0.5, 0.5, -0.5,
	        this.indices = new Uint16Array([
	            0, 1, 2, 0, 2, 3,
	            4, 5, 6, 4, 6, 7,
	            8, 9, 10, 8, 10, 11,
	            12, 13, 14, 12, 14, 15,
	            16, 17, 18, 16, 18, 19,
	            20, 21, 22, 20, 22, 23,
	            //top - left - front 
	            0 + 24, 1 + 24, 2 + 24, 0 + 24, 2 + 24, 3 + 24,
	            4 + 24, 5 + 24, 6 + 24, 4 + 24, 6 + 24, 7 + 24,
	            8 + 24, 9 + 24, 10 + 24, 8 + 24, 10 + 24, 11 + 24,
	            //top-right-front 
	            0 + 36, 1 + 36, 2 + 36, 0 + 36, 2 + 36, 3 + 36,
	            4 + 36, 5 + 36, 6 + 36, 4 + 36, 6 + 36, 7 + 36,
	            8 + 36, 9 + 36, 10 + 36, 8 + 36, 10 + 36, 11 + 36,
	            //top-left-back 
	            0 + 48, 1 + 48, 2 + 48, 0 + 48, 2 + 48, 3 + 48,
	            4 + 48, 5 + 48, 6 + 48, 4 + 48, 6 + 48, 7 + 48,
	            8 + 48, 9 + 48, 10 + 48, 8 + 48, 10 + 48, 11 + 48,
	            //top-right-back
	            0 + 60, 1 + 60, 2 + 60, 0 + 60, 2 + 60, 3 + 60,
	            4 + 60, 5 + 60, 6 + 60, 4 + 60, 6 + 60, 7 + 60,
	            8 + 60, 9 + 60, 10 + 60, 8 + 60, 10 + 60, 11 + 60,
	            //bottom - left - front
	            0 + 72, 2 + 72, 1 + 72, 0 + 72, 3 + 72, 2 + 72,
	            4 + 72, 5 + 72, 6 + 72, 4 + 72, 6 + 72, 7 + 72,
	            8 + 72, 9 + 72, 10 + 72, 8 + 72, 10 + 72, 11 + 72,
	            //bottom-right-front 
	            0 + 84, 2 + 84, 1 + 84, 0 + 84, 3 + 84, 2 + 84,
	            4 + 84, 5 + 84, 6 + 84, 4 + 84, 6 + 84, 7 + 84,
	            8 + 84, 9 + 84, 10 + 84, 8 + 84, 10 + 84, 11 + 84,
	            //bottom-left-back 
	            0 + 96, 2 + 96, 1 + 96, 0 + 96, 3 + 96, 2 + 96,
	            4 + 96, 5 + 96, 6 + 96, 4 + 96, 6 + 96, 7 + 96,
	            8 + 96, 9 + 96, 10 + 96, 8 + 96, 10 + 96, 11 + 96,
	            //bottom-right-back
	            0 + 108, 2 + 108, 1 + 108, 0 + 108, 3 + 108, 2 + 108,
	            4 + 108, 5 + 108, 6 + 108, 4 + 108, 6 + 108, 7 + 108,
	            8 + 108, 9 + 108, 10 + 108, 8 + 108, 10 + 108, 11 + 108,
	            //top-right
	            0 + 120, 1 + 120, 2 + 120, 0 + 120, 2 + 120, 3 + 120,
	            4 + 120, 5 + 120, 6 + 120, 4 + 120, 6 + 120, 7 + 120,
	            //top-left
	            0 + 128, 1 + 128, 2 + 128, 0 + 128, 2 + 128, 3 + 128,
	            4 + 128, 5 + 128, 6 + 128, 4 + 128, 6 + 128, 7 + 128,
	            //top-front
	            0 + 136, 1 + 136, 2 + 136, 0 + 136, 2 + 136, 3 + 136,
	            4 + 136, 5 + 136, 6 + 136, 4 + 136, 6 + 136, 7 + 136,
	            //top-back
	            0 + 144, 1 + 144, 2 + 144, 0 + 144, 2 + 144, 3 + 144,
	            4 + 144, 5 + 144, 6 + 144, 4 + 144, 6 + 144, 7 + 144,
	            //bottom-right
	            0 + 152, 2 + 152, 1 + 152, 0 + 152, 3 + 152, 2 + 152,
	            4 + 152, 5 + 152, 6 + 152, 4 + 152, 6 + 152, 7 + 152,
	            //bottom-left
	            0 + 160, 1 + 160, 2 + 160, 0 + 160, 2 + 160, 3 + 160,
	            4 + 160, 5 + 160, 6 + 160, 4 + 160, 6 + 160, 7 + 160,
	            //bottom-front
	            0 + 168, 2 + 168, 1 + 168, 0 + 168, 3 + 168, 2 + 168,
	            4 + 168, 5 + 168, 6 + 168, 4 + 168, 6 + 168, 7 + 168,
	            //bottom-back
	            0 + 176, 2 + 176, 1 + 176, 0 + 176, 3 + 176, 2 + 176,
	            4 + 176, 5 + 176, 6 + 176, 4 + 176, 6 + 176, 7 + 176,
	            //front-right
	            0 + 184, 1 + 184, 2 + 184, 0 + 184, 2 + 184, 3 + 184,
	            4 + 184, 5 + 184, 6 + 184, 4 + 184, 6 + 184, 7 + 184,
	            //front-left
	            0 + 192, 1 + 192, 2 + 192, 0 + 192, 2 + 192, 3 + 192,
	            4 + 192, 5 + 192, 6 + 192, 4 + 192, 6 + 192, 7 + 192,
	            //back-right
	            0 + 200, 1 + 200, 2 + 200, 0 + 200, 2 + 200, 3 + 200,
	            4 + 200, 5 + 200, 6 + 200, 4 + 200, 6 + 200, 7 + 200,
	            //back-left
	            0 + 208, 1 + 208, 2 + 208, 0 + 208, 2 + 208, 3 + 208,
	            4 + 208, 5 + 208, 6 + 208, 4 + 208, 6 + 208, 7 + 208,
	        ]);
	        //// Front face
	        //1.0 / 3.0, 0.0 / 3.0,
	        //2.0 / 3.0, 0.0 / 3.0,
	        //2.0 / 3.0, 1.0 / 3.0,
	        //1.0 / 3.0, 1.0 / 3.0,
	        //
	        //// Back face
	        //1.0, 0.0 / 3.0,
	        //1.0, 1.0 / 3.0,
	        //2.0 / 3.0, 1.0 / 3.0,
	        //2.0 / 3.0, 0.0 / 3.0,
	        //
	        //
	        //// Top face
	        //2.0 / 3.0, 1.0 / 3.0,
	        //1.0, 1.0 / 3.0,
	        //1.0, 2.0 / 3.0,
	        //2.0 / 3.0, 2.0 / 3.0,
	        //
	        //// Bottom face
	        //0.0, 1.0 / 3.0,
	        //0.0, 0.0 / 3.0,
	        //1.0 / 3.0, 0.0 / 3.0,
	        //1.0 / 3.0, 1.0 / 3.0,
	        //
	        //// Right face
	        //0.0, 1.0 / 3.0,
	        //1.0 / 3.0, 1.0 / 3.0,
	        //1.0 / 3.0, 2.0 / 3.0,
	        //0.0, 2.0 / 3.0,
	        //
	        //// Left face
	        //2.0 / 3.0, 1.0 / 3.0,
	        //2.0 / 3.0, 2.0 / 3.0,
	        //1.0 / 3.0, 2.0 / 3.0,
	        //1.0 / 3.0, 1.0 / 3.0
	        this.txtCoords = new Float32Array([
	            // Front face
	            1.0 / 3.0 + 1.0 / 15.0, 0.0 / 3.0 + 1.0 / 15.0,
	            2.0 / 3.0 - 1.0 / 15.0, 0.0 / 3.0 + 1.0 / 15.0,
	            2.0 / 3.0 - 1.0 / 15.0, 1.0 / 3.0 - 1.0 / 15.0,
	            1.0 / 3.0 + 1.0 / 15.0, 1.0 / 3.0 - 1.0 / 15.0,
	            // Back face
	            1.0 - 1.0 / 15.0, 0.0 / 3.0 + 1.0 / 15.0,
	            1.0 - 1.0 / 15.0, 1.0 / 3.0 - 1.0 / 15.0,
	            2.0 / 3.0 + 1.0 / 15.0, 1.0 / 3.0 - 1.0 / 15.0,
	            2.0 / 3.0 + 1.0 / 15.0, 0.0 / 3.0 + 1.0 / 15.0,
	            // Top face
	            2.0 / 3.0 + 1.0 / 15.0, 1.0 / 3.0 + 1.0 / 15.0,
	            1.0 - 1.0 / 15.0, 1.0 / 3.0 + 1.0 / 15.0,
	            1.0 - 1.0 / 15.0, 2.0 / 3.0 - 1.0 / 15.0,
	            2.0 / 3.0 + 1.0 / 15.0, 2.0 / 3.0 - 1.0 / 15.0,
	            // Bottom face
	            0.0 + 1.0 / 15.0, 1.0 / 3.0 - 1.0 / 15.0,
	            0.0 + 1.0 / 15.0, 0.0 / 3.0 + 1.0 / 15.0,
	            1.0 / 3.0 - 1.0 / 15.0, 0.0 / 3.0 + 1.0 / 15.0,
	            1.0 / 3.0 - 1.0 / 15.0, 1.0 / 3.0 - 1.0 / 15.0,
	            // Right face
	            0.0 + 1.0 / 15.0, 1.0 / 3.0 + 1.0 / 15.0,
	            1.0 / 3.0 - 1.0 / 15.0, 1.0 / 3.0 + 1.0 / 15.0,
	            1.0 / 3.0 - 1.0 / 15.0, 2.0 / 3.0 - 1.0 / 15.0,
	            0.0 + 1.0 / 15.0, 2.0 / 3.0 - 1.0 / 15.0,
	            // Left face
	            2.0 / 3.0 - 1.0 / 15.0, 1.0 / 3.0 + 1.0 / 15.0,
	            2.0 / 3.0 - 1.0 / 15.0, 2.0 / 3.0 - 1.0 / 15.0,
	            1.0 / 3.0 + 1.0 / 15.0, 2.0 / 3.0 - 1.0 / 15.0,
	            1.0 / 3.0 + 1.0 / 15.0, 1.0 / 3.0 + 1.0 / 15.0,
	            //top - left - front 
	            2.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            2.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            2.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            2.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
	            1.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
	            1.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
	            1.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
	            //top-right-front 
	            2.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            2.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            2.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            2.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
	            1.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
	            1.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
	            1.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
	            //top-left-back 
	            2.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            2.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            2.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            2.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            2.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
	            2.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
	            2.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
	            2.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
	            //top-right-back 
	            2.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            2.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            2.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            2.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            2.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
	            2.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
	            2.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
	            2.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
	            //bottom - left - front 
	            1.0 / 30.0, 1.0 / 30.0,
	            1.0 / 30.0, 1.0 / 30.0,
	            1.0 / 30.0, 1.0 / 30.0,
	            1.0 / 30.0, 1.0 / 30.0,
	            1.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
	            1.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
	            1.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
	            1.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
	            //bottom-right-front 
	            1.0 / 30.0, 1.0 / 30.0,
	            1.0 / 30.0, 1.0 / 30.0,
	            1.0 / 30.0, 1.0 / 30.0,
	            1.0 / 30.0, 1.0 / 30.0,
	            1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
	            1.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
	            1.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
	            1.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
	            //bottom-left-back 
	            1.0 / 30.0, 1.0 / 30.0,
	            1.0 / 30.0, 1.0 / 30.0,
	            1.0 / 30.0, 1.0 / 30.0,
	            1.0 / 30.0, 1.0 / 30.0,
	            1.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 3.0 + 1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            2.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
	            2.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
	            2.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
	            2.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
	            //bottom-right-back 
	            1.0 / 30.0, 1.0 / 30.0,
	            1.0 / 30.0, 1.0 / 30.0,
	            1.0 / 30.0, 1.0 / 30.0,
	            1.0 / 30.0, 1.0 / 30.0,
	            1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            2.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
	            2.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
	            2.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
	            2.0 / 3.0 + 1.0 / 30.0, 1.0 / 30.0,
	            //top-right
	            2.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            2.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            2.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            2.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            //top-left
	            2.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            2.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            2.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            2.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            //top-front
	            2.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            2.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            2.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            2.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
	            1.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
	            1.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
	            1.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
	            //top-back
	            2.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            2.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            2.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            2.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            2.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
	            2.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
	            2.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
	            2.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
	            //bottom-right
	            2.0 / 30.0, 1.0 / 30.0,
	            2.0 / 30.0, 1.0 / 30.0,
	            2.0 / 30.0, 1.0 / 30.0,
	            2.0 / 30.0, 1.0 / 30.0,
	            2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            //bottom-left
	            2.0 / 30.0, 1.0 / 30.0,
	            2.0 / 30.0, 1.0 / 30.0,
	            2.0 / 30.0, 1.0 / 30.0,
	            2.0 / 30.0, 1.0 / 30.0,
	            1.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            //bottom-front
	            2.0 / 30.0, 1.0 / 30.0,
	            2.0 / 30.0, 1.0 / 30.0,
	            2.0 / 30.0, 1.0 / 30.0,
	            2.0 / 30.0, 1.0 / 30.0,
	            1.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
	            1.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
	            1.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
	            1.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
	            //bottom-back
	            2.0 / 30.0, 1.0 / 30.0,
	            2.0 / 30.0, 1.0 / 30.0,
	            2.0 / 30.0, 1.0 / 30.0,
	            2.0 / 30.0, 1.0 / 30.0,
	            2.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
	            2.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
	            2.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
	            2.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
	            //front-right
	            1.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
	            1.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
	            1.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
	            1.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
	            2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            //front-left
	            1.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
	            1.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
	            1.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
	            1.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
	            1.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            //back-right
	            2.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
	            2.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
	            2.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
	            2.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
	            2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            //back-left
	            2.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
	            2.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
	            2.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
	            2.0 / 3.0 + 2.0 / 30.0, 1.0 / 30.0,
	            1.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	            1.0 / 3.0 + 2.0 / 30.0, 1.0 / 3.0 + 1.0 / 30.0,
	        ]);
	        this._image = image;
	    }
	    xNavigationCube.prototype.init = function (xviewer) {
	        var self = this;
	        this.viewer = xviewer;
	        var gl = this.viewer._gl;
	        //create own shader 
	        this._shader = null;
	        this._initShader();
	        this._alpha = this.passiveAlpha;
	        this._selection = 0.0;
	        //set own shader for init
	        gl.useProgram(this._shader);
	        //create uniform and attribute pointers
	        this._pMatrixUniformPointer = gl.getUniformLocation(this._shader, "uPMatrix");
	        this._rotationUniformPointer = gl.getUniformLocation(this._shader, "uRotation");
	        this._colourCodingUniformPointer = gl.getUniformLocation(this._shader, "uColorCoding");
	        this._alphaUniformPointer = gl.getUniformLocation(this._shader, "uAlpha");
	        this._selectionUniformPointer = gl.getUniformLocation(this._shader, "uSelection");
	        this._textureUniformPointer = gl.getUniformLocation(this._shader, "uTexture");
	        this._highlightingUniformPointer = gl.getUniformLocation(this._shader, "uHighlighting");
	        this._vertexAttrPointer = gl.getAttribLocation(this._shader, "aVertex"),
	            this._texCoordAttrPointer = gl.getAttribLocation(this._shader, "aTexCoord"),
	            this._idAttrPointer = gl.getAttribLocation(this._shader, "aId"),
	            gl.enableVertexAttribArray(this._vertexAttrPointer);
	        gl.enableVertexAttribArray(this._texCoordAttrPointer);
	        gl.enableVertexAttribArray(this._idAttrPointer);
	        //feed data into the GPU and keep pointers
	        this._indexBuffer = gl.createBuffer();
	        this._vertexBuffer = gl.createBuffer();
	        this._texCoordBuffer = gl.createBuffer();
	        this._idBuffer = gl.createBuffer();
	        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
	        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
	        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
	        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
	        gl.bindBuffer(gl.ARRAY_BUFFER, this._texCoordBuffer);
	        gl.bufferData(gl.ARRAY_BUFFER, this.txtCoords, gl.STATIC_DRAW);
	        gl.bindBuffer(gl.ARRAY_BUFFER, this._idBuffer);
	        gl.bufferData(gl.ARRAY_BUFFER, this.ids(), gl.STATIC_DRAW);
	        //create texture
	        var self = this;
	        this._texture = gl.createTexture();
	        if (typeof (this._image) === "undefined") {
	            //add HTML UI to viewer port
	            var data = xbim_navigation_cube_textures_1.xCubeTextures.en;
	            var image = new Image();
	            self._image = image;
	            image.addEventListener("load", function () {
	                //load image texture into GPU
	                gl.bindTexture(gl.TEXTURE_2D, self._texture);
	                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, self._image);
	                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
	                gl.generateMipmap(gl.TEXTURE_2D);
	            });
	            image.src = data;
	        }
	        else {
	            //load image texture into GPU
	            gl.bindTexture(gl.TEXTURE_2D, self._texture);
	            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, self._image);
	            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
	            gl.generateMipmap(gl.TEXTURE_2D);
	        }
	        //reset original shader program 
	        gl.useProgram(this.viewer._shaderProgram);
	        xviewer._canvas.addEventListener('mousemove', function (event) {
	            var startX = event.clientX;
	            var startY = event.clientY;
	            //get coordinates within canvas (with the right orientation)
	            var r = xviewer._canvas.getBoundingClientRect();
	            var viewX = startX - r.left;
	            var viewY = xviewer._height - (startY - r.top);
	            //this is for picking
	            var id = xviewer._getID(viewX, viewY);
	            if (id >= self.TOP && id <= self.BACK_LEFT) {
	                self._alpha = self.activeAlpha;
	                self._selection = id;
	            }
	            else {
	                self._alpha = self.passiveAlpha;
	                self._selection = 0;
	            }
	        }, true);
	        self._drag = false;
	        xviewer._canvas.addEventListener('mousedown', function (event) {
	            var startX = event.clientX;
	            var startY = event.clientY;
	            //get coordinates within canvas (with the right orientation)
	            var r = xviewer._canvas.getBoundingClientRect();
	            var viewX = startX - r.left;
	            var viewY = xviewer._height - (startY - r.top);
	            //this is for picking
	            var id = xviewer._getID(viewX, viewY);
	            if (id >= self.TOP && id <= self.BACK_LEFT) {
	                //change viewer navigation mode to be 'orbit'
	                self._drag = true;
	                self._originalNavigation = xviewer.navigationMode;
	                xviewer.navigationMode = "orbit";
	            }
	        }, true);
	        window.addEventListener('mouseup', function (event) {
	            if (self._drag === true) {
	                xviewer.navigationMode = self._originalNavigation;
	            }
	            self._drag = false;
	        }, true);
	        this._initialized = true;
	    };
	    xNavigationCube.prototype.onBeforeDraw = function () { };
	    xNavigationCube.prototype.onBeforePick = function (id) {
	        if (id >= this.TOP && id <= this.BACK_LEFT) {
	            var dir = glMatrix.vec3.create();
	            var distance = this.viewer._distance;
	            var diagonalRatio = 1.3;
	            switch (id) {
	                case this.TOP:
	                    this.viewer.show('top');
	                    return true;
	                case this.BOTTOM:
	                    this.viewer.show('bottom');
	                    return true;
	                case this.LEFT:
	                    this.viewer.show('left');
	                    return true;
	                case this.RIGHT:
	                    this.viewer.show('right');
	                    return true;
	                case this.FRONT:
	                    this.viewer.show('front');
	                    return true;
	                case this.BACK:
	                    this.viewer.show('back');
	                    return true;
	                case this.TOP_LEFT_FRONT:
	                    dir = glMatrix.vec3.fromValues(-1, -1, 1);
	                    distance *= diagonalRatio;
	                    break;
	                case this.TOP_RIGHT_FRONT:
	                    dir = glMatrix.vec3.fromValues(1, -1, 1);
	                    distance *= diagonalRatio;
	                    break;
	                case this.TOP_LEFT_BACK:
	                    dir = glMatrix.vec3.fromValues(-1, 1, 1);
	                    distance *= diagonalRatio;
	                    break;
	                case this.TOP_RIGHT_BACK:
	                    dir = glMatrix.vec3.fromValues(1, 1, 1);
	                    distance *= diagonalRatio;
	                    break;
	                case this.BOTTOM_LEFT_FRONT:
	                    dir = glMatrix.vec3.fromValues(-1, -1, -1);
	                    distance *= diagonalRatio;
	                    break;
	                case this.BOTTOM_RIGHT_FRONT:
	                    dir = glMatrix.vec3.fromValues(1, -1, -1);
	                    distance *= diagonalRatio;
	                    break;
	                case this.BOTTOM_LEFT_BACK:
	                    dir = glMatrix.vec3.fromValues(-1, 1, -1);
	                    distance *= diagonalRatio;
	                    break;
	                case this.BOTTOM_RIGHT_BACK:
	                    dir = glMatrix.vec3.fromValues(1, 1, -1);
	                    distance *= diagonalRatio;
	                    break;
	                case this.TOP_LEFT:
	                    dir = glMatrix.vec3.fromValues(-1, 0, 1);
	                    distance *= diagonalRatio;
	                    break;
	                case this.TOP_RIGHT:
	                    dir = glMatrix.vec3.fromValues(1, 0, 1);
	                    distance *= diagonalRatio;
	                    break;
	                case this.TOP_FRONT:
	                    dir = glMatrix.vec3.fromValues(0, -1, 1);
	                    distance *= diagonalRatio;
	                    break;
	                case this.TOP_BACK:
	                    dir = glMatrix.vec3.fromValues(0, 1, 1);
	                    distance *= diagonalRatio;
	                    break;
	                case this.BOTTOM_LEFT:
	                    dir = glMatrix.vec3.fromValues(-1, 0, -1);
	                    distance *= diagonalRatio;
	                    break;
	                case this.BOTTOM_RIGHT:
	                    dir = glMatrix.vec3.fromValues(1, 0, -1);
	                    break;
	                case this.BOTTOM_FRONT:
	                    dir = glMatrix.vec3.fromValues(0, -1, -1);
	                    distance *= diagonalRatio;
	                    break;
	                case this.BOTTOM_BACK:
	                    dir = glMatrix.vec3.fromValues(0, 1, -1);
	                    distance *= diagonalRatio;
	                    break;
	                case this.FRONT_RIGHT:
	                    dir = glMatrix.vec3.fromValues(1, -1, 0);
	                    distance *= diagonalRatio;
	                    break;
	                case this.FRONT_LEFT:
	                    dir = glMatrix.vec3.fromValues(-1, -1, 0);
	                    distance *= diagonalRatio;
	                    break;
	                case this.BACK_RIGHT:
	                    dir = glMatrix.vec3.fromValues(1, 1, 0);
	                    distance *= diagonalRatio;
	                    break;
	                case this.BACK_LEFT:
	                    dir = glMatrix.vec3.fromValues(-1, 1, 0);
	                    distance *= diagonalRatio;
	                    break;
	                default:
	                    break;
	            }
	            var o = this.viewer._origin;
	            var heading = glMatrix.vec3.fromValues(0, 0, 1);
	            var origin = glMatrix.vec3.fromValues(o[0], o[1], o[2]);
	            dir = glMatrix.vec3.normalize(glMatrix.vec3.create(), dir);
	            var shift = glMatrix.vec3.scale(glMatrix.vec3.create(), dir, distance);
	            var camera = glMatrix.vec3.add(glMatrix.vec3.create(), origin, shift);
	            //use look-at function to set up camera and target
	            glMatrix.mat4.lookAt(this.viewer._mvMatrix, camera, origin, heading);
	            return true;
	        }
	        return false;
	    };
	    xNavigationCube.prototype.onAfterDraw = function () {
	        var gl = this.setActive();
	        //set uniform for colour coding to false
	        gl.uniform1i(this._colourCodingUniformPointer, 0);
	        this.draw();
	        this.setInactive();
	    };
	    xNavigationCube.prototype.onBeforeDrawId = function () { };
	    xNavigationCube.prototype.onAfterDrawId = function () {
	        var gl = this.setActive();
	        //set uniform for colour coding to false
	        gl.uniform1i(this._colourCodingUniformPointer, 1);
	        this.draw();
	        this.setInactive();
	    };
	    xNavigationCube.prototype.onBeforeGetId = function (id) { };
	    xNavigationCube.prototype.setActive = function () {
	        var gl = this.viewer._gl;
	        //set own shader
	        gl.useProgram(this._shader);
	        return gl;
	    };
	    xNavigationCube.prototype.setInactive = function () {
	        var gl = this.viewer._gl;
	        //set viewer shader
	        gl.useProgram(this.viewer._shaderProgram);
	    };
	    xNavigationCube.prototype.draw = function () {
	        if (!this._initialized)
	            return;
	        var gl = this.viewer._gl;
	        //set navigation data from xViewer to this shader
	        var pMatrix = glMatrix.mat4.create();
	        var height = 1.0 / this.ratio;
	        var width = height / this.viewer._height * this.viewer._width;
	        //create orthogonal projection matrix
	        switch (this.position) {
	            case this.BOTTOM_RIGHT:
	                glMatrix.mat4.ortho(pMatrix, (this.ratio - 1.0) * width, //left
	                this.ratio * width, //right
	                this.ratio * -1.0 * height, //bottom
	                (1.0 - this.ratio) * height, //top
	                -1, //near
	                1); //far
	                break;
	            case this.BOTTOM_LEFT:
	                glMatrix.mat4.ortho(pMatrix, -1.0 * this.ratio * width, //left
	                (1.0 - this.ratio) * width, //right
	                this.ratio * -1.0 * height, //bottom
	                (1.0 - this.ratio) * height, //top
	                -1, //near
	                1); //far
	                break;
	            case this.TOP_LEFT:
	                glMatrix.mat4.ortho(pMatrix, -1.0 * this.ratio * width, //left
	                (1.0 - this.ratio) * width, //right
	                (this.ratio - 1.0) * height, //bottom
	                this.ratio * height, //top
	                -1, //near
	                1); //far
	                break;
	            case this.TOP_RIGHT:
	                glMatrix.mat4.ortho(pMatrix, (this.ratio - 1.0) * width, //left
	                this.ratio * width, //right
	                (this.ratio - 1.0) * height, //bottom
	                this.ratio * height, //top
	                -1, //near
	                1); //far
	                break;
	            default:
	        }
	        //extract just a rotation from model-view matrix
	        var rotation = glMatrix.mat3.fromMat4(glMatrix.mat3
	            .create(), this.viewer._mvMatrix);
	        gl.uniformMatrix4fv(this._pMatrixUniformPointer, false, pMatrix);
	        gl.uniformMatrix3fv(this._rotationUniformPointer, false, rotation);
	        gl.uniform1f(this._alphaUniformPointer, this._alpha);
	        gl.uniform1f(this._highlightingUniformPointer, this.highlighting);
	        gl.uniform1f(this._selectionUniformPointer, this._selection);
	        //bind data buffers
	        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
	        gl.vertexAttribPointer(this._vertexAttrPointer, 3, gl.FLOAT, false, 0, 0);
	        gl.bindBuffer(gl.ARRAY_BUFFER, this._idBuffer);
	        gl.vertexAttribPointer(this._idAttrPointer, 1, gl.FLOAT, false, 0, 0);
	        gl.bindBuffer(gl.ARRAY_BUFFER, this._texCoordBuffer);
	        gl.vertexAttribPointer(this._texCoordAttrPointer, 2, gl.FLOAT, false, 0, 0);
	        //bind texture
	        gl.activeTexture(gl.TEXTURE1);
	        gl.bindTexture(gl.TEXTURE_2D, this._texture);
	        gl.uniform1i(this._textureUniformPointer, 1);
	        var cfEnabled = gl.getParameter(gl.CULL_FACE);
	        if (!cfEnabled)
	            gl.enable(gl.CULL_FACE);
	        //draw the cube as an element array
	        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
	        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
	        if (!cfEnabled)
	            gl.disable(gl.CULL_FACE);
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
	        };
	        //fragment shader
	        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	        compile(fragmentShader, xbim_navigation_cube_shaders_1.xCubeShaders.cube_fshader);
	        //vertex shader (the more complicated one)
	        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	        compile(vertexShader, xbim_navigation_cube_shaders_1.xCubeShaders.cube_vshader);
	        //link program
	        this._shader = gl.createProgram();
	        gl.attachShader(this._shader, vertexShader);
	        gl.attachShader(this._shader, fragmentShader);
	        gl.linkProgram(this._shader);
	        if (!gl.getProgramParameter(this._shader, gl.LINK_STATUS)) {
	            viewer._error('Could not initialise shaders for a navigation cube plugin');
	        }
	    };
	    xNavigationCube.prototype.ids = function () {
	        return new Float32Array([
	            this.FRONT,
	            this.FRONT,
	            this.FRONT,
	            this.FRONT,
	            this.BACK,
	            this.BACK,
	            this.BACK,
	            this.BACK,
	            this.TOP,
	            this.TOP,
	            this.TOP,
	            this.TOP,
	            this.BOTTOM,
	            this.BOTTOM,
	            this.BOTTOM,
	            this.BOTTOM,
	            this.RIGHT,
	            this.RIGHT,
	            this.RIGHT,
	            this.RIGHT,
	            this.LEFT,
	            this.LEFT,
	            this.LEFT,
	            this.LEFT,
	            this.TOP_LEFT_FRONT,
	            this.TOP_LEFT_FRONT,
	            this.TOP_LEFT_FRONT,
	            this.TOP_LEFT_FRONT,
	            this.TOP_LEFT_FRONT,
	            this.TOP_LEFT_FRONT,
	            this.TOP_LEFT_FRONT,
	            this.TOP_LEFT_FRONT,
	            this.TOP_LEFT_FRONT,
	            this.TOP_LEFT_FRONT,
	            this.TOP_LEFT_FRONT,
	            this.TOP_LEFT_FRONT,
	            this.TOP_RIGHT_FRONT,
	            this.TOP_RIGHT_FRONT,
	            this.TOP_RIGHT_FRONT,
	            this.TOP_RIGHT_FRONT,
	            this.TOP_RIGHT_FRONT,
	            this.TOP_RIGHT_FRONT,
	            this.TOP_RIGHT_FRONT,
	            this.TOP_RIGHT_FRONT,
	            this.TOP_RIGHT_FRONT,
	            this.TOP_RIGHT_FRONT,
	            this.TOP_RIGHT_FRONT,
	            this.TOP_RIGHT_FRONT,
	            this.TOP_LEFT_BACK,
	            this.TOP_LEFT_BACK,
	            this.TOP_LEFT_BACK,
	            this.TOP_LEFT_BACK,
	            this.TOP_LEFT_BACK,
	            this.TOP_LEFT_BACK,
	            this.TOP_LEFT_BACK,
	            this.TOP_LEFT_BACK,
	            this.TOP_LEFT_BACK,
	            this.TOP_LEFT_BACK,
	            this.TOP_LEFT_BACK,
	            this.TOP_LEFT_BACK,
	            this.TOP_RIGHT_BACK,
	            this.TOP_RIGHT_BACK,
	            this.TOP_RIGHT_BACK,
	            this.TOP_RIGHT_BACK,
	            this.TOP_RIGHT_BACK,
	            this.TOP_RIGHT_BACK,
	            this.TOP_RIGHT_BACK,
	            this.TOP_RIGHT_BACK,
	            this.TOP_RIGHT_BACK,
	            this.TOP_RIGHT_BACK,
	            this.TOP_RIGHT_BACK,
	            this.TOP_RIGHT_BACK,
	            this.BOTTOM_LEFT_FRONT,
	            this.BOTTOM_LEFT_FRONT,
	            this.BOTTOM_LEFT_FRONT,
	            this.BOTTOM_LEFT_FRONT,
	            this.BOTTOM_LEFT_FRONT,
	            this.BOTTOM_LEFT_FRONT,
	            this.BOTTOM_LEFT_FRONT,
	            this.BOTTOM_LEFT_FRONT,
	            this.BOTTOM_LEFT_FRONT,
	            this.BOTTOM_LEFT_FRONT,
	            this.BOTTOM_LEFT_FRONT,
	            this.BOTTOM_LEFT_FRONT,
	            this.BOTTOM_RIGHT_FRONT,
	            this.BOTTOM_RIGHT_FRONT,
	            this.BOTTOM_RIGHT_FRONT,
	            this.BOTTOM_RIGHT_FRONT,
	            this.BOTTOM_RIGHT_FRONT,
	            this.BOTTOM_RIGHT_FRONT,
	            this.BOTTOM_RIGHT_FRONT,
	            this.BOTTOM_RIGHT_FRONT,
	            this.BOTTOM_RIGHT_FRONT,
	            this.BOTTOM_RIGHT_FRONT,
	            this.BOTTOM_RIGHT_FRONT,
	            this.BOTTOM_RIGHT_FRONT,
	            this.BOTTOM_LEFT_BACK,
	            this.BOTTOM_LEFT_BACK,
	            this.BOTTOM_LEFT_BACK,
	            this.BOTTOM_LEFT_BACK,
	            this.BOTTOM_LEFT_BACK,
	            this.BOTTOM_LEFT_BACK,
	            this.BOTTOM_LEFT_BACK,
	            this.BOTTOM_LEFT_BACK,
	            this.BOTTOM_LEFT_BACK,
	            this.BOTTOM_LEFT_BACK,
	            this.BOTTOM_LEFT_BACK,
	            this.BOTTOM_LEFT_BACK,
	            this.BOTTOM_RIGHT_BACK,
	            this.BOTTOM_RIGHT_BACK,
	            this.BOTTOM_RIGHT_BACK,
	            this.BOTTOM_RIGHT_BACK,
	            this.BOTTOM_RIGHT_BACK,
	            this.BOTTOM_RIGHT_BACK,
	            this.BOTTOM_RIGHT_BACK,
	            this.BOTTOM_RIGHT_BACK,
	            this.BOTTOM_RIGHT_BACK,
	            this.BOTTOM_RIGHT_BACK,
	            this.BOTTOM_RIGHT_BACK,
	            this.BOTTOM_RIGHT_BACK,
	            this.TOP_RIGHT,
	            this.TOP_RIGHT,
	            this.TOP_RIGHT,
	            this.TOP_RIGHT,
	            this.TOP_RIGHT,
	            this.TOP_RIGHT,
	            this.TOP_RIGHT,
	            this.TOP_RIGHT,
	            this.TOP_LEFT,
	            this.TOP_LEFT,
	            this.TOP_LEFT,
	            this.TOP_LEFT,
	            this.TOP_LEFT,
	            this.TOP_LEFT,
	            this.TOP_LEFT,
	            this.TOP_LEFT,
	            this.TOP_FRONT,
	            this.TOP_FRONT,
	            this.TOP_FRONT,
	            this.TOP_FRONT,
	            this.TOP_FRONT,
	            this.TOP_FRONT,
	            this.TOP_FRONT,
	            this.TOP_FRONT,
	            this.TOP_BACK,
	            this.TOP_BACK,
	            this.TOP_BACK,
	            this.TOP_BACK,
	            this.TOP_BACK,
	            this.TOP_BACK,
	            this.TOP_BACK,
	            this.TOP_BACK,
	            this.BOTTOM_RIGHT,
	            this.BOTTOM_RIGHT,
	            this.BOTTOM_RIGHT,
	            this.BOTTOM_RIGHT,
	            this.BOTTOM_RIGHT,
	            this.BOTTOM_RIGHT,
	            this.BOTTOM_RIGHT,
	            this.BOTTOM_RIGHT,
	            this.BOTTOM_LEFT,
	            this.BOTTOM_LEFT,
	            this.BOTTOM_LEFT,
	            this.BOTTOM_LEFT,
	            this.BOTTOM_LEFT,
	            this.BOTTOM_LEFT,
	            this.BOTTOM_LEFT,
	            this.BOTTOM_LEFT,
	            this.BOTTOM_FRONT,
	            this.BOTTOM_FRONT,
	            this.BOTTOM_FRONT,
	            this.BOTTOM_FRONT,
	            this.BOTTOM_FRONT,
	            this.BOTTOM_FRONT,
	            this.BOTTOM_FRONT,
	            this.BOTTOM_FRONT,
	            this.BOTTOM_BACK,
	            this.BOTTOM_BACK,
	            this.BOTTOM_BACK,
	            this.BOTTOM_BACK,
	            this.BOTTOM_BACK,
	            this.BOTTOM_BACK,
	            this.BOTTOM_BACK,
	            this.BOTTOM_BACK,
	            this.FRONT_RIGHT,
	            this.FRONT_RIGHT,
	            this.FRONT_RIGHT,
	            this.FRONT_RIGHT,
	            this.FRONT_RIGHT,
	            this.FRONT_RIGHT,
	            this.FRONT_RIGHT,
	            this.FRONT_RIGHT,
	            this.FRONT_LEFT,
	            this.FRONT_LEFT,
	            this.FRONT_LEFT,
	            this.FRONT_LEFT,
	            this.FRONT_LEFT,
	            this.FRONT_LEFT,
	            this.FRONT_LEFT,
	            this.FRONT_LEFT,
	            this.BACK_RIGHT,
	            this.BACK_RIGHT,
	            this.BACK_RIGHT,
	            this.BACK_RIGHT,
	            this.BACK_RIGHT,
	            this.BACK_RIGHT,
	            this.BACK_RIGHT,
	            this.BACK_RIGHT,
	            this.BACK_LEFT,
	            this.BACK_LEFT,
	            this.BACK_LEFT,
	            this.BACK_LEFT,
	            this.BACK_LEFT,
	            this.BACK_LEFT,
	            this.BACK_LEFT,
	            this.BACK_LEFT,
	        ]);
	    };
	    ;
	    return xNavigationCube;
	}());
	exports.xNavigationCube = xNavigationCube;


/***/ },
/* 16 */
/***/ function(module, exports) {

	"use strict";
	exports.xHomeTextures = {
	    en: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASMAAAEXCAYAAADmyyKWAAAABHNCSVQICAgIfAhkiAAADtpJREFUeJzt3XuwrXVdx/H3Fzicw+VwB5EABRGIh6sUkCSlkZbIRVQuapIXwiJNy1vaZSbLLJtsZKzIgYKBQFBABEIQBA/XairGfiQqmBU55G0QLyCXX388TyZyOGdf1lq/71rr/foPZp+1Pmfvvd4z53n2b+2otSItVYk4ADgTOK2r9Y7WezS9Nmg9QNOrRLwAWAMcCqwZ/ltaEmOkJSkRpwJXAKuH/7UauGL4/9Kihf9M02KUiADeA7xjHR/2XuCdnd9cWgRjpAUrESuBc4ATF/DhHwZO6Wp9aLyrNCuMkRakRGwLXAb85CL+2E3AcV2tXxvPKs0SY6T1KhHPAK4C9lzCH/8c8MKu1rtHu0qzxgvYWqcS8RPAbSwtRAx/7rbhcaQnZYz0pErES4Hrge2W+VDbAdcPjyetlTHSWpWItwAXAatG9JCrgIuGx5WewGtGepwSsSFwBvDLY3yavwDe0NX66BifQ1PGGOn7SsTmwIXAURN4uiuBk7pavzWB59IUMEYCoEQ8lT4QB03waf8ZOKqr9csTfE4l5TUjUSL2BW5nsiFieL7bh+fXnDNGc65EHAncDOzSaMIuwM3DDs0xYzTHSsRr6H+YcYvGU7YArhr2aE4ZozlVIt4NnAWsaL1lsAI4a9ilOeQF7DlTIjYGzgZe0XrLOpwPvKar9Xuth2hyjNEcKRFbA5cCP9V6ywLcCLy4q/UbrYdoMozRnCgRu9FfH9q79ZZF+Cz9Idsvth6i8fOa0RwoEYfQH3adphBBv/e2Yb9mnDGacSXixcANwA6NpyzVDsANw99DM8wYzbAS8SbgI8Amrbcs0ybAR4a/j2aU14xmUInYAPgz4A2tt4zBGcCbulofaz1Eo2WMZkyJ2BS4ADim9ZYxuhw4uav1O62HaHSM0QwpEU+h//VBP9Z6ywT8I/Cirtb7Wg/RaBijGVEi9qG/df+01lsm6Ev0t/7vbD1Ey+cF7BlQIp5Lf9h1nkIE/d/35uHvrylnjKZciXgV8Algq9ZbGtkK+MTwedAUM0ZTrET8Lv0vVcxy2LWVFcA5w+dDU8prRlOoRKwAPgSc0npLQucAp3a1Ptx6iBbHGE2ZErElcAnwvNZbErseOL6r9f7WQ7RwxmiKlIin0d8x26f1lilwJ/2dti+1HqKF8ZrRlCgRB9MfdjVEC7MP/SHbg1sP0cIYoylQIo6mf3+fHVtvmTI7AjcOnz8lZ4ySKxG/ClwGbNZ6y5TaDLhs+DwqMa8ZJTUcdv0T4M2tt8yQ9wNv8ZBtTsYooRKxCf37QPsePqN3KfCKrtbvth6ixzNGyZSIHehPpR/aessMux04pqv1f1oP0f8zRomUiL3ob93v3nrLHLiH/tb/Xa2HqOcF7CRKxBHArRiiSdkduHX4vCsBY5RAiXg5cC2wdestc2Zr4Nrh86/GjFFjJeJdwHnAxq23zKmNgfOGr4Ma8ppRIyViI+BMwN8vn8fZwGldrY+0HjKPjFEDJWIL+t/a8bOtt+gJrgVe2tX6zdZD5o0xmrASsQtwJbBf6y16Up8Bjupq/c/WQ+aJ14wmqEQcRH/Y1RDlth/9IduDWg+ZJ8ZoQkrEC4FPAzu13qIF2Qn49PB10wQYowkoEa+n/6nqzVtv0aJsDlw+fP00Zl4zGqMSEcAfAW9tvUXL9j7g7Z0vmLExRmNSIlYB5wIva71FI3Mx8Kqu1gdbD5lFxmgMSsR2wMeAZ7feopG7BTi2q/WrrYfMGmM0YiXimfSHXfdovUVj8wX6Q7afbz1klngBe4RKxOH0h10N0Wzbg/6Q7eGth8wSYzQiJeJE4Dpg29ZbNBHbAtcNX3eNgDEagRLxduACYGXrLZqolcAFw9dfy+Q1o2UYDrt+EPil1lvU3F8Bp3vIdumM0RKViNXARcDPtd6iNK4GTuhqfaD1kGlkjJagRPwI/WHXA1pvUTp30B+yvbf1kGnjNaNFKhH70x92NURamwPoD9nu33rItDFGi1AiXgDcBOzceotS2xm4afh+0QIZowUqEa8DrgBWt96iqbAauGL4vtECeM1oPYbDrn8A/GbrLZpafwi8y0O262aM1qFErAT+Bjip8RRNvwuBX+xqfaj1kKyM0ZMoEdsAlwHPab1FM2MNcFxX69dbD8nIGK1FiXgG/WHXPVtv0cz5HP0h27tbD8nGC9g/pEQcRn/Y1RBpHPakP2R7WOsh2RijH1AiXgJ8Cti+9RbNtO2BTw3fbxoYo0GJ+A36d/Jb1XqL5sIq4OLh+054zYgSsSHwAeBXWm/R3Ppz4I1drY+2HtLSXMeoRGwGfBg4qvUWzb0rgRO7Wr/dekgrcxujEvFU+p+oflbrLdLgn4AXdbV+ufWQFubymlGJ2Jf+sKshUibPoj9ku2/rIS3MXYxKxJH0h113bb1FWotd6Q/ZHtl6yKTNVYxKxKvpf5hxy9ZbpHXYErhq+H6dG3MToxLxe8DZwIrWW6QFWAGcPXzfzoWZv4BdIjYGzgJe2XqLtETnAa/tav1e6yHjNNMxKhFbA5cAP914irRcNwDHd7V+o/WQcZnZGJWI3eivD+3deos0Ip+lP2T7xdZDxmEmrxmViEPob90bIs2Svelv/R/Sesg4zFyMSsRx9Iddd2i9RRqDHegP2R7XesiozVSMSsSvAR8FNm29RRqjTYGPDt/vM2MmrhmViA2A9wNvbL1FmrAPAG/uan2s9ZDlmvoYlYhNgb8Fjm29RWrkY8DLu1q/03rIckx1jErEU4CPAz/eeovU2D8AR3e13td6yFJNbYxKxI/S37p/euMpUhb/Tn/r/99aD1mKqbyAXSKeC9yCIZJ+0NOBW4bXx9SZuhiViF8Arga2ar1FSmgr4OrhdTJVpipGJeJ3gHOBjVtvkRLbGDh3eL1Mjam4ZlQiVgAfAk5pvUWaMucAp3a1Ptx6yPqkj1GJ2JL+Bxl/pvUWaUpdB7ykq/X+1kPWJXWMSsSu9HfMutZbpClX6O+0/UfrIU8m7TWjEnEwcDuGSBqFDrh9eF2llDJGJeJo4EZgx9ZbpBmyI3Dj8PpKJ12MSsTpwKXAZq23SDNoM+DS4XWWSpprRsNh1/cBv956izQn/hR4a5ZDtiliVCI2oX+f3+Nbb5HmzCXAK7tav9t6SPMYlYjt6Q+7Htp0iDS/bqc/ZPuVliOaxqhE7EV/6373ZiMkAdxDf+v/rlYDml3ALhFH0B92NURSe7vTH7I9otWAJjEqEScD1wDbtHh+SWu1DXDN8PqcuInHqES8EzgfWDnp55a0XiuB84fX6URN7JpRidgI+EvgtRN5QknLdRbw+q7WRybxZBOJUYnYArgYeP7Yn0zSKF0DvKyr9ZvjfqKxx6hE7Ex/x2y/sT6RpHH5DP2dtv8a55OM9ZpRiTiQ/mcYDJE0vfajP2R74DifZGwxKhE/D6wBdhrXc0iamJ2ANcPreizGEqMScRr9T1VvPo7Hl9TE5sDHh9f3yI30mlGJCOC9wNtG9qCSMvpj4B3dCAMyshiViFX077d7wkgeUFJ2FwGndLU+OIoHG0mMSsR29L9i99nLfjBJ0+QW4Niu1q8u94GWHaMS8Uz6W/d7LHeMpKn0Bfpb/59fzoMs6wJ2iTgcuBVDJM2zPYBbhx4s2ZJjVCJOAD4JbLucAZJmwrbAJ4cuLMmSYlQi3gZcCKxa6hNLmjmrgAuHPizaoq4ZlYgNgQ8CY/k5A0kz40zg9K7WRxf6BxYcoxKxOf2tvLH9BKakmfJ3wAldrd9ayAcvKEYlYifgSmCsZ1MkzZx/AY7qav3v9X3geq8ZlYj96Q+7GiJJi3Ug/SHb/df3geuMUYl4Pv1h151HNEzS/NmZ/pDtOt/P7EljVCJeR/9Psy1GPEzS/NkCuHLoylo94ZrRcNj194GJvweupLnwHuC3fviQ7eNiVCJWAn8NNPntAJLmxgXAq7taH/q///H9GJWIbYDLgOe02SZpzqwBjutq/ToMMSoRu9Mfdt2r6TRJ8+Yu+kO298S/wmHA5cD2jUdJmk9fAY7ZCHiM6XtDtOcBv916hJTUu4HrW49YpMc26mr9+9YrFqtE7Nh6g5TYnV2tN7QesVgT//XWkrQ2xkhSCsZIUgrGSFIKxkhSCsZIUgrGSFIKxkhSCsZIUgrGSFIKxkhSChu1HpDdhltuCRGtZ0xcffRRHnvggZE/7garVxMbbjjyx02vVh69//7WK1IzRuux1333EStXtp4xcQ/ecQd3Hzj6Xwiz25o1rDrggJE/bnb1oYe4c5W/gHld/GeapBSMkaQUjJGkFIyRpBSMkaQUjJGkFIyRpBSMkaQUjJGkFIyRpBSMkaQUjJGkFIyRpBSMkaQUjJGkFIyRpBSMkaQUjJGkFIyRpBSMkaQUjJGkFIyRpBSMkaQUjJGkFIyRpBSMkaQUjJGkFIyRpBSMkaQUjJGkFIyRpBSMkaQUjJGkFIyRpBSMkaQUjJGkFIyRpBSMkaQUjJGkFIyRpBSMkaQUjJGkFIyRpBSMkaQUjJGkFIyRpBSMkaQUjJGkFIyRpBSMkaQUjJGkFIyRpBSMkaQUjJGkFDZqPSC7r51xBrFiResZE/fIvfeO5XHvP/98vn3DDWN57Mzqww+3npBe1Fpbb1i0EnEScEHrHVJSJ3e1Xth6xGL5zzRJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKRgjSSkYI0kpGCNJKfwvQct8OdSrePoAAAAASUVORK5CYII='
	};


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var xbim_navigation_home_textures_1 = __webpack_require__(16);
	var glMatrix = __webpack_require__(11);
	var xNavigationHome = (function () {
	    /**
	     * This is constructor of the Home plugin for {@link xViewer xBIM Viewer}. It gets optional Image object as an argument. If no image
	     * is specified there is a default one (which is not very prety).
	     * @name xNavigationHome
	     * @constructor
	     * @classdesc This is a plugin for xViewer which renders interactive home button. It is customizable in terms of alpha
	     * behaviour and its position on the viewer canvas as well as definition of the distance and view direction. Use of plugin:
	     *
	     *     var home = new xNavigationHome();
	     *     viewer.addPlugin(home);
	     *
	     *
	     * @param {Image} [image = null] - optional image to be used for a button.
	    */
	    function xNavigationHome(image) {
	        /**
	        * Size of the the home button relative to the size of viewer canvas. This has to be a positive number between [0,1] Default value is 0.2.
	        * @member {Number} xNavigationHome#ratio
	        */
	        this.ratio = 0.2;
	        /**
	        * Position of the the home button relative to the size of viewer canvas. This has to be a positive number between [0,1] Default value is 0.05.
	        * @member {Number} xNavigationHome#placementX
	        */
	        this.placementX = 0.05;
	        /**
	        * Position of the the home button relative to the size of viewer canvas. This has to be a positive number between [0,1] Default value is 0.05.
	        * @member {Number} xNavigationHome#placementY
	        */
	        this.placementY = 0.05;
	        /**
	        * Navigation home button has two transparency states. One is when user hovers over the cube and the second when the cursor is anywhere else.
	        * This is for the hovering shate and it should be a positive number between [0,1]. If the value is less than 1 cube will be semitransparent
	        * when user hovers over. Default value is 1.0.
	        * @member {Number} xNavigationHome#activeAlpha
	        */
	        this.activeAlpha = 1.0;
	        /**
	        * Navigation home button has two transparency states. One is when user hovers over the cube and the second when the cursor is anywhere else.
	        * This is for the non-hovering shate and it should be a positive number between [0,1]. If the value is less than 1 cube will be semitransparent
	        * when user is not hovering over. Default value is 0.3.
	        * @member {Number} xNavigationHome#passiveAlpha
	        */
	        this.passiveAlpha = 0.3;
	        /**
	        * Distance to be used for a home view. If null, default viewer distance for a full extent mode is used. Default value: null
	        * @member {Number} xNavigationHome#distance
	        */
	        this.distance = null;
	        /**
	        * View direction to be used for a home view. Default value: [1, 1, -1]
	        * @member {Number} xNavigationHome#viewDirection
	        */
	        this.viewDirection = [1, 1, -1];
	        //private variables
	        this._image = image;
	    }
	    xNavigationHome.prototype.init = function (xviewer) {
	        this._viewer = xviewer;
	        var self = this;
	        if (typeof (this._image) === "undefined") {
	            //add HTML UI to viewer port
	            var data = xbim_navigation_home_textures_1.xHomeTextures["en"];
	            var image = new Image();
	            self._image = image;
	            image.addEventListener("load", function () {
	                self._adjust();
	            });
	            image.src = data;
	        }
	        else {
	            self._adjust();
	        }
	        //add image to document
	        document.documentElement.appendChild(this._image);
	        //add click event listener
	        self._image.addEventListener("click", function () {
	            var viewer = self._viewer;
	            //set target to full extent
	            viewer.setCameraTarget();
	            var origin = viewer._origin;
	            var distance = self.distance != null ? self.distance : viewer._distance;
	            var normDirection = glMatrix.vec3.normalize(glMatrix.vec3.create(), self.viewDirection);
	            var position = glMatrix.vec3.scale(glMatrix.vec3.create(), normDirection, -1.0 * distance);
	            viewer.setCameraPosition(position);
	        });
	        //set active state styling
	        self._image.addEventListener("mouseover", function () {
	            self._image.style.opacity = self.activeAlpha.toString(); //For real browsers;
	            self._image.style.filter = "alpha(opacity=" + Math.round(self.activeAlpha * 100.0) + ")"; //For IE;
	        });
	        //set passive state styling
	        self._image.addEventListener("mouseleave", function () {
	            self._image.style.opacity = self.passiveAlpha.toString(); //For real browsers;
	            self._image.style.filter = "alpha(opacity=" + Math.round(self.passiveAlpha * 100.0) + ")"; //For IE;
	        });
	        //set initial styling
	        self._image.style.opacity = this.passiveAlpha.toString(); //For real browsers;
	        self._image.style.filter = "alpha(opacity=" + Math.round(this.passiveAlpha * 100.0) + ")"; //For IE;
	    };
	    xNavigationHome.prototype._adjust = function () {
	        var canvas = this._viewer._canvas;
	        function getOffsetRect(elem) {
	            var box = elem.getBoundingClientRect();
	            var body = document.body;
	            var docElem = document.documentElement;
	            var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
	            var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
	            var clientTop = docElem.clientTop || body.clientTop || 0;
	            var clientLeft = docElem.clientLeft || body.clientLeft || 0;
	            var top = Math.round(box.top + scrollTop - clientTop);
	            var left = Math.round(box.left + scrollLeft - clientLeft);
	            var width = Math.round(box.width);
	            var height = Math.round(box.height);
	            return { top: top, left: left, width: width, height: height };
	        }
	        //get position, width and height
	        var rect = getOffsetRect(canvas);
	        //set image size to what it should be (both relative to height so it is not destorted)
	        this._image.style.width = Math.round(rect.height * this.ratio) + "px";
	        this._image.style.height = Math.round(rect.height * this.ratio) + "px";
	        //place image to the desired position
	        this._image.style.position = "absolute";
	        this._image.style.left = Math.round(rect.left + rect.width * this.placementX) + "px";
	        this._image.style.top = Math.round(rect.top + rect.height * this.placementY) + "px";
	    };
	    xNavigationHome.prototype.onBeforeDraw = function () { };
	    xNavigationHome.prototype.onBeforePick = function (id) { };
	    xNavigationHome.prototype.onAfterDraw = function () { this._adjust(); };
	    xNavigationHome.prototype.onBeforeDrawId = function () { };
	    xNavigationHome.prototype.onAfterDrawId = function () { };
	    xNavigationHome.prototype.onBeforeGetId = function (id) { };
	    xNavigationHome.prototype.draw = function () { };
	    return xNavigationHome;
	}());
	exports.xNavigationHome = xNavigationHome;


/***/ },
/* 18 */
/***/ function(module, exports) {

	"use strict";
	var xAttributeDictionary = (function () {
	    function xAttributeDictionary(lang, culture) {
	        var dictionaries = [
	            {
	                lang: 'cs',
	                culture: 'cz',
	                terms: {
	                    AssetDescription: "Popis",
	                    AssetInstallationDate: "Datum instalace",
	                    AssetName: "Název",
	                    AssetSerialNumber: "Sériové číslo",
	                    AssetTypeCategory: "Kategorie",
	                    AssetTypeColorCode: "Kód barvy",
	                    AssetTypeDescription: "Popis",
	                    AssetTypeFeaturesDescription: "Popis vlastností",
	                    AssetTypeGradeDescription: "Popis kvality",
	                    AssetTypeMaterialDescription: "Popis materiálu",
	                    AssetTypeName: "Název",
	                    AssetTypeShapeDescription: "Popis tvaru",
	                    AssetTypeSizeDescription: "Popis velikosti",
	                    AssetWarrantyStartDate: "Začátek záruky",
	                    AttributeCategory: "Kategorie",
	                    AttributeDescription: "Popis",
	                    AttributeName: "Název",
	                    FacilityCategory: "Kategorie",
	                    FacilityDefaultAreaUnit: "Předdefinovaná jednotka plochy",
	                    FacilityDefaultLinearUnit: "Předdefinovaná jednotka délky",
	                    FacilityDefaultVolumeUnit: "Předdefinovaná jednotka objemu",
	                    FacilityDeliverablePhaseName: "Název fáze výsledku",
	                    FacilityDescription: "Popis nemovitosti",
	                    FacilityName: "Název",
	                    FloorCategory: "Kategorie",
	                    FloorDescription: "Popis",
	                    FloorName: "Název",
	                    ProjectDescription: "Popis projektu",
	                    ProjectName: "Název projektu",
	                    SiteDescription: "Popis stavby",
	                    SpaceCategory: "Kategorie místnosti",
	                    SpaceDescription: "Popis místnosti",
	                    SpaceName: "Název místnosti",
	                    SpaceSignageName: "Space Signage Name",
	                    StringValue: "String Value",
	                    SystemCategory: "System Category",
	                    SystemDescription: "System Description",
	                    SystemName: "System Name",
	                    UnitName: "Unit Name",
	                    ZoneCategory: "Zone Category",
	                    ZoneDescription: "Zone Description",
	                    ZoneName: "Zone Name",
	                    externalID: "External ID",
	                    externalIDReference: "External ID Reference",
	                    propertySetName: "Property Set",
	                    True: "Ano",
	                    False: "Ne"
	                }
	            },
	            {
	                lang: 'en',
	                culture: 'uk',
	                terms: {
	                    AssetDescription: "Asset Description",
	                    AssetInstallationDate: "Asset Installation Date",
	                    AssetName: "Asset Name",
	                    AssetSerialNumber: "Asset Serial Number",
	                    AssetTypeCategory: "Asset Type Category",
	                    AssetTypeColorCode: "Asset Type Color Code",
	                    AssetTypeDescription: "Asset Type Description",
	                    AssetTypeFeaturesDescription: "Asset Type Features Description",
	                    AssetTypeGradeDescription: "Asset Type Grade Description",
	                    AssetTypeMaterialDescription: "Asset Type Material Description",
	                    AssetTypeName: "Asset Type Name",
	                    AssetTypeShapeDescription: "Asset Type Shape Description",
	                    AssetTypeSizeDescription: "Asset Type Size Description",
	                    AssetWarrantyStartDate: "Asset Warranty Start Date",
	                    AttributeCategory: "Attribute Category",
	                    AttributeDescription: "Attribute Description",
	                    AttributeName: "Attribute Name",
	                    FacilityCategory: "Facility Category",
	                    FacilityDefaultAreaUnit: "Facility Default Area Unit",
	                    FacilityDefaultLinearUnit: "Facility Default Linear Unit",
	                    FacilityDefaultVolumeUnit: "Facility Default Volume Unit",
	                    FacilityDeliverablePhaseName: "Facility Deliverable Phase Name",
	                    FacilityDescription: "Facility Description",
	                    FacilityName: "Facility Name",
	                    FloorCategory: "Floor Category",
	                    FloorDescription: "Floor Description",
	                    FloorName: "Floor Name",
	                    ProjectDescription: "Project Description",
	                    ProjectName: "Project Name",
	                    SiteDescription: "Site Description",
	                    SpaceCategory: "Space Category",
	                    SpaceDescription: "Space Description",
	                    SpaceName: "Space Name",
	                    SpaceSignageName: "Space Signage Name",
	                    StringValue: "String Value",
	                    SystemCategory: "System Category",
	                    SystemDescription: "System Description",
	                    SystemName: "System Name",
	                    UnitName: "Unit Name",
	                    ZoneCategory: "Zone Category",
	                    ZoneDescription: "Zone Description",
	                    ZoneName: "Zone Name",
	                    externalID: "External ID",
	                    externalIDReference: "External ID Reference",
	                    propertySetName: "Property Set",
	                    True: "True",
	                    False: "False"
	                }
	            }
	        ];
	        var def = dictionaries.filter(function (e) { return e.lang == 'en' && e.culture == 'uk'; })[0].terms;
	        if (typeof (lang) == 'undefined' && typeof (culture) == 'undefined')
	            return def;
	        //try to find the best fit
	        var candidates = dictionaries.filter(function (e) { return e.lang == lang; });
	        //return default dictionary
	        if (candidates.length == 0)
	            return def;
	        //return language match
	        if (candidates.length == 1 || typeof (culture) == 'undefined')
	            return candidates[0].terms;
	        var candidates2 = candidates.filter(function (e) { return e.culture == culture; });
	        //return culture match
	        if (candidates2.length == 1)
	            return candidates2[0].terms;
	        else
	            return candidates[0].terms;
	    }
	    return xAttributeDictionary;
	}());
	exports.xAttributeDictionary = xAttributeDictionary;


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var xbim_visual_templates_1 = __webpack_require__(20);
	var xbim_visual_model_1 = __webpack_require__(21);
	var xbim_cobieuk_utils_1 = __webpack_require__(22);
	var xbim_cobie_utils_1 = __webpack_require__(27);
	var xBrowser = (function () {
	    /**
	    * This is the main class you need to use to render semantic structure of the building model
	    *
	    * @name xBrowser
	    * @constructor
	    * @classdesc This is a reader of COBie data encoded in JSON format in COBieLite data structure. You can easily combine this with 3D viewer xViewer to get full
	    * user experience. This class is loosely coupled with jQuery UI. It is not a mandatory dependency for the rendering itself. Tree views are basically
	    * nested unordered lists which is a natural representation for hierarchical data and lists are rendered as a table with one column. Classes are assigned
	    * to different parts in a way that you can use to style in any way you want.
	    *
	    * If you want to do all the rendering yourself you can still take advantage of preprocessing which happens after COBie data is loaded. COBie data model
	    * is converted to the simplified structure which is more homogenous and better suitable for templating and visual representation. For more detailed
	    * information have a look on {@link xVisualModel xVisualModel} and related classes. Visual model is passed as an argument to {@link xBrowser#event.loaded loaded} event.
	    *
	    * @param {string} [lang] - language code. This framework contains dictionary for parameters and attributes. It will be used for COBie processing and rendering. If your language or culture is not available default values are "en", "uk"
	    * @param {string} [culture] - culture code. Default combination of language and culture is "en", "uk".
	    */
	    function xBrowser(lang, culture) {
	        this._iconMap = {
	            def: 'ui-icon-document',
	            facility: 'ui-icon-home',
	            space: 'ui-icon-document-b',
	            floor: 'ui-icon-image',
	            assettype: 'ui-icon-copy',
	            asset: 'ui-icon-script',
	            document: 'ui-icon-document',
	            issue: 'ui-icon-clipboard',
	            contact: 'ui-icon-person',
	            system: 'ui-icon-wrench',
	            zone: 'ui-icon-newwin'
	        };
	        this._model = new xbim_visual_model_1.xVisualModel(null);
	        this._events = [];
	        this._templates = {};
	        this._lang = lang;
	        this._culture = culture;
	        this._templates = {};
	        //compile templates
	        var templateStrings = xbim_visual_templates_1.xVisualTemplates();
	        for (var t in templateStrings) {
	            var templateString = templateStrings[t];
	            this._templates[t] = this._compileTemplate(templateString);
	        }
	    }
	    xBrowser.prototype._compileTemplate = function (str) {
	        // Based on Simple JavaScript Templating
	        // John Resig - http://ejohn.org/ - MIT Licensed
	        // http://ejohn.org/blog/javascript-micro-templating/
	        return new Function("_data_", "var _p_=[],print=function(){_p_.push.apply(_p_,arguments);};" +
	            // Introduce the data as local variables using with(){}
	            "with(_data_){_p_.push('" +
	            // Convert the template into pure JavaScript
	            str
	                .replace(/[\r\t\n]/g, " ")
	                .split("<%").join("\t")
	                .replace(/((^|%>)[^\t]*)'/g, "$1\r")
	                .replace(/\t=(.*?)%>/g, "',$1,'")
	                .split("\t").join("');")
	                .split("%>").join("_p_.push('")
	                .split("\r").join("\\'")
	            + "');}return _p_.join('');");
	    };
	    ;
	    /**
	    * This function renders spatial structure as a tree view (facility -> floors -> spaces -> assets). If you use jQuery UI it can be turned into collapsable tree control
	    * with UI icons. But it is not mandatory and you can style it any way you want. Just keep in mind that HTML elements
	    * created by this function have a handlers attached which will fire UI events of {@link xBrowser xBrowser}. If you do any
	    * heavy transformation of the resulting HTML make sure you keep this if other parts of your code rely on these events.
	    * @function xBrowser#renderSpatialStructure
	    * @param {string|HTMLElement} container - string ID of the contaier or HTMLElement representing container. Resulting HTML will be placed inside of this element. Be aware that this will erase any actual content of the container element.
	    * @param {Bool} initTree - if true and jQuery UI is referenced tree will be rendered using UI icons as a collapsable tree control.
	    */
	    xBrowser.prototype.renderSpatialStructure = function (container, initTree) {
	        if (!this._model)
	            throw 'No data to be rendered. Use this function in an event handler of "loaded" event.';
	        this._renderTreeView(container, this._model.facility, initTree);
	    };
	    ;
	    /**
	    * This function renders asset types as a tree view (asset type -> asset). If you use jQuery UI it can be turned into collapsable tree control
	    * with UI icons. But it is not mandatory and you can style it any way you want. Just keep in mind that HTML elements
	    * created by this function have a handlers attached which will fire UI events of {@link xBrowser xBrowser}. If you do any
	    * heavy transformation of the resulting HTML make sure you keep this if other parts of your code rely on these events.
	    * @function xBrowser#renderAssetTypes
	    * @param {string|HTMLElement} container - string ID of the contaier or HTMLElement representing container. Resulting HTML will be placed inside of this element. Be aware that this will erase any actual content of the container element.
	    * @param {Bool} initTree - if true and jQuery UI is referenced tree will be rendered using UI icons as a collapsable tree control.
	    */
	    xBrowser.prototype.renderAssetTypes = function (container, initTree) {
	        if (!this._model)
	            throw 'No data to be rendered. Use this function in an event handler of "loaded" event.';
	        this._renderTreeView(container, this._model.assetTypes, initTree);
	    };
	    ;
	    /**
	    * This function renders asset types as a list view (asset type -> asset). If you use jQuery UI it will use UI icons.
	    * But it is not mandatory and you can style it any way you want. Just keep in mind that HTML elements
	    * created by this function have a handlers attached which will fire UI events of {@link xBrowser xBrowser}. If you do any
	    * heavy transformation of the resulting HTML make sure you keep this if other parts of your code rely on these events.
	    * @function xBrowser#renderContacts
	    * @param {string|HTMLElement} container - string ID of the contaier or HTMLElement representing container. Resulting HTML will be placed inside of this element. Be aware that this will erase any actual content of the container element.
	    */
	    xBrowser.prototype.renderContacts = function (container) {
	        if (!this._model)
	            throw 'No data to be rendered. Use this function in an event handler of "loaded" event.';
	        this._renderListView(container, this._model.contacts, this._templates.contact);
	    };
	    ;
	    /**
	    * This function renders systems as a tree view (systems -> assets). If you use jQuery UI it can be turned into collapsable tree control
	    * with UI icons. But it is not mandatory and you can style it any way you want. Just keep in mind that HTML elements
	    * created by this function have a handlers attached which will fire UI events of {@link xBrowser xBrowser}. If you do any
	    * heavy transformation of the resulting HTML make sure you keep this if other parts of your code rely on these events.
	    * @function xBrowser#renderSystems
	    * @param {string|HTMLElement} container - string ID of the contaier or HTMLElement representing container. Resulting HTML will be placed inside of this element. Be aware that this will erase any actual content of the container element.
	    * @param {Bool} initTree - if true and jQuery UI is referenced tree will be rendered using UI icons as a collapsable tree control.
	    */
	    xBrowser.prototype.renderSystems = function (container, initTree) {
	        if (!this._model)
	            throw 'No data to be rendered. Use this function in an event handler of "loaded" event.';
	        this._renderTreeView(container, this._model.systems, initTree);
	    };
	    ;
	    /**
	    * This function renders zones as a tree view (zones -> spaces -> assets). If you use jQuery UI it can be turned into collapsable tree control
	    * with UI icons. But it is not mandatory and you can style it any way you want. Just keep in mind that HTML elements
	    * created by this function have a handlers attached which will fire UI events of {@link xBrowser xBrowser}. If you do any
	    * heavy transformation of the resulting HTML make sure you keep this if other parts of your code rely on these events.
	    * @function xBrowser#renderZones
	    * @param {string|HTMLElement} container - string ID of the contaier or HTMLElement representing container. Resulting HTML will be placed inside of this element. Be aware that this will erase any actual content of the container element.
	    * @param {Bool} initTree - if true and jQuery UI is referenced tree will be rendered using UI icons as a collapsable tree control.
	    */
	    xBrowser.prototype.renderZones = function (container, initTree) {
	        if (!this._model)
	            throw 'No data to be rendered. Use this function in an event handler of "loaded" event.';
	        this._renderTreeView(container, this._model.zones, initTree);
	    };
	    ;
	    /**
	    * This function renders assignments as a list view. This represents different kinds of relations between this and other entities
	    * If you use jQuery UI it will use UI icons.
	    * But it is not mandatory and you can style it any way you want. Just keep in mind that HTML elements
	    * created by this function have a handlers attached which will fire UI events of {@link xBrowser xBrowser}. If you do any
	    * heavy transformation of the resulting HTML make sure you keep this if other parts of your code rely on these events.
	    * @function xBrowser#renderAssignments
	    * @param {xVisualEntity} entity - visual entity. You can obtain this entity directly from xVisualModel or in a handler of one of these events:
	    * {@link xBrowser#event:entityClick entityClick},
	    * {@link xBrowser#event:entityDblclick entityDblclick},
	    * {@link xBrowser#event:entityMouseDown entityMouseDown},
	    * {@link xBrowser#event:entityMouseUp entityMouseUp},
	    * {@link xBrowser#event:entityMouseMove entityMouseMove},
	    * {@link xBrowser#event:entityTouch entityTouch},
	    * {@link xBrowser#event:entityActive entityActive}
	    * @param {string|HTMLElement} container - string ID of the contaier or HTMLElement representing container. Resulting HTML will be placed inside of this element. Be aware that this will erase any actual content of the container element.
	    */
	    xBrowser.prototype.renderAssignments = function (entity, container) {
	        if (!this._model)
	            throw 'No data to be rendered. Use this function in an event handler of "loaded" event.';
	        container = this._getContainer(container);
	        container.innerHTML = "";
	        var sets = entity.assignments;
	        if (sets.length == 0)
	            return;
	        for (var i = 0; i < sets.length; i++) {
	            var set = sets[i];
	            if (set.assignments.length == 0)
	                continue;
	            var div = document.createElement("div");
	            div.classList.add('xbim-assignment');
	            div.classList.add('ui-widget');
	            div.classList.add('ui-corner-all');
	            div.classList.add('ui-widget-content');
	            var header = document.createElement('h3');
	            header.classList.add('xbim-assignment-header');
	            header.classList.add('ui-corner-all');
	            header.classList.add('ui-widget-header');
	            header.classList.add('ui-state-default');
	            header.innerHTML = set.name ? set.name : 'Undefined';
	            div.appendChild(header);
	            var data = document.createElement('div');
	            data.classList.add('xbim-assignment-content');
	            this._renderListView(data, set.assignments);
	            div.appendChild(data);
	            container.appendChild(div);
	        }
	    };
	    ;
	    /**
	    * This function renders documents as a list view. If you use jQuery UI it will use UI icons.
	    * But it is not mandatory and you can style it any way you want. Just keep in mind that HTML elements
	    * created by this function have a handlers attached which will fire UI events of {@link xBrowser xBrowser}. If you do any
	    * heavy transformation of the resulting HTML make sure you keep this if other parts of your code rely on these events.
	    * @function xBrowser#renderDocuments
	    * @param {xVisualEntity} entity - visual entity. You can obtain this entity directly from xVisualModel or in a handler of one of these events:
	    * {@link xBrowser#event:entityClick entityClick},
	    * {@link xBrowser#event:entityDblclick entityDblclick},
	    * {@link xBrowser#event:entityMouseDown entityMouseDown},
	    * {@link xBrowser#event:entityMouseUp entityMouseUp},
	    * {@link xBrowser#event:entityMouseMove entityMouseMove},
	    * {@link xBrowser#event:entityTouch entityTouch},
	    * {@link xBrowser#event:entityActive entityActive}
	    * @param {string|HTMLElement} container - string ID of the contaier or HTMLElement representing container. Resulting HTML will be placed inside of this element. Be aware that this will erase any actual content of the container element.
	    */
	    xBrowser.prototype.renderDocuments = function (entity, container) {
	        if (!entity)
	            throw 'No data to be rendered. Use this function in an event handler of "loaded" event.';
	        var self = this;
	        container = this._getContainer(container);
	        var docs = entity.documents;
	        if (docs) {
	            this._renderListView(container, docs, null);
	        }
	    };
	    ;
	    /**
	    * This function renders issues assigned to the entity as a list view. If you use jQuery UI it will use UI icons.
	    * But it is not mandatory and you can style it any way you want. Just keep in mind that HTML elements
	    * created by this function have a handlers attached which will fire UI events of {@link xBrowser xBrowser}. If you do any
	    * heavy transformation of the resulting HTML make sure you keep this if other parts of your code rely on these events.
	    * @function xBrowser#renderIssues
	    * @param {xVisualEntity} entity - visual entity. You can obtain this entity directly from xVisualModel or in a handler of one of these events:
	    * {@link xBrowser#event:entityClick entityClick},
	    * {@link xBrowser#event:entityDblclick entityDblclick},
	    * {@link xBrowser#event:entityMouseDown entityMouseDown},
	    * {@link xBrowser#event:entityMouseUp entityMouseUp},
	    * {@link xBrowser#event:entityMouseMove entityMouseMove},
	    * {@link xBrowser#event:entityTouch entityTouch},
	    * {@link xBrowser#event:entityActive entityActive}
	    * @param {string|HTMLElement} container - string ID of the contaier or HTMLElement representing container. Resulting HTML will be placed inside of this element. Be aware that this will erase any actual content of the container element.
	    */
	    xBrowser.prototype.renderIssues = function (entity, container) {
	        if (!entity)
	            throw 'No data to be rendered. Use this function in an event handler of "loaded" event.';
	        var self = this;
	        container = this._getContainer(container);
	        var issues = entity.issues;
	        if (issues) {
	            this._renderListView(container, issues, null);
	        }
	    };
	    ;
	    /**
	    * This function renders attributes assigned to the entity as a list view. Attributes are COBie equivalent for Property Sets and can contain
	    * arbitrary data. If you use jQuery UI it will use UI icons.
	    * But it is not mandatory and you can style it any way you want.
	    * @function xBrowser#renderAttributes
	    * @param {xVisualEntity} entity - visual entity. You can obtain this entity directly from xVisualModel or in a handler of one of these events:
	    * {@link xBrowser#event:entityClick entityClick},
	    * {@link xBrowser#event:entityDblclick entityDblclick},
	    * {@link xBrowser#event:entityMouseDown entityMouseDown},
	    * {@link xBrowser#event:entityMouseUp entityMouseUp},
	    * {@link xBrowser#event:entityMouseMove entityMouseMove},
	    * {@link xBrowser#event:entityTouch entityTouch},
	    * {@link xBrowser#event:entityActive entityActive}
	    * @param {string|HTMLElement} container - string ID of the contaier or HTMLElement representing container. Resulting HTML will be placed inside of this element. Be aware that this will erase any actual content of the container element.
	    */
	    xBrowser.prototype.renderAttributes = function (entity, container) {
	        if (!entity)
	            throw 'No data to be rendered. Use this function in an event handler of "loaded" event.';
	        var self = this;
	        container = this._getContainer(container);
	        var html = self._templates.attribute(entity);
	        container.innerHTML = html;
	    };
	    ;
	    /**
	    * This function renders properties assigned to the entity as a list view. Properties are predefined in COBie data model. If you use jQuery UI it will use UI icons.
	    * But it is not mandatory and you can style it any way you want.
	    * @function xBrowser#renderProperties
	    * @param {xVisualEntity} entity - visual entity. You can obtain this entity directly from xVisualModel or in a handler of one of these events:
	    * {@link xBrowser#event:entityClick entityClick},
	    * {@link xBrowser#event:entityDblclick entityDblclick},
	    * {@link xBrowser#event:entityMouseDown entityMouseDown},
	    * {@link xBrowser#event:entityMouseUp entityMouseUp},
	    * {@link xBrowser#event:entityMouseMove entityMouseMove},
	    * {@link xBrowser#event:entityTouch entityTouch},
	    * {@link xBrowser#event:entityActive entityActive}
	    * @param {string|HTMLElement} container - string ID of the contaier or HTMLElement representing container. Resulting HTML will be placed inside of this element. Be aware that this will erase any actual content of the container element.
	    */
	    xBrowser.prototype.renderProperties = function (entity, container) {
	        if (!entity)
	            throw 'No data to be rendered. Use this function in an event handler of "loaded" event.';
	        var self = this;
	        container = this._getContainer(container);
	        var html = self._templates.property(entity);
	        container.innerHTML = html;
	    };
	    ;
	    /**
	    * This function renders properties and attributes assigned to the entity as a list view. This combines data which can be rendered separately
	    * by {@link xBrowser#renderProperties renderProperties()} or {@link xBrowser#renderAttributes renderAttributes()} but it is sometimes convenient
	    * to render both into one single layout.  If you use jQuery UI it will use UI icons.
	    * But it is not mandatory and you can style it any way you want.
	    *
	    * @function xBrowser#renderPropertiesAttributes
	    * @param {xVisualEntity} entity - visual entity. You can obtain this entity directly from xVisualModel or in a handler of one of these events:
	    * {@link xBrowser#event:entityClick entityClick},
	    * {@link xBrowser#event:entityDblclick entityDblclick},
	    * {@link xBrowser#event:entityMouseDown entityMouseDown},
	    * {@link xBrowser#event:entityMouseUp entityMouseUp},
	    * {@link xBrowser#event:entityMouseMove entityMouseMove},
	    * {@link xBrowser#event:entityTouch entityTouch},
	    * {@link xBrowser#event:entityActive entityActive}
	    * @param {string|HTMLElement} container - string ID of the contaier or HTMLElement representing container. Resulting HTML will be placed inside of this element. Be aware that this will erase any actual content of the container element.
	    */
	    xBrowser.prototype.renderPropertiesAttributes = function (entity, container) {
	        if (!entity)
	            throw 'No data to be rendered. Use this function in an event handler of "loaded" event.';
	        var self = this;
	        container = this._getContainer(container);
	        var html = self._templates.propertyattribute(entity);
	        container.innerHTML = html;
	    };
	    ;
	    xBrowser.prototype._registerEntityCallBacks = function (element, entity) {
	        var self = this;
	        element.entity = entity;
	        //element.addEventListener('', function (e) { self._fire('', { entity: entity, event: e , element: element}); e.stopPropagation(); });
	        /**
	        * Occurs when user clicks on a HTML element representing {@link xVisualEntity xVisualEntity}
	        * @event xBrowser#entityClick
	        * @type {object}
	        * @param {xVisualEntity} entity
	        * @param {object} event
	        * @param {HTMLElement} element
	        */
	        /**
	        * Occurs when user clicks on a HTML element representing {@link xVisualEntity xVisualEntity} or if {@link xBrowser#activateEntity activateEntity()} is called.
	        * @event xBrowser#entityActive
	        * @type {object}
	        * @param {xVisualEntity} entity
	        * @param {object} event
	        * @param {HTMLElement} element - This argument might be null if event is fired in code by call to {@link xBrowser#activateEntity activateEntity()}.
	        */
	        /**
	        * Occurs when user double clicks on a HTML element representing {@link xVisualEntity xVisualEntity}.
	        * @event xBrowser#entityDblclick
	        * @type {object}
	        * @param {xVisualEntity} entity
	        * @param {object} event
	        * @param {HTMLElement} element - This argument might be null if event is fired in code by call to {@link xBrowser#activateEntity activateEntity()}.
	        */
	        element.addEventListener('click', function (e) {
	            self._fire('entityClick', { entity: entity, event: e, element: element });
	            self._fire('entityActive', { entity: entity, event: e, element: element });
	            e.stopPropagation();
	        });
	        element.addEventListener('dblclick', function (e) {
	            self._fire('entityDblclick', { entity: entity, event: e, element: element });
	            self._fire('entityActive', { entity: entity, event: e, element: element });
	            e.stopPropagation();
	        });
	        /**
	        * Occurs when mouseDown event occurs on a HTML element representing {@link xVisualEntity xVisualEntity}
	        * @event xBrowser#entityMouseDown
	        * @type {object}
	        * @param {xVisualEntity} entity
	        * @param {object} event
	        * @param {HTMLElement} element
	        */
	        element.addEventListener('mouseDown', function (e) { self._fire('entityMouseDown', { entity: entity, event: e, element: element }); e.stopPropagation(); });
	        /**
	        * Occurs when mouseUp event occurs on a HTML element representing {@link xVisualEntity xVisualEntity}
	        * @event xBrowser#entityMouseUp
	        * @type {object}
	        * @param {xVisualEntity} entity
	        * @param {object} event
	        * @param {HTMLElement} element
	        */
	        element.addEventListener('mouseUp', function (e) { self._fire('entityMouseUp', { entity: entity, event: e, element: element }); e.stopPropagation(); });
	        /**
	        * Occurs when mouseMove event occurs on a HTML element representing {@link xVisualEntity xVisualEntity}
	        * @event xBrowser#entityMouseMove
	        * @type {object}
	        * @param {xVisualEntity} entity
	        * @param {object} event
	        * @param {HTMLElement} element
	        */
	        element.addEventListener('mouseMove', function (e) { self._fire('entityMouseMove', { entity: entity, event: e, element: element }); e.stopPropagation(); });
	        /**
	        * Occurs when touch event occurs on a HTML element representing {@link xVisualEntity xVisualEntity}
	        * @event xBrowser#entityTouch
	        * @type {object}
	        * @param {xVisualEntity} entity
	        * @param {object} event
	        * @param {HTMLElement} element
	        */
	        element.addEventListener('touch', function (e) { self._fire('entityTouch', { entity: entity, event: e, element: element }); e.stopPropagation(); });
	    };
	    ;
	    xBrowser.prototype._uiTree = function (container) {
	        if (!container)
	            return;
	        //this only works if jQuery UI is available
	        if (!jQuery || !jQuery.ui)
	            return;
	        var $container = typeof (container) == 'string' ? $("#" + container) : $(container);
	        var elements = typeof (container) == 'string' ? $("#" + container + " li") : $(container).find('li');
	        //return if tree has been initialized already
	        if ($container.hasClass('xbim-tree'))
	            return;
	        $container.addClass('xbim-tree');
	        var iconOpen = "ui-icon-triangle-1-s";
	        var iconClosed = "ui-icon-triangle-1-e";
	        var iconLeaf = "ui-icon-document";
	        elements
	            .prepend(function () {
	            if ($(this).children('ul').length > 0) {
	                $(this).addClass('xbim-tree-node');
	                return '<span class="ui-icon ' + iconClosed + '" style="float: left;"></span>';
	            }
	            else {
	                $(this).addClass('xbim-tree-leaf');
	                return '';
	            }
	        })
	            .css('list-style-type', 'none')
	            .css('cursor', 'default')
	            .children('ul').hide();
	        elements.find('span.' + iconClosed).on("click", function (e) {
	            e.stopPropagation();
	            $(this).parent().children('ul').slideToggle();
	            if ($(this).hasClass(iconClosed))
	                $(this).removeClass(iconClosed).addClass(iconOpen);
	            else
	                $(this).removeClass(iconOpen).addClass(iconClosed);
	        });
	        //open first level if there is only one element
	        var firstLevel = $container.children('ul').children('li');
	        if (firstLevel.length == 1)
	            firstLevel.children('span.' + iconClosed).click();
	    };
	    ;
	    xBrowser.prototype._renderListView = function (container, entities, entityTemplate) {
	        var self = this;
	        container = this._getContainer(container);
	        entityTemplate = entityTemplate ? entityTemplate : self._templates.entity;
	        var table = document.createElement('table');
	        container.innerHTML = "";
	        container.appendChild(table);
	        for (var i = 0; i < entities.length; i++) {
	            var entity = entities[i];
	            var html = entityTemplate(entity);
	            var tr = document.createElement('tr');
	            table.appendChild(tr);
	            var td = document.createElement('td');
	            tr.appendChild(td);
	            td.innerHTML = html;
	            this._registerEntityCallBacks(td, entity);
	            if (jQuery && jQuery.ui) {
	                var icon = this._iconMap[entity.type] ? this._iconMap[entity.type] : this._iconMap['def'];
	                $(td).prepend('<span class="ui-icon ' + icon + '" style="float: left;"></span>');
	            }
	        }
	    };
	    ;
	    xBrowser.prototype._renderTreeView = function (container, roots, initSimpleTree, entityTemplate) {
	        var self = this;
	        container = this._getContainer(container);
	        entityTemplate = entityTemplate ? entityTemplate : self._templates.entity;
	        initSimpleTree = initSimpleTree ? initSimpleTree : true;
	        var renderEntities = function (entities, ul) {
	            for (var i = 0; i < entities.length; i++) {
	                var entity = entities[i];
	                var html = entityTemplate(entity);
	                var li = document.createElement('li');
	                li.innerHTML = html;
	                self._registerEntityCallBacks(li, entity);
	                if (!ul) {
	                    var ul = document.createElement('ul');
	                    container.appendChild(ul);
	                }
	                ul.appendChild(li);
	                //recursive call if this element has any children
	                if (entity.children && entity.children.length > 0) {
	                    var inUl = document.createElement('ul');
	                    li.appendChild(inUl);
	                    renderEntities(entity.children, inUl);
	                }
	                if (jQuery && jQuery.ui) {
	                    var icon = self._iconMap[entity.type] ? self._iconMap[entity.type] : self._iconMap['def'];
	                    $(li).prepend('<span class="ui-icon ' + icon + '" style="float: left;"></span>');
	                }
	            }
	        };
	        renderEntities(roots);
	        if (initSimpleTree)
	            this._uiTree(container);
	    };
	    ;
	    /**
	    * Use this function to activate entity from code. This will cause {@link xBrowser#event:entityActive entityActive} event to be fired.
	    * That might be usefull to update data relying on any kind of selection.
	    * @function xBrowser#activateEntity
	    * @param {Number} id - ID of the entity to be activated
	    */
	    xBrowser.prototype.activateEntity = function (id) {
	        if (!this._model)
	            return;
	        var entity = this._model.getEntity(id);
	        if (!entity)
	            return;
	        this._fire('entityActive', { entity: entity });
	    };
	    ;
	    xBrowser.prototype._getContainer = function (container) {
	        if (typeof (container) == 'object')
	            return container;
	        if (typeof (container) == 'string') {
	            container = document.getElementById(container);
	            if (container)
	                return container;
	        }
	        if (!container)
	            return document.documentElement;
	    };
	    ;
	    /**
	    * Use this function to load data from JSON representation of COBieLite. Listen to {@link xBrowser#event:loaded loaded} event to start
	    * using the browser.
	    * @function xBrowser#load
	    * @param {string|File|Blob} source - path to JSON data or File or Blob object to be used to load the data from
	    * @fires xBrowser#loaded
	    */
	    xBrowser.prototype.load = function (source) {
	        if (typeof (source) == 'undefined')
	            throw 'You have to define a source to JSON data.';
	        var self = this;
	        //if it is a file, load its content
	        if (source instanceof Blob || source instanceof File) {
	            var fReader = new FileReader();
	            fReader.onloadend = function () {
	                if (fReader.result) {
	                    //set data buffer for next processing
	                    var data = JSON.parse(fReader.result);
	                    //set right utils according to the data type
	                    var uk = typeof (data.FacilityDefaultLinearUnit) === "undefined";
	                    var utils = uk ? new xbim_cobieuk_utils_1.xCobieUkUtils(self._lang, self._culture) : new xbim_cobie_utils_1.xCobieUtils(self._lang, self._culture);
	                    self._model = utils.getVisualModel(data);
	                    self._fire('loaded', { model: self._model });
	                }
	            };
	            fReader.readAsText(source);
	            return;
	        }
	        //it should be a string now. Throw an exception if it isn't
	        if (typeof (source) !== 'string')
	            throw "Unexpected type of source. It should be File, Blob of string URL";
	        //if it is a string than use ajax to load the data
	        var xhr = new XMLHttpRequest();
	        xhr.open('GET', source, true);
	        xhr.onreadystatechange = function () {
	            if (xhr.readyState == 4 && xhr.status == 200) {
	                var data = xhr.response;
	                //----- IE fix
	                if (typeof (data) == 'string')
	                    data = JSON.parse(data);
	                //------
	                //decide about the version if utils
	                var uk = typeof (data.FacilityDefaultLinearUnit) === "undefined";
	                var utils = uk ? new xbim_cobieuk_utils_1.xCobieUkUtils(self._lang, self._culture) : new xbim_cobie_utils_1.xCobieUtils(self._lang, self._culture);
	                self._model = utils.getVisualModel(data);
	                /**
	                * Occurs when JSON data model is loaded
	                * @event xBrowser#loaded
	                * @type {object}
	                * @param {xVisualModel} model - preprocessed {@link xVisualModel model} prepared for visual representation
	                * @param {object} model - original COBie data
	                */
	                self._fire('loaded', { model: self._model });
	            }
	            //throw exception as a warning
	            if (xhr.readyState == 4 && xhr.status != 200) {
	                var msg = 'Failed to fetch semantic JSON data from server. Server code: ' + xhr.status +
	                    '. This might be due to CORS policy of your browser if you run this as a local file.';
	                throw msg;
	            }
	        };
	        xhr.responseType = 'json';
	        xhr.send();
	    };
	    ;
	    /**
	    * Use this method to register to events of the browser. You can define arbitrary number
	    * of event handlers for any event. You can remove handler by calling {@link xBrowser#onRemove onRemove()} method.
	    *
	    * @function xBrowser#on
	    * @param {String} eventName - Name of the event you would like to listen to.
	    * @param {Object} callback - Callback handler of the event which will consume arguments and perform any custom action.
	    */
	    xBrowser.prototype.on = function (eventName, callback) {
	        var events = this._events;
	        if (!events[eventName]) {
	            events[eventName] = [];
	        }
	        events[eventName].push(callback);
	    };
	    ;
	    /**
	    * Use this method to unregisted handlers from events. You can add event handlers by call to {@link xBrowser#on on()} method.
	    *
	    * @function xBrowser#onRemove
	    * @param {String} eventName - Name of the event
	    * @param {Object} callback - Handler to be removed
	    */
	    xBrowser.prototype.onRemove = function (eventName, callback) {
	        var events = this._events;
	        var callbacks = events[eventName];
	        if (!callbacks) {
	            return;
	        }
	        var index = callbacks.indexOf(callback);
	        if (index >= 0) {
	            callbacks.splice(index, 1);
	        }
	    };
	    ;
	    //executes all handlers bound to event name
	    xBrowser.prototype._fire = function (eventName, args) {
	        var handlers = this._events[eventName];
	        if (!handlers) {
	            return;
	        }
	        //call the callbacks
	        handlers.forEach(function (handler) {
	            handler(args);
	        }, this);
	    };
	    ;
	    return xBrowser;
	}());
	exports.xBrowser = xBrowser;


/***/ },
/* 20 */
/***/ function(module, exports) {

	"use strict";
	function xVisualTemplates() {
	    return {
	        property: '<%if (properties && properties.length > 0) {%>\
	<table> \
	    <% for (var p in properties) { var prop = properties[p];%> \
	    <tr> \
	        <td><%=prop.name%></td>\
	        <td><%=prop.value%></td>\
	    </tr>\
	    <%}%>\
	</table> \
	<%}%>',
	        attribute: '<% if (attributes && attributes.length > 0) {\
	    var psets = [];\
	    for(var i = 0; i < attributes.length; i++){\
	        var attr = attributes[i]; var pset = attr.propertySet; if (pset) {if(psets.indexOf(pset) == -1){psets.push(pset);}}\
	    }\
	%>\
	<table> \
	    <% for (var p in psets) { var psetName = psets[p]; var pset = attributes.filter(function(e){ return e.propertySet == psetName;});\
	%>\
	<tr><th colspan="2"><%=psetName%></th></tr>\
	<%for (var a in pset) { var attr = pset[a];%> \
	    <tr title="<%=attr.description%>"> \
	        <td><%=attr.name%></td>\
	        <td><%=attr.value%></td>\
	    </tr>\
	    <%}}%>\
	</table>\
	<%}%>',
	        propertyattribute: '<%if (properties.length > 0 || attributes.length > 0) {%><table> \
	    <% for (var p in properties) { var prop = properties[p];%> \
	    <tr> \
	        <td><%=prop.name%></td>\
	        <td><%=prop.value%></td>\
	    </tr>\
	    <%}%>\
	<%}\
	if (attributes && attributes.length > 0) {\
	    var psets = [];\
	    for(var i = 0; i < attributes.length; i++){\
	        var attr = attributes[i]; if (!attr.propertySet) attr.propertySet = "General";\
	        var pset = attr.propertySet; if (pset) {if(psets.indexOf(pset) == -1){psets.push(pset);}}\
	    }\
	%>\
	    <% for (var p in psets) { var psetName = psets[p]; var pset = attributes.filter(function(e){ return e.propertySet == psetName;});\
	%>\
	<tr><th colspan="2"><%=psetName%></th></tr>\
	<%for (var a in pset) { var attr = pset[a];%> \
	    <tr title="<%=attr.description%>"> \
	        <td><%=attr.name%></td>\
	        <td><%=attr.value%></td>\
	    </tr>\
	    <%}}%>\
	</table>\
	<%}%>',
	        entity: '<span class="xbim-entity" title="<%=typeof(description) != "undefined" ? description : ""%>"> <%= name? name: (function f() { return type.charAt(0).toUpperCase() + type.slice(1); })() %> </span>',
	        contact: '<% var nameA = properties.filter(function(e){return e.id == "ContactGivenName";})[0] || properties.filter(function(e){return e.id == "GivenName";})[0]; \
	var surnameA = properties.filter(function(e){return e.id == "ContactFamilyName";})[0] || properties.filter(function(e){return e.id == "FamilyName";})[0]; \
	var emailA = properties.filter(function(e){return e.id == "ContactEmail";})[0] || properties.filter(function(e){return e.id == "Email";})[0]; \
	var name = nameA ? nameA.value : "";\
	var surname = surnameA ? surnameA.value : "";\
	var email = emailA ? emailA.value : ""; %>\
	<span class="xbim-entity" title="<%=email%>"> <%=name%> <%=surname%> <% if (!name && !surname) print("No name"); %> </span>'
	    };
	}
	exports.xVisualTemplates = xVisualTemplates;
	;


/***/ },
/* 21 */
/***/ function(module, exports) {

	"use strict";
	var xVisualModel = (function () {
	    /**
	    * Visual model containing preprocessed COBie data in more uniform form usable for templating and rendering
	    *
	    * @name xVisualModel
	    * @constructor
	    * @classdesc Visual model containing preprocessed COBie data in more uniform form usable for templating and rendering
	    * @param {object} [values] - Object which can be used to initialize content of the object. It can be also used to create shallow copy of the object.
	    */
	    function xVisualModel(values) {
	        /** @member {xVisualEntity[]} xVisualModel#facility - An array of facilities. There is always one faclity but it is convenient to have all
	        * members of xVisualModel to be an array so they can be accessed in an uniform way.
	        */
	        this.facility = [];
	        /** @member {xVisualEntity[]} xVisualModel#zones - An array of zones defined in COBie model. They contain spaces as their children. */
	        this.zones = [];
	        /** @member {xVisualEntity[]} xVisualModel#systems - An array of systems */
	        this.systems = [];
	        /** @member {xVisualEntity[]} xVisualModel#contacts - An array of all contacts used in the COBie model*/
	        this.contacts = [];
	        /** @member {xVisualEntity[]} xVisualModel#assetTypes - An array of all asset types. These contain assets as their children */
	        this.assetTypes = [];
	        if (typeof (values) == 'object') {
	            for (var a in values) {
	                this[a] = values[a];
	            }
	        }
	    }
	    xVisualModel.prototype.getEntity = function (id) {
	        if (typeof (id) == 'undefined' || id == null)
	            return null;
	        id = id.toString();
	        var get = function (collection, id) {
	            for (var i = 0; i < collection.length; i++) {
	                var entity = collection[i];
	                if (entity.id == id)
	                    return entity;
	                var result = get(entity.children, id);
	                if (result)
	                    return result;
	            }
	            return null;
	        };
	        for (var i in this) {
	            if (typeof (this[i]) == 'function')
	                continue;
	            var result = get(this[i], id);
	            if (result)
	                return result;
	        }
	        return null;
	    };
	    return xVisualModel;
	}());
	exports.xVisualModel = xVisualModel;


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var xbim_visual_entity_1 = __webpack_require__(23);
	var xbim_visual_model_1 = __webpack_require__(21);
	var xbim_attribute_dictionary_1 = __webpack_require__(18);
	var xbim_visual_assignment_set_1 = __webpack_require__(24);
	var xbim_visual_attribute_1 = __webpack_require__(25);
	var xbim_visual_property_1 = __webpack_require__(26);
	var xCobieUkUtils = (function () {
	    function xCobieUkUtils(lang, culture) {
	        this._contacts = [];
	        this.settings = {
	            decimalPlaces: 4
	        };
	        this._dictionary = new xbim_attribute_dictionary_1.xAttributeDictionary(lang, culture);
	    }
	    xCobieUkUtils.prototype.getVisualEntity = function (entity, type) {
	        if (!entity || !type)
	            throw 'entity must be defined';
	        return new xbim_visual_entity_1.xVisualEntity({
	            id: entity.ExternalId,
	            type: type,
	            name: this
	                .getValidationStatus(entity) +
	                entity.Name,
	            description: entity.Description,
	            attributes: this.getAttributes(entity),
	            properties: this.getProperties(entity),
	            assignments: this.getAssignments(entity, type),
	            documents: this.getDocuments(entity, type),
	            issues: this.getIssues(entity)
	        });
	    };
	    xCobieUkUtils.prototype.getValidationStatus = function (entity) {
	        if (entity.Categories == null)
	            return '';
	        for (var i = 0; i < entity.Categories.length; i++) {
	            var category = entity.Categories[i];
	            if (typeof (category.Code) !== 'undefined' && category.Code.toLowerCase() === 'failed')
	                return '[F] ';
	            if (typeof (category.Code) !== 'undefined' && category.Code.toLowerCase() === 'passed')
	                return '[T] ';
	        }
	        return '';
	    };
	    xCobieUkUtils.prototype.getVisualModel = function (data) {
	        if (!data)
	            throw 'data must be defined';
	        //contacts are used very often as a references in assignments
	        //so it is good to have them in the wide scope for processing
	        this._contacts = this.getContacts(data);
	        var types = this.getAssetTypes(data);
	        //this will also add assets to spaces where they should be
	        var facility = this.getSpatialStructure(data, types);
	        return new xbim_visual_model_1.xVisualModel({
	            facility: facility,
	            zones: this.getZones(data, facility),
	            systems: this.getSystems(data, types),
	            assetTypes: types,
	            contacts: this._contacts
	        });
	    };
	    xCobieUkUtils.prototype.getContacts = function (data) {
	        if (!data)
	            throw 'data must be defined';
	        var result = [];
	        var contacts = data.Contacts;
	        if (!contacts)
	            return result;
	        for (var i = 0; i < contacts.length; i++) {
	            var vContact = this.getVisualEntity(contacts[i], 'contact');
	            result.push(vContact);
	        }
	        return result;
	    };
	    xCobieUkUtils.prototype.getSpatialStructure = function (data, types) {
	        if (!data)
	            throw 'data must be defined';
	        if (!types)
	            throw 'types must be defined';
	        var facility = this.getVisualEntity(data, 'facility');
	        var floors = data.Floors;
	        if (!floors || floors.length == 0)
	            return [facility];
	        for (var i in floors) {
	            var floor = floors[i];
	            var vFloor = this.getVisualEntity(floor, 'floor');
	            facility.children.push(vFloor);
	            var spaces = floor['Spaces'];
	            if (!spaces)
	                continue;
	            for (var s in spaces) {
	                var space = spaces[s];
	                var vSpace = this.getVisualEntity(space, 'space');
	                vFloor.children.push(vSpace);
	            }
	        }
	        //add asset types and assets to spaces 
	        for (var t in types) {
	            var type = types[t];
	            for (var i in type.children) {
	                var instance = type.children[i];
	                //check assignments
	                var assignmentSet = instance.assignments.filter(function (e) { return e.id == 'Space'; })[0];
	                if (!assignmentSet)
	                    continue;
	                var key = assignmentSet.assignments[0];
	                if (!key)
	                    continue;
	                var spaceProp = key.properties.filter(function (e) { return e.id == 'Name'; })[0];
	                if (!spaceProp)
	                    continue;
	                var spaceName = spaceProp.value.split(',')[0];
	                for (var j = 0; j < facility.children.length; j++) {
	                    var floor = facility.children[j];
	                    var space = floor.children.filter(function (e) { return e.name == spaceName; })[0];
	                    if (!space)
	                        continue;
	                    space.children.push(instance);
	                    assignmentSet.assignments[0] = space;
	                    break;
	                    ;
	                }
	            }
	        }
	        //facility is a root element of the tree spatial structure
	        return [facility];
	    };
	    xCobieUkUtils.prototype.getZones = function (data, facility) {
	        if (!data)
	            throw 'data must be defined';
	        if (!facility)
	            throw 'data must be defined';
	        var result = [];
	        var zones = data.Zones;
	        if (!zones)
	            return result;
	        for (var z in zones) {
	            var zone = zones[z];
	            var vZone = this.getVisualEntity(zone, 'zone');
	            result.push(vZone);
	            //add spaces as a children
	            var keys = zone.Spaces;
	            if (!keys || keys.length == 0)
	                continue;
	            for (var ki in keys) {
	                var key = keys[ki];
	                for (var i = 0; i < facility.length; i++) {
	                    var f = facility[i];
	                    for (var j = 0; j < f.children.length; j++) {
	                        var floor = f.children[j];
	                        for (var k = 0; k < floor.children.length; k++) {
	                            var space = floor.children[k];
	                            if (space.name != key.Name)
	                                continue;
	                            //add space as a children
	                            vZone.children.push(space);
	                            //add zone to space as an assignment
	                            var assignmentSet = space.assignments.filter(function (e) { return e.id == 'Zone'; })[0];
	                            if (!assignmentSet) {
	                                assignmentSet = new xbim_visual_assignment_set_1.xVisualAssignmentSet();
	                                assignmentSet.id = 'Zone';
	                                assignmentSet.name = 'Zones';
	                                space.assignments.push(assignmentSet);
	                            }
	                            assignmentSet.assignments.push(vZone);
	                        }
	                    }
	                }
	            }
	        }
	        return result;
	    };
	    xCobieUkUtils.prototype.getSystems = function (data, types) {
	        if (!data)
	            throw 'data must be defined';
	        if (!types)
	            throw 'types must be defined';
	        var result = [];
	        var systems = data.Systems;
	        if (!systems)
	            return result;
	        var instances = [];
	        for (var k = 0; k < types.length; k++) {
	            var type = types[k];
	            for (var c in type.children) {
	                instances.push(type.children[c]);
	            }
	        }
	        for (var s in systems) {
	            var system = systems[s];
	            var vSystem = this.getVisualEntity(system, 'system');
	            result.push(vSystem);
	            //add assets to systems 
	            var componentKeys = system.Components;
	            for (var j = 0; j < componentKeys.length; j++) {
	                var key = componentKeys[j];
	                var candidates = instances.filter(function (e) { return e.name == key.Name; });
	                if (!candidates)
	                    continue;
	                var instance = candidates[0];
	                if (!instance)
	                    continue;
	                //add asset to system
	                vSystem.children.push(instance);
	                //add system to asset assignments
	                var assignmentSet = instance.assignments.filter(function (e) { return e.id == 'System'; })[0];
	                if (!assignmentSet) {
	                    assignmentSet = new xbim_visual_assignment_set_1.xVisualAssignmentSet();
	                    assignmentSet.id = 'System';
	                    assignmentSet.Name = 'Systems';
	                    instance.assignments.push(assignmentSet);
	                }
	                assignmentSet.assignments.push(vSystem);
	            }
	        }
	        return result;
	    };
	    xCobieUkUtils.prototype.getAssetTypes = function (data) {
	        if (!data)
	            throw 'data must be defined';
	        var result = [];
	        var tr = this.getTranslator();
	        var types = data.AssetTypes;
	        if (!types)
	            return result;
	        for (var t in types) {
	            var type = types[t];
	            var vType = this.getVisualEntity(type, 'assettype');
	            result.push(vType);
	            //process instances of type
	            var instances = type.Assets;
	            if (!instances)
	                continue;
	            for (var i in instances) {
	                var instance = instances[i];
	                var vInstance = this.getVisualEntity(instance, 'asset');
	                vType.children.push(vInstance);
	                //add assignment to the type
	                var assignment = new xbim_visual_assignment_set_1.xVisualAssignmentSet();
	                assignment.id = 'AssetType';
	                assignment.name = tr(assignment.id);
	                assignment.assignments.push(vType);
	                vInstance.assignments.push(assignment);
	            }
	        }
	        return result;
	    };
	    xCobieUkUtils.prototype.getProperties = function (entity) {
	        if (!entity)
	            throw 'entity must be defined';
	        var tr = this.getTranslator();
	        var result = [];
	        for (var a in entity) {
	            var attr = entity[a];
	            var valStr = this.getValueString(attr);
	            if (valStr) {
	                var nameStr = tr(a);
	                result.push(new xbim_visual_property_1.xVisualProperty({ name: nameStr, value: valStr, id: a }));
	            }
	        }
	        var catProperties = this.getCategoryProperties(entity);
	        for (var i = 0; i < catProperties.length; i++) {
	            result.push(catProperties[i]);
	        }
	        return result;
	    };
	    xCobieUkUtils.prototype.getCategoryProperties = function (entity) {
	        var cats = entity.Categories;
	        if (!cats)
	            return [];
	        var result = [];
	        for (var i = 0; i < cats.length; i++) {
	            var cat = cats[i];
	            var valStr = cat.Code + cat.Description ? ': ' + cat.Description : '';
	            result.push(new xbim_visual_property_1.xVisualProperty({ name: cat.Classification || 'Free category', value: valStr, id: i }));
	        }
	        return [];
	    };
	    xCobieUkUtils.prototype.getAttributes = function (entity) {
	        if (!entity)
	            throw 'entity must be defined';
	        var result = [];
	        var attributes = entity.Attributes;
	        if (!attributes)
	            return result;
	        for (var a in attributes) {
	            var attribute = attributes[a];
	            result.push(new xbim_visual_attribute_1.xVisualAttribute({
	                name: attribute.Name,
	                description: attribute.Description,
	                value: this.getValueString(attribute),
	                propertySet: attribute.ExternalEntity,
	                categories: this.getCategoryProperties(attribute),
	                issues: attribute.Issues ? this.getIssues({ Issues: attribute.Issues }) : []
	            }));
	        }
	        return result;
	    };
	    xCobieUkUtils.prototype.getAssignments = function (entity, type) {
	        if (!entity || !type)
	            throw 'entity and type must be defined';
	        var tr = this.getTranslator();
	        var result = [];
	        //assignment can either be an array of keys or a single embeded object
	        for (var attrName in entity) {
	            if (!entity.hasOwnProperty(attrName))
	                continue;
	            var assignmentSet = new xbim_visual_assignment_set_1.xVisualAssignmentSet();
	            var attr = entity[attrName];
	            //set of assignments (keys)
	            if (attr instanceof Array && attr.length > 0 && typeof (attr[0].KeyType) !== 'undefined') {
	                assignmentSet.id = attr[0].KeyType;
	                assignmentSet.name = tr(attrName);
	                for (var i = 0; i < attr.length; i++) {
	                    //if it is a contact than add a contact if available
	                    if (attr[i].KeyType === 'Contact') {
	                        var contact = this.findContact(attr['Email']);
	                        if (contact) {
	                            assignmentSet.assignments.push(contact);
	                            continue;
	                        }
	                    }
	                    var vAssignment = this.getVisualEntity(attr[i], attr[i].KeyType.toLowerCase());
	                    vAssignment.isKey = true;
	                    assignmentSet.assignments.push(vAssignment);
	                }
	                result.push(assignmentSet);
	                continue;
	            }
	            //single key assignment
	            if (typeof (attr.KeyType) !== 'undefined') {
	                assignmentSet.id = attr.KeyType;
	                assignmentSet.name = tr(attrName);
	                //add a contact if it is defined
	                if (attr.KeyType === 'Contact' && this._contacts) {
	                    var contact = this.findContact(attr.Email);
	                    if (contact) {
	                        assignmentSet.assignments.push(contact);
	                        result.push(assignmentSet);
	                        continue;
	                    }
	                }
	                var vEntity = this.getVisualEntity(attr, attr.KeyType.toLowerCase());
	                assignmentSet.assignments.push(vEntity);
	                result.push(assignmentSet);
	                continue;
	            }
	            //cope with objects that encapsulate set of information (like a warranty, site, space and eventually others)
	            if (!(attr instanceof Array) && (attr instanceof Object)) {
	                assignmentSet.id = attr.KeyType;
	                assignmentSet.name = tr(attrName);
	                var vEntity = this.getVisualEntity(attr, 'inner');
	                assignmentSet.assignments.push(vEntity);
	                result.push(assignmentSet);
	                continue;
	            }
	        }
	        return result;
	    };
	    xCobieUkUtils.prototype.findContact = function (email) {
	        for (var i = 0; i < this._contacts.length; i++) {
	            var contact = this._contacts[i];
	            var emailProp = contact.properties.filter(function (e) { return e.name === 'Email'; })[0];
	            if (emailProp && emailProp.value === email)
	                return contact;
	        }
	    };
	    xCobieUkUtils.prototype.getDocuments = function (entity, type) {
	        if (!entity || !type)
	            throw 'entity and type must be defined';
	        var result = [];
	        var documents = entity.Documents;
	        if (!documents)
	            return result;
	        for (var i = 0; i < documents.length; i++) {
	            var doc = documents[i];
	            var vDoc = this.getVisualEntity(doc, 'document');
	            result.push(vDoc);
	        }
	        return result;
	    };
	    xCobieUkUtils.prototype.getIssues = function (entity) {
	        if (!entity)
	            throw 'entity and type must be defined';
	        var result = [];
	        var issues = entity.Issues;
	        if (!issues)
	            return result;
	        for (var i = 0; i < issues.length; i++) {
	            var issue = issues[i];
	            var vIssue = this.getVisualEntity(issue, 'issue');
	            result.push(vIssue);
	        }
	        return result;
	    };
	    xCobieUkUtils.prototype.setLanguage = function (lang, culture) {
	        this._dictionary = new xbim_attribute_dictionary_1.xAttributeDictionary(lang, culture);
	    };
	    xCobieUkUtils.prototype.getValueString = function (value) {
	        if (typeof (value) == 'undefined' || value == null)
	            return '';
	        var units = value.Unit || '';
	        //this is for different kinds of attributes using latest serializer implementation
	        if (typeof (value.StringAttributeValue) !== 'undefined')
	            return value.StringAttributeValue.Value || '';
	        if (typeof (value.BooleanAttributeValue) !== 'undefined')
	            return value.BooleanAttributeValue.Value || '';
	        if (typeof (value.DateTimeAttributeValue) !== 'undefined')
	            return value.DateTimeAttributeValue.Value || '';
	        if (typeof (value.DecimalAttributeValue) !== 'undefined') {
	            var number = value.DecimalAttributeValue.Value;
	            if (number) {
	                number = number.toFixed(this.settings.decimalPlaces);
	                return number.toString() + ' ' + units;
	            }
	            return '';
	        }
	        if (typeof (value.IntegerAttributeValue) !== 'undefined') {
	            var number = value.IntegerAttributeValue.Value;
	            if (number) {
	                return number.toString() + ' ' + units;
	            }
	            return '';
	        }
	        //return null for arrays and objects (which are both 'object')
	        if (typeof (value) == 'object')
	            return null;
	        return value;
	    };
	    xCobieUkUtils.prototype.getTranslator = function () {
	        var self = this;
	        return function (term) {
	            return self._dictionary[term] ? self._dictionary[term] : term.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
	        };
	    };
	    return xCobieUkUtils;
	}());
	exports.xCobieUkUtils = xCobieUkUtils;


/***/ },
/* 23 */
/***/ function(module, exports) {

	"use strict";
	var xVisualEntity = (function () {
	    /**
	    * Visual model containing entity data
	    *
	    * @name xVisualEntity
	    * @constructor
	    * @classdesc Visual model containing entity data
	    * @param {object} [values] - Object which can be used to initialize content of the object. It can be also used to create shallow copy of the object.
	    */
	    function xVisualEntity(values) {
	        /** @member {string} xVisualEntity#id - ID extracted from object attributes*/
	        this.id = '';
	        /** @member {string} xVisualEntity#type - type of the object like asset, assettype, floor, facility, assembly and others. It is always one lower case word.*/
	        this.type = '';
	        /** @member {string} xVisualEntity#name - Name extracted from object attributes*/
	        this.name = '';
	        /** @member {string} xVisualEntity#description - Description extracted from attributes*/
	        this.description = '';
	        /** @member {xVisualAttribute[]} xVisualEntity#attributes */
	        this.attributes = [];
	        /** @member {xVisualProperty[]} xVisualEntity#properties */
	        this.properties = [];
	        /** @member {xVisualEntity[]} xVisualEntity#documents */
	        this.documents = [];
	        /** @member {xVisualEntity[]} xVisualEntity#issues */
	        this.issues = [];
	        /** @member {xVisualAssignmentSet[]} xVisualEntity#assignments - An array of {@link xVisualAsignmentSet visual assignment sets} */
	        this.assignments = [];
	        /** @member {xVisualEntity[]} xVisualEntity#children - this can be used to build hierarchical structures like facility -> floors -> spaces -> assets */
	        this.children = [];
	        /** @member {xVisualEntity[]} xVisualEntity#warranties - this is applicable for asset type only. */
	        this.warranties = [];
	        this.isKey = false; //indicates if this is only a key for the actual entity
	        if (typeof (values) == 'object') {
	            for (var a in values) {
	                this[a] = values[a];
	            }
	        }
	    }
	    return xVisualEntity;
	}());
	exports.xVisualEntity = xVisualEntity;


/***/ },
/* 24 */
/***/ function(module, exports) {

	"use strict";
	/**
	* @name xVisualAssignmentSet
	* @constructor
	* @classdesc Visual model describing named sets of assignments
	*/
	var xVisualAssignmentSet = (function () {
	    function xVisualAssignmentSet() {
	        /** @member {string} xVisualAssignmentSet#name */
	        this.name = '';
	        /** @member {string} xVisualAssignmentSet#id */
	        this.id = '';
	        /** @member {xVisualEntity[]} xVisualAssignmentSet#assignments */
	        this.assignments = [];
	    }
	    return xVisualAssignmentSet;
	}());
	exports.xVisualAssignmentSet = xVisualAssignmentSet;
	;


/***/ },
/* 25 */
/***/ function(module, exports) {

	"use strict";
	var xVisualAttribute = (function () {
	    /**
	    * @name xVisualAttribute
	    * @constructor
	    * @classdesc Visual model describing attribute of the object
	    * @param {object} [values] - Object which can be used to initialize content of the object. It can be also used to create shallow copy of the object.
	    */
	    function xVisualAttribute(values) {
	        /** @member {string} xVisualAttribute#name */
	        this.name = '';
	        /** @member {string} xVisualAttribute#description */
	        this.description = '';
	        /** @member {string} xVisualAttribute#value */
	        this.value = '';
	        /** @member {string} xVisualAttribute#propertySet - original property set name from IFC file */
	        this.propertySet = '';
	        /** @member {string} xVisualAttribute#category */
	        this.category = '';
	        /** @member {xVisualEntity[]} xVisualAttribute#issues */
	        this.issues = [];
	        if (typeof (values) == 'object') {
	            for (var a in values) {
	                this[a] = values[a];
	            }
	        }
	    }
	    return xVisualAttribute;
	}());
	exports.xVisualAttribute = xVisualAttribute;


/***/ },
/* 26 */
/***/ function(module, exports) {

	"use strict";
	var xVisualProperty = (function () {
	    /**
	    * @name xVisualProperty
	    * @constructor
	    * @classdesc Visual model describing property of the object
	    * @param {object} [values] - Object which can be used to initialize content of the object. It can be also used to create shallow copy of the object.
	    */
	    function xVisualProperty(values) {
	        /** @member {string} xVisualProperty#name - name might be translated if you specify a language and culture in {@link xBrowser xBrowser} constructor */
	        this.name = '';
	        /** @member {string} xVisualProperty#value - string containing eventually units*/
	        this.value = '';
	        /** @member {string} xVisualProperty#id - original name from COBie before any transformation*/
	        this.id = '';
	        if (typeof (values) == 'object') {
	            for (var a in values) {
	                this[a] = values[a];
	            }
	        }
	    }
	    return xVisualProperty;
	}());
	exports.xVisualProperty = xVisualProperty;


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var xbim_visual_entity_1 = __webpack_require__(23);
	var xbim_visual_model_1 = __webpack_require__(21);
	var xbim_attribute_dictionary_1 = __webpack_require__(18);
	var xbim_visual_assignment_set_1 = __webpack_require__(24);
	var xbim_visual_attribute_1 = __webpack_require__(25);
	var xbim_visual_property_1 = __webpack_require__(26);
	var xCobieUtils = (function () {
	    function xCobieUtils(lang, culture) {
	        this.settings = {
	            decimalPlaces: 4
	        };
	        this._dictionary = new xbim_attribute_dictionary_1.xAttributeDictionary(lang, culture);
	    }
	    xCobieUtils.prototype.getVisualEntity = function (entity, type) {
	        if (!entity || !type)
	            throw 'entity must be defined';
	        var id = entity.externalID || entity.externalIDReference;
	        var name = '';
	        var description = '';
	        for (var a in entity) {
	            if (!entity.hasOwnProperty(a)) {
	                continue;
	            }
	            if (a.toLowerCase() === (type + 'name').toLowerCase())
	                name = entity[a];
	            if (a.toLowerCase() === (type + 'description').toLowerCase())
	                description = entity[a];
	            if (name.length !== 0 && description.length !== 0)
	                break;
	        }
	        return new xbim_visual_entity_1.xVisualEntity({
	            id: id,
	            type: type,
	            name: name,
	            description: description,
	            attributes: this.getAttributes(entity),
	            properties: this.getProperties(entity),
	            assignments: this.getAssignments(entity, type),
	            documents: this.getDocuments(entity, type),
	            issues: this.getIssues(entity)
	        });
	    };
	    xCobieUtils.prototype.getVisualModel = function (data) {
	        if (!data)
	            throw 'data must be defined';
	        var types = this.getAssetTypes(data);
	        var facility = this.getSpatialStructure(data, types);
	        return new xbim_visual_model_1.xVisualModel({
	            facility: facility,
	            zones: this.getZones(data, facility),
	            systems: this.getSystems(data, types),
	            assetTypes: types,
	            contacts: this.getContacts(data)
	        });
	    };
	    xCobieUtils.prototype.getContacts = function (data) {
	        if (!data)
	            throw 'data must be defined';
	        var result = [];
	        var contacts = data.Contacts;
	        if (contacts)
	            contacts = contacts.Contact;
	        if (!contacts)
	            return result;
	        contacts.forEach(function (contact) {
	            var vContact = this.getVisualEntity(contact, 'contact');
	            result.push(vContact);
	        }, this);
	        return result;
	    };
	    xCobieUtils.prototype.getSpatialStructure = function (data, types) {
	        if (!data)
	            throw 'data must be defined';
	        var facility = this.getVisualEntity(data, 'facility');
	        var floors = data.Floors;
	        if (!floors)
	            return [facility];
	        floors = floors.Floor;
	        if (!floors || floors.length == 0)
	            return [facility];
	        floors.forEach(function (floor) {
	            var vFloor = this.getVisualEntity(floor, 'floor');
	            facility.children.push(vFloor);
	            var spaces = floor.Spaces;
	            if (!spaces)
	                return;
	            spaces = spaces.Space;
	            if (!spaces)
	                return;
	            spaces.forEach(function (space) {
	                var vSpace = this.getVisualEntity(space, 'space');
	                vFloor.children.push(vSpace);
	            }, this);
	        }, this);
	        //add asset types and assets to spaces 
	        types = types ? types : this.getAssetTypes(data);
	        types.forEach(function (type) {
	            type.children.forEach(function (instance) {
	                //check assignments
	                var assignmentSet = instance.assignments.filter(function (e) { return e.id === 'Space'; })[0];
	                if (!assignmentSet)
	                    return;
	                var key = assignmentSet.assignments[0];
	                if (!key)
	                    return;
	                var spaceProp = key.properties.filter(function (e) { return e.id === 'SpaceName'; })[0];
	                var floorProp = key.properties.filter(function (e) { return e.id === 'FloorName'; })[0];
	                if (!floorProp || !spaceProp)
	                    return;
	                var spaceName = spaceProp.value;
	                var floorName = floorProp.value;
	                var floor = facility.children.filter(function (e) { return e.name === floorName; })[0];
	                if (!floor)
	                    return;
	                var space = floor.children.filter(function (e) { return e.name === spaceName; })[0];
	                if (!space)
	                    return;
	                space.children.push(instance);
	                assignmentSet.assignments[0] = space;
	            }, this);
	        }, this);
	        //facility is a root element of the tree spatial structure
	        return [facility];
	    };
	    xCobieUtils.prototype.getZones = function (data, facility) {
	        if (!data)
	            throw 'data must be defined';
	        var result = [];
	        var zones = data.Zones;
	        if (!zones)
	            return result;
	        zones = zones.Zone;
	        if (!zones)
	            return result;
	        zones.forEach(function (zone) {
	            var vZone = this.getVisualEntity(zone, 'zone');
	            result.push(vZone);
	        }, this);
	        //add spaces as a children of zones
	        facility.forEach(function (f) {
	            f.children.forEach(function (floor) {
	                floor.children.forEach(function (space) {
	                    var assignmentSet = space.assignments
	                        .filter(function (e) { return e.id === 'Zone'; })[0];
	                    if (!assignmentSet)
	                        return;
	                    var key = assignmentSet.assignments[0];
	                    if (!key)
	                        return;
	                    if (!key.id)
	                        return;
	                    var zone = result.filter(function (e) { return e.id === key.id; })[0];
	                    if (zone) {
	                        //add space to visual children
	                        zone.children.push(space);
	                        //replace key with actual object
	                        assignmentSet.assignments[0] = zone;
	                    }
	                }, this);
	            }, this);
	        }, this);
	        return result;
	    };
	    xCobieUtils.prototype.getSystems = function (data, types) {
	        if (!data)
	            throw 'data must be defined';
	        var result = [];
	        var systems = data.Systems;
	        if (!systems)
	            return result;
	        systems = systems.System;
	        if (!systems)
	            return result;
	        systems.forEach(function (system) {
	            var vSystem = this.getVisualEntity(system, 'system');
	            result.push(vSystem);
	        }, this);
	        //add asset types and assets to spaces 
	        types = types ? types : this.getAssetTypes(data);
	        types.forEach(function (type) {
	            type.children.forEach(function (instance) {
	                //check assignments
	                var assignmentSet = instance.assignments.filter(function (e) { return e.id === 'System'; })[0];
	                if (!assignmentSet)
	                    return;
	                var key = assignmentSet.assignments[0];
	                if (!key)
	                    return;
	                if (!key.id)
	                    return;
	                var system = result.filter(function (e) { return e.id === key.id; })[0];
	                if (system) {
	                    //add instance to system's visual children
	                    system.children.push(instance);
	                    //replace key with actual object
	                    assignmentSet.assignments[0] = system;
	                }
	            }, this);
	        }, this);
	        return result;
	    };
	    xCobieUtils.prototype.getAssetTypes = function (data) {
	        if (!data)
	            throw 'data must be defined';
	        var result = [];
	        var tr = this.getTranslator();
	        var types = data.AssetTypes;
	        if (!types)
	            return result;
	        types = types.AssetType;
	        if (!types)
	            return result;
	        types.forEach(function (type) {
	            var vType = this.getVisualEntity(type, 'assettype');
	            result.push(vType);
	            //process instances of type
	            var instances = type.Assets;
	            if (!instances)
	                return;
	            instances = instances.Asset;
	            if (!instances)
	                return;
	            instances.forEach(function (instance) {
	                var vInstance = this.getVisualEntity(instance, 'asset');
	                vType.children.push(vInstance);
	                //add assignment to the type
	                var assignment = new xbim_visual_assignment_set_1.xVisualAssignmentSet();
	                assignment.id = 'AssetType';
	                assignment.name = tr(assignment.id);
	                assignment.assignments.push(vType);
	                vInstance.assignments.push(assignment);
	            }, this);
	        }, this);
	        return result;
	    };
	    xCobieUtils.prototype.getProperties = function (entity) {
	        if (!entity)
	            throw 'entity must be defined';
	        var tr = this.getTranslator();
	        var result = [];
	        for (var a in entity) {
	            if (!entity.hasOwnProperty(a)) {
	                continue;
	            }
	            var attr = entity[a];
	            var valStr = this.getValueString(attr);
	            //it is an object not an attribute
	            if (!valStr)
	                continue;
	            var nameStr = tr(a);
	            result.push(new xbim_visual_property_1.xVisualProperty({ name: nameStr, value: valStr, id: a }));
	        }
	        ;
	        return result;
	    };
	    xCobieUtils.prototype.getAttributes = function (entity) {
	        if (!entity)
	            throw 'entity must be defined';
	        var result = [];
	        var attributes = null;
	        for (var a in entity) {
	            if (!entity.hasOwnProperty(a)) {
	                continue;
	            }
	            if (entity[a].Attribute) {
	                attributes = entity[a].Attribute;
	                break;
	            }
	        }
	        if (!attributes)
	            return result;
	        attributes.forEach(function (attribute) {
	            result.push(new xbim_visual_attribute_1.xVisualAttribute({
	                name: attribute.AttributeName,
	                description: attribute.AttributeDescription,
	                value: this.getValueString(attribute.AttributeValue),
	                propertySet: attribute.propertySetName,
	                category: attribute.AttributeCategory,
	                issues: attribute.AttributeIssues ? this.getAttributes(attribute.AttributeIssues) : []
	            }));
	        }, this);
	        return result;
	    };
	    xCobieUtils.prototype.getAssignments = function (entity, type) {
	        if (!entity || !type)
	            throw 'entity and type must be defined';
	        var tr = this.getTranslator();
	        var result = [];
	        for (var attr in entity) {
	            if (!entity.hasOwnProperty(attr)) {
	                continue;
	            }
	            var collection = new xbim_visual_assignment_set_1.xVisualAssignmentSet();
	            //assignment collection
	            var r = new RegExp('^(' + type + ')(.*)(assignments)$', 'i');
	            if (r.test(attr)) {
	                collection.id = attr.replace(r, '$2');
	                collection.name = tr(collection.id + 's');
	                for (var a in entity[attr]) {
	                    if (!entity[attr].hasOwnProperty(a)) {
	                        continue;
	                    }
	                    var assignmentSet = entity[attr][a];
	                    var name = a.replace('Assignment', '').toLowerCase();
	                    for (var a in assignmentSet) {
	                        if (!assignmentSet.hasOwnProperty(a)) {
	                            continue;
	                        }
	                        var assignment = assignmentSet[a];
	                        var vAssignment = this.getVisualEntity(assignment, name);
	                        vAssignment.isKey = true;
	                        collection.assignments.push(vAssignment);
	                    }
	                }
	            }
	            //single assignment
	            r = new RegExp('(.*)(assignment)$', 'i');
	            if (r.test(attr)) {
	                collection.id = attr.replace(r, '$1');
	                collection.name = tr(collection.id);
	                var vEntity = this.getVisualEntity(entity[attr], collection.id.toLowerCase());
	                collection.assignments.push(vEntity);
	            }
	            if (collection.assignments.length !== 0) {
	                result.push(collection);
	            }
	        }
	        return result;
	    };
	    xCobieUtils.prototype.getDocuments = function (entity, type) {
	        if (!entity || !type)
	            throw 'entity and type must be defined';
	        var result = [];
	        for (var attr in entity) {
	            if (!entity.hasOwnProperty(attr)) {
	                continue;
	            }
	            var r = new RegExp('^(' + type + ')(documents)$', 'i');
	            if (r.test(attr)) {
	                var documents = entity[attr].Document;
	                if (!documents)
	                    continue;
	                for (var i = 0; i < documents.length; i++) {
	                    var doc = documents[i];
	                    var vDoc = this.getVisualEntity(doc, 'document');
	                    result.push(vDoc);
	                }
	            }
	        }
	        return result;
	    };
	    xCobieUtils.prototype.getIssues = function (entity) {
	        if (!entity)
	            throw 'entity and type must be defined';
	        var result = [];
	        for (var attr in entity) {
	            if (!entity.hasOwnProperty(attr)) {
	                continue;
	            }
	            if (entity[attr].Issue) {
	                var issues = entity[attr].Issue;
	                for (var i = 0; i < issues.length; i++) {
	                    var issue = issues[i];
	                    var vIssue = this.getVisualEntity(issue, 'issue');
	                    result.push(vIssue);
	                }
	            }
	        }
	        return result;
	    };
	    xCobieUtils.prototype.setLanguage = function (lang, culture) {
	        this._dictionary = new xbim_attribute_dictionary_1.xAttributeDictionary(lang, culture);
	    };
	    xCobieUtils.prototype.getValueString = function (value) {
	        if (typeof (value) == 'undefined' || value == null)
	            return '';
	        var tr = this.getTranslator();
	        //this of for attributes prior to serialization enhancements
	        if (typeof (value.Item) !== 'undefined')
	            value = value.Item;
	        //this is for different kinds of attributes using latest serializer implementation
	        if (typeof (value.AttributeBooleanValue) !== 'undefined')
	            value = value.AttributeBooleanValue;
	        if (typeof (value.AttributeDateValue) !== 'undefined')
	            value = value.AttributeDateValue;
	        if (typeof (value.AttributeDateTimeValue) !== 'undefined')
	            value = value.AttributeDateTimeValue;
	        if (typeof (value.AttributeDecimalValue) !== 'undefined')
	            value = value.AttributeDecimalValue;
	        if (typeof (value.AttributeIntegerValue) !== 'undefined')
	            value = value.AttributeIntegerValue;
	        if (typeof (value.AttributeMonetaryValue) !== 'undefined')
	            value = value.AttributeMonetaryValue;
	        if (typeof (value.AttributeStringValue) !== 'undefined')
	            value = value.AttributeStringValue;
	        if (typeof (value.AttributeTimeValue) !== 'undefined')
	            value = value.AttributeTimeValue;
	        var baseVal = '';
	        if (typeof (value) == 'string')
	            baseVal = value;
	        if (typeof (value.BooleanValue) !== 'undefined')
	            baseVal = value.BooleanValue ? tr('True') : tr('False');
	        if (typeof (value.StringValue) !== 'undefined')
	            baseVal = value.StringValue;
	        if (typeof (value.DecimalValue) !== 'undefined')
	            baseVal = value.DecimalValue.toFixed(this.settings.decimalPlaces).toString();
	        if (typeof (value.IntegerValue) !== 'undefined')
	            baseVal = value.IntegerValue.toString();
	        if (value.UnitName)
	            baseVal += ' ' + value.UnitName;
	        return baseVal.length > 0 ? baseVal : '';
	    };
	    xCobieUtils.prototype.getTranslator = function () {
	        var self = this;
	        return function (term) {
	            return self._dictionary[term] ? self._dictionary[term] : term.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
	        };
	    };
	    return xCobieUtils;
	}());
	exports.xCobieUtils = xCobieUtils;


/***/ },
/* 28 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ },
/* 29 */,
/* 30 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ }
/******/ ])
});
;
//# sourceMappingURL=xbim.bundle.js.map