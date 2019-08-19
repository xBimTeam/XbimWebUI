import { Guid } from "./guid";
import { Snapshot } from "./snapshot";
import { Bitmap } from "./bitmap";
import { ClippingPlane } from "./clipping-plane";
import { Line } from "./line";
import { PerspectiveCamera } from "./perspective-camera";
import { OrthogonalCamera } from "./orthogonal-camera";
import { Components } from "./components";

export class Viewpoint {
    /**
     * Index used for sorting of multiple viewpoints
     */
    public index: number;

    /**
     * Unique ID of the viewpoint
     */
    public guid: string = Guid.new();

    /**
     * This element describes a viewpoint using orthogonal camera.
     */
    public orthogonal_camera: OrthogonalCamera;

    /**
     * This element describes a viewpoint using perspective camera.
     */
    public perspective_camera: PerspectiveCamera;

    /**
     * Lines can be used to add markup in 3D. Each line is defined by three dimensional 
     * Start Point and End Point. Lines that have the same start and end points are to be 
     * considered points and may be displayed accordingly.
     */
    public lines: Line[];

    /**
     * ClippingPlanes can be used to define a subsection of a building model that is related to the topic. 
     * Each clipping plane is defined by Location and Direction.
     */
    public clipping_planes: ClippingPlane[];

    /**
     * A list of bitmaps can be used to add more information, 
     * for example, text in the visualization.
     * Bitmaps would be placed in the 3D view
     */
    public bitmaps: Bitmap[];

    /**
     * Image snapshot of the view
     */
    public snapshot: Snapshot;

    /**
     * Components in the viewpoint
     */
    public components: Components;
}