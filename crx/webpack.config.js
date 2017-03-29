var path = require('path');

module.exports = {
    entry: {
        content: './content.js'
    },
    output: {
        filename: '[name].js',
        path: path.join(__dirname, 'build')
    },
    module: {
        loaders: [{
            test: /dist\/parrot\.js$/,
            loader: 'raw'
        }]
    }
};
