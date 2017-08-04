"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var model_geometry_1 = require("../model-geometry");
//only run following script if this is created as a Worker
if (self && self instanceof DedicatedWorkerGlobalScope) {
    var worker_1 = self;
    worker_1.onmessage = function (e) {
        var model = e.data;
        var geometry = new model_geometry_1.ModelGeometry();
        geometry.onerror = function (msg) {
            throw msg;
        };
        geometry.onloaded = function () {
            try {
                var msg = {};
                var transferable = [];
                for (var i in geometry) {
                    //skip private properties and non-own properties
                    if (!geometry.hasOwnProperty(i) || i.startsWith("_"))
                        continue;
                    var prop = geometry[i];
                    if (typeof prop === "function")
                        continue;
                    //building message object containing values but no functions or anything
                    msg[i] = prop;
                    //create array of transferable objects for all typed arrays. Browsers which support Transferable interface will speed this up massively
                    if (ArrayBuffer.isView(prop))
                        transferable.push(prop.buffer);
                }
                //post the object and pass through all transferable objects
                worker_1.postMessage(msg, transferable);
                worker_1.close();
            }
            catch (e) {
                worker_1.close();
                throw e;
            }
        };
        geometry.load(model);
    };
}
//# sourceMappingURL=geometry-loader.js.map