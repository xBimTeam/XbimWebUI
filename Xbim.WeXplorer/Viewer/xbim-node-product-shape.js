var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Xbim;
(function (Xbim) {
    var Viewer;
    (function (Viewer) {
        var ProductShape = (function (_super) {
            __extends(ProductShape, _super);
            function ProductShape() {
                return _super !== null && _super.apply(this, arguments) || this;
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