import { mat4 } from 'gl-matrix';
import { Viewer } from '../viewer';

class Snapshot {
    private mvMatrix: mat4;
    private states: { [id: number]: number[][]; } = {};
    private clippingPlaneA: number[];
    private clippingPlaneB: number[];
    private modelsOn: number[];


    constructor(private viewer: Viewer) {
        //camera view
        this.mvMatrix = mat4.clone(viewer.mvMatrix);

        //models state
        let ids = viewer.activeHandles.map(h => h.id);
        ids.forEach((id, i, a) => {
            this.states[id] = viewer.getModelState(id);
        });

        //clipping planes
        this.clippingPlaneA = viewer.getClip().PlaneA;
        this.clippingPlaneB = viewer.getClip().PlaneB;

        //models stopped and active
        this.modelsOn = ids;
    }

    public Restore() {
        let v = this.viewer;

        //camera view
        v.mvMatrix = this.mvMatrix;

        //models state
        Object.getOwnPropertyNames(this.states).forEach(id => {
            let modelId = parseInt(id, 10);
            let state = this.states[id];
            v.restoreModelState(modelId, state);
        });

        //clipping planes
        v.setClippingPlaneA(this.clippingPlaneA);
        v.setClippingPlaneB(this.clippingPlaneB);

        //models stopped and active
        v.stopAll();
        this.modelsOn.forEach((id) => { v.start(id); });
    }
}
