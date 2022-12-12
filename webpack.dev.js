const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

var entries = {};
entries['featured-viewer'] = './examples/featured-viewer/index.ts';
entries['basic-viewer'] = './examples/basic-viewer/index.ts';
entries['wexbim-files-viewer'] = './examples/wexbim-files-viewer/index.ts';
entries['pins'] = './examples/pins/index.ts';

module.exports = merge(common, {
    entry: entries,
    mode: "development",
    devtool: 'inline-source-map',
    plugins: [
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
        }),
        new HtmlWebpackPlugin({
            filename: 'pins/index.html',
            template: './examples/pins/index.html',
            chunks: ['pins', 'commons']
        })
    ],
    module: {
        rules: [
            { test: /\.html$/, use: ["html-loader"] }
        ]
    },
    devServer: {
        
        host: "localhost",
        port: 9001,
        open: "/",
        hot: true,
        devMiddleware: {
            publicPath: "/dist/",

        },
        static: {
            directory: path.join(__dirname, './'),
            serveIndex: true,
        },
        client: {
            overlay: {
                warnings: true,
                errors: true
            }
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
