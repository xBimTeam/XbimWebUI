/**
    * Enumeration for object states.
    * @readonly
    * @enum {number}
    */
export enum State {
    UNDEFINED = 255,
    HIDDEN = 254,
    HIGHLIGHTED = 253,
    XRAYVISIBLE = 252,
    PICKING_ONLY = 251,
    UNSTYLED = 225
}

export class StatePriorities {
    public static getPriority(state: State): number {
        switch (state) {
            case State.HIGHLIGHTED : return 1;
            case State.PICKING_ONLY : return 2;
            case State.HIDDEN : return 3;
            case State.XRAYVISIBLE : return 4;
            default: return 100;
        }
    }

    public static getHighestPriority(states: State[]): State {
        if (states == null || states.length === 0) {
            return null;
        }

        const priorities = states.map(s => ({state: s, priority: this.getPriority(s)}));
        priorities.sort(p => p.priority);

        const top = priorities[0];
        if (top.priority > 50) {
            return State.UNDEFINED;
        }
        return top.state;
    }
}