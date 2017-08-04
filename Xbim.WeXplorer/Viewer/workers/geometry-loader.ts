 import { ModelGeometry } from "../model-geometry";

//only run following script if this is created as a Worker
if (self && self instanceof DedicatedWorkerGlobalScope ) {
    let worker = self as DedicatedWorkerGlobalScope;
    worker.onmessage = function(e) {
        let model = e.data;
        let geometry = new ModelGeometry();

        geometry.onerror = function(msg) {
            throw msg;
        };

        geometry.onloaded = function() {
            try {
                let msg = {};
                let transferable = [];
                for (let i in geometry) {
                    //skip private properties and non-own properties
                    if (!geometry.hasOwnProperty(i) || i.startsWith("_"))
                        continue;

                    let prop = geometry[i];
                    if (typeof prop === "function")
                        continue;

                    //building message object containing values but no functions or anything
                    msg[i] = prop;

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
