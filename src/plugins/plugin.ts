import { Viewer } from "../viewer";
import { ProductIdentity } from "../common/product-identity";

export interface IPlugin {

    init(viewer: Viewer): void;

    onBeforeDraw(width: number, height: number): void;
    onAfterDraw(width: number, height: number): void;

    onBeforeDrawId(): void;
    onAfterDrawId(): void;
    onAfterDrawModelId(): void;

    /**
     * When this function returns true, viewer doesn't use the ID for anything else taking this ID as reserved by the plugin
     */
    onBeforeGetId(identity: ProductIdentity): boolean;

    /**
     * When this function returns true, viewer doesn't use the ID for anything else taking this ID as reserved by the plugin
     */
    onBeforePick(identity: ProductIdentity): boolean;
}