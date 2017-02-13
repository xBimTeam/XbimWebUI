/// <binding ProjectOpened='Watch - Development' />
var webpack = require('webpack');
var fs = require("fs");
var minify = process.argv.indexOf('--min') >= 0;
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var extractCSS = new ExtractTextPlugin(minify ? 'xbim.browser.min.css' : 'xbim.browser.css');

module.exports = {
    entry: [
            './webpack.index.viewer.ts',
            './webpack.index.plugins.ts',
            './webpack.index.browser.ts',
        './Resources/doctemplate/static/styles/xbrowser-styles.css',
    ],
    output: {
        path: './Build',
        filename: minify ? 'xbim.bundle.min.js' : 'xbim.bundle.js'
    },
    devtool: 'source-map',
    module: {
        loaders: [
            {
                test: /\.ts$/, loaders: ['ts-loader?' + JSON.stringify({
                    compilerOptions: {
                        declaration: false
                    }
                })]
            },
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