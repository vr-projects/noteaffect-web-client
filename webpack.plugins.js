const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const CleanCss = require("clean-css");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const Dotenv = require("dotenv-webpack");

module.exports = {
  getPlugins: function (minHtml) {
    return [
      new Dotenv({
        path:
          process.env.NODE_ENV === "production"
            ? "./.env.production"
            : "./.env.development",
        safe: false,
        allowEmptyValues: false,
        systemvars: true,
        silent: false,
        defaults: false,
      }),
      new MiniCssExtractPlugin({
        publicPath: "/css/",
        filename: "../css/[name].css",
      }),
      new OptimizeCssAssetsPlugin({
        cssProcessor: {
          process: function (input, opts) {
            const optsTo = opts.to;
            delete opts.to;

            const cleanCss = new CleanCss(
              Object.assign(
                {
                  returnPromise: true,
                  rebaseTo: optsTo,
                },
                opts
              )
            );
            return cleanCss.minify(input).then((output) => ({
              css: output.styles,
            }));
          },
        },
        cssProcessorOptions: {
          discardComments: {
            removeAll: true,
          },
        },
        canPrint: true,
      }),
      new HtmlWebpackPlugin({
        filename: "../index" + (minHtml ? ".min" : "") + ".html",
        inject: false,
        template: "public/index.template.html",
        minify: {
          collapseWhitespace: minHtml ? true : false,
        },
      }),
      new HtmlWebpackPlugin({
        filename: "../polling" + (minHtml ? ".min" : "") + ".html",
        inject: false,
        template: "public/polling.template.html",
        minify: {
          collapseWhitespace: minHtml ? true : false,
        },
      }),
      new HtmlWebpackPlugin({
        filename: "../print" + (minHtml ? ".min" : "") + ".html",
        inject: false,
        template: "public/print.template.html",
        minify: {
          collapseWhitespace: minHtml ? true : false,
        },
      }),
      new HtmlWebpackPlugin({
        filename: "../rsvp" + (minHtml ? ".min" : "") + ".html",
        inject: false,
        template: "public/rsvp.template.html",
        minify: {
          collapseWhitespace: minHtml ? true : false,
        },
      }),
      new HtmlWebpackPlugin({
        filename: "../version" + (minHtml ? ".min" : "") + ".html",
        inject: false,
        template: "public/version.template.html",
        minify: {
          collapseWhitespace: minHtml ? true : false,
        },
      }),      
      new HtmlWebpackPlugin({
        filename: "../downloads" + (minHtml ? ".min" : "") + ".html",
        inject: false,
        template: "public/downloads.template.html",
        minify: {
          collapseWhitespace: minHtml ? true : false,
        },
      }),
    ];
  },
};
