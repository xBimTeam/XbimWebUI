var webpack = require('webpack');
var fs = require("fs");
var minify = process.argv.indexOf('--min') >= 0;
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var extractCSS = new ExtractTextPlugin(minify ? 'xbim.bundle.min.css' : 'xbim.bundle.css');

module.exports = {
    entry: {
        index: [
            './index.ts',
            './Resources/doctemplate/static/styles/xbrowser-styles.css',
            './Resources/doctemplate/static/styles/xviewer-styles.css'
        ]
    },
    output: {
        path: './Build',
        filename: minify ? 'xbim.bundle.min.js' : 'xbim.bundle.js',
        libraryTarget: 'umd',
        library: 'xbim-webui'
    },
    devtool: 'source-map',
    module: {
        loaders: [
            { test: /\.ts$/, loaders: ['ts-loader?' + JSON.stringify({
                compilerOptions: {
                    declaration: false
                }
            })] },
            { test: /\.css$/, loader: extractCSS.extract(['css-loader']) }
        ]
    },
    plugins: [
        extractCSS
    ].concat(
        minify
        ? [
            new webpack.optimize.DedupePlugin(),
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                }
            })
        ]
        : [
            new webpack.BannerPlugin(fs.readFileSync('./Resources/xbim-disclaimer.txt', 'utf8'), { raw: true })
        ]),
    resolve: {
        extensions: ['', '.ts', '.js']
    }
}