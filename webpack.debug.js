var webpack = require('webpack');
var DevServer = require('webpack-dev-server');
var config = require('./webpack.dev');
var clean = require('./utilities/clean');

clean('.');

// var compiler = webpack(config, (err, stat) => {});
// compiler.watch({}, () => {});