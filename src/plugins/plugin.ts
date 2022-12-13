import { Viewer } from "../viewer";
import { ProductIdentity } from "../common/product-identity";

/**
 * Defines the interface for a Viewer plugin
 * * @category Plugins
 */
export interface IPlugin {

    init(viewer: Viewer): void;

    onBeforeDraw(width: number, height: number): void;
    onAfterDraw(width: number, height: number): void;

    onBeforeDrawId(): void;
    onAfterDrawId(): void;
    onAfterDrawModelId(): void;
}
