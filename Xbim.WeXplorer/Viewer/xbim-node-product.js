var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Xbim;
(function (Xbim) {
    var Viewer;
    (function (Viewer) {
        var ProductNode = (function (_super) {
            __extends(ProductNode, _super);
            function ProductNode() {
                _super.apply(this, arguments);
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
//# sourceMappingURL=xbim-node-product.js.map