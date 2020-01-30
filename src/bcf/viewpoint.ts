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
        const dataUrl = viewer.getCurrentImageDataUrl(width, height, 'jpeg');
        // strip 'data:image/jpeg;base64,' from the data url
        const base64image = dataUrl.substring(23);
        view.snapshot = {
            snapshot_type: 'jpg',
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
        const toVec3 = (a: number[] | Float32Array) => {
            if (a == null || a.length < 3) {
                return null;
            }
            return vec3.fromValues(a[0], a[1], a[2]);
        };

        const wcs = viewer.getCurrentWcs();
        const aspect = viewer.width / viewer.height;

        // common camera properties
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
        const dir = toVec3(camDir);
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

        let isPositiveNumber = (v: number) => {
            return v != null && typeof (v) === 'number' && v > 0;
        };

        // set camera type and properties
        let orthCamHeight = viewer.cameraProperties.height;
        if (viewpoint.perspective_camera) {
            viewer.camera = CameraType.PERSPECTIVE;
            if (isPositiveNumber(viewpoint.perspective_camera.field_of_view)) {
                viewer.cameraProperties.fov = viewpoint.perspective_camera.field_of_view;
            }
        }
        else if (viewpoint.orthogonal_camera) {
            viewer.camera = CameraType.ORTHOGONAL;
            if (isPositiveNumber(viewpoint.orthogonal_camera.view_to_world_scale)) {
                const scale = viewpoint.orthogonal_camera.view_to_world_scale;
                const viewportHeight = viewer.height / Viewpoint.resolution;
                const modelHeight = viewportHeight / scale;
                orthCamHeight = modelHeight * viewer.unitsInMeter;
            }
            viewer.cameraProperties.fov = 60.0;
        }

        // use width and height if available to set perspective and adjust ratio
        if (isPositiveNumber(camera.width) && isPositiveNumber(camera.height)) {
            let h = camera.height;
            const w = camera.width;
            const a = w / h;
            // fix to fit the screen
            if (a > aspect) {
                // adjust distance - move eye more far away from the subject
                const fov = viewer.cameraProperties.fov * Math.PI / 180.0;
                const delta = h * (a / aspect - 1.0) / (2.0 * Math.tan(fov / 2.0));
                const deltaDir = vec3.negate(vec3.create(), vec3.normalize(vec3.create(), dir));
                const deltaTrans = vec3.scale(vec3.create(), deltaDir, delta);
                eye = vec3.add(vec3.create(), eye, deltaTrans);
                // adjust perspective camera height
                h = h * a / aspect;
            }
            orthCamHeight = h;

            // fix camera position if it is too far away
            var region = viewer.getMergedRegion();
            if (region && region.bbox && region.bbox.length > 0) {
                // get closest point from the current region
                const sizes = BBox.getSizeInView(region.bbox, toVec3(camera.camera_direction), toVec3(camera.camera_up_vector));
                const regionDepth = sizes.depth;
                const regionCenter = region.centre;
                const pointDir = vec3.normalize(vec3.create(), vec3.negate(vec3.create(), toVec3(camera.camera_direction)));
                const pointMove = vec3.scale(vec3.create(), pointDir, regionDepth / 2.0);
                const closestPoint = vec3.add(vec3.create(), toVec3(regionCenter), pointMove); // (d,e,f)

                // get closest point on the plane
                // https://math.stackexchange.com/questions/100761/how-do-i-find-the-projection-of-a-point-onto-a-plane
                const planeNormal = vec3.normalize(vec3.create(), toVec3(camera.camera_direction)); // (a,b,c)
                const cameraPosition = toVec3(camera.camera_view_point); // (x,y,z)
                const distance = planeNormal[0] * closestPoint[0] - planeNormal[0] * cameraPosition[0] +
                    planeNormal[1] * closestPoint[1] - planeNormal[1] * cameraPosition[1] +
                    planeNormal[2] * closestPoint[2] - planeNormal[2] * cameraPosition[2];

                // calculate optimal distance from height and field of view
                const optimalDistance = h / (Math.tan(viewer.cameraProperties.fov * Math.PI / 180.0 / 2.0) * 2.0);

                // if we are too far away, adjust at least to be on the beginning of the region
                if (Math.abs(distance) > optimalDistance) {
                    const pointOnPlane = vec3.fromValues(
                        cameraPosition[0] + distance * planeNormal[0],
                        cameraPosition[1] + distance * planeNormal[1],
                        cameraPosition[2] + distance * planeNormal[2]);
                    const move = vec3.scale(vec3.create(), planeNormal, optimalDistance);
                    eye = vec3.subtract(vec3.create(), pointOnPlane, move);
                }
            }
        }

        // set camera (MV matrix)
        const target = vec3.add(vec3.create(), eye, dir);
        const mv = mat4.lookAt(mat4.create(), eye, target, up);
        viewer.animations.viewTo({ mv: mv, height: orthCamHeight }, duration);

        // discard any current clipping
        Viewpoint.SetClipping(viewer, viewpoint);

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
                    const modelId = parseInt(parts[0]);
                    const productId = parseInt(parts[1]);
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
                viewer.addState(State.HIGHLIGHTED, productsByModel[mId], parseInt(mId));
            });
        }
    }

    /**
     * Applies the clipping planes for this viewpoint to the supplied viewer
     * @param viewer 
     * @param viewpoint 
     */
    public static SetClipping(viewer: Viewer, viewpoint: Viewpoint) {
        viewer.unclip();
        // restore first two clipping planes
        if (viewpoint.clipping_planes != null && viewpoint.clipping_planes.length > 0) {
            const planeA = Viewpoint.getClippingEquation(viewpoint.clipping_planes[0]);
            const planeB = Viewpoint.getClippingEquation(viewpoint.clipping_planes[1]);
            if (planeA != null) {
                viewer.setClippingPlaneA(planeA);
            }
            if (planeB != null) {
                viewer.setClippingPlaneB(planeB);
            }
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
