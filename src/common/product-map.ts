import { ProductType } from "../product-type";
import { State, StatePriorities } from "./state";

export class ProductMap {
    productID: number;
    renderId: number;
    type: ProductType;
    bBox: Float32Array;
    spans: Array<Int32Array>;
    states: number[] = [];

    public static clone(o: ProductMap): ProductMap {
        const c = new ProductMap();
        c.productID = o.productID;
        c.renderId - o.renderId;
        c.type = o.type;
        c.bBox = new Float32Array(o.bBox);
        c.spans = o.spans;
        c.states = o.states.slice(0);
        return c;
    }

    public addState(state: State) {
        if (this.states.find(s => s == state) != null) {
            return;
        }
        this.states.push(state);
    }

    public removeState(state: State) {
        const index = this.states.indexOf(state);
        if (index < 0) {
            return;
        }
        this.states.splice(index, 1);
    }

    public clearState(): void {
        this.states = [];
    }

    public get state(): State {
        if (this.states == null || this.states.length === 0) {
            return State.UNDEFINED;
        }
        return StatePriorities.getHighestPriority(this.states);
    }
}