var input = document.getElementById('file');
input.addEventListener('change', function (evt) {
    var file = input.files[0];
    var slice = file.slice(0, 100);
    var reader = new FileReader();
    reader.onload = function (e) {
        var array = reader.result;
        var bytes = new Uint8Array(array);
        var str = String.fromCharCode(Array.prototype.slice.call(bytes));
    };
    reader.readAsArrayBuffer(slice);
});
//# sourceMappingURL=index.js.map