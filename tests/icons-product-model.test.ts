import assert = require("assert");
import { Icons } from "../src/plugins/DataVisualization/Icons/icons";

type Products = { id: number, model: number }[];

// Models: id -> product ids it contains. Stopped models are not active.
function createIcons(models: { [id: number]: number[] }, stopped: number[] = []): any {
    const viewer = {
        activeHandles: Object.keys(models)
            .map(Number)
            .filter(id => stopped.indexOf(id) < 0)
            .map(id => ({ id })),
        isProductInModel: (productId: number, modelId: number) =>
            !!models[modelId] && models[modelId].indexOf(productId) >= 0
    };
    const icons = Object.create(Icons.prototype);
    icons._viewer = viewer;
    return icons;
}

function check(icons: any, products: Products | undefined): boolean {
    return icons.canBeRendered({ products, location: null }, null, null, null);
}

function testProductInActiveModelRenders(): void {
    const icons = createIcons({ 1: [101] });
    assert.strictEqual(check(icons, [{ id: 101, model: 1 }]), true);
}

function testSameIdInOtherActiveModelDoesNotRender(): void {
    const icons = createIcons({ 1: [101], 2: [101] }, [2]);
    assert.strictEqual(check(icons, [{ id: 101, model: 2 }]), false);
}

function testUnloadedModelDoesNotRender(): void {
    const icons = createIcons({ 1: [101] });
    assert.strictEqual(check(icons, [{ id: 101, model: 2 }]), false);
}

function testAnyValidProductRenders(): void {
    const icons = createIcons({ 1: [101], 2: [202] }, [2]);
    assert.strictEqual(check(icons, [{ id: 202, model: 2 }, { id: 101, model: 1 }]), true);
}

function testProductMissingFromActiveModelDoesNotRender(): void {
    const icons = createIcons({ 1: [101] });
    assert.strictEqual(check(icons, [{ id: 999, model: 1 }]), false);
}

function testNoProductsRenders(): void {
    const icons = createIcons({ 1: [101] });
    assert.strictEqual(check(icons, undefined), true);
    assert.strictEqual(check(icons, []), true);
}

testProductInActiveModelRenders();
testSameIdInOtherActiveModelDoesNotRender();
testUnloadedModelDoesNotRender();
testAnyValidProductRenders();
testProductMissingFromActiveModelDoesNotRender();
testNoProductsRenders();
console.log("icons-product-model tests passed");
