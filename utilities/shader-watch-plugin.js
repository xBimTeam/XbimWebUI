const fs = require('fs');
const path = require('path');
const ShaderCompiler = require('./shader-compiler');
const sc = new ShaderCompiler();
function ShaderWatchPlugin() { }
 
let files = null; 

ShaderWatchPlugin.prototype.apply = function (compiler) {
    compiler.hooks.watchRun.tapAsync('ShaderWatchPlugin', function (compilation, callback) {
 
        if (files == null) {
            let root = path.join(compilation.context, 'src');
            files = sc.getShadersSync(root);
            if (files.length > 0)
            {
                files.forEach(file => {
                    fs.watch(file, (evt, f) => {
                        sc.compile(file);
                    });
                });
            }
        }
        callback();
    })
};

module.exports = ShaderWatchPlugin;