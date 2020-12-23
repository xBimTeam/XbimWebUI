const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ShaderPlugin = require('./utilities/shader-plugin');
const ShaderWatchPlugin = require('./utilities/shader-watch-plugin');

var entries = {};
entries['index'] = './index.ts';

var tsLoader = 'ts-loader?' + JSON.stringify({
    compilerOptions: {
        declaration: true,
        declarationDir: 'dist'
    }
});

module.exports = {
    entry: entries,
    plugins: [
        new CleanWebpackPlugin(['dist']),
        new ShaderPlugin(),
        new ShaderWatchPlugin()
    ],
    output: {
        filename: '[name].js',
        libraryTarget: 'umd',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [tsLoader]
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    performance: {
        maxAssetSize: 300000,
        maxEntrypointSize: 300000
    }
};
