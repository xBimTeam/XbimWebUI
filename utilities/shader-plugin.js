const fs = require('fs');
const path = require('path');
const ShaderCompiler = require('./shader-compiler')
function ShaderPlugin() { }


ShaderPlugin.prototype.apply = function (compiler) {
    compiler.hooks.beforeRun.tapAsync('ShaderPlugin', function (compilation, callback) {
        var sc = new ShaderCompiler();

        // get all .c shader files
        var root = path.join(compilation.context, 'src') ;
        var files = sc.getShadersSync(root);
        files.forEach(file => {
            sc.compile(file)
        });
        
        callback();
    })
};

module.exports = ShaderPlugin;