import assert = require("assert");
import { ProductAnalyticalResult } from "../src/common/product-analytical-result";
import { ProductMap } from "../src/common/product-map";
import { State } from "../src/common/state";
import { ModelHandle } from "../src/model-handle";
import { ProductType } from "../src/product-type";
import { Region } from "../src/reader/model-geometry";
import { ViewerSession } from "../src/transactions/viewer-session";
import { Viewer } from "../src/viewer";

/**
 * Non-enumerable dictionary metadata, named something other than a framework
 * observer key, so a hardcoded name exclusion cannot satisfy this regression.
 */
const METADATA_NAME = "reactiveTag";

interface ProductMaps {
    [id: number]: ProductMap;
}

function addNonEnumerableMetadata(target: object): void {
    assert.notStrictEqual(METADATA_NAME, "__ob__");
    Object.defineProperty(target, METADATA_NAME, {
        configurable: true,
        enumerable: false,
        value: { note: "observer metadata without states" },
        writable: true
    });

    const descriptor = Object.getOwnPropertyDescriptor(target, METADATA_NAME);
    assert.ok(descriptor != null);
    assert.strictEqual(descriptor.enumerable, false);
    assert.strictEqual((target as any)[METADATA_NAME].states, undefined);
    assert.strictEqual((target as any)[METADATA_NAME].bBox, undefined);
    assert.strictEqual((target as any)[METADATA_NAME].spans, undefined);
    assert.strictEqual((target as any)[METADATA_NAME].type, undefined);
    assert.notStrictEqual(Object.getOwnPropertyNames(target).indexOf(METADATA_NAME), -1);
    assert.strictEqual(Object.keys(target).indexOf(METADATA_NAME), -1);
}

function createProduct(id: number, type: ProductType, states: State[], spans?: number[][], bBox?: number[]): ProductMap {
    const map = new ProductMap();
    map.productID = id;
    map.type = type;
    map.states = states.slice();
    map.spans = (spans == null ? [] : spans).map((span) => new Int32Array(span));
    if (bBox != null) {
        map.bBox = new Float32Array(bBox);
    }
    return map;
}

function createHandle(modelId: number, productMaps: ProductMaps, states?: number[]): ModelHandle {
    const handle = Object.create(ModelHandle.prototype) as ModelHandle;
    handle.id = modelId;
    (handle as any)._model = {
        productMaps: productMaps,
        states: states == null ? [] : states.slice()
    };
    (handle as any)._empty = false;
    (handle as any)._drawProductIds = null;
    return handle;
}

function typedMaps(): ProductMaps {
    return {
        30: createProduct(30, ProductType.IFCDOOR, [State.UNDEFINED]),
        10: createProduct(10, ProductType.IFCWALL, [State.HIGHLIGHTED]),
        40: createProduct(40, ProductType.IFCWALLELEMENTEDCASE, [State.HIDDEN]),
        20: createProduct(20, ProductType.IFCWALLSTANDARDCASE, [State.HOVEROVER])
    };
}

function idsOf(maps: ProductMap[]): number[] {
    return maps.map((map) => map.productID);
}

function testGetProductsOfTypeIgnoresMetadata(): void {
    const plain = idsOf(runGetProductsOfType(false));
    const withMetadata = idsOf(runGetProductsOfType(true));
    assert.deepStrictEqual(withMetadata, plain);
    assert.deepStrictEqual(withMetadata, [10, 20, 40]);
}

function runGetProductsOfType(withMetadata: boolean): ProductMap[] {
    const productMaps = typedMaps();
    if (withMetadata) {
        addNonEnumerableMetadata(productMaps);
    }
    return createHandle(4, productMaps).getProductsOfType(ProductType.IFCWALL);
}

function testGetMapsIgnoresMetadata(): void {
    const plain = idsOf(runGetMaps(false));
    const withMetadata = idsOf(runGetMaps(true));
    assert.deepStrictEqual(withMetadata, plain);
    assert.deepStrictEqual(withMetadata, [10, 20, 40]);
}

