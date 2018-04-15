const cst = require('../src/common/constants.js');
const innerWrapUrl = require('../src/common/wrapurl.js');

const mockServer = 'http://mockserver.com';

describe('wrapurl', function() {
    let urlStr, options;

    describe('url filter', function() {
        it('should return directly if no host', function() {
            urlStr = '/some/path';
            expect(innerWrapUrl(urlStr)).toEqual(urlStr);
        });
        it('should return directly if contains "local"', function() {
            urlStr = 'http://local.xx.com/some/path';
            expect(innerWrapUrl(urlStr)).toEqual(urlStr);
        });
        it('should return directly if not enabled', function() {
            urlStr = 'http://xx.com/some/path';
            expect(innerWrapUrl(urlStr)).toEqual(urlStr);
        });
    });
    describe('enable by query', function() {
        beforeEach(function() {
            urlStr = 'http://xx.com/some/path';
            options = {
                pageUrl: `http://yy.com/page?q=1&${cst.QUERY_MOCK_ENABLED}=${cst.COOKIE_MOCK_ENABLED_OK}`,
                cookie: 'c=2',
                reqType: 'jsonp'
            };
        });

        it('should read host from query first', function() {
            options.pageUrl += `&${[cst.QUERY_MOCK_SERVER]}=${mockServer}`;

            expect(innerWrapUrl(urlStr, options)).toEqual(
                getRewriteUrl(mockServer, urlStr, options.cookie, options.reqType)
            );
        });
        it('should read host from cookie if no host in query', function() {
            options.cookie += `;${cst.COOKIE_MOCK_SERVER}=${mockServer}`;

            expect(innerWrapUrl(urlStr, options)).toEqual(
                getRewriteUrl(mockServer, urlStr, options.cookie, options.reqType)
            );
        });
    });
    describe('enable by cookie', function() {
        beforeEach(function() {
            urlStr = 'http://xx.com/some/path';
            options = {
                pageUrl: 'http://yy.com/page?q=1',
                cookie: `c=2;${cst.COOKIE_MOCK_ENABLED}=${cst.COOKIE_MOCK_ENABLED_OK}`,
                reqType: 'jsonp'
            };
        });

        it('should read host from query first', function() {
            options.pageUrl += `&${[cst.QUERY_MOCK_SERVER]}=${mockServer}`;

            expect(innerWrapUrl(urlStr, options)).toEqual(
                getRewriteUrl(mockServer, urlStr, options.cookie, options.reqType)
            );
        });
        it('should read host from cookie if no host in query', function() {
            options.cookie += `;${cst.COOKIE_MOCK_SERVER}=${mockServer}`;

            expect(innerWrapUrl(urlStr, options)).toEqual(
                getRewriteUrl(mockServer, urlStr, options.cookie, options.reqType)
            );
        });
    });
});

function getQueryString(query) {
    var array = [];
    for (var key in query) {
        array.push(key + '=' + encodeURIComponent(query[key]));
    }
    return '?' + array.join('&');
}
function getRewriteUrl(host, urlStr, cookie, reqType) {
    var params = {};
    params[cst.API_PARAM_URL] = urlStr;
    params[cst.API_PARAM_COOKIE] = cookie || '';
    params[cst.API_PARAM_REQTYPE] = reqType || '';
    return host + cst.API_REWRITE + getQueryString(params);
}
