/// <binding ProjectOpened='Watch - Development' />
var webpack = require('webpack');
var fs = require("fs");
var minify = process.argv.indexOf('--min') >= 0;

var entries = {};
entries['xbim-viewer'] = './Viewer/viewer.ts';
entries['xbim-browser'] = './Browser/browser.ts';
entries['xbim-geometry-loader'] = './Viewer/workers/geometry-loader.ts';
//entries['xbim-plugins'] = './webpack.index.plugins.ts';

module.exports = {
    devServer: {
        contentBase: ".",
        host: "localhost",
        port: 9000
    },
    entry: entries,
    output: {
        path: './Build',
        library: 'Xbim',
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
                    //transpileOnly: true
                })]
            }
        ]
    },
    plugins:
        minify ? [
            new webpack.BannerPlugin(fs.readFileSync('./Resources/xbim-disclaimer.txt', 'utf8'), { raw: true }),
            new webpack.optimize.DedupePlugin(),
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                }
            })
        ]
        : [
            new webpack.BannerPlugin(fs.readFileSync('./Resources/xbim-disclaimer.txt', 'utf8'), { raw: true })
        ],
    resolve: {
        extensions: ['', '.ts', '.js']
    }
}