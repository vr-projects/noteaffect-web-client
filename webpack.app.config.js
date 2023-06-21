const MiniCssExtractPlugin = require("mini-css-extract-plugin");

var path = require("path");
const Plugins = require("./webpack.plugins");

const COMMIT_REF = process.env.CI_COMMIT_REF_NAME || "@COMMITREF";
const COMMIT_HASH = process.env.CI_COMMIT_SHA || "@COMMITHASH";

module.exports = {
  optimization: {
    splitChunks: {
      chunks: "all",
    },
    minimize: true,
    nodeEnv: "production",
  },
  entry: {
    app: ["whatwg-fetch", "babel-polyfill", "./src/app.tsx"],
    polling: ["whatwg-fetch", "babel-polyfill", "./src/polling.tsx"],
    print: ["whatwg-fetch", "babel-polyfill", "./src/print.tsx"],
    rsvp: ["whatwg-fetch", "babel-polyfill", "./src/rsvp.tsx"],
    downloads: ["whatwg-fetch", "babel-polyfill", "./src/downloads.tsx"],
    styles: ["./src/sass/app.scss"],
  },
  output: {
    path: path.resolve(__dirname, "dist/js/"),
    publicPath: `https://releases.noteaffect.com/${COMMIT_REF}/js/`,
    filename: `[name].${COMMIT_HASH}.min.js`,
    chunkFilename: `[name].${COMMIT_HASH}.min.js`,
  },
  mode: "production",
  resolve: {
    extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
    modules: [path.resolve("./src"), path.resolve("./node_modules")],
  },
  module: {
    rules: [
      // SVG images
      {
        test: /\.(svg|ttf|eot|woff|woff2)$/,
        use: [
          {
            loader: "file-loader",
          },
        ],
      },
      // CSS
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
        exclude: [/(node_modules)/],
      },
      // SASS
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
        exclude: [/(node_modules)/],
      },
      //   modules
      {
        test: /\.jsx?$/,
        use: ["babel-loader"],
        exclude: [
          /(node_modules\/lodash)/,
          /(node_modules\/react-dom)/,
          /(node_modules\/react-icons)/,
          /(node_modules\/react-soundplayer)/,
          /(node_modules\/pdfjs-dist)/,
        ],
      },
      // react-icons
      {
        test: /\.index\.esm\.js$/,
        loader: "babel-loader",
        include: [/(node_modules\/react-icons)/],
        query: {
          compact: false,
        },
      },
      // TypeScript code
      {
        test: /\.tsx?$/,
        use: ["babel-loader", 'ts-loader?{configFile:"tsconfig.json"}'],
        exclude: /node_modules/,
      },
    ],
  },
  externals: {
    jquery: "window.jQuery",
    fabric: "window",
  },
  plugins: Plugins.getPlugins(true),
};