function runGetMaps(withMetadata: boolean): ProductMap[] {
    const productMaps = typedMaps();
    if (withMetadata) {
        addNonEnumerableMetadata(productMaps);
    }
    const handle = createHandle(4, productMaps);
    return (handle as any).getMaps(ProductType.IFCWALL);
}

function stateMaps(): ProductMaps {
    return {
        20: createProduct(20, ProductType.IFCWALL, []),
        10: createProduct(10, ProductType.IFCWALL, [State.HIGHLIGHTED]),
        30: createProduct(30, ProductType.IFCDOOR, [State.UNDEFINED]),
        40: createProduct(40, ProductType.IFCWALL, [State.HOVEROVER, State.XRAYVISIBLE])
    };
}

function testGetStatesIgnoresMetadata(): void {
    const plain = runGetStates(false);
    const withMetadata = runGetStates(true);
    assert.deepStrictEqual(withMetadata, plain);
    assert.deepStrictEqual(withMetadata, [
        { id: 10, states: [State.HIGHLIGHTED] },
        { id: 40, states: [State.HOVEROVER, State.XRAYVISIBLE] }
    ]);
}

function runGetStates(withMetadata: boolean): { id: number, states: State[] }[] {
    const productMaps = stateMaps();
    if (withMetadata) {
        addNonEnumerableMetadata(productMaps);
    }
    return createHandle(3, productMaps).getStates();
}

interface HighlightSnapshot {
    states: { id: number, states: State[] }[];
    buffer: number[];
    changed: boolean;
}

function highlightMaps(): ProductMaps {
    return {
        8: createProduct(8, ProductType.IFCWALL, [State.HIGHLIGHTED, State.HIDDEN], [[1, 3]]),
        4: createProduct(4, ProductType.IFCWALL, [State.HIGHLIGHTED], [[0, 1]])
    };
}

function snapshotStates(productMaps: ProductMaps, handle: ModelHandle): HighlightSnapshot {
    const states = Object.keys(productMaps).map((id) => {
        const map = productMaps[id];
        return { id: map.productID, states: map.states.slice() };
    });
    return {
        states: states,
        buffer: (handle as any)._model.states.slice(),
        changed: (handle as any)._changed
    };
}

function testClearHighlightingIgnoresMetadata(): void {
    const plain = runClearHighlighting(false);
    const withMetadata = runClearHighlighting(true);
    assert.deepStrictEqual(withMetadata, plain);
    assert.deepStrictEqual(withMetadata.states, [
        { id: 4, states: [] },
        { id: 8, states: [State.HIDDEN] }
    ]);
    assert.deepStrictEqual(withMetadata.buffer, [State.UNDEFINED, 2, State.HIDDEN, 4, State.HIDDEN, 6]);
    assert.strictEqual(withMetadata.changed, true);
}

function runClearHighlighting(withMetadata: boolean): HighlightSnapshot {
    const productMaps = highlightMaps();
    if (withMetadata) {
        addNonEnumerableMetadata(productMaps);
    }
    const handle = createHandle(1, productMaps, [1, 2, 3, 4, 5, 6]);
    handle.clearHighlighting();
    return snapshotStates(productMaps, handle);
}

function testResetStateIgnoresMetadata(): void {
    const plain = runResetState(false);
    const withMetadata = runResetState(true);
    assert.deepStrictEqual(withMetadata, plain);
    assert.deepStrictEqual(withMetadata.states, [
        { id: 4, states: [] },
        { id: 8, states: [] }
    ]);
    assert.deepStrictEqual(withMetadata.buffer, [
        State.UNDEFINED, 2,
        State.UNDEFINED, 4,
        State.UNDEFINED, 6
    ]);
    assert.strictEqual(withMetadata.changed, true);
}

function runResetState(withMetadata: boolean): HighlightSnapshot {
    const productMaps: ProductMaps = {
        8: createProduct(8, ProductType.IFCDOOR, [State.HIDDEN, State.HOVEROVER], [[1, 2]]),
        4: createProduct(4, ProductType.IFCWALL, [State.HIGHLIGHTED], [[0, 1]])
    };
    if (withMetadata) {
        addNonEnumerableMetadata(productMaps);
    }
    const handle = createHandle(2, productMaps, [1, 2, 3, 4, 5, 6]);
    handle.resetState();
    return snapshotStates(productMaps, handle);
}

