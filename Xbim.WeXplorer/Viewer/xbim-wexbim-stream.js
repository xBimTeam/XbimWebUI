var Xbim;
(function (Xbim) {
    var Viewer;
    (function (Viewer) {
        var WexBimHeader = (function () {
            function WexBimHeader() {
                this.MagicNumber = 94132117;
                this.Version = 3; //modified to support regions correctly
            }
            WexBimHeader.ReadFromStream = function (reader) {
                var header = new WexBimHeader();
                header.MagicNumber = reader.readInt32();
                if (header.MagicNumber != 94132117)
                    throw "This is not a valid wexbim file. Magic number mismatch.";
                header.Version = reader.readByte();
                header.ShapeCount = reader.readInt32();
                header.VertexCount = reader.readInt32();
                header.TriangleCount = reader.readInt32();
                header.MatrixCount = reader.readInt32();
                header.ProductCount = reader.readInt32();
                header.StyleCount = reader.readInt32();
                header.OneMeter = reader.readFloat32();
                header.RegionCount = reader.readInt16();
                return header;
            };
            return WexBimHeader;
        }());
        Viewer.WexBimHeader = WexBimHeader;
        var WexBimRegion = (function () {
            function WexBimRegion() {
                this.GeometryModels = new Array();
            }
            WexBimRegion.prototype.MatrixCount = function () {
                var count = 0;
                this.GeometryModels.forEach(function (gm) { return count += gm.MatrixCount; });
                return count;
            };
            WexBimRegion.prototype.ShapeCount = function () {
                var count = 0;
                this.GeometryModels.forEach(function (gm) { return count += gm.ShapeCount; });
                return count;
            };
            WexBimRegion.prototype.TriangleCount = function () {
                var count = 0;
                this.GeometryModels.forEach(function (gm) { return count += gm.TriangleCount; });
                return count;
            };
            WexBimRegion.prototype.VertexCount = function () {
                var count = 0;
                this.GeometryModels.forEach(function (gm) { return count += gm.VertexCount; });
                return count;
            };
            WexBimRegion.prototype.AddGeometryModel = function (model) {
                this.GeometryModels.push(model);
            };
            WexBimRegion.ReadFromStream = function (reader) {
                var region = new WexBimRegion();
                region.Population = reader.readInt32();
                region.Centre = reader.readFloat32Array(3);
                region.BoundingBox = reader.readFloat32Array(6);
                return region;
            };
            return WexBimRegion;
        }());
        Viewer.WexBimRegion = WexBimRegion;
        var WexBimStyle = (function () {
            function WexBimStyle() {
            }
            WexBimStyle.ReadFromStream = function (reader) {
                var style = new WexBimStyle();
                style.StyleId = reader.readInt32();
                style.RGBA = reader.readFloat32Array(4);
                return style;
            };
            return WexBimStyle;
        }());
        Viewer.WexBimStyle = WexBimStyle;
        var WexBimProduct = (function () {
            function WexBimProduct() {
            }
            WexBimProduct.ReadFromStream = function (reader) {
                var product = new WexBimProduct();
                product.ProductLabel = reader.readInt32();
                product.ProductType = reader.readInt16();
                product.BoundingBox = reader.readFloat32Array(6);
                return product;
            };
            return WexBimProduct;
        }());
        Viewer.WexBimProduct = WexBimProduct;
        var WexBimShapeSingleInstance = (function () {
            function WexBimShapeSingleInstance() {
                this.IsSingleInstance = true;
                this.Transformation = null;
            }
            WexBimShapeSingleInstance.ReadFromStream = function (reader, model) {
                var shape = new WexBimShapeSingleInstance();
                shape.ProductLabel = reader.readInt32();
                shape.InstanceTypeId = reader.readInt16();
                shape.InstanceLabel = reader.readInt32();
                shape.StyleId = reader.readInt32();
                shape.GeometryModel = model;
                return shape;
            };
            return WexBimShapeSingleInstance;
        }());
        Viewer.WexBimShapeSingleInstance = WexBimShapeSingleInstance;
        /// <summary>
        /// Special kind of shape header for multiple instance shapes which has a transform
        /// </summary>
        var WexBimShapeMultiInstance = (function () {
            function WexBimShapeMultiInstance() {
                this.IsSingleInstance = false;
                this.Transformation = null;
            }
            WexBimShapeMultiInstance.ReadFromStream = function (reader, model) {
                var shape = new WexBimShapeMultiInstance();
                shape.ProductLabel = reader.readInt32();
                shape.InstanceTypeId = reader.readInt16();
                shape.InstanceLabel = reader.readInt32();
                shape.StyleId = reader.readInt32();
                shape.Transformation = reader.readFloat64Array(16);
                //set inverse
                shape.GeometryModel = model;
                return shape;
            };
            return WexBimShapeMultiInstance;
        }());
        Viewer.WexBimShapeMultiInstance = WexBimShapeMultiInstance;
        var WexBimGeometryModel = (function () {
            function WexBimGeometryModel() {
                this.Shapes = new Array();
            }
            Object.defineProperty(WexBimGeometryModel.prototype, "MatrixCount", {
                get: function () {
                    return this.Shapes.filter(function (s) { return s instanceof WexBimShapeMultiInstance; }).length;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(WexBimGeometryModel.prototype, "ShapeCount", {
                get: function () {
                    return this.Shapes.length;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(WexBimGeometryModel.prototype, "TriangleCount", {
                get: function () {
                    return this.Geometry.TriangleCount;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(WexBimGeometryModel.prototype, "VertexCount", {
                get: function () {
                    return this.Geometry.VertexCount;
                },
                enumerable: true,
                configurable: true
            });
            WexBimGeometryModel.ReadFromStream = function (reader) {
                var geometry = new WexBimGeometryModel();
                var numShapes = reader.readInt32();
                if (numShapes > 1) {
                    for (var i = 0; i < numShapes; i++) {
                        var instance = WexBimShapeMultiInstance.ReadFromStream(reader, geometry);
                        geometry.Shapes[instance.ProductLabel] = instance;
                    }
                }
                else {
                    var instance = WexBimShapeSingleInstance.ReadFromStream(reader, geometry);
                    geometry.Shapes[instance.ProductLabel] = instance;
                }
                //read the geometry
                var numBytes = reader.readInt32();
                geometry.Geometry = new Viewer.WexBimMesh(reader.readData(numBytes));
                return geometry;
            };
            return WexBimGeometryModel;
        }());
        Viewer.WexBimGeometryModel = WexBimGeometryModel;
        var WexBimStream = (function () {
            function WexBimStream() {
                this.Regions = new Array();
                this.Styles = new Array();
                this.Products = {};
            }
            WexBimStream.prototype.AddRegion = function (region) {
                this.Regions.push(region);
            };
            WexBimStream.prototype.AddStyle = function (style) {
                this.Styles.push(style);
            };
            WexBimStream.prototype.Union = function (boxA, boxB) {
                var result = new Float32Array(6);
                if (boxA == null && boxB != null) {
                    result.set(boxB);
                    return result;
                }
                if (boxB == null) {
                    return null;
                }
                result[0] = Math.min(boxA[0], boxB[0]);
                result[1] = Math.min(boxA[1], boxB[1]);
                result[2] = Math.min(boxA[2], boxB[2]);
                result[3] = Math.max((boxA[0] + boxA[3]), (boxB[0] + boxB[3])) - result[0];
                result[4] = Math.max((boxA[1] + boxA[4]), (boxB[1] + boxB[4])) - result[1];
                result[5] = Math.max((boxA[2] + boxA[5]), (boxB[2] + boxB[5])) - result[2];
                return result;
            };
            /// <summary>
            /// Adds a product part representation to the view, if parts of the product are already added the bounding box is expanded, the first product type is retained
            /// </summary>
            /// <param name="product"></param>
            WexBimStream.prototype.AddProduct = function (product) {
                var existingProduct = this.Products[product.ProductLabel];
                if (existingProduct) {
                    existingProduct.BoundingBox = this.Union(existingProduct.BoundingBox, product.BoundingBox);
                }
                else {
                    this.Products[product.ProductLabel] = product;
                }
            };
            WexBimStream.Load = function (source, callback) {
                if (source == null)
                    throw "Undefined source";
                if (callback == null)
                    throw "You have to use callback to get the stream";
                var reader = new Viewer.BinaryReader();
                reader.onloaded = function (r) {
                    var wexbim = WexBimStream.ReadFromStream(r);
                    if (callback)
                        callback(wexbim);
                };
                reader.load(source);
            };
            WexBimStream.ReadFromStream = function (reader) {
                var wexBimStream = new WexBimStream();
                wexBimStream.Header = WexBimHeader.ReadFromStream(reader);
                for (var i = 0; i < wexBimStream.Header.RegionCount; i++) {
                    wexBimStream.AddRegion(WexBimRegion.ReadFromStream(reader));
                }
                for (var i = 0; i < wexBimStream.Header.StyleCount; i++) {
                    wexBimStream.AddStyle(WexBimStyle.ReadFromStream(reader));
                }
                for (var i = 0; i < wexBimStream.Header.ProductCount; i++) {
                    wexBimStream.AddProduct(WexBimProduct.ReadFromStream(reader));
                }
                wexBimStream.Regions.forEach(function (region) {
                    var geometryCount = reader.readInt32();
                    for (var i = 0; i < geometryCount; i++) {
                        region.AddGeometryModel(WexBimGeometryModel.ReadFromStream(reader));
                    }
                });
                //set up products with shapes
                wexBimStream.Regions.forEach(function (region) {
                    region.GeometryModels.forEach(function (model) {
                        model.Shapes.forEach(function (shape) {
                            var product = wexBimStream.Products[shape.ProductLabel];
                            product.Shapes.push(shape);
                        });
                    });
                });
                return wexBimStream;
            };
            return WexBimStream;
        }());
        Viewer.WexBimStream = WexBimStream;
    })(Viewer = Xbim.Viewer || (Xbim.Viewer = {}));
})(Xbim || (Xbim = {}));
//# sourceMappingURL=xbim-wexbim-stream.js.map