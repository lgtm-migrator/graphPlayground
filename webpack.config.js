const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

const outputPath = path.resolve(__dirname, 'dist');

module.exports = {
    entry: {
        bundle: './src/js/app.js',
        pwaPacked: './src/pwaServiceWorker.js'
    },
    output: {
        filename: '[name].js',
        path: outputPath
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['env', {
                                targets: {
                                    browsers: ["last 2 versions", "safari >= 9"]
                                },
                                "useBuiltIns": true
                            }]
                        ]
                    }
                }
            }
        ]
    },
    stats: {
        colors: true
    },
    devtool: "source-map",
    plugins: [
        // Don't include momentjs since it isn't used by anything (but would otherwise get bundled
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        new CopyWebpackPlugin([
            {
                from: '*.png'
            },
            {
                from: '*.ico'
            },
            {
                from: './index.html'
            },
            {
                from: './manifest.json'
            }
        ])
    ],
    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendors",
                    chunks: "all"
                }
            }
        }
    }
};
