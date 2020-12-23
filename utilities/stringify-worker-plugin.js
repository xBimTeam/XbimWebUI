const fs = require('fs');
const path = require('path');

class StringifyWorkerPlugin {
    constructor() { }
    
    apply(compiler) {
        compiler.hooks.afterEmit.tapAsync('StringifyWorkerPlugin', (compilation, callback) => {
            var outDir = compilation.outputOptions.path;
            Object.getOwnPropertyNames(compilation.assets).forEach(a => {
                if (!a.endsWith('.js')) {
                    return;
                }
                var data = fs.readFileSync(path.join(outDir, a), 'utf8');
                data = data
                    .replace(/\\"/g, "\\\\\\\"")
                    .replace(/\\r/g, "\\\\r")
                    .replace(/\\n/g, "\\\\n")
                    .replace(/([^\\])(")/g, "$1\\\"")
                    .replace(/([^\\])(")/g, "$1\\\"") // intentionaly duplicated for "" case
                    .replace(/\r\n/g, '\\r\\n')
                    .replace(/\n/g, '\\n');

                var name = path.basename(a, '.js');
                var content = `export const ${name} = "${data}"`;
                var result = path.join(outDir, name + '.ts');
                fs.writeFileSync(result, content, { encoding: 'utf8' });
            });
            callback();
        });
    }
}

module.exports = StringifyWorkerPlugin;