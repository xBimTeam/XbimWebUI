/// <binding ProjectOpened='Watch - Development, Watch - Production' />
var webpack = require('webpack');
var path = require("path");
var fs = require("fs");


var banner = fs.readFileSync('./Resources/xbim-disclaimer.txt', 'utf8');

var isDevelop = process.env.NODE_ENV === 'development';

var entries = {};
entries['xbim-viewer'] = './xbim-viewer.ts';
entries['xbim-geometry-loader'] = './Viewer/workers/geometry-loader.ts';

var plugins = [];
plugins.push(new webpack.BannerPlugin({banner: banner,  raw: true }));
if (!isDevelop)
    plugins.push(new webpack.optimize.UglifyJsPlugin());

var tsLoader = 'ts-loader?' + JSON.stringify({
    compilerOptions: {
        declaration: false
    },
    visualStudioErrorFormat: true,
    transpileOnly: true
});

module.exports = {
    devServer: {
        contentBase: ".",
        host: "localhost",
        port: 9000
    },
    entry: entries,
    output: {
        path: path.join(__dirname, "Build"),
        //library: 'Xbim',
        libraryTarget: 'umd',
        sourceMapFilename: isDevelop ? '[name].js.map' : '[name].min.js.map',
        filename: isDevelop ? '[name].js' : '[name].min.js',
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [tsLoader]
            }
        ]
    },
    plugins: plugins,
    resolve: {
        extensions: ['.ts', '.js']
    }
}

