var webpack = require('webpack');
var fs = require("fs");
var minify = process.argv.indexOf('--min') >= 0;

module.exports = {
    entry: {
        index: [
            './webpack.index.viewer.ts',
            './webpack.index.plugins.ts'
        ]
    },
    output: {
        path: './Build',
        filename: minify ? 'xbim.viewer.min.js' : 'xbim.viewer.js',
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
            })] }
        ]
    },
    plugins: [
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