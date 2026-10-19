import assert = require("assert");
import { createComponentFactory, createComponentResolver, ViewpointIdentityResolver } from "../src/bcf/component-identity";

const resolver: ViewpointIdentityResolver = {
    originatingSystem: "Example Authoring Tool",
    toComponent: () => null,
    fromComponent: component => component.originating_system === "Autodesk" &&
        component.authoring_tool_id === "12345678123456789abcdef012345678" ?
        { modelId: 7, productId: 42 } : null
};

const component = createComponentFactory(resolver)(42, 7);
assert.strictEqual(component.originating_system, "Example Authoring Tool");
assert.strictEqual(component.authoring_tool_id, "7_42");

const resolve = createComponentResolver(resolver);
assert.deepStrictEqual(resolve(component), { modelId: 7, productId: 42 });
assert.strictEqual(resolve({
    originating_system: "Another Authoring Tool",
    authoring_tool_id: "7_42"
}), null);
assert.deepStrictEqual(resolve({
    originating_system: "Autodesk",
    authoring_tool_id: "12345678123456789abcdef012345678"
}), { modelId: 7, productId: 42 });
