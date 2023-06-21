var baseConfig = require("./webpack.app.local.config");
const Plugins = require('./webpack.plugins');

baseConfig.watch = true;
baseConfig.plugins = Plugins.getPlugins(false);
module.exports = baseConfig;
