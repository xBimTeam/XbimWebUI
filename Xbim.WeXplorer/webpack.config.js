/// <binding ProjectOpened='Watch - Development' />
var webpack = require('webpack');
var path = require("path");
var fs = require("fs");
var banner = fs.readFileSync('./Resources/xbim-disclaimer.txt', 'utf8');

var isDevelop = process.env.NODE_ENV == 'development';
var minify = !isDevelop;

var entries = {};
entries['xbim-viewer'] = './Viewer/viewer.ts';
entries['xbim-browser'] = './Viewer/browser/browser.ts';
entries['xbim-geometry-loader'] = './Viewer/workers/geometry-loader.ts';

var plugins = [];
plugins.push(new webpack.BannerPlugin({banner: banner,  raw: true }));

if (!isDevelop) {
    plugins.push(new webpack.optimize.UglifyJsPlugin( { compress: { warnings: false } }));
}

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
        //library: 'Xbim', /* if no name is defined all is defined globally */
        libraryTarget: 'umd',
        sourceMapFilename: minify ? '[name].min.js.map' : '[name].js.map',
        filename: minify ? '[name].min.js' : '[name].js',
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [tsLoader]
            },
            //{
            //    test: /loader.ts$/,
            //    use: [tsLoader,'worker-loader?inline=false']
            //}
        ]
    },
    plugins: plugins,
    resolve: {
        extensions: ['.ts', '.js']
    }
}

