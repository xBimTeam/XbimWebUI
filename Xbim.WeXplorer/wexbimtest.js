var reader = new Xbim.Viewer.BinaryReader();
var wexbim;
var source = "/tests/data/envelop.wexbim";
var errCount = 0;
reader.onerror = function (e) { return errCount++; };
reader.onloaded = function (r) {
    var wexbim = Xbim.Viewer.WexBimStream.ReadFromStream(r);
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