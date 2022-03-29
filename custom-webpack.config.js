const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: 'node_modules/libarchive.js/dist', to: 'public' }
            ]
        })
    ]
}