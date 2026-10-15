import assert = require("assert");
import { ProductMap } from "../src/common/product-map";
import { State } from "../src/common/state";
import { ModelHandle } from "../src/model-handle";

/**
 * Non-enumerable dictionary metadata, named something other than a framework
 * observer key, so a hardcoded name exclusion cannot satisfy this regression.
 */
const METADATA_NAME = "reactiveTag";

interface ProductMaps {
    [id: number]: ProductMap;
}

function createProduct(id: number, states: State[]): ProductMap {
    const map = new ProductMap();
    map.productID = id;
    map.states = states.slice();
    return map;
}

/**
 * Real ModelHandle method, with only the fields that traversal reads.
 * The constructor needs a WebGL context and is not used here.
 */
function createHandle(modelId: number, productMaps: ProductMaps, isolatedProducts: number[] = null): ModelHandle {
    const handle = Object.create(ModelHandle.prototype) as ModelHandle;
    handle.id = modelId;
    (handle as any)._model = { productMaps: productMaps };
    (handle as any)._drawProductIds = isolatedProducts;
    return handle;
}

function addNonEnumerableMetadata(productMaps: ProductMaps): void {
    assert.notStrictEqual(METADATA_NAME, "__ob__");
    Object.defineProperty(productMaps, METADATA_NAME, {
        configurable: true,
        enumerable: false,
        value: { note: "observer metadata without states" },
        writable: true
    });

    const descriptor = Object.getOwnPropertyDescriptor(productMaps, METADATA_NAME);
    assert.ok(descriptor != null);
    assert.strictEqual(descriptor.enumerable, false);
    assert.strictEqual((productMaps as any)[METADATA_NAME].states, undefined);
    assert.notStrictEqual(Object.getOwnPropertyNames(productMaps).indexOf(METADATA_NAME), -1);
    assert.strictEqual(Object.keys(productMaps).indexOf(METADATA_NAME), -1);
}

function testNonEnumerableMetadataIsIgnored(): void {
    const productMaps: ProductMaps = {
        11: createProduct(11, [State.HOVEROVER]),
        22: createProduct(22, [State.HIGHLIGHTED]),
        33: createProduct(33, [State.HOVEROVER, State.XRAYVISIBLE])
    };
    addNonEnumerableMetadata(productMaps);

    const handle = createHandle(7, productMaps);
    assert.deepStrictEqual(handle.getProductsWithState(State.HOVEROVER), [
        { id: 11, model: 7 },
        { id: 33, model: 7 }
    ]);
    assert.deepStrictEqual(handle.getProductsWithState(State.HIGHLIGHTED), [
        { id: 22, model: 7 }
    ]);
}

function testOrdinaryDictionaryStateMatching(): void {
    const productMaps: ProductMaps = {
        1: createProduct(1, [State.HOVEROVER]),
        2: createProduct(2, [State.HIGHLIGHTED, State.HIDDEN]),
        3: createProduct(3, [State.UNDEFINED])
    };
    const handle = createHandle(4, productMaps);

    assert.deepStrictEqual(handle.getProductsWithState(State.HOVEROVER), [
        { id: 1, model: 4 }
    ]);
    assert.deepStrictEqual(handle.getProductsWithState(State.HIGHLIGHTED), [
        { id: 2, model: 4 }
    ]);
    assert.deepStrictEqual(handle.getProductsWithState(State.HIDDEN), [
        { id: 2, model: 4 }
    ]);
    assert.deepStrictEqual(handle.getProductsWithState(State.XRAYVISIBLE), []);
    assert.deepStrictEqual(handle.getProductsWithState(State.UNDEFINED), [
        { id: 3, model: 4 }
    ]);
}

function testMetadataOnlyDictionary(): void {
    const productMaps: ProductMaps = {};
    addNonEnumerableMetadata(productMaps);
    const handle = createHandle(8, productMaps);
    assert.deepStrictEqual(handle.getProductsWithState(State.HOVEROVER), []);
}

function testEmptyDictionary(): void {
    const handle = createHandle(9, {});
    assert.deepStrictEqual(handle.getProductsWithState(State.HOVEROVER), []);
    assert.deepStrictEqual(handle.getProductsWithState(State.HIGHLIGHTED), []);
}

function testEmptyStateArrays(): void {
    const productMaps: ProductMaps = {
        5: createProduct(5, []),
        6: createProduct(6, [State.HOVEROVER])
    };
    const handle = createHandle(2, productMaps);
    assert.deepStrictEqual(handle.getProductsWithState(State.HOVEROVER), [
        { id: 6, model: 2 }
    ]);
    assert.deepStrictEqual(handle.getProductsWithState(State.HIGHLIGHTED), []);
}

function testIsolationFiltersMatchingProducts(): void {
    const productMaps: ProductMaps = {
        10: createProduct(10, [State.HOVEROVER]),
        20: createProduct(20, [State.HOVEROVER]),
        30: createProduct(30, [State.HIGHLIGHTED])
    };
    addNonEnumerableMetadata(productMaps);

    const handle = createHandle(15, productMaps, [20, 30]);
    assert.deepStrictEqual(handle.getProductsWithState(State.HOVEROVER), [
        { id: 20, model: 15 }
    ]);
    assert.deepStrictEqual(handle.getProductsWithState(State.HIGHLIGHTED), [
        { id: 30, model: 15 }
    ]);
}

testNonEnumerableMetadataIsIgnored();
testOrdinaryDictionaryStateMatching();
testMetadataOnlyDictionary();
testEmptyDictionary();
testEmptyStateArrays();
testIsolationFiltersMatchingProducts();
