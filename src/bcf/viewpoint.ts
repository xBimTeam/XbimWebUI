import { Guid } from "./guid";
import { Snapshot } from "./snapshot";
import { Bitmap } from "./bitmap";
import { ClippingPlane } from "./clipping-plane";
import { Line } from "./line";
import { PerspectiveCamera } from "./perspective-camera";
import { OrthogonalCamera } from "./orthogonal-camera";
import { Components } from "./components";
import { Viewer } from "../viewer";
import { vec3, mat4 } from "gl-matrix";
import { CameraType } from "../camera";

export class Viewpoint {

    /**
     * Static index used for autoincrement of viewpoints created in this session
     */
    private static _currentIndex: number = 0;

    /**
     * Index used for sorting of multiple viewpoints. (Autoincremented)
     */
    public index: number = ++Viewpoint._currentIndex;

    /**
     * Unique ID of the viewpoint. (Automatically created by default)
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


    /**
     * Creates BCF viewpoint from the current view
     * 
     * @param viewer viewer instance
     */
    public static GetViewpoint(viewer: Viewer, width = viewer.width / 2.0): Viewpoint {
        const view = new Viewpoint();
        const aspect = viewer.width / viewer.height;
        const height = viewer.height / aspect;

        const toArray = (a: vec3) => {
            return Array.prototype.slice.call(a);
        };

        // capture camera
        if (viewer.camera == CameraType.PERSPECTIVE) {
            view.perspective_camera = {
                camera_direction: toArray(viewer.getCameraDirection()),
                camera_up_vector: toArray(viewer.getCameraHeading()),
                camera_view_point: toArray(viewer.getCameraPositionWcs()),
                field_of_view: viewer.cameraProperties.fov
            };
        } else {
            // width of view in meters
            const modelHeight = viewer.cameraProperties.height / viewer.unitsInMeter;
            const viewportHeight = viewer.height / Viewpoint.resolution;
            view.orthogonal_camera = {
                camera_direction: toArray(viewer.getCameraDirection()),
                camera_up_vector: toArray(viewer.getCameraHeading()),
                camera_view_point: toArray(viewer.getCameraPositionWcs()),
                view_to_world_scale: viewportHeight / modelHeight
            }
        }

        // capture image (good for preview for example)
        const dataUrl = viewer.getCurrentImageDataUrl(width, height, 'jpeg');
        // strip 'data:image/jpeg;base64,' from the data url
        const base64image = dataUrl.substring(23);
        view.snapshot = {
            snapshot_type: 'jpg',
            snapshot_data: base64image
        };

        // capture current clipping planes: We may have different clipping planes for different submodels

        // capture component styling (selection, overriden colours, visibility etc.) We should use IFC guids for this which is not in the scope of the viewer

        return view;
    }

    public static SetViewpoint(viewer: Viewer, viewpoint: Viewpoint, duration: number = 0): void {
        const toVec3 = (a: number[]) => {
            if (a == null || a.length < 3) {
                return null;
            }
            return vec3.fromValues(a[0], a[1], a[2]);
        };

        const wcs = viewer.getCurrentWcs();

        let camViewPoint = viewpoint.perspective_camera != null ?
            viewpoint.perspective_camera.camera_view_point :
            viewpoint.orthogonal_camera.camera_view_point;
        let camDir = viewpoint.perspective_camera != null ?
            viewpoint.perspective_camera.camera_direction :
            viewpoint.orthogonal_camera.camera_direction;
        let camUpDir = viewpoint.perspective_camera != null ?
            viewpoint.perspective_camera.camera_up_vector :
            viewpoint.orthogonal_camera.camera_up_vector;

        const eyeWcs = toVec3(camViewPoint);
        const eye = vec3.subtract(vec3.create(), eyeWcs, wcs);
        const dir = toVec3(camDir);
        const target = vec3.add(vec3.create(), eye, dir);
        let up = toVec3(camUpDir) || vec3.fromValues(0, 0, 1);

        // target abd heading are collinear. This is singular orientation and will screw the view up.
        let angle = vec3.angle(dir, up);
        if (Math.abs(angle) < 1e-6 || Math.abs(angle - Math.PI) < 1e-6) {
            console.warn('Collinear target and heading vectors for the view. Singularity will be fixed by guess.');

            // looking up or down is most likely scenario for singularity
            angle = vec3.angle(dir, vec3.fromValues(0, 0, 1));
            if (Math.abs(angle) < 1e-6 || Math.abs(angle - Math.PI) < 1e-6) {
                up = vec3.fromValues(0, 1, 0);
            }
        }

        // set camera type and properties
        let orthCamHeight = viewer.cameraProperties.height;
        if (viewpoint.perspective_camera) {
            viewer.camera = CameraType.PERSPECTIVE;            
            if (viewpoint.perspective_camera.field_of_view != null && viewpoint.perspective_camera.field_of_view > 0) {
                viewer.cameraProperties.fov = viewpoint.perspective_camera.field_of_view;
            }
        }
        if (viewpoint.orthogonal_camera) {
            viewer.camera = CameraType.ORTHOGONAL;
            if (viewpoint.orthogonal_camera.view_to_world_scale != null && viewpoint.orthogonal_camera.view_to_world_scale > 0) {
                const scale = viewpoint.orthogonal_camera.view_to_world_scale;
                const viewportHeight = viewer.height / Viewpoint.resolution;
                const modelHeight = viewportHeight / scale;
                orthCamHeight = modelHeight * viewer.unitsInMeter;
            }
        }
        
        // set camera (MV matrix)
        const mv = mat4.lookAt(mat4.create(), eye, target, up);
        viewer.animations.viewTo({ mv: mv, height: orthCamHeight }, duration);
    }

    // static cache for resolution
    private static _resolution: number = null;

    /**
     * Number of pixels per meter in the browser
     */
    private static get resolution(): number {
        if (Viewpoint._resolution != null) {
            return Viewpoint._resolution;
        }

        var e = document.createElement("div");
        e.style.position = "absolute";
        e.style.width = "100mm";
        document.body.appendChild(e);
        var rect = e.getBoundingClientRect();
        document.body.removeChild(e);
        Viewpoint._resolution = rect.width / 0.1;
        return Viewpoint._resolution;
    }
}
