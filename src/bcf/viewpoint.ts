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
import { State } from "../..";
import { Visibility } from "./visibility";
import { Component } from "./component";
import { BBox } from "../common/bbox";

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
     * @param idMapper function to be used to transform viewer identity into external identity. Typically to GUID. Viewer operates on local identity where combination of productID and modelID is unique within the current scope.
     * @param width  Optional width of the generated thumbnail in pixels. This is the current width of the viewer by default. Current aspect ratio is preserved.
     */
    public static GetViewpoint(viewer: Viewer, idMapper: (productId: number, modelId: number) => string, width = viewer.width / 2.0): Viewpoint {
        const view = new Viewpoint();
        const aspect = viewer.width / viewer.height;
        const height = width / aspect;

        const toArray = (a: vec3) => {
            return Array.prototype.slice.call(a);
        };

        // capture camera
        if (viewer.camera === CameraType.PERSPECTIVE) {
            view.perspective_camera = {
                camera_direction: toArray(viewer.getCameraDirection()),
                camera_up_vector: toArray(viewer.getCameraHeading()),
                camera_view_point: toArray(viewer.getCameraPositionWcs()),
                field_of_view: viewer.cameraProperties.fov,
                height: viewer.cameraProperties.height,
                width: viewer.cameraProperties.height * aspect
            };
        } else {
            // width of view in meters
            const modelHeight = viewer.cameraProperties.height / viewer.unitsInMeter;
            const viewportHeight = viewer.height / Viewpoint.resolution;
            view.orthogonal_camera = {
                camera_direction: toArray(viewer.getCameraDirection()),
                camera_up_vector: toArray(viewer.getCameraHeading()),
                camera_view_point: toArray(viewer.getCameraPositionWcs()),
                view_to_world_scale: viewportHeight / modelHeight,
                height: viewer.cameraProperties.height,
                width: viewer.cameraProperties.height * aspect
            }
        }

        // capture image (good for preview for example)
        const dataUrl = viewer.getCurrentImageDataUrl(width, height, 'png');
        // strip 'data:image/jpeg;base64,' from the data url
        const base64image = dataUrl.substring(22);

        view.snapshot = {
            snapshot_type: 'png',
            snapshot_data: base64image
        };

        // capture current clipping planes: We may have different clipping planes for different submodels
        const planes = viewer.getClip();
        if (planes != null) {
            Viewpoint.AddClippingPlane(view, planes.PlaneA);
            Viewpoint.AddClippingPlane(view, planes.PlaneB);
        }

        // capture component styling (selection, overriden colours, visibility etc.) We should use IFC guids for this which is not in the scope of the viewer
        const highlighted = viewer.getProductsWithState(State.HIGHLIGHTED);
        if (highlighted != null && highlighted.length > 0) {
            if (idMapper == null) {
                console.warn('ID mapping function should be used to persist global identity of selected elements');
                idMapper = (id, model) => `${model}_${id}`;
            }
            if (view.components == null) {
                view.components = new Components();
                view.components.coloring = [];
                view.components.selection = [];
                view.components.visibility = new Visibility();
            }
            const selection = view.components.selection;
            highlighted.forEach(s => {
                const guid = idMapper(s.id, s.model);
                selection.push(new Component(guid));
            });
        }

        return view;
    }

    private static AddClippingPlane(view: Viewpoint, planeEquation: number[]): void {
        if (planeEquation == null || planeEquation.length !== 4) {
            return;
        }
        if (view.clipping_planes == null) {
            view.clipping_planes = [];
        }
        const plane = new ClippingPlane();
        plane.direction = planeEquation.slice(0, 3);

        const p = planeEquation;
        const x = -p[0] * p[3] / (p[0] * p[0] + p[1] * p[1] + p[2] * p[2])
        const y = -p[1] * p[3] / (p[0] * p[0] + p[1] * p[1] + p[2] * p[2])
        const z = -p[2] * p[3] / (p[0] * p[0] + p[1] * p[1] + p[2] * p[2])
        plane.location = [x, y, z];

        view.clipping_planes.push(plane);
    }

    public static SetViewpoint(viewer: Viewer, viewpoint: Viewpoint, idMapper: (guid: string) => { productId: number, modelId: number }, duration: number = 0): void {
        // threashold for distance and size of the view
        const threasholdCoeficient = 4.0;

        // helper function
        const toVec3 = (a: number[] | Float32Array) => {
            if (a == null || a.length < 3) {
                return null;
            }
            return vec3.fromValues(a[0], a[1], a[2]);
        };

        // we have to consider current WCS for navigation
        const wcs = viewer.getCurrentWcs();
        const aspect = viewer.width / viewer.height;

        // discard any current clipping, set new clipping.
        // this might affect current region size and position
        // which has effect on camera adjustments later in the code
        Viewpoint.SetClipping(viewer, viewpoint);

        // common camera properties to be used for camera position
        const camera: {
            camera_view_point: number[],
            camera_direction: number[],
            camera_up_vector: number[],
            width: number,
            height: number
        } = viewpoint.perspective_camera || viewpoint.orthogonal_camera;

        if (camera == null) {
            return;
        }

        let camViewPoint = camera.camera_view_point;
        let camDir = camera.camera_direction;
        let camUpDir = camera.camera_up_vector;

        const eyeWcs = toVec3(camViewPoint);
        let eye = vec3.subtract(vec3.create(), eyeWcs, wcs);
        const dir = vec3.normalize(vec3.create(), toVec3(camDir));
        let up = vec3.normalize(vec3.create(), (toVec3(camUpDir) || vec3.fromValues(0, 0, 1)));

        // target and heading are collinear. This is a singular orientation and will screw the view up.
        let angle = vec3.angle(dir, up);
        if (Math.abs(angle) < 1e-6 || Math.abs(angle - Math.PI) < 1e-6) {
            console.warn('Collinear target and heading vectors for the view. Singularity will be fixed by guess.');

            // looking up or down is most likely scenario for singularity
            angle = vec3.angle(dir, vec3.fromValues(0, 0, 1));
            if (Math.abs(angle) < 1e-6 || Math.abs(angle - Math.PI) < 1e-6) {
                up = vec3.fromValues(0, 1, 0);
            }
        }

        // helper function
        let isPositiveNumber = (v: number) => {
            return v != null && typeof (v) === 'number' && v > 0;
        };

        // set camera type and properties
        let orthCamHeight = viewer.cameraProperties.height || 100;

        // region sizes from the viewpoint direction
        const region = viewer.getMergedRegion();
        const optimum = (region && region.bbox && region.population > 0) ?
            viewer.getDistanceAndHeight(region.bbox, dir, up) :
            null;

        // move the eye to optimal dostance if the current distance is too much
        if (optimum != null) {
            const distance = vec3.dist(toVec3(region.centre), eye);

            // we are too far away, move to optimal distance, set optimal height for orthographic view
            if (distance > optimum.distance * threasholdCoeficient) {
                const moveDir = vec3.negate(vec3.create(), dir);
                const move = vec3.scale(vec3.create(), moveDir, optimum.distance);
                eye = vec3.add(vec3.create(), toVec3(region.centre), move);
                orthCamHeight = optimum.height;
            }
        }

        if (viewpoint.perspective_camera) {
            viewer.camera = CameraType.PERSPECTIVE;
            let fov = 60.0; // default value
            if (isPositiveNumber(viewpoint.perspective_camera.field_of_view)) {
                fov = viewpoint.perspective_camera.field_of_view;
            }

            if (isPositiveNumber(camera.width) && isPositiveNumber(camera.height)) {
                // camera properties fom the data of the maximal values
                const a = camera.width / camera.height;

                // fix to fit the screen (aspect ratio)
                if (a > aspect) {
                    const current = fov * Math.PI / 180.0;
                    // FOV is non-linear in relation to aspect ratio but can be calculated like this
                    const extended = 2.0 * Math.atan(Math.tan(current / 2.0) * a / aspect);
                    fov = extended * 180.0 / Math.PI;
                }
            }
            viewer.cameraProperties.fov = fov;
        }
        else if (viewpoint.orthogonal_camera) {
            viewer.camera = CameraType.ORTHOGONAL;
            // set default FOV
            viewer.cameraProperties.fov = 60.0;

            if (isPositiveNumber(viewpoint.orthogonal_camera.view_to_world_scale)) {
                const scale = viewpoint.orthogonal_camera.view_to_world_scale;
                const viewportHeight = viewer.height / Viewpoint.resolution;
                const modelHeight = viewportHeight / scale;
                orthCamHeight = modelHeight * viewer.unitsInMeter;
            }

            // use width and height if available to set perspective and adjust ratio
            if (isPositiveNumber(camera.width) && isPositiveNumber(camera.height)) {
                // camera properties fom the data of the maximal values
                let h = camera.height;
                const w = camera.width;
                const a = w / h;

                // fix to fit the screen (aspect ratio)
                if (a > aspect) {
                    // adjust perspective camera height
                    h = h * a / aspect;
                }

                // set to optimal view if it seems to be too far away
                if (optimum != null && h > optimum.height * threasholdCoeficient) {
                    h = optimum.height;
                }

                orthCamHeight = h;
            }
        }

        // set camera (MV matrix)
        const target = vec3.add(vec3.create(), eye, dir);
        const mv = mat4.lookAt(mat4.create(), eye, target, up);
        viewer.animations.viewTo({ mv: mv, height: orthCamHeight }, duration)
            .then(() => {
                // try to fix camera placement for generic orthographic views or camera height for perspective views
                // this improves interactive navigation and smooth switching between cameras
                if (viewpoint.orthogonal_camera) {
                    // don't do anything if this is a plan view
                    var delta = vec3.angle(toVec3(camera.camera_direction), vec3.fromValues(0, 0, -1));
                    if (delta > Math.PI / 180.0)
                        return;

                    viewer.adjustments.adjust(10);
                }
            });


        // clear current selection
        viewer.clearHighlighting();

        // restore selection
        if (viewpoint.components != null && viewpoint.components.selection != null && viewpoint.components.selection.length > 0) {
            const selection = viewpoint.components.selection;

            // transform from global IDs to local ones
            if (idMapper == null) {
                console.warn('No function defined to map between global IDs and local product and model IDs');
                idMapper = (id: string) => {
                    const parts = id.split('_');
                    const modelId = parseInt(parts[0], 10);
                    const productId = parseInt(parts[1], 10);
                    return { productId, modelId };
                }
            }
            const productsByModel: { [id: number]: number[] } = {};
            selection
                .map(c => idMapper(c.ifc_guid))
                .forEach(map => {
                    const products = productsByModel[map.modelId] || (productsByModel[map.modelId] = []);
                    products.push(map.productId);
                });
            Object.getOwnPropertyNames(productsByModel).forEach(mId => {
                viewer.addState(State.HIGHLIGHTED, productsByModel[mId], parseInt(mId, 10));
            });
        }
    }

    /**
     * Applies the clipping planes for this viewpoint to the supplied viewer
     * @param viewer 
     * @param viewpoint 
     */
    public static SetClipping(viewer: Viewer, viewpoint: Viewpoint) {

        // reset to no clipping and no section box as a default
        viewer.unclip();
        viewer.sectionBox.setToInfinity();

        // no clipping instructions, return
        if (viewpoint.clipping_planes == null || viewpoint.clipping_planes.length === 0) {
            return;
        }

        // restore as a section box
        if (viewpoint.clipping_planes.length === 6) {
            viewer.sectionBox.setToPlanes(viewpoint.clipping_planes);
            return;
        }

        // restore first two clipping planes (we can't handle more separately)
        const planeA = Viewpoint.getClippingEquation(viewpoint.clipping_planes[0]);
        const planeB = Viewpoint.getClippingEquation(viewpoint.clipping_planes[1]);

        if (planeA != null) {
            viewer.setClippingPlaneA(planeA);
        }
        if (planeB != null) {
            viewer.setClippingPlaneB(planeB);
        }
    }

    private static getClippingEquation(plane: ClippingPlane): number[] {
        if (plane == null || plane.direction == null || plane.location == null) {
            return null;
        }

        const normal = plane.direction;
        const point = plane.location;
        //compute normal equation of the plane
        var d = 0.0 - normal[0] * point[0] - normal[1] * point[1] - normal[2] * point[2];

        return [normal[0], normal[1], normal[2], d];
    }

    // static cache for resolution - it can't change for the device
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
