import { Component } from "./component";
import { ViewSetupHints } from "./view-setup-hints";

export class Visibility {
    /**
     * If true: Show all components, and hide the exceptions. If false: Hide all components and show exceptions;
     */
    public default_visibility: boolean = false;

    /**
     * Components to hide/show determined by default_visibility
     */
    public exceptions: Component[];

    /**
     * Hints about the setup of the viewer
     */
    public view_setup_hints: ViewSetupHints;
}