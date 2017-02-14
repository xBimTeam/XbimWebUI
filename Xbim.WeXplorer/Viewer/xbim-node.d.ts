declare namespace Xbim.Viewer {
    abstract class Node {
        ID: number;
        readonly Type: NodeType;
        Parent: Node;
        Nodes: Node[];
        Hidden: Boolean;
        protected needsRecompile: Boolean;
        protected abstract CompileNode(): void;
        protected abstract DrawNode(): void;
        Compile(): void;
        /**
         * This method will render this node and all subnodes
         * @param skip Optional condition. If this call evaluates to true this node is not drawn.
         */
        Draw(skip?: (node: Node) => boolean): void;
        /**
         * Performs hierarchical search in the graph using the specified selector function
         * @param selector Condition to check
         * @param stopper Condition to stop in-depth search
         * @param results Array of results to aggregate
         * @returns All nodes which evaluate condition to true
         */
        Find(selector: (node: Node) => boolean, stopper?: (node: Node) => boolean, results?: Node[]): Node[];
        /**
         * Use this function to perform recursive action on this and all sub nodes.
         * @param action
         */
        ForEach(action: (node: Node) => void): void;
    }
    enum NodeType {
        SCENE = 0,
        TYPE = 1,
        PRODUCT = 2,
        SHAPE = 3,
        NOTDEFINED = 4,
    }
}
