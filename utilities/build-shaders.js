const fs = require('fs');
const path = require('path');
const ShaderCompiler = require('./shader-compiler')

var sc = new ShaderCompiler();
let dir = process.argv[2];

// get all .c shader files
var files = sc.getShadersSync(dir);

// compile into TS
files.forEach(file => {
    sc.compile(file)
    callback();
});