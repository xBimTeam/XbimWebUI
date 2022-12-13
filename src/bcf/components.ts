import { Component } from "./component";
import { Coloring } from "./coloring";
import { Visibility } from "./visibility";


/**
 * @category BCF
 */
export class Components {
    /**
     * Selected components
     */
    public selection: Component[];

    /**
     * Colored components
     */
    public coloring: Coloring[];

    /**
     * Visibility of components
     */
    public visibility: Visibility;
}