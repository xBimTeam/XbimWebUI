import { ProductType } from "../product-type";
import { State, StatePriorities } from "./state";

export class ProductMap {
    public productID: number;
    public renderId: number;
    public type: ProductType;
    public bBox: Float32Array;
    public spans: Int32Array[];
    public states: number[] = [];

    public static clone(o: ProductMap): ProductMap {
        const c = new ProductMap();
        c.productID = o.productID;
        c.renderId = o.renderId;
        c.type = o.type;
        c.bBox = new Float32Array(o.bBox);
        c.spans = o.spans;
        c.states = o.states.slice(0);
        return c;
    }

    public static addState(p: ProductMap, state: State) {
        if (p.states.find(s => s === state) != null) {
            return;
        }
        p.states.push(state);
    }

    public static removeState(p: ProductMap, state: State) {
        const index = p.states.indexOf(state);
        if (index < 0) {
            return;
        }
        p.states.splice(index, 1);
    }

    public static getState(p: ProductMap): State {
        if (p.states == null || p.states.length === 0) {
            return State.UNDEFINED;
        }
        return StatePriorities.getHighestPriority(p.states);
    }
}