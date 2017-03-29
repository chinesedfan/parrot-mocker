var innerWrapUrl = require('./common/wrapurl.js');

/**
 * Wrap the API url to the mock server url if needs
 *
 * @param {String} urlStr - the API url
 * @param {Object} options - refer to README.md
 * @return {String} the url to the mock server
 */
exports.wrapUrl = function(urlStr, options) {
    return innerWrapUrl(urlStr, options, {
        isServer: true
    });
};
