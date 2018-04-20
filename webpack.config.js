var path = require('path');

module.exports = [{
    entry: {
        parrot: ['./src/browser.js']
    },
    output: {
        filename: '[name].js',
        path: path.join(__dirname, 'dist')
    }
}, {
    entry: {
        content: './crx/content.js'
    },
    output: {
        filename: '[name].js',
        path: path.join(__dirname, 'crx/build')
    },
    module: {
        loaders: [{
            test: /dist\/parrot\.js$/,
            loader: 'raw-loader'
        }]
    }
}];
