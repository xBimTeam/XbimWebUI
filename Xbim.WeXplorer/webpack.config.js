/// <binding ProjectOpened='Watch - Development' />
var webpack = require('webpack');
var fs = require("fs");

var isDevelop = process.env.NODE_ENV == 'development';
var minify = process.argv.indexOf('--min') >= 0 || !isDevelop;



var entries = {};
entries['xbim-viewer'] = './Viewer/viewer.ts';
entries['xbim-browser'] = './Viewer/browser/browser.ts';
entries['xbim-geometry-loader'] = './Viewer/workers/geometry-loader.ts';

var plugins = [];
plugins.push(new webpack.BannerPlugin(fs.readFileSync('./Resources/xbim-disclaimer.txt', 'utf8'), { raw: true }));

if (isDevelop) {
    plugins.push(new webpack.BannerPlugin(fs.readFileSync('./Resources/xbim-disclaimer.txt', 'utf8'), { raw: true }));
    plugins.push(new webpack.optimize.DedupePlugin());
}

module.exports = {
    devServer: {
        contentBase: ".",
        host: "localhost",
        port: 9000
    },
    entry: entries,
    output: {
        path: './Build',
        //library: 'Xbim', /* if no name is defined all is defined globally */
        libraryTarget: 'umd',
        sourceMapFilename: minify ? '[name].min.js.map' : '[name].js.map',
        filename: minify ? '[name].min.js' : '[name].js',
    },
    devtool: 'source-map',
    module: {
        loaders: [
            {
                test: /\.ts$/, loaders: ['ts-loader?' + JSON.stringify({
                    compilerOptions: {
                        declaration: false
                    },
                    visualStudioErrorFormat: true,
                    transpileOnly: true
                })]
            }
        ]
    },
    plugins: plugins,
    resolve: {
        extensions: ['', '.ts', '.js']
    }
}

