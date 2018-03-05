var webpack = require('webpack');
var path = require("path");
var fs = require("fs");


var isDevelop = process.env.NODE_ENV === 'development';

var entries = {};
entries['xbim-viewer'] = './xbim-viewer.ts';
// entries['xbim-geometry-loader'] = './src/workers/geometry-loader.ts';

var plugins = [];


var tsLoader = 'ts-loader?' + JSON.stringify({
    compilerOptions: {
        declaration: true
    }
});

module.exports = {
    devServer: {
        contentBase: ".",
        host: "localhost",
        port: 9000
    },
    mode: "development",
    entry: entries,
    output: {
        path: path.join(__dirname, "build"),
        libraryTarget: 'umd',
        sourceMapFilename: isDevelop ? '[name].js.map' : '[name].min.js.map',
        filename: isDevelop ? '[name].js' : '[name].min.js',
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [tsLoader]
            }
        ]
    },
    plugins: plugins,
    resolve: {
        extensions: ['.ts', '.js']
    }
}

