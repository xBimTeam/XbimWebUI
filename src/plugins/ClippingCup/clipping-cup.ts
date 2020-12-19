import { IPlugin } from "../plugin";
import { Viewer } from "../../viewer";
import { ProductIdentity } from "../../common/product-identity";
import { ModelHandle } from "../../model-handle";

export class ClippingCup implements IPlugin {
    private viewer: Viewer = null;
    private caps: { [wexBimId: number]: { vertices: Float32Array, image: Uint8ClampedArray } };
    private activeHandles: ModelHandle[] = [];

    public init(viewer: Viewer): void {
        this.viewer = viewer;
    }

    public onAfterDraw(width: number, height: number): void {
        // draw captured caps on cutting planes
    }

    // tslint:disable: no-empty
    public onBeforeDraw(width: number, height: number): void {

    }

    // following methods are not needed
    public onBeforeDrawId(): void { }
    public onAfterDrawId(): void { }
    public onAfterDrawModelId(): void { }
}