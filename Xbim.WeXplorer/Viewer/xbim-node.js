var Xbim;
(function (Xbim) {
    var Viewer;
    (function (Viewer) {
        var Node = (function () {
            function Node() {
                this.Type = NodeType.NOTDEFINED;
                this.Nodes = new Array();
                this.Hidden = false;
                this.needsRecompile = true;
            }
            Node.prototype.Compile = function () {
                if (this.needsRecompile) {
                    this.CompileNode();
                    this.needsRecompile = false;
                }
                //compile all subnodes
                if (this.Nodes) {
                    this.Nodes.forEach(function (n) { return n.Compile(); });
                }
            };
            /**
             * This method will render this node and all subnodes
             * @param skip Optional condition. If this call evaluates to true this node is not drawn.
             */
            Node.prototype.Draw = function (skip) {
                if (this.Hidden) {
                    return;
                }
                //check custom function
                if (skip != null && skip(this)) {
                    return;
                }
                this.DrawNode();
                //draw all subnodes
                if (this.Nodes) {
                    this.Nodes.forEach(function (n) { return n.Draw(skip); });
                }
            };
            /**
             * Performs hierarchical search in the graph using the specified selector function
             * @param selector Condition to check
             * @param stopper Condition to stop in-depth search
             * @param results Array of results to aggregate
             * @returns All nodes which evaluate condition to true
             */
            Node.prototype.Find = function (selector, stopper, results) {
                if (results == null)
                    results = new Array();
                if (stopper != null && stopper(this)) {
                    return results;
                }
                if (selector(this)) {
                    results.push(this);
                }
                if (this.Nodes) {
                    this.Nodes.forEach(function (n) { return n.Find(selector, stopper, results); });
                }
                return results;
            };
            /**
             * Use this function to perform recursive action on this and all sub nodes.
             * @param action
             */
            Node.prototype.ForEach = function (action) {
                action(this);
                if (this.Nodes) {
                    this.Nodes.forEach(function (n) { return n.ForEach(action); });
                }
            };
            return Node;
        }());
        Viewer.Node = Node;
        var NodeType;
        (function (NodeType) {
            NodeType[NodeType["SCENE"] = 0] = "SCENE";
            NodeType[NodeType["TYPE"] = 1] = "TYPE";
            NodeType[NodeType["PRODUCT"] = 2] = "PRODUCT";
            NodeType[NodeType["SHAPE"] = 3] = "SHAPE";
            NodeType[NodeType["NOTDEFINED"] = 4] = "NOTDEFINED";
        })(NodeType = Viewer.NodeType || (Viewer.NodeType = {}));
    })(Viewer = Xbim.Viewer || (Xbim.Viewer = {}));
})(Xbim || (Xbim = {}));
//# sourceMappingURL=xbim-node.js.map