function analysisMaps(): ProductMaps {
    return {
        30: createProduct(30, ProductType.IFCWALL, [State.UNDEFINED], [[0, 9], [9, 12]], [0, 0, 0, 3, 4, 12]),
        10: createProduct(10, ProductType.IFCDOOR, [State.HIDDEN], [[0, 3]], [1, 2, 3, 6, 8, 0])
    };
}

function testGetProductAnalysisIgnoresMetadata(): void {
    const plain = runAnalysis(false);
    const withMetadata = runAnalysis(true);
    assert.deepStrictEqual(withMetadata, plain);

    const tenVolume = Math.sqrt(6 * 6 + 8 * 8);
    const thirtyIndexCount = 12;
    const thirtyVolume = Math.sqrt(3 * 3 + 4 * 4 + 12 * 12);
    assert.deepStrictEqual(withMetadata, [
        { modelId: -1, productId: -1, numberOfTriangles: 1, size: 1, volume: 1, density: 1 },
        {
            modelId: 9,
            productId: 10,
            numberOfTriangles: 1,
            size: 8,
            volume: tenVolume,
            density: 1 / tenVolume
        },
        {
            modelId: 9,
            productId: 30,
            numberOfTriangles: thirtyIndexCount / 3,
            size: 12,
            volume: thirtyVolume,
            density: (thirtyIndexCount / 3) / thirtyVolume
        }
    ]);
}

function runAnalysis(withMetadata: boolean): ProductAnalyticalResult[] {
    const productMaps = analysisMaps();
    if (withMetadata) {
        addNonEnumerableMetadata(productMaps);
    }
    const handle = createHandle(9, productMaps);
    const seed: ProductAnalyticalResult[] = [{
        modelId: -1,
        productId: -1,
        numberOfTriangles: 1,
        size: 1,
        volume: 1,
        density: 1
    }];
    return handle.getProductAnalysis(seed);
}

function regionMaps(): ProductMaps {
    return {
        11: createProduct(11, ProductType.IFCWALL, [], [], [0, 0, 0, 2, 4, 6]),
        22: createProduct(22, ProductType.IFCWALL, [], [], [Infinity, 0, 0, 1, 1, 1]),
        33: createProduct(33, ProductType.IFCWALL, [], [], [1, -1, 2, 4, 2, 2])
    };
}

function testRecomputeCompleteRegionIgnoresMetadata(): void {
    const plain = runRegion(false);
    const withMetadata = runRegion(true);
    assert.deepStrictEqual(withMetadata, plain);
    assert.strictEqual(withMetadata.population, 3);
    assert.deepStrictEqual(Array.from(withMetadata.bbox), [0, -1, 0, 5, 5, 6]);
    assert.deepStrictEqual(Array.from(withMetadata.centre), [2.5, 1.5, 3]);
}

function runRegion(withMetadata: boolean): Region {
    const productMaps = regionMaps();
    if (withMetadata) {
        addNonEnumerableMetadata(productMaps);
    }
    const handle = createHandle(6, productMaps);
    return (handle as any).recomputeCompleteRegion();
}

function testMetadataOnlyDictionaryDoesNotThrow(): void {
    const plain = runMetadataOnly(false);
    const withMetadata = runMetadataOnly(true);
    assert.deepStrictEqual(withMetadata.states, plain.states);
    assert.deepStrictEqual(withMetadata.products, plain.products);
    assert.deepStrictEqual(withMetadata.maps, plain.maps);
    assert.deepStrictEqual(withMetadata.analysis, plain.analysis);
    assert.deepStrictEqual(withMetadata.buffer, plain.buffer);
    assert.strictEqual(withMetadata.population, plain.population);
    assert.deepStrictEqual(withMetadata.states, []);
    assert.deepStrictEqual(withMetadata.products, []);
    assert.deepStrictEqual(withMetadata.analysis, []);
    assert.deepStrictEqual(withMetadata.buffer, [State.UNDEFINED, 2, State.UNDEFINED, 4]);
    assert.strictEqual(withMetadata.population, -1);
    assert.strictEqual(withMetadata.bbox, null);
}

