/**
 * This class can be used to implement undo/redo functionality. The only requirement is
 * that every undoable action has to be performed using 'Do()' function and has to provide
 * its 'undo' counterpart so session can perform undo and redo operations as necessary.
 */
export declare class Session {
    private _do;
    private _undo;
    private _position;
    private _events;
    /**
     * This function will add 'do' and 'undo' action to the session and will
     * perform the 'do' action. This can consume any action.
     * @param doAction Action to do
     * @param undoAction Action to undo
     */
    do(doAction: () => void, undoAction: () => void): void;
    undo(): void;
    redo(): void;
    readonly canUndo: boolean;
    readonly canRedo: boolean;
    readonly length: number;
    private getEventArgs;
    protected fire(eventName: string, args: any): void;
    /**
     * Use this method to register to events of the viewer like {@link Viewer#event:pick pick}, {@link Viewer#event:mouseDown mouseDown},
     * {@link Viewer#event:loaded loaded} and others. You can define arbitrary number
     * of event handlers for any event. You can remove handler by calling {@link Viewer#off off()} method.
     *
     * @function Viewer#on
     * @param {String} eventName - Name of the event you would like to listen to.
     * @param {Object} callback - Callback handler of the event which will consume arguments and perform any custom action.
    */
    on(eventName: string, callback: Function): void;
    /**
    * Use this method to unregister handlers from events. You can add event handlers by calling the {@link Viewer#on on()} method.
    *
    * @function Viewer#off
    * @param {String} eventName - Name of the event
    * @param {Object} callback - Handler to be removed
    */
    off(eventName: string, callback: any): void;
}
