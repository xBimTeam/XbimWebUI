var webpack = require('webpack');
var DevServer = require('webpack-dev-server');
var config = require('./webpack.worker');

var compiler = webpack(config, (err, stat) => {});
//compiler.watch({}, () => {});