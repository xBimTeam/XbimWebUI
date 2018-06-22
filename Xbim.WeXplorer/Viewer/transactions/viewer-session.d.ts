import { Viewer, ProductType } from '../viewer';
import { Session } from './session';
/**
 * This class is a convenience wrapper around the viewer which provides
 * undo/redo operations for all viewer functions
 * @name ViewerSession
 * @constructor
 * @classdesc This class allows to manage state of selection and visibility in undo/redo session
 *
 * @param {Viewer} viewer viewer to operate on
 */
export declare class ViewerSession extends Session {
    private viewer;
    constructor(viewer: Viewer);
    private _selection;
    /**
     * Current selection as a read-only list of product and model ids
     * @member {Array<{ id: number, modelId: number }>} ViewerSession#selection
     */
    readonly selection: Array<{
        id: number;
        modelId: number;
    }>;
    private getSelectionClone();
    private getProductsOfType(type);
    /**
    * Selects all instances of the specified type or types
    * @function ViewerSession.selectType
    * @param {ProductType | ProductType[]} type - Type or array of types
    * @param {boolean} clear - Defines wether the selection should be cleared or added
    */
    selectType(type: ProductType | ProductType[], clear: boolean): void;
    /**
    * Selects all instances defined as a list of objects containing id and modelId
    * @function ViewerSession.select
    * @param {Array<{ id: number, modelId: number }>} products - Product and model IDs
    * @param {boolean} clear - Defines wether the selection should be cleared or added
    * @fires ViewerSession#selection
    */
    select(products: Array<{
        id: number;
        modelId: number;
    }>, clear: boolean): void;
    private _hidden;
    /**
    * Current hidden products as a read-only list of product and model ids
    * @member {Array<{ id: number, modelId: number }>} ViewerSession#hidden
    */
    readonly hidden: Array<{
        id: number;
        modelId: number;
    }>;
    /**
    * Hides all instances of the specified type or types
    * @function ViewerSession.hideType
    * @param {ProductType | ProductType[]} type - Type or array of types
    * @param {boolean} clear - Defines wether the selection should be cleared or added
    * @fires ViewerSession#hide
    */
    hideType(type: ProductType | ProductType[]): void;
    /**
    * Hides all instances defined as a list of objects containing id and modelId
    * @function ViewerSession.hide
    * @param {Array<{ id: number, modelId: number }>} products - Product and model IDs
    * @fires ViewerSession#hide
    */
    hide(products: Array<{
        id: number;
        modelId: number;
    }>): void;
    /**
    * Shows all instances of the specified type or types
    * @function ViewerSession.showType
    * @param {ProductType | ProductType[]} type - Type or array of types
    * @param {boolean} clear - Defines wether the selection should be cleared or added
    * @fires ViewerSession#show
    */
    showType(type: ProductType | ProductType[]): void;
    /**
    * Shows all instances defined as a list of objects containing id and modelId
    * @function ViewerSession.show
    * @param {Array<{ id: number, modelId: number }>} products - Product and model IDs
    * @fires ViewerSession#show
    */
    show(products: Array<{
        id: number;
        modelId: number;
    }>): void;
    /**
   * Clips the model
   * @function ViewerSession.clip
   * @param {number[]} [point] - Point of clipping
   * @param {number[]} [normal] - Normal to the clipping plane
   * @fires ViewerSession#clip
   */
    clip(point?: number[], normal?: number[]): void;
    /**
    * Unclips the model
    * @function ViewerSession.unclip
    * @fires ViewerSession#clip
    */
    unclip(): void;
    private currentZoom;
    /**
    * Zooms to specified product or to full extent if no argument is provided
    * @function ViewerSession.zoom
    * @param {number} [id] - Product ID
    * @param {number} [modelId] - Model ID
    * @fires ViewerSession#zoom
    */
    zoomTo(id?: number, modelId?: number): void;
    /**
    * Stops one model
    * @function ViewerSession.stopModel
    * @param {number} [id] - Model ID
    * @fires ViewerSession#modelsChanged
    */
    stopModel(id?: number): void;
    /**
    * Starts one model
    * @function ViewerSession.stopModel
    * @param {number} [id] - Model ID
    * @fires ViewerSession#modelsChanged
    */
    startModel(id?: number): void;
}
