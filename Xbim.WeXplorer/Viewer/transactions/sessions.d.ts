/**
 * This class can be used to implement undo/redo functionality. The only requirement is
 * that every undoable action has to be performed using 'Do()' function and has to provide
 * its 'undo' counterpart so session can perform undo and redo operations as necessary.
 */
export declare class Session {
    private _do;
    private _undo;
    private _position;
    /**
     * This function will add 'do' and 'undo' action to the session and will
     * perform the 'do' action. This can consume any action.
     * @param doAction Action to do
     * @param undoAction Action to undo
     */
    Do(doAction: () => void, undoAction: () => void): void;
    Undo(): void;
    Redo(): void;
    readonly CanUndo: boolean;
    readonly CanRedo: boolean;
    readonly Length: number;
}
