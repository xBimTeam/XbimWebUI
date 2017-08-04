import { ModelGeometry } from "../model-geometry";

//only run following script if this is created as a Worker
if (self && self instanceof DedicatedWorkerGlobalScope ) {
    var worker = self as DedicatedWorkerGlobalScope;
    worker.onmessage = function (e) {
        var model = e.data;
        var geometry = new ModelGeometry();

        geometry.onerror = function (msg) {
            throw msg;
        }

        geometry.onloaded = function () {
            try {
                var msg = {};
                var transferable = [];
                for (var i in geometry) {
                    if (!geometry.hasOwnProperty(i))
                        continue

                    var prop = geometry[i];
                    //ignore functions and private members when creating transferable message object
                    if (typeof prop === "function" || i.startsWith("_"))
                        continue;

                    //building message object containing values but no functions or anything
                    msg[i] = prop

                    //create array of transferable objects for all typed arrays. Browsers which support Transferable interface will speed this up massively
                    if (ArrayBuffer.isView(prop))
                        transferable.push(prop.buffer);
                }

                //post the object and pass through all transferable objects
                worker.postMessage(msg, transferable);
                worker.close();
            } catch (e) {
                worker.close();
                throw e;
            }
        };
        geometry.load(model);
    };
}