function runMetadataOnly(withMetadata: boolean): {
    states: { id: number, states: State[] }[],
    products: ProductMap[],
    maps: ProductMap[],
    analysis: ProductAnalyticalResult[],
    buffer: number[],
    population: number,
    bbox: Float32Array
} {
    const productMaps: ProductMaps = {};
    if (withMetadata) {
        addNonEnumerableMetadata(productMaps);
    }
    const handle = createHandle(8, productMaps, [1, 2, 3, 4]);
    const states = handle.getStates();
    const products = handle.getProductsOfType(ProductType.IFCWALL);
    const maps = (handle as any).getMaps(ProductType.IFCDOOR) as ProductMap[];
    const analysis = handle.getProductAnalysis(null);
    handle.clearHighlighting();
    handle.resetState();
    const region = (handle as any).recomputeCompleteRegion() as Region;
    return {
        states: states,
        products: products,
        maps: maps,
        analysis: analysis,
        buffer: (handle as any)._model.states.slice(),
        population: region.population,
        bbox: region.bbox
    };
}

function testViewerSetIgnoresMetadata(): void {
    const viewer = Object.create(Viewer.prototype) as Viewer;
    const settings: Partial<Viewer> = { zoomDuration: 42 };
    addNonEnumerableMetadata(settings);
    viewer.set(settings);
    assert.strictEqual(viewer.zoomDuration, 42);
    assert.strictEqual((viewer as any)[METADATA_NAME], undefined);
}

function sessionResults(withMetadata: boolean): { selection: { id: number, modelId: number }[], hidden: { id: number, modelId: number }[] } {
    const states: { [key: string]: State } = {};
    const viewer = {
        getState: (id: number, modelId: number): State => {
            const value = states[modelId + ":" + id];
            return value === undefined ? State.UNDEFINED : value;
        },
        setState: (state: State, ids: number[], modelId: number): void => {
            ids.forEach((id) => {
                states[modelId + ":" + id] = state;
            });
        },
        activeHandles: []
    };
    const session = new ViewerSession(viewer as any);
    if (withMetadata) {
        addNonEnumerableMetadata((session as any)._selection);
        addNonEnumerableMetadata((session as any)._hidden);
    }
    session.select([{ id: 5, modelId: 1 }, { id: 6, modelId: 3 }], true);
    session.hide([{ id: 9, modelId: 2 }]);
    if (withMetadata) {
        addNonEnumerableMetadata((session as any)._selection);
        addNonEnumerableMetadata((session as any)._hidden);
    }
    return {
        selection: session.selection.map((product) => ({ id: product.id, modelId: product.modelId })),
        hidden: session.hidden.map((product) => ({ id: product.id, modelId: product.modelId }))
    };
}

function testViewerSessionIgnoresMetadata(): void {
    const plain = sessionResults(false);
    const withMetadata = sessionResults(true);
    assert.deepStrictEqual(withMetadata, plain);
    assert.deepStrictEqual(withMetadata.selection, [
        { id: 5, modelId: 1 },
        { id: 6, modelId: 3 }
    ]);
    assert.deepStrictEqual(withMetadata.hidden, [
        { id: 9, modelId: 2 }
    ]);
}

testGetProductsOfTypeIgnoresMetadata();
testGetMapsIgnoresMetadata();
testGetStatesIgnoresMetadata();
testClearHighlightingIgnoresMetadata();
testResetStateIgnoresMetadata();
testGetProductAnalysisIgnoresMetadata();
testRecomputeCompleteRegionIgnoresMetadata();
testMetadataOnlyDictionaryDoesNotThrow();
testViewerSetIgnoresMetadata();
testViewerSessionIgnoresMetadata();
