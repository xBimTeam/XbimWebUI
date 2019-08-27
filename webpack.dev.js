const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

var entries = {};
entries['featured-viewer'] = './examples/featured-viewer/index.ts';
entries['basic-viewer'] = './examples/basic-viewer/index.ts';
entries['wexbim-files-viewer'] = './examples/wexbim-files-viewer/index.ts';

module.exports = merge(common, {
    entry: entries,
    mode: "development",
    devtool: 'inline-source-map',
    plugins: [
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
            filename: 'featured-viewer/index.html',
            template: './examples/featured-viewer/index.html',
            chunks: ['featured-viewer', 'commons']
        }),
        new HtmlWebpackPlugin({
            filename: 'basic-viewer/index.html',
            template: './examples/basic-viewer/index.html',
            chunks: ['basic-viewer', 'commons']
        }),
        new HtmlWebpackPlugin({
            filename: 'wexbim-files-viewer/index.html',
            template: './examples/wexbim-files-viewer/index.html',
            chunks: ['wexbim-files-viewer', 'commons']
        })
    ],
    module: {
        rules: [
            { test: /\.html$/, use: ["html-loader"] }
        ]
    },
    devServer: {
        contentBase: ".",
        host: "localhost",
        publicPath: "/dist/",
        port: 9001,
        hot: true,
        overlay: {
            warnings: true,
            errors: true
        }
    },
    optimization: {
        splitChunks:{
            cacheGroups: {
                commons: {
                    name: "commons",
                    chunks: "initial",
                    minChunks: 2
                }
            }
        }
    }
});
