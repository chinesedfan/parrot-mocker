const cst = require('../src/common/constants.js');
let cookies, fetch, xhr, jsonp, innerWrapUrl, shouldSkip;

describe('browser', function() {
    beforeEach(function() {
        global.window = {};
        global.document = {
            cookie: ''
        };
        global.location = {
            href: '',
            hostname: ''
        };
        global.localStorage = {
            getItem: jest.fn(),
            setItem: jest.fn()
        };

        jest.resetModules();
        jest.mock('../src/common/cookies.js');
        jest.mock('../src/common/wrapurl.js');
        jest.mock('../src/common/shouldskip.js');
        jest.mock('../src/wrapper/fetch-polyfill.js');
        jest.mock('../src/wrapper/xhr.js');
        jest.mock('../src/wrapper/jsonp.js');

        cookies = require('../src/common/cookies.js');
        cookies.getItem.mockImplementation(require.requireActual('../src/common/cookies.js').getItem);
        innerWrapUrl = require('../src/common/wrapurl.js');
        shouldSkip = require('../src/common/shouldskip.js');
        fetch = require('../src/wrapper/fetch-polyfill.js');
        xhr = require('../src/wrapper/xhr.js');
        jsonp = require('../src/wrapper/jsonp.js');
    });

    it('should skip when the lock is there', function() {
        global.window[cst.GLOBAL_LOCK] = true;

        require('../src/browser');

        expectInterceptCalled(0);
        expect(cookies.setItem).toHaveBeenCalledTimes(0);
    });
    it('should skip if not enabled', function() {
        require('../src/browser');

        expectInterceptCalled(0);
        expect(cookies.setItem).toHaveBeenCalledTimes(0);
    });
    it('should enable with right parameters', function() {
        global.location = {
            href: `http://yy.com/page?q=1&${cst.QUERY_MOCK_ENABLED}=${cst.COOKIE_MOCK_ENABLED_OK}`,
            host: 'yy.com:80',
            hostname: 'yy.com'
        };

        require('../src/browser');

        expect(fetch.init).toHaveBeenCalledWith(global.window);
        expect(xhr.init.mock.calls[0][0]).toBe(jsonp.init.mock.calls[0][0]);

        // manual called
        const wrapUrl = xhr.init.mock.calls[0][0];
        wrapUrl('https://api.com/path', 'jsonp');
        expect(innerWrapUrl).toHaveBeenCalledTimes(1);
        expect(innerWrapUrl).toHaveBeenCalledWith('https://api.com/path', expect.objectContaining({
            reqType: 'jsonp',
            pageUrl: global.location.href,
            cookie: global.document.cookie
        }), expect.anything());

        global.localStorage.getItem.mockReturnValue('rules');
        global.localStorage.getItem.mockClear();
        const shouldSkipOption = innerWrapUrl.mock.calls[0][1].shouldSkip;
        shouldSkipOption(global.location.host);

        expect(global.localStorage.getItem).toHaveBeenCalledTimes(1);
        expect(global.localStorage.getItem).toHaveBeenCalledWith(cst.LS_MOCK_SKIP_RULES);
        expect(shouldSkip).toHaveBeenCalledTimes(1);
        expect(shouldSkip).toHaveBeenCalledWith(global.location.host, 'rules');
    });
    it('should enable if has the query', function() {
        global.location = {
            href: `http://yy.com/page?q=1&${cst.QUERY_MOCK_ENABLED}=${cst.COOKIE_MOCK_ENABLED_OK}`,
            hostname: 'yy.com'
        };

        require('../src/browser');

        expectInterceptCalled(1);
        expect(global.window[cst.GLOBAL_LOCK]).toEqual(true);
    });
    it('should write cookies if has the query', function() {
        const mockServer = 'http://mockserver.com';
        const clientID = 'abcdefgh';
        const duration = 24 * 60 * 60;
        const path = '/';
        const hostname = 'yy.com';
        global.location = {
            href: 'http://yy.com/page?q=1'
                    + `&${cst.QUERY_MOCK_ENABLED}=${cst.COOKIE_MOCK_ENABLED_OK}`
                    + `&${cst.QUERY_MOCK_SERVER}=${encodeURIComponent(mockServer)}`
                    + `&${cst.QUERY_MOCK_CLIENTID}=${clientID}`,
            hostname
        };

        require('../src/browser');

        expect(cookies.setItem).toHaveBeenCalledTimes(3);
        expect(cookies.setItem.mock.calls[0]).toEqual([cst.COOKIE_MOCK_ENABLED, cst.COOKIE_MOCK_ENABLED_OK, duration, path, hostname]);
        expect(cookies.setItem.mock.calls[1]).toEqual([cst.COOKIE_MOCK_SERVER, mockServer, duration, path, hostname]);
        expect(cookies.setItem.mock.calls[2]).toEqual([cst.COOKIE_MOCK_CLIENTID, clientID, duration, path, hostname]);
    });
    it('should enable if has the cookie', function() {
        global.location = {
            href: 'http://yy.com/page?q=1',
            hostname: 'yy.com'
        };
        global.document = {
            cookie: `c=2;${cst.COOKIE_MOCK_ENABLED}=${cst.COOKIE_MOCK_ENABLED_OK}`
        };

        require('../src/browser');

        expectInterceptCalled(1);
        expect(global.window[cst.GLOBAL_LOCK]).toEqual(true);
        expect(cookies.setItem).toHaveBeenCalledTimes(0);
    });
});

function expectInterceptCalled(times) {
    expect(fetch.init).toHaveBeenCalledTimes(times);
    expect(xhr.init).toHaveBeenCalledTimes(times);
    expect(jsonp.init).toHaveBeenCalledTimes(times);
}
