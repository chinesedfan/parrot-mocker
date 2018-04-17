const chrome = require('sinon-chrome');
const { assert, stub } = require('sinon');
const cst = require('../../src/common/constants.js');
let cookies;

describe('content.js', function() {
    beforeEach(function() {
        global.chrome = chrome;
        global.window = {};
        global.location = {
            protocol: 'https:',
            reload: jest.fn()
        };
        global.document = {
            createElement: jest.fn().mockReturnValue({}),
            getElementById: jest.fn().mockReturnValue(true),
            documentElement: {
                appendChild: jest.fn()
            }
        };
        global.localStorage = {
            getItem: jest.fn(),
            setItem: jest.fn()
        };

        chrome.flush();
        jest.useFakeTimers();
        jest.resetModules();
        jest.mock('../../src/common/cookies.js');
        jest.mock('../../dist/parrot.js', () => 'str');

        cookies = require('../../src/common/cookies.js');
        cookies.getItem.mockImplementation(require.requireActual('../../src/common/cookies.js').getItem);
    });

    describe('onMessage handler', function() {
        it('should disable and remove cookies', function() {
            chrome.runtime.onMessage.addListener = stub().callsArgWith(0, {
                event: 'mode-change',
                enabled: false
            });
            require('../../crx/content');

            expect(cookies.setItem).toHaveBeenCalledTimes(1);
            expectCookiesSetItem(0, cst.COOKIE_MOCK_ENABLED, '', 'Thu, 01 Jan 1970 00:00:00 GMT');
        });
        it('should enable and write cookies with default duration', function() {
            chrome.runtime.onMessage.addListener = stub().callsArgWith(0, {
                event: 'mode-change',
                enabled: true,
                server: 'https://mockserver.com',
                clientid: 'abcdefgh'
            });
            require('../../crx/content');

            const vEnd = 24 * 60 * 60 * 1;
            expect(cookies.setItem).toHaveBeenCalledTimes(3);
            expectCookiesSetItem(0, cst.COOKIE_MOCK_ENABLED, cst.COOKIE_MOCK_ENABLED_OK, vEnd);
            expectCookiesSetItem(1, cst.COOKIE_MOCK_SERVER, 'https://mockserver.com', vEnd);
            expectCookiesSetItem(2, cst.COOKIE_MOCK_CLIENTID, 'abcdefgh', vEnd);
        });
        it('should enable, sync local storage and write cookies', function() {
            chrome.runtime.onMessage.addListener = stub().callsArgWith(0, {
                event: 'mode-change',
                enabled: true,
                server: 'https://mockserver.com',
                clientid: 'abcdefgh',
                duration: '2',
                skipRules: 'rules'
            });
            global.localStorage.getItem.mockReturnValue('3'); // different value
            require('../../crx/content');

            expect(global.localStorage.setItem).toHaveBeenCalledTimes(2);
            expect(global.localStorage.setItem.mock.calls[0]).toEqual([cst.LS_MOCK_DURATION, '2']);
            expect(global.localStorage.setItem.mock.calls[1]).toEqual([cst.LS_MOCK_SKIP_RULES, 'rules']);
            expect(global.localStorage.getItem).toHaveBeenCalledTimes(3);
            expect(global.localStorage.getItem.mock.calls).toEqual(Array(3).fill([cst.LS_MOCK_DURATION]));

            const vEnd = 24 * 60 * 60 * 3;
            expect(cookies.setItem).toHaveBeenCalledTimes(3);
            expectCookiesSetItem(0, cst.COOKIE_MOCK_ENABLED, cst.COOKIE_MOCK_ENABLED_OK, vEnd);
            expectCookiesSetItem(1, cst.COOKIE_MOCK_SERVER, 'https://mockserver.com', vEnd);
            expectCookiesSetItem(2, cst.COOKIE_MOCK_CLIENTID, 'abcdefgh', vEnd);
        });
        it('should reload', function() {
            chrome.runtime.onMessage.addListener = stub().callsArgWith(0, {
                event: 'mode-change',
                enabled: false
            });
            global.location.href = 'https://page.com/path';
            require('../../crx/content');

            expect(global.location.reload).toHaveBeenCalledTimes(1);
        });
        it('should reload without special parameters', function() {
            chrome.runtime.onMessage.addListener = stub().callsArgWith(0, {
                event: 'mode-change',
                enabled: false
            });
            global.location.href = `https://page.com/path?${cst.QUERY_MOCK_ENABLED}=1`;
            require('../../crx/content');

            expect(global.location.href).toEqual(`https://page.com/path?${cst.QUERY_MOCK_ENABLED}=`);
            expect(global.location.reload).toHaveBeenCalledTimes(0);
        });
        it('should check activate and update the icon', function() {
            chrome.runtime.onMessage.addListener = stub().callsArgWith(0, {
                event: 'test-activate',
                enabled: false
            });
            global.document.cookie = `${cst.COOKIE_MOCK_ENABLED}=${cst.COOKIE_MOCK_ENABLED_OK}`;
            require('../../crx/content');

            assert.calledOnce(chrome.runtime.sendMessage);
            assert.calledWithExactly(chrome.runtime.sendMessage, {
                event: 'set-icon',
                active: true
            });
        });
        it('should query status', function() {
            const sendResponse = jest.fn();
            chrome.runtime.onMessage.addListener = stub().callsArgWith(0, {
                event: 'query-status'
            }, {}, sendResponse);
            global.document.cookie = [
                `${cst.COOKIE_MOCK_DEBUG}=1`,
                `${cst.COOKIE_MOCK_ENABLED}=${cst.COOKIE_MOCK_ENABLED_OK}`,
                `${cst.COOKIE_MOCK_SERVER}=mockserver`,
                `${cst.COOKIE_MOCK_CLIENTID}=abcdefgh`
            ].join(';');
            require('../../crx/content');

            expect(sendResponse).toHaveBeenCalledTimes(1);
            expect(sendResponse).toHaveBeenLastCalledWith({
                debug: '1',
                locked: true,
                ishttps: true,
                enabled: true,
                server: 'mockserver',
                clientid: 'abcdefgh'
            });
        });
    });
    it('should init icon after injecting the script', function() {
        jest.clearAllTimers();
        require('../../crx/content');

        expect(global.document.documentElement.appendChild).toHaveBeenCalledTimes(1);

        jest.advanceTimersByTime(200);

        assert.calledOnce(chrome.runtime.sendMessage);
        assert.calledWithExactly(chrome.runtime.sendMessage, {
            event: 'set-icon',
            active: false
        });
    });
});

function expectCookiesSetItem(i, key, value, vEnd) {
    const args = cookies.setItem.mock.calls[i];
    expect(args[0]).toEqual(key);
    expect(args[1]).toEqual(value);
    expect(args[2]).toEqual(vEnd);
}
