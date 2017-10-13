import { Viewer, State } from '../viewer';
import { Session } from './session';
/**
 * This class is a convenience wrapper around the viewer which provides
 * undo/redo operations for all viewer functions
 */
export declare class ViewerSession extends Session {
    private viewer;
    constructor(viewer: Viewer);
    ClippingPlane: number[];
    clip(point?: number[], normal?: number[]): void;
    unclip(): void;
    setState(state: State, target: number | number[], modelId?: number): void;
    setStyle(style: number, target: number | number[], modelId?: number): void;
    zoomTo(id?: number, model?: number): void;
    setCameraPosition(coordinates: number[]): void;
    setCameraTarget(prodId?: number, modelId?: number): void;
    stop(id?: number): void;
    start(id?: number): void;
    private snapshotsOn;
    takeSnapshots(miliseconds: number): void;
    stopSnapshots(): void;
}
