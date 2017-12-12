const input = document.getElementById('file') as HTMLInputElement;
input.addEventListener('change', (evt) => {
    const file = input.files[0] as File;
    var slice = file.slice(0, 100);
    var reader = new FileReader();
    reader.onload = (e) => {
        const array = reader.result as ArrayBuffer;
        const bytes = new Uint8Array(array);
        const str = String.fromCharCode(Array.prototype.slice.call(bytes));
    };
    reader.readAsArrayBuffer(slice);
});