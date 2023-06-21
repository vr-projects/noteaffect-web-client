const Plugins = require('./webpack.plugins');
var baseConfig = require('./webpack.app.config');
var path = require('path');

baseConfig.mode = 'development';
baseConfig.optimization.minimize = false;
baseConfig.optimization.nodeEnv = 'development';
baseConfig.output.path = path.resolve(__dirname, 'server_dev/js');
baseConfig.output.filename = '[name].js';
baseConfig.output.chunkFilename = '[name].js';
baseConfig.output.publicPath = '/dev/js/';
baseConfig.plugins = Plugins.getPlugins(false);
module.exports = baseConfig;