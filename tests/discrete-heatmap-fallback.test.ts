import assert = require("assert");
import { State } from "../src/common";
import { Viewer } from "../src/viewer";
import { DiscreteHeatmapChannel } from "../src/plugins/DataVisualization/Heatmap/discrete-heatmap-channel";
import { Heatmap } from "../src/plugins/DataVisualization/Heatmap/heatmap";
import { HeatmapSource } from "../src/plugins/DataVisualization/Heatmap/heatmap-source";

function channel(dataType: string = "string", fallbackColor?: string): DiscreteHeatmapChannel {
    return new DiscreteHeatmapChannel("status", dataType, "Status", "", "", "", {
        High: "#ff0000",
        Low: "#00ff00",
        "": "#0000ff",
        "null": "#ffffff",
        "1": "#123456"
    }, fallbackColor);
}

const discrete = channel();
assert.strictEqual(discrete.fallbackColor, "#808080");
assert.strictEqual(discrete.getColor("hIgH"), "#ff0000");
assert.strictEqual(discrete.getColor(""), "#0000ff");
assert.strictEqual(discrete.getColor("unknown"), "#808080");
assert.strictEqual(discrete.getColor(null), undefined);
assert.strictEqual(discrete.getColor(undefined), undefined);

const numeric = channel("number", "#112233");
assert.strictEqual(numeric.getColor(1), "#123456");
assert.strictEqual(numeric.getColor("high"), "#112233");
assert.strictEqual(numeric.getColor("constructor"), "#112233");
numeric.fallbackColor = "#abcdef";
assert.strictEqual(numeric.getColor(2), "#abcdef");

const styles: { id: number, rgba: number[] }[] = [];
const styled: { style: number, products: number[], model: number }[] = [];
const states: { state: State, products: number[], model: number }[] = [];
const viewer: Viewer = Object.create(Viewer.prototype);
viewer.defineStyle = (id, rgba) => { styles.push({ id, rgba }); };
viewer.setStyle = (style, products, model) => {
    assert.ok(Array.isArray(products));
    assert.notStrictEqual(model, undefined);
    styled.push({ style, products, model });
};
viewer.addState = (state, products, model) => {
    assert.ok(Array.isArray(products));
    assert.notStrictEqual(model, undefined);
    states.push({ state, products, model });
};
const heatmap = new Heatmap();
heatmap.init(viewer);
heatmap.addChannel(discrete);
heatmap.addSources([
    new HeatmapSource("mapped", [{ id: 1, model: 10 }], "status", "HIGH"),
    new HeatmapSource("unknown", [{ id: 2, model: 10 }, { id: 2, model: 20 }], "status", "unknown"),
    new HeatmapSource("null", [{ id: 3, model: 10 }], "status", null),
    new HeatmapSource("undefined", [{ id: 4, model: 10 }], "status", undefined),
    new HeatmapSource("string-null", [{ id: 5, model: 10 }], "status", "null")
]);

heatmap.renderSource("mapped");
assert.strictEqual(styles.some(style => style.rgba.join(",") === "128,128,128,255"), false);
styled.length = 0;
states.length = 0;
heatmap.renderChannel("status");
const red = styles.find(style => style.rgba.join(",") === "255,0,0,255").id;
const grey = styles.find(style => style.rgba.join(",") === "128,128,128,255").id;
const white = styles.find(style => style.rgba.join(",") === "255,255,255,255").id;
assert.deepStrictEqual(styled, [
    { style: red, products: [1], model: 10 },
    { style: grey, products: [2], model: 10 },
    { style: grey, products: [2], model: 20 },
    { style: white, products: [5], model: 10 }
]);
assert.deepStrictEqual(states, styled.map(call => ({
    state: State.XRAYVISIBLE, products: call.products, model: call.model
})));

const initialStyleCount = styles.length;
styled.length = 0;
states.length = 0;
heatmap.renderSources(["unknown"]);
assert.strictEqual(styles.length, initialStyleCount);
assert.deepStrictEqual(styled, [
    { style: grey, products: [2], model: 10 },
    { style: grey, products: [2], model: 20 }
]);
assert.deepStrictEqual(states, styled.map(call => ({
    state: State.XRAYVISIBLE, products: call.products, model: call.model
})));

discrete.fallbackColor = "#010203";
styled.length = 0;
states.length = 0;
heatmap.renderSource("unknown");
assert.strictEqual(styles.length, initialStyleCount + 1);
const custom = styles.find(style => style.rgba.join(",") === "1,2,3,255").id;
assert.deepStrictEqual(styled, [
    { style: custom, products: [2], model: 10 },
    { style: custom, products: [2], model: 20 }
]);
assert.deepStrictEqual(states, styled.map(call => ({
    state: State.XRAYVISIBLE, products: call.products, model: call.model
})));
