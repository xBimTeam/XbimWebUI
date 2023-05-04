import { Viewer, Product, State, ViewType, RenderingMode, ProductType, NavigationCube, Grid, EasingType, MessageProgress, InteractiveClippingPlane } from '../..';

export class PlaySpaces {
    /**
     *
     */
    constructor(private viewer: Viewer) {
    }

    public play(): void {
        const steps = 50;
        const start = [255, 0, 0, 255];
        const end = [0, 255, 0, 255];

        this.viewer.setState(State.HIDDEN, ProductType.IFCPRODUCT);
        this.viewer.setState(State.UNDEFINED, ProductType.IFCSPACE);

        const spaces = this.viewer.getProductsWithState(State.UNDEFINED);

        // create colour pallete
        for (let i = 0; i < steps; i++) {
            this.viewer.defineStyle(i, this.interpolateColour(start, end, steps, i));
        }

        const states: {id: number, model:number, state: number, increment: boolean}[] = 
            spaces.map(s => {return { id: s.id, model: s.model, state: Math.floor(Math.random() * steps), increment: true}});
        states.forEach(s => this.viewer.setStyle(s.state, [s.id], s.model));

        setInterval(() => {
            states.forEach(s => {
                const {state, increment} = this.getNextState(steps, s.state, s.increment);
                s.state = state;
                s.increment = increment;
                this.viewer.setStyle(s.state, [s.id], s.model)
            });
        }, 100);
    }

    private getNextState(steps: number, state: number, increment: boolean): {state: number, increment: boolean} {
        if (increment) {
            state = state + 1;
            if (state >= steps) {
                state = state - 2;
                increment = false;
            }
        } else {
            state = state - 1;
            if (state < 0) {
                state = state + 2;
                increment = true;
            }
        }
        return {state, increment};
    }

    private interpolateColour(start: number[], end: number[], steps: number, position: number): number[] {
        const result: number[] = [];
        for (let i = 0; i < start.length; i++) {
            result[i] = start[i] + (end[i] - start[i]) / steps * position;
        }
        return result;
    }

}