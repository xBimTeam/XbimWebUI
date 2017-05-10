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
        var ShapeNode = (function (_super) {
            __extends(ShapeNode, _super);
            function ShapeNode() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ShapeNode.prototype.CompileNode = function () {
            };
            ShapeNode.prototype.DrawNode = function () {
            };
            return ShapeNode;
        }(Viewer.Node));
        Viewer.ShapeNode = ShapeNode;
    })(Viewer = Xbim.Viewer || (Xbim.Viewer = {}));
})(Xbim || (Xbim = {}));
//# sourceMappingURL=node-shape.js.map