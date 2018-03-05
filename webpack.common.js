const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

var entries = {};
entries['xbim-viewer'] = './xbim-viewer.ts';

var tsLoader = 'ts-loader?' + JSON.stringify({
    compilerOptions: {
        declaration: true
    }
});

module.exports = {
    entry: entries,
    plugins: [
        new CleanWebpackPlugin(['dist'])
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
    }
};
