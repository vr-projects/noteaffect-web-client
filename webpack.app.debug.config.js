const Plugins = require("./webpack.plugins");
var baseConfig = require("./webpack.app.config");

const COMMIT_HASH = process.env.CI_COMMIT_SHA || "@COMMITHASH";

baseConfig.output.filename = `[name].${COMMIT_HASH}.js`;
baseConfig.output.chunkFilename = `[name].${COMMIT_HASH}.js`;
baseConfig.optimization.minimize = false;
baseConfig.plugins = Plugins.getPlugins(false);

module.exports = baseConfig;
