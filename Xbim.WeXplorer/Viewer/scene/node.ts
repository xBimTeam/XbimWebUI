export abstract class Node {
    public ID: number;
    public readonly Type: NodeType = NodeType.NOTDEFINED;
    public Parent: Node;
    public Nodes: Node[] = new Array<Node>();
    public Hidden: Boolean = false;

    protected needsRecompile: Boolean = true;

    protected abstract CompileNode(): void;
    protected abstract DrawNode(): void;

    public Compile(): void {
        if (this.needsRecompile) {
            this.CompileNode();
            this.needsRecompile = false;
        }
        //compile all subnodes
        if (this.Nodes) {
            this.Nodes.forEach(n => n.Compile());
        }
    }

    /**
     * This method will render this node and all subnodes
     * @param skip Optional condition. If this call evaluates to true this node is not drawn.
     */
    public Draw(skip?: (node: Node) => boolean): void {
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
            this.Nodes.forEach(n => n.Draw(skip));
        }
    }

    /**
     * Performs hierarchical search in the graph using the specified selector function
     * @param selector Condition to check
     * @param stopper Condition to stop in-depth search
     * @param results Array of results to aggregate
     * @returns All nodes which evaluate condition to true
     */
    public Find(selector: (node: Node) => boolean, stopper?: (node: Node) => boolean, results?: Node[]): Node[] {
        if (results == null)
            results = new Array<Node>();

        if (stopper != null && stopper(this)) {
            return results;
        }

        if (selector(this)) {
            results.push(this);
        }

        if (this.Nodes) {
            this.Nodes.forEach(n => n.Find(selector, stopper, results));
        }
        return results;
    }

    /**
     * Use this function to perform recursive action on this and all sub nodes.
     * @param action
     */
    public ForEach(action: (node: Node) => void): void {
        action(this);
        if (this.Nodes) {
            this.Nodes.forEach(n => n.ForEach(action));
        }
    }
}

export enum NodeType {
    SCENE,
    TYPE,
    PRODUCT,
    SHAPE,
    NOTDEFINED
}
