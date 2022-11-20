const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        app: './src/js/app.js'
    },
    mode: 'development',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: './js/[name].js',
    },
    module: {
        rules: [
            {
                test: /\.js?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ],
              }
        ],
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: 'public' },
            ],
        }),
    ],
};