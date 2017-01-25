var webpack = require('webpack');
var fs = require("fs");
var minify = process.argv.indexOf('--min') >= 0;
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var extractCSS = new ExtractTextPlugin(minify ? 'xbim.browser.bundle.min.css' : 'xbim.browser.bundle.css');

module.exports = {
    entry: [
        './webpack-browser-bundle',
        './Resources/doctemplate/static/styles/xbrowser-styles.css',
        './Resources/doctemplate/static/styles/xviewer-styles.css'
    ],
    output: {
        path: './Build',
        filename: minify ? 'xbim.browser.bundle.min.js' : 'xbim.browser.bundle.js'
    },
    devtool: 'source-map',
    module: {
        loaders: [
            { test: /\.ts$/, loaders: ['ts-loader'] },
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