var webpack = require('webpack');
var minify = process.argv.indexOf('--min') >= 0;

module.exports = {
    entry: './index',
    output: {
        path: './Build',
        filename: minify ? 'xbim.bundle.min.js' : 'xbim.bundle.js',
        libraryTarget: 'umd'
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
        ]
        : [],
    resolve: {
        extensions: ['', '.ts', '.js']
    }
}