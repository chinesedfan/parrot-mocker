var path = require('path');

module.exports = {
    entry: {
        parrot: ['./src/browser.js']
    },
    output: {
        filename: '[name].js',
        path: path.join(__dirname, 'dist')
    }
};
