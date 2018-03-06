var webpack = require('webpack');
var DevServer = require('webpack-dev-server');
var config = require('./webpack.dev');

var compiler = webpack(config, (err, stat) => {});
compiler.watch({}, () => {});

// var ds = new DevServer(webpack, config);
// ds.listen();