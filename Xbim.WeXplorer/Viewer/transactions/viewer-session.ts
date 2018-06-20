import { Viewer, ProductType, State } from '../viewer';
import { Session } from './session';

/**
 * This class is a convenience wrapper around the viewer which provides
 * undo/redo operations for all viewer functions
 */
export class ViewerSession extends Session {

    constructor(private viewer: Viewer)
    {
        super();
    }

    public clip(point?: number[], normal?: number[]) {
        var plane = this.viewer.clippingPlaneA.slice(0);
        var doAction = () => {
            this.viewer.clip(point, normal);
        };
        var undoAction = () => {
            this.viewer.clippingPlaneA = plane;
        };
        super.Do(doAction, undoAction);
    }

    public unclip(): void {
        var plane = this.viewer.clippingPlaneA.slice(0);
        var doAction = () => {
            this.viewer.unclip();
        };
        var undoAction = () => {
            this.viewer.clippingPlaneA = plane;
        };
        super.Do(doAction, undoAction);
    }

    public setState(state: State, target: number | number[], modelId?: number) {
        if (typeof (modelId) === 'undefined') {
            modelId = 0;
        }
        var stateName = State[state];
        var old = this.viewer.getModelState(modelId);
        var doAction = () => {
            this.viewer.setState(state, target, modelId);
        };
        var undoAction = () => {
            this.viewer.restoreModelState(modelId, old);
        };
        super.Do(doAction, undoAction);
    }

    public setStyle(style: number, target: number | number[], modelId?: number) {
        if (typeof (modelId) === 'undefined') {
            modelId = 0;
        }
        var old = this.viewer.getModelState(modelId);
        var doAction = () => {
            this.viewer.setStyle(style, target, modelId);
        };
        var undoAction = () => {
            this.viewer.restoreModelState(modelId, old);
        };
        super.Do(doAction, undoAction);
    }

    public zoomTo(id?: number, model?: number) {
        var oldMv = new Float32Array(this.viewer.mvMatrix);
        var doAction = () => {
            this.viewer.zoomTo(id, model);
        };
        var undoAction = () => {
            this.viewer.mvMatrix = oldMv;
        };
        super.Do(doAction, undoAction);
    }

    public setCameraPosition(coordinates: number[]) {
        var oldMv = new Float32Array(this.viewer.mvMatrix);
        var doAction = () => {
            this.viewer.setCameraPosition(coordinates);
        };
        var undoAction = () => {
            this.viewer.mvMatrix = oldMv;
        };
        super.Do(doAction, undoAction);
    }

    public setCameraTarget(prodId?: number, modelId?: number) {
        var oldDistance = this.viewer._distance;
        var oldOrigin = this.viewer._origin.slice(0);
        var doAction = () => {
            this.viewer.setCameraTarget(prodId, modelId);
        };
        var undoAction = () => {
            this.viewer._origin = oldOrigin;
            this.viewer._distance = oldDistance;
        };
        super.Do(doAction, undoAction);
    }

    public stopModel(id?: number) {
        var doAction = () => {
            this.viewer.stop(id);
        };
        var undoAction = () => {
            this.viewer.start(id);
        };
        super.Do(doAction, undoAction);
    }

    public startModel(id?: number) {
        var doAction = () => {
            this.viewer.start(id);
        };
        var undoAction = () => {
            this.viewer.stop(id);
        };
        super.Do(doAction, undoAction);
    }
}

class Snapshot {
    private mvMatrix: Float32Array;
    private states: { [id: number]: Array<Array<number>>; } = {};
    private clippingPlaneA: number[];
    private clippingPlaneB: number[];
    private modelsOn: number[];
    private modelsOff: number[];


    constructor(private viewer: Viewer) {
        //camera view
        this.mvMatrix = new Float32Array(viewer.mvMatrix);

        //models state
        let ids = viewer.ModelIds;
        ids.forEach((id, i, a) => {
            this.states[id] = viewer.getModelState(id);
        });

        //clipping planes
        this.clippingPlaneA = viewer.clippingPlaneA.slice(0);
        this.clippingPlaneB = viewer.clippingPlaneB.slice(0);

        //models stopped and active
        this.modelsOn = viewer.ModelIdsOn;
        this.modelsOff = viewer.ModelIdsOff;
    }

    public Restore() {
        let v = this.viewer;

        //camera view
        v.mvMatrix = this.mvMatrix;

        //models state
        for (let id in this.states) {
            let modelId = new Number(id).valueOf();
            let state = this.states[id];
            v.restoreModelState(modelId, state);
        }

        //clipping planes
        v.clippingPlaneA = this.clippingPlaneA;
        v.clippingPlaneB = this.clippingPlaneB;

        //models stopped and active
        this.modelsOn.forEach((id) => { v.start(id); });
        this.modelsOff.forEach((id) => { v.stop(id); });
    }
}