"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var binary_reader_1 = require("./binary-reader");
var triangulated_shape_1 = require("./triangulated-shape");
var state_1 = require("./state");
var product_type_1 = require("./product-type");
var ModelGeometry = /** @class */ (function () {
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
        this.productMaps = {};
    }
    ModelGeometry.prototype.parse = function (binReader) {
        var _this = this;
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
        this.productMaps = {};
        this.regions = new Array(numRegions);
        var iVertex = 0;
        var iIndexForward = 0;
        var iIndexBackward = numTriangles * 3;
        var iTransform = 0;
        var iMatrix = 0;
        var stateEnum = state_1.State;
        var typeEnum = product_type_1.ProductType;
        for (var i = 0; i < numRegions; i++) {
            var region = new Region();
            region.population = br.readInt32();
            region.centre = br.readFloat32Array(3);
            region.bbox = br.readFloat32Array(6);
            this.regions[i] = region;
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
            var bBox = br.readFloat32Array(6);
            var map = {
                productID: productLabel,
                type: prodType,
                bBox: bBox,
                spans: []
            };
            this.productMaps[productLabel] = map;
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
                    transformation = version === 1 ? br.readFloat32Array(16) : br.readFloat64Array(16);
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
                    transform: transformation != null ? iTransform++ : -1
                });
            }
            //read shape geometry
            var shapeGeom = new triangulated_shape_1.TriangulatedShape();
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
                var map = _this.productMaps[shape.pLabel];
                if (typeof (map) === "undefined") {
                    //throw "Product hasn't been defined before.";
                    map = {
                        productID: 0,
                        type: typeEnum.IFCOPENINGELEMENT,
                        bBox: new Float32Array(6),
                        spans: []
                    };
                    _this.productMaps[shape.pLabel] = map;
                }
                _this.normals.set(shapeGeom.normals, iIndex * 2);
                //switch spaces and openings off by default 
                var state = map.type == typeEnum.IFCSPACE || map.type == typeEnum.IFCOPENINGELEMENT
                    ? stateEnum.HIDDEN
                    : 0xFF; //0xFF is for the default state
                //fix indices to right absolute position. It is relative to the shape.
                for (var i = 0; i < shapeGeom.indices.length; i++) {
                    _this.indices[iIndex] = shapeGeom.indices[i] + iVertex / 3;
                    _this.products[iIndex] = shape.pLabel;
                    _this.styleIndices[iIndex] = shape.style;
                    _this.transformations[iIndex] = shape.transform;
                    _this.states[2 * iIndex] = state; //set state
                    _this.states[2 * iIndex + 1] = 0xFF; //default style
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
        if (!br.isEOF()) {
            //throw 'Binary reader is not at the end of the file.';
        }
        this.transparentIndex = iIndexForward;
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
var ProductMap = /** @class */ (function () {
    function ProductMap() {
    }
    return ProductMap;
}());
exports.ProductMap = ProductMap;
var Region = /** @class */ (function () {
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
//# sourceMappingURL=model-geometry.js.map