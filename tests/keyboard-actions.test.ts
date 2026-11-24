import assert = require("assert");
import { describe, it } from "node:test";
import { getKeyActions, runMultiplier } from "../src/navigation/keyboard-actions";

const keys = (...codes: string[]) => new Set(codes);

describe("keyboard actions", () => {
    it("walks forward while W is held", () => {
        const actions = getKeyActions(keys("KeyW"));
        assert.deepStrictEqual(actions.map(a => [a.type, a.deltaY]), [["walk", 2]]);
    });

    it("runs when shift is held with W, regardless of the order the keys were pressed in", () => {
        // the Set has no ordering semantics so W-then-Shift and Shift-then-W are identical
        const forward = getKeyActions(keys("KeyW", "ShiftLeft"));
        const reverse = getKeyActions(keys("ShiftRight", "KeyW"));
        assert.deepStrictEqual(forward.map(a => a.deltaY), [2 * runMultiplier]);
        assert.deepStrictEqual(reverse.map(a => a.deltaY), [2 * runMultiplier]);
    });

    it("combines several movement keys", () => {
        const actions = getKeyActions(keys("KeyW", "KeyA"));
        assert.deepStrictEqual(actions.map(a => a.type), ["walk", "pan"]);
    });

    it("does nothing for shift alone and does not accelerate looking around", () => {
        assert.strictEqual(getKeyActions(keys("ShiftLeft")).length, 0);
        const look = getKeyActions(keys("KeyQ", "ShiftLeft"));
        assert.deepStrictEqual(look.map(a => [a.type, a.deltaX]), [["look-around", 2]]);
    });

    it("doesn't apply an action twice when aliased keys are held", () => {
        assert.strictEqual(getKeyActions(keys("KeyR", "ArrowUp")).length, 1);
    });

    it("scales steps by the frame scale", () => {
        assert.strictEqual(getKeyActions(keys("KeyW"), 2)[0].deltaY, 4);
    });
});
