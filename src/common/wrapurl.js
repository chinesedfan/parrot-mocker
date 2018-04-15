var url = require('url');
var cookies = require('./cookies.js');
var cst = require('./constants.js');

/**
 * Wrap the API url to the mock server url if needs
 *
 * @param {String} urlStr - the API url
 * @param {Object} options - refer to README.md
 * @param {Object} innerOpts - mask the differences between node & browser
 * @return {String} the url to the mock server
 */
module.exports = function(urlStr, options, innerOpts) {
    options = options || {};

    var parsedUrl = url.parse(urlStr, true, true);
    // do not forward relative or local request, beacuse the server can not resolve
    var shouldSkip = options.shouldSkip || function(host) {
        return !host || host.indexOf('local') >= 0;
    };
    if (shouldSkip(parsedUrl.host)) return urlStr;

    var query = url.parse(options.pageUrl || '', true).query;
    var mock = query[cst.QUERY_MOCK_ENABLED] || cookies.getItem(options.cookie, cst.COOKIE_MOCK_ENABLED);
    var host = query[cst.QUERY_MOCK_SERVER] || cookies.getItem(options.cookie, cst.COOKIE_MOCK_SERVER);

    if (mock === cst.COOKIE_MOCK_ENABLED_OK) {
        var params = {};
        params[cst.API_PARAM_URL] = urlStr;
        params[cst.API_PARAM_COOKIE] = options.cookie || '';
        params[cst.API_PARAM_REQTYPE] = options.reqType || '';
        return host + cst.API_REWRITE + getQueryString(params);
    } else {
        return urlStr;
    }
};

function getQueryString(query) {
    var array = [];
    for (var key in query) {
        array.push(key + '=' + encodeURIComponent(query[key]));
    }
    return '?' + array.join('&');
}
