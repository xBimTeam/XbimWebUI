/**
 * This class can be used to implement undo/redo functionality. The only requirement is
 * that every undoable action has to be performed using 'Do()' function and has to provide
 * its 'undo' counterpart so session can perform undo and redo operations as necessary.
 */
export class Session
{
    // Array of undo redo actions
    private _do: (() => void)[] = [];
    private _undo: (() => void)[] = [];
    private _position: number = -1;
    private _events: { [id: string]: ((a: any) => void)[]; } = {};

    /**
     * This function will add 'do' and 'undo' action to the session and will
     * perform the 'do' action. This can consume any action.
     * @param doAction Action to do
     * @param undoAction Action to undo
     */
    public do(doAction: () => void, undoAction: () => void): void {

        //check if this is a do after undo. Shrink the stact in that is the case
        var shrink = this._do.length - this._position - 1;
        if (shrink > 0) {
            this._do.splice(this._position + 1)
            this._undo.splice(this._position + 1)
        }

        //add to list of actions
        this._do.push(doAction);
        this._undo.push(undoAction);
        this._position++;

        doAction();
        this.fire('do', this.getEventArgs())
    }

    public undo(): void {
        if (!this.canUndo) {
            return;
        }

        var action = this._undo[this._position--];
        action();
        this.fire('undo', this.getEventArgs())
    }

    public redo(): void {
        if (!this.canRedo) {
            return;
        }

        var action = this._do[++this._position];
        action();
        this.fire('redo', this.getEventArgs())
    }

    public get canUndo(): boolean {
        return this._position >= 0;
    }

    public get canRedo(): boolean {
        return this._position < this._do.length - 1;
    }

    public get length(): number {
        return this._do.length;
    }

    private getEventArgs(): { canUndo: boolean, canRedo: boolean, length: number }
    {
        return { canUndo: this.canUndo, canRedo: this.canRedo, length: this.length };
    }

    //executes all handlers bound to event name
    protected fire(eventName: string, args: any) {
        var handlers = this._events[eventName];
        if (!handlers) {
            return;
        }
        //call the callbacks
        handlers.slice().forEach((handler: (a: any) => void ) => {
            handler(args);
        });
    }

    /**
     * Use this method to register to events of the viewer like {@link Viewer#event:pick pick}, {@link Viewer#event:mouseDown mouseDown}, 
     * {@link Viewer#event:loaded loaded} and others. You can define arbitrary number
     * of event handlers for any event. You can remove handler by calling {@link Viewer#off off()} method.
     *
     * @function Viewer#on
     * @param {String} eventName - Name of the event you would like to listen to.
     * @param {Object} callback - Callback handler of the event which will consume arguments and perform any custom action.
    */
    public on(eventName: string, callback: (a: any) => void) {
        var events = this._events;
        if (!events[eventName]) {
            events[eventName] = [];
        }
        events[eventName].push(callback);
    }

    /**
    * Use this method to unregister handlers from events. You can add event handlers by calling the {@link Viewer#on on()} method.
    *
    * @function Viewer#off
    * @param {String} eventName - Name of the event
    * @param {Object} callback - Handler to be removed
    */
    public off(eventName: string, callback) {
        var events = this._events;
        var callbacks = events[eventName];
        if (!callbacks) {
            return;
        }
        var index = callbacks.indexOf(callback);
        if (index >= 0) {
            callbacks.splice(index, 1);
        }
    }
}

