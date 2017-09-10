import path from "path";
import webpack from "webpack";
import SimpleProgressWebpackPlugin from "customized-progress-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import pkg from "../package.json";

const vendersConfig = require("../venders-config.json");

const getPlugins = function(morePlugins) {
    let plugins = [
        new webpack.BannerPlugin(
            `${pkg.name} v${pkg.version}\n\nCopyright 2017-present, WuXueqian.\nAll rights reserved.`
        ),
        new webpack.HashedModuleIdsPlugin(),
        new SimpleProgressWebpackPlugin({ format: "compact" }),
        new CopyWebpackPlugin([
            { from: "src/favicon.ico", to: path.resolve(__dirname, "../dist") },
            { from: "src/robots.txt", to: path.resolve(__dirname, "../dist") }
        ]),
        new webpack.DllReferencePlugin({
            context: __dirname,
            manifest: require("../manifest.json")
        }),
        new HtmlWebpackPlugin({
            filename: path.resolve(__dirname, "../dist/index.html"),
            template: "src/index.html",
            inject: true,
            vendersName: vendersConfig.venders.js
            //beetlLayout: "${layoutContent}"
        })
    ];

    if (morePlugins) {
        plugins = plugins.concat(morePlugins);
    }

    return plugins;
};

const getRules = function(moreRules) {
    let rules = [
        {
            test: /\.jsx?$/,
            loader: "babel-loader",
            exclude: /node_modules/
        },
        {
            test: /\.tsx?$/,
            loader: "babel-loader!ts-loader",
            exclude: /node_modules/
        },
        {
            test: /\.json$/,
            loader: "json-loader",
            exclude: /node_modules/
        },
        {
            test: /\.(png|jpg|gif)$/,
            exclude: /node_modules/,
            loader: "url-loader",
            query: {
                limit: 2000,
                name: "assets/img/[name].[ext]" // 'assets/img/[name].[ext]?[hash:7]'
            }
        },
        {
            test: /\.(woff|woff2|eot|ttf|svg)/, // if /\.(woff|woff2|eot|ttf|svg)$/ the font-awesome with url like xx.woff?v=4.7.0 can not be loaded
            exclude: /node_modules/,
            loader: "url-loader",
            query: {
                limit: 10000,
                name: "assets/fonts/[name].[ext]"
            }
        }
    ];

    if (moreRules) {
        rules = rules.concat(moreRules);
    }

    return rules;
};

export default function(morePlugins, moreRules) {
    let config = {
        devtool: "#source-map", // '#eval-source-map'
        node: {
            __filename: false,
            __dirname: false
        },
        resolve: {
            extensions: [
                ".json",
                ".js",
                ".jsx",
                ".ts",
                ".tsx",
                ".css",
                ".less"
            ],
            alias: {
                IMG: path.resolve(__dirname, "../src/assets/images/"),
                STYLES: path.resolve(__dirname, "../src/assets/styles")
            },
            modules: [
                "node_modules",
                path.resolve(__dirname, "../src/components")
            ]
        },
        target: "web",
        externals: {
            jquery: "jQuery"
        },
        module: {
            rules: getRules(moreRules)
        },
        plugins: getPlugins(morePlugins)
    };

    return config;
}