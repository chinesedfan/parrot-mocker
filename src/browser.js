var url = require('url');

var cst = require('./common/constants.js');
var cookies = require('./common/cookies.js');
var innerWrapUrl = require('./common/wrapurl.js');
var shouldSkip = require('./common/shouldskip.js');

var fetch = require('./wrapper/fetch-polyfill.js'); // force fetch to be implemented by xhr
var xhr = require('./wrapper/xhr.js');
var jsonp = require('./wrapper/jsonp.js');

(function() {
    if (window[cst.GLOBAL_LOCK]) return;

    var query = url.parse(location.href, true).query;
    // enable if the switch is on
    var mock = query[cst.QUERY_MOCK_ENABLED] || cookies.getItem(document.cookie, cst.COOKIE_MOCK_ENABLED);
    if (mock === cst.COOKIE_MOCK_ENABLED_OK) {
        enableIntercept();
        window[cst.GLOBAL_LOCK] = true;
    }
    // update cookies (invalid values mean disabled)
    if (query[cst.QUERY_MOCK_ENABLED]) {
        writeCookie(cst.COOKIE_MOCK_ENABLED, query[cst.QUERY_MOCK_ENABLED]);
        writeCookie(cst.COOKIE_MOCK_SERVER, query[cst.QUERY_MOCK_SERVER]);
        writeCookie(cst.COOKIE_MOCK_CLIENTID, query[cst.QUERY_MOCK_CLIENTID]);
    }
})();

function enableIntercept() {
    fetch.init(window);
    xhr.init(wrapUrl);
    jsonp.init(wrapUrl, localStorage.getItem(cst.LS_JSONP_PARAM_NAME));
}

function wrapUrl(urlStr, reqType) {
    return innerWrapUrl(urlStr, {
        reqType: reqType,
        pageUrl: location.href,
        cookie: document.cookie, // ATTENTION: the page cookies are different with the real API cookies
        shouldSkip: function(host) {
            return shouldSkip(host, localStorage.getItem(cst.LS_MOCK_SKIP_RULES));
        }
    }, {
        isServer: false,
        host: location.host
    });
}

function writeCookie(key, value) {
    var duration = localStorage.getItem(cst.LS_MOCK_DURATION);
    duration = parseInt(duration) || 1;

    cookies.setItem(key, value, 24 * 60 * 60 * duration, '/', location.hostname);
}
