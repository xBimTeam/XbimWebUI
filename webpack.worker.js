const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const StringifyWorkerPlugin = require('./utilities/stringify-worker-plugin');

var tsLoader = 'ts-loader?' + JSON.stringify({
    compilerOptions: {
        declaration: false,
        sourceMap: false
    }
});

module.exports = {
    mode: "production",
    entry: {
        worker: './src/workers/geometry-loader.ts'
    },
    plugins: [
        new UglifyJSPlugin(),
        new StringifyWorkerPlugin()
    ],
    output: {
        filename: '[name].js',
        libraryTarget: 'umd',
        path: path.resolve(__dirname, 'src/workers')
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [tsLoader]
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js', '.c']
    }
};
