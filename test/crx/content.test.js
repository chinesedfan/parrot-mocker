const chrome = require('sinon-chrome');
const { stub } = require('sinon');
const cst = require('../../src/common/constants.js');
let cookies;

describe('content.js', function() {
    beforeEach(function() {
        global.chrome = chrome;
        global.window = {};
        global.location = {
            reload: jest.fn()
        };
        global.document = {
            createElement: jest.fn().mockReturnValue({}),
            documentElement: {
                appendChild: jest.fn()
            }
        };

        jest.resetModules();
        jest.mock('../../src/common/cookies');
        jest.mock('../../dist/parrot', () => 'str');

        cookies = require('../../src/common/cookies');
    });

    describe('onMessage handler', function() {
        it('should disable and remove cookies', function() {
            chrome.runtime.onMessage.addListener = stub().callsArgWith(0, {
                event: 'mode-change',
                enabled: false
            });
            require('../../crx/content');

            expect(cookies.setItem.mock.calls).toHaveLength(1);
            expectCookiesSetItem(0, cst.COOKIE_MOCK_ENABLED, '', 'Thu, 01 Jan 1970 00:00:00 GMT');
        });
        it('should enable and write cookies', function() {
            chrome.runtime.onMessage.addListener = stub().callsArgWith(0, {
                event: 'mode-change',
                enabled: true,
                server: 'https://mockserver.com',
                clientid: 'abcdefgh'
            });
            require('../../crx/content');

            const vEnd = 24 * 60 * 60;
            expect(cookies.setItem.mock.calls).toHaveLength(3);
            expectCookiesSetItem(0, cst.COOKIE_MOCK_ENABLED, cst.COOKIE_MOCK_ENABLED_OK, vEnd);
            expectCookiesSetItem(1, cst.COOKIE_MOCK_SERVER, 'https://mockserver.com', vEnd);
            expectCookiesSetItem(2, cst.COOKIE_MOCK_CLIENTID, 'abcdefgh', vEnd);
        });
        it('should reload without special parameters', function() {
        });
        it('should check activate and update the icon', function() {

        });
        it('should query status', function() {
        });
    });
    it('should init icon after injecting the script', function() {

    });
});

function expectCookiesSetItem(i, key, value, vEnd) {
    const args = cookies.setItem.mock.calls[i];
    expect(args[0]).toEqual(key);
    expect(args[1]).toEqual(value);
    expect(args[2]).toEqual(vEnd);
}
