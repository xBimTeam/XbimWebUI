var webpack = require('webpack');
var fs = require("fs");
var minify = process.argv.indexOf('--min') >= 0;

module.exports = {
    entry: './webpack-browser-bundle',
    output: {
        path: './Build',
        filename: minify ? 'xbim.browser.bundle.min.js' : 'xbim.browser.bundle.js'
    },
    devtool: 'source-map',
    module: {
        loaders: [{ test: /\.ts$/, loaders: ['ts-loader'] }]
    },
    plugins: minify
        ? [
            new webpack.optimize.DedupePlugin(),
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                }
            })
        ] : [
            new webpack.BannerPlugin(fs.readFileSync('./Resources/xbim-disclaimer.txt', 'utf8'), {raw: true})
        ],
    resolve: {
        extensions: ['', '.ts', '.js']
    }
}