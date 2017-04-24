"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var binary_reader_1 = require("./Viewer/binary-reader");
var wexbim_stream_1 = require("./Viewer/wexbim-stream");
var reader = new binary_reader_1.BinaryReader();
var source = "/tests/data/envelop.wexbim";
var errCount = 0;
reader.onerror = function (e) { return errCount++; };
reader.onloaded = function (r) {
    var wexbim = wexbim_stream_1.WexBimStream.ReadFromStream(r);
    var msg = document.getElementById("message");
    if (reader.isEOF() && errCount == 0) {
        msg.innerHTML = "Everything is all right. Reader didn't crash and did reach the end of the file.";
    }
    else {
        msg.innerHTML = "Not finished... :-(";
    }
};
reader.load(source);
//# sourceMappingURL=wexbimtest.js.map