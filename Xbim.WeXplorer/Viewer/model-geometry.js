"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var binary_reader_1 = require("./binary-reader");
var triangulated_shape_1 = require("./triangulated-shape");
var state_1 = require("./state");
var product_type_1 = require("./product-type");
var ModelGeometry = (function () {
    function ModelGeometry() {
        this.meter = 1000;
        //this will be used to change appearance of the objects
        //map objects have a format: 
        //map = {
        //	productID: int,
        //	type: int,
        //	bBox: Float32Array(6),
        //	spans: [Int32Array([int, int]),Int32Array([int, int]), ...] //spanning indexes defining shapes of product and it's state
        //};
        this._iVertex = 0;
        this._iIndexForward = 0;
        this._iIndexBackward = 0;
        this._iTransform = 0;
        this._iMatrix = 0;
        this.productMaps = {};
        this._styleMap = new StyleMap();
    }
    ModelGeometry.prototype.parse = function (binReader) {
        this._reader = binReader;
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
        //create target buffers of correct sizes (avoid reallocation of memory, work with native typed arrays)
        this.vertices = new Float32Array(this.square(4, numVertices * 3));
        this.normals = new Uint8Array(numTriangles * 6);
        this.indices = new Float32Array(numTriangles * 3);
        this.styleIndices = new Uint16Array(numTriangles * 3);
        this.styles = new Uint8Array(this.square(1, (numStyles + 1) * 4)); //+1 is for a default style
        this.products = new Float32Array(numTriangles * 3);
        this.states = new Uint8Array(numTriangles * 3 * 2); //place for state and restyling
        this.transformations = new Float32Array(numTriangles * 3);
        this.matrices = new Float32Array(this.square(4, numMatrices * 16));
        this.productMaps = {};
        this.regions = new Array(numRegions);
        //initial values for indices for iterations over data
        this._iVertex = 0;
        this._iIndexForward = 0;
        this._iIndexBackward = numTriangles * 3;
        this._iTransform = 0;
        this._iMatrix = 0;
        for (var i = 0; i < numRegions; i++) {
            var region = new Region();
            region.population = br.readInt32();
            region.centre = br.readFloat32Array(3);
            region.bbox = br.readFloat32Array(6);
            this.regions[i] = region;
        }
        var iStyle = 0;
        for (iStyle; iStyle < numStyles; iStyle++) {
            var styleId = br.readInt32();
            var R = br.readFloat32() * 255;
            var G = br.readFloat32() * 255;
            var B = br.readFloat32() * 255;
            var A = br.readFloat32() * 255;
            this.styles.set([R, G, B, A], iStyle * 4);
            this._styleMap.Add({ id: styleId, index: iStyle, transparent: A < 254 });
        }
        this.styles.set([255, 255, 255, 255], iStyle * 4);
        var defaultStyle = { id: -1, index: iStyle, transparent: false };
        this._styleMap.Add(defaultStyle);
        for (var i = 0; i < numProducts; i++) {
            var productLabel = br.readInt32();
            var prodType = br.readInt16();
            var bBox = br.readFloat32Array(6);
            var map = {
                productID: productLabel,
                type: prodType,
                bBox: bBox,
                spans: []
            };
            this.productMaps[productLabel] = map;
        }
        //version 3 puts geometry in regions properly so it is possible to use this information for rendering
        if (version >= 3) {
            for (var r = 0; r < numRegions; r++) {
                var region = this.regions[r];
                var geomCount = br.readInt32();
                for (var g = 0; g < geomCount; g++) {
                    //read shape information
                    var shapes = this.readShape(version);
                    //read geometry
                    var geomLength = br.readInt32();
                    //read geometry data (make sure we don't overflow - use isolated subreader)
                    var gbr = br.getSubReader(geomLength);
                    var geometry = new triangulated_shape_1.TriangulatedShape();
                    geometry.parse(gbr);
                    //make sure that geometry is complete
                    if (!gbr.isEOF())
                        throw new Error("Incomplete reading of geometry for shape instance " + shapes[0].iLabel);
                    //add data to arrays prepared for GPU
                    this.feedDataArrays(shapes, geometry);
                }
            }
        }
        else {
            //older versions use less safety and just iterate over in a single loop
            for (var iShape = 0; iShape < numShapes; iShape++) {
                //reed shape representations
                var shapes_1 = this.readShape(version);
                //read shape geometry
                var geometry = new triangulated_shape_1.TriangulatedShape();
                geometry.parse(br);
                //feed data arays
                this.feedDataArrays(shapes_1, geometry);
            }
        }
        //binary reader should be at the end by now
        if (!br.isEOF()) {
            throw new Error('Binary reader is not at the end of the file.');
        }
        //set value of transparent index divider for two phase rendering (simplified ordering)
        this.transparentIndex = this._iIndexForward;
    };
    /**
     * Get size of arrays to be square (usable for texture data)
     * @param arity
     * @param count
     */
    ModelGeometry.prototype.square = function (arity, count) {
        if (typeof (arity) == 'undefined' || typeof (count) == 'undefined') {
            throw new Error('Wrong arguments for "square" function.');
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
    ModelGeometry.prototype.feedDataArrays = function (shapes, geometry) {
        var _this = this;
        //copy shape data into inner array and set to null so it can be garbage collected
        shapes.forEach(function (shape) {
            var iIndex = 0;
            //set iIndex according to transparency either from beginning or at the end
            if (shape.transparent) {
                iIndex = _this._iIndexBackward - geometry.indices.length;
            }
            else {
                iIndex = _this._iIndexForward;
            }
            var begin = iIndex;
            var map = _this.productMaps[shape.pLabel];
            if (typeof (map) === "undefined") {
                //throw "Product hasn't been defined before.";
                map = {
                    productID: 0,
                    type: product_type_1.ProductType.IFCOPENINGELEMENT,
                    bBox: new Float32Array(6),
                    spans: []
                };
                _this.productMaps[shape.pLabel] = map;
            }
            _this.normals.set(geometry.normals, iIndex * 2);
            //switch spaces and openings off by default 
            var state = map.type == product_type_1.ProductType.IFCSPACE || map.type == product_type_1.ProductType.IFCOPENINGELEMENT
                ? state_1.State.HIDDEN
                : 0xFF; //0xFF is for the default state
            //fix indices to right absolute position. It is relative to the shape.
            for (var i = 0; i < geometry.indices.length; i++) {
                _this.indices[iIndex] = geometry.indices[i] + _this._iVertex / 3;
                _this.products[iIndex] = shape.pLabel;
                _this.styleIndices[iIndex] = shape.style;
                _this.transformations[iIndex] = shape.transform; //shape.pLabel == 33698 || shape.pLabel == 33815 ? -1 : shape.transform;
                _this.states[2 * iIndex] = state; //set state
                _this.states[2 * iIndex + 1] = 0xFF; //default style
                iIndex++;
            }
            var end = iIndex;
            map.spans.push(new Int32Array([begin, end]));
            if (shape.transparent)
                _this._iIndexBackward -= geometry.indices.length;
            else
                _this._iIndexForward += geometry.indices.length;
        }, this);
        //copy geometry and keep track of amount so that we can fix indices to right position
        //this must be the last step to have correct iVertex number above
        this.vertices.set(geometry.vertices, this._iVertex);
        this._iVertex += geometry.vertices.length;
    };
    ModelGeometry.prototype.readShape = function (version) {
        var br = this._reader;
        var repetition = br.readInt32();
        var shapeList = new Array();
        for (var iProduct = 0; iProduct < repetition; iProduct++) {
            var prodLabel = br.readInt32();
            var instanceTypeId = br.readInt16();
            var instanceLabel = br.readInt32();
            var styleId = br.readInt32();
            var transformation = null;
            if (repetition > 1) {
                //version 1 had lower precission of transformation matrices
                transformation = version === 1 ? br.readFloat32Array(16) : br.readFloat64Array(16);
                this.matrices.set(transformation, this._iMatrix);
                this._iMatrix += 16;
            }
            var styleItem = this._styleMap.GetStyle(styleId);
            if (styleItem === null)
                styleItem = this._styleMap.GetStyle(-1); //default style
            shapeList.push({
                pLabel: prodLabel,
                iLabel: instanceLabel,
                style: styleItem.index,
                transparent: styleItem.transparent,
                transform: transformation != null ? this._iTransform++ : -1
            });
        }
        return shapeList;
    };
    //Source has to be either URL of wexBIM file or Blob representing wexBIM file
    ModelGeometry.prototype.load = function (source) {
        //binary reading
        var br = new binary_reader_1.BinaryReader();
        var self = this;
        br.onloaded = function () {
            self.parse(br);
            if (self.onloaded) {
                self.onloaded(this);
            }
        };
        br.onerror = function (msg) {
            if (self.onerror)
                self.onerror(msg);
        };
        br.load(source);
    };
    return ModelGeometry;
}());
exports.ModelGeometry = ModelGeometry;
var ProductMap = (function () {
    function ProductMap() {
    }
    return ProductMap;
}());
exports.ProductMap = ProductMap;
var Region = (function () {
    function Region(region) {
        this.population = -1;
        this.centre = null;
        this.bbox = null;
        if (region) {
            this.population = region.population;
            this.centre = new Float32Array(region.centre);
            this.bbox = new Float32Array(region.bbox);
        }
    }
    /**
     * Returns clone of this region
     */
    Region.prototype.clone = function () {
        var clone = new Region();
        clone.population = this.population;
        clone.centre = new Float32Array(this.centre);
        clone.bbox = new Float32Array(this.bbox);
        return clone;
    };
    /**
     * Returns new region which is a merge of this region and the argument
     * @param region region to be merged
     */
    Region.prototype.merge = function (region) {
        //if this is a new empty region, return clone of the argument
        if (this.population === -1 && this.centre === null && this.bbox === null)
            return new Region(region);
        var out = new Region();
        out.population = this.population + region.population;
        var x = Math.min(this.bbox[0], region.bbox[0]);
        var y = Math.min(this.bbox[1], region.bbox[1]);
        var z = Math.min(this.bbox[2], region.bbox[2]);
        var x2 = Math.min(this.bbox[0] + this.bbox[3], region.bbox[0] + region.bbox[3]);
        var y2 = Math.min(this.bbox[1] + this.bbox[4], region.bbox[1] + region.bbox[4]);
        var z2 = Math.min(this.bbox[2] + this.bbox[5], region.bbox[2] + region.bbox[5]);
        var sx = x2 - x;
        var sy = y2 - y;
        var sz = z2 - z;
        var cx = (x + x2) / 2.0;
        var cy = (y + y2) / 2.0;
        var cz = (z + z2) / 2.0;
        out.bbox = new Float32Array([x, y, z, sx, sy, sz]);
        out.centre = new Float32Array([cx, cy, cz]);
        return out;
    };
    return Region;
}());
exports.Region = Region;
var StyleMap = (function () {
    function StyleMap() {
        this._internal = {};
    }
    StyleMap.prototype.Add = function (record) {
        this._internal[record.id] = record;
    };
    StyleMap.prototype.GetStyle = function (id) {
        var item = this._internal[id];
        if (item)
            return item;
        return null;
    };
    return StyleMap;
}());
var StyleRecord = (function () {
    function StyleRecord() {
    }
    return StyleRecord;
}());
var ShapeRecord = (function () {
    function ShapeRecord() {
    }
    return ShapeRecord;
}());
//# sourceMappingURL=model-geometry.js.map