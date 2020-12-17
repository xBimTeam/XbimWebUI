import { Message, MessageType } from '../common/message';
import { ModelGeometry } from '../reader/model-geometry';

function isImageBitmap(obj: any): boolean {
    // this is an interface signature of ImageBitmap
    return obj.width != null && obj.height != null && obj.close != null;
}

//only run following script if this is created as a Dedicated Worker
if (self && self instanceof DedicatedWorkerGlobalScope) {
    var worker = self as DedicatedWorkerGlobalScope;
    worker.onmessage = (e: MessageEvent) => {
        let model = e.data.model;
        let headers = e.data.headers;
        let geometry = new ModelGeometry();

        geometry.onerror = (msg) => {
            const message: Message = {
                type: MessageType.FAILED,
                message: msg,
                percent: 0,
            };
            worker.postMessage(message);
            console.error(msg);
            worker.close();
        };

        geometry.onloaded = () => {
            try {
                // todo: use ImageBitmap to do more asynchronous work (https://stackoverflow.com/questions/51710067/webgl-async-operations)
                let result = {};
                let transferable = [];
                for (let i in geometry) {
                    if (!geometry.hasOwnProperty(i)) {

                        continue;
                    }

                    let prop = geometry[i];
                    //ignore functions and private members when creating transferable message object
                    if (typeof prop === "function" || i.startsWith("_")) {
                        continue;
                    }

                    //building message object containing values but no functions or anything
                    result[i] = prop;

                    //create array of transferable objects for all typed arrays. Browsers which support Transferable interface will speed this up massively
                    if (ArrayBuffer.isView(prop)) {
                        transferable.push(prop.buffer);
                    } else if (isImageBitmap(prop)) {
                        transferable.push(prop);
                    }
                }

                //post the object and pass through all transferable objects
                const message: Message = {
                    type: MessageType.COMPLETED,
                    message: "Completed",
                    percent: 100,
                    result: result
                };
                worker.postMessage(message, transferable);
                worker.close();
            } catch (e) {
                const message: Message = {
                    type: MessageType.FAILED,
                    message: e,
                    percent: 0,
                };
                worker.postMessage(message);
                console.error(e);
                worker.close();
            }
        };
        geometry.load(model, headers, (message) => {
            worker.postMessage(message);
        });
    };
}
