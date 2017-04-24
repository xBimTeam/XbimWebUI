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
        var ProductNode = (function (_super) {
            __extends(ProductNode, _super);
            function ProductNode() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ProductNode.prototype.CompileNode = function () {
            };
            ProductNode.prototype.DrawNode = function () {
            };
            return ProductNode;
        }(Viewer.Node));
        Viewer.ProductNode = ProductNode;
    })(Viewer = Xbim.Viewer || (Xbim.Viewer = {}));
})(Xbim || (Xbim = {}));
//# sourceMappingURL=node-product.js.map