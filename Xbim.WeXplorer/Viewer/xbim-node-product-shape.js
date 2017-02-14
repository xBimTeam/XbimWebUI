var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Xbim;
(function (Xbim) {
    var Viewer;
    (function (Viewer) {
        var ProductShape = (function (_super) {
            __extends(ProductShape, _super);
            function ProductShape() {
                _super.apply(this, arguments);
            }
            ProductShape.prototype.CompileNode = function () {
            };
            ProductShape.prototype.DrawNode = function () {
            };
            return ProductShape;
        }(Viewer.Node));
        Viewer.ProductShape = ProductShape;
    })(Viewer = Xbim.Viewer || (Xbim.Viewer = {}));
})(Xbim || (Xbim = {}));
//# sourceMappingURL=xbim-node-product-shape.js.map