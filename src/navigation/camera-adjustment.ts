import { Viewer } from "../viewer";
import { Framebuffer } from "../framebuffer";
import { mat4, vec3, vec2 } from "gl-matrix";
import { CameraType } from "../camera";

export class CameraAdjustment {
    private lastMvChange = 0;
    private dirty = true;
    private stopped = true;

    /**
     * This object can be used to keep orthographic height aligned with the current perspective view and to
     * keep camera position (distance) right for orthographic view
     */
    constructor(
        private viewer: Viewer,
        private request: (callback: FrameRequestCallback) => number,
        private density: number) {
    }

    public stop() {
        this.stopped = true;
    }

    public watch(latency: number = 500) {
        // without a depth support this doesn't make a sense
        if (!this.viewer.hasDepthSupport) {
            return;
        }

        const request = this.request;
        const viewer = this.viewer;
        this.stopped = false;

        const step = () => {
            if (this.stopped)
                return;

            // this redraw is likely caused by us
            if ((Date.now() - this.lastMvChange) < latency + 20) {
                request(step);
                return;
            }

            // user interaction
            if (viewer.mvMatrixAge < latency) {
                this.dirty = true;
                request(step);
                return;
            }

            // handled already
            if (viewer.mvMatrixAge > latency && !this.dirty) {
                request(step);
                return;
            }

            // no height means it is not in any interactive state, not rendering anything.
            if (!viewer.height) {
                request(step);
                return;
            }

            // adjust view properties
            this.adjust();

            // clear the flag
            this.dirty = false;
            request(step);
        };

        // start watching
        request(step);
    }

    public adjust(density: number = null): void {
        const viewer = this.viewer;
        density = density || this.density;

        if (!viewer.hasDepthSupport)
            return;

        // only run adjustment if there is something to see
        if (!viewer.isRunning || viewer.activeHandles.length === 0)
            return;

        // make it smaller (therefore lower the resolution)
        const width = viewer.width / 4.0;
        const height = viewer.height / 4.0;

        if (width === 0 || height === 0) {
            return;
        }

        var fb = new Framebuffer(viewer.gl, width, height, true, this.viewer.glVersion);
        viewer.draw(fb, true);

        // create the analytical matrix of points based on density and current width and height
        const points: { x: number, y: number }[] = [];
        const dw = width / (density + 1);
        const dh = height / (density + 1);
        for (let i = 1; i < (density + 1); i++) {
            const x = i * dw;
            for (let j = 1; j < (density + 1); j++) {
                const y = j * dh;
                points.push({ x, y });
            }
        }

        // plain average weights
        const weights = points.map(p => 1);

        // get non-null xyz in clip space
        const clipPoints = fb.getXYZArray(points)
            // enrich the result with weights
            .map((p, i) => {
                if (p == null)
                    return null;
                return { point: p, weight: weights[i] }
            })
            .filter(p => p != null);

        if (clipPoints.length === 0) {
            return;
        }

        // convert to view space
        const pMatrix = viewer.cameraProperties.getProjectionMatrix(width, height);
        // const matrix = mat4.multiply(mat4.create(), pMatrix, viewer.mvMatrix);
        const inv = mat4.invert(mat4.create(), pMatrix);
        const viewPoints = clipPoints.map(p => ({ point: vec3.transformMat4(vec3.create(), p.point, inv), weight: p.weight }));

        // z dimension is distance from camera in view space
        const distances = viewPoints.map(p => ({ distance: -p.point[2], weight: p.weight }));

        // average distance in the view
        const distance = this.trimmedMean(distances);
        const fov = viewer.cameraProperties.fov * Math.PI / 180.0;

        // in perspective camera, adjust orthographic height
        if (viewer.camera === CameraType.PERSPECTIVE) {
            const optimalHeight = 2.0 * distance * Math.tan(fov / 2.0);
            // setting height when camera mode is 'PERSPECTIVE' doesn't cause redraw. This will not cause a redraw loop
            viewer.cameraProperties.height = optimalHeight;
        }

        // in orthographic camera, adjust camera distance from subject
        if (viewer.camera === CameraType.ORTHOGONAL) {
            const dir = vec3.normalize(vec3.create(), viewer.getCameraDirection());
            const h = viewer.cameraProperties.height;
            const optimalDistance = h / (2.0 * Math.tan(fov / 2));

            // only move if the difference is more than 10% (either side) to avoid the redraw loop
            const check = optimalDistance / distance;
            if (check > 1.1 || check < 0.9) {
                const delta = optimalDistance - distance;
                const move = vec3.scale(vec3.create(), dir, delta);

                viewer.mvMatrix = mat4.translate(mat4.create(), viewer.mvMatrix, move);
                this.lastMvChange = Date.now();
            }
        }
    }

    private trimmedMean(values: { distance: number, weight: number }[]): number {
        // don't trim if there are less than 100 values, calculate weighted mean
        if (values.length > 100) {
            // sort as numbers (default algorithm sorts as strings)
            values.sort((a, b) => a.distance - b.distance);

            // cut off top and bottom 10% to get rid of outliers
            const cutOff = Math.floor(values.length / 10);
            values = values.slice(cutOff, values.length - cutOff);
        }

        // return trimmed weighted mean value
        return values.reduce((previous, current) => previous + current.distance * current.weight, 0) /
            values.reduce((previous, current) => previous + current.weight, 0);
    }
}