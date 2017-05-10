"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//only run following script if this is created as a Worker
if (this.WorkerGlobalScope && this instanceof WorkerGlobalScope) {
    //import all dependencies
    importScripts('/Scripts/xbim-loader.min.js');
    onmessage = function (e) {
        var model = e.data;
        var geometry = new xModelGeometry();
        geometry.onerror = function (msg) {
            throw msg;
        };
        geometry.onloaded = function () {
            try {
                var msg = {};
                var transferable = [];
                for (var i in geometry) {
                    if (!geometry.hasOwnProperty(i))
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
                postMessage(msg, transferable);
                close();
            }
            catch (e) {
                throw e;
                close();
            }
        };
        geometry.load(model);
    };
}
//# sourceMappingURL=worker.js.map