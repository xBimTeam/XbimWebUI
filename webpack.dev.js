const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');

module.exports = merge(common, {
    mode: "development",
    devtool: 'inline-source-map',
    plugins: [
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin()
    ],
    devServer: {
        contentBase: ".",
        host: "localhost",
        publicPath: "/dist/",
        port: 9000,
        hot: true,
        overlay: {
            warnings: true,
            errors: true
        }
    },
});
