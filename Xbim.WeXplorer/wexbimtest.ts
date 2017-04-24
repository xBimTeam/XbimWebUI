import { BinaryReader } from "./Viewer/binary-reader";
import { WexBimStream } from "./Viewer/wexbim-stream";

var reader = new BinaryReader();
var source = "/tests/data/envelop.wexbim";
let errCount = 0;
reader.onerror = e => errCount++;
reader.onloaded = r => {
    var wexbim = WexBimStream.ReadFromStream(r);
    var msg = document.getElementById("message");

    if (reader.isEOF() && errCount == 0) {
        msg.innerHTML = "Everything is all right. Reader didn't crash and did reach the end of the file.";
    }
    else {
        msg.innerHTML = "Not finished... :-(";
    }
};
reader.load(source);

