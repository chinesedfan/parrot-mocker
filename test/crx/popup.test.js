const fs = require('fs');
const path = require('path');
const chrome = require('sinon-chrome');
const { assert, stub } = require('sinon');
const { JSDOM } = require('jsdom');
const { COOKIE_MOCK_CLIENTID, LS_MOCK_SERVER, LS_MOCK_DURATION,
    LS_JSONP_PARAM_NAME, LS_MOCK_SKIP_RULES } = require('../../src/common/constants');
const { coverageVar, instrument } = require('../util.js');

let window;
let eleInput, eleMsg, eleBtn;
describe('popup.js', function() {
    let script;

    beforeAll(function() {
        const file = path.resolve(__dirname, '../../crx/popup.js');
        script = instrument(file);
    });

    beforeEach(function() {
        chrome.flush();
        chrome.tabs.query.callsArgWith(1, [{id: 123}]);

        return JSDOM.fromFile(path.resolve(__dirname, '../../crx/popup.html'), {
            runScripts: 'outside-only'
        }).then(function(dom) {
            window = dom.window;
            window[coverageVar] = global[coverageVar];
            window.localStorage = {
                getItem: jest.fn(),
                setItem: jest.fn()
            };
            window.chrome = chrome;

            const document = window.document;
            document.addEventListener = stub().callsArg(1);

            eleInput = document.getElementById('mockserver');
            eleMsg = document.getElementsByClassName('msg')[0];
            eleBtn = document.getElementsByClassName('btn')[0];
        });
    });

    it('should call required functions', function() {
        window.eval(script);

        assert.calledOnce(chrome.tabs.query);
        assert.calledOnce(chrome.tabs.sendMessage);
    });
    describe('render', function() {
        it('should render correctly if no content.js loaded', function() {
            chrome.tabs.sendMessage.callsArgWith(2);
            window.eval(script);

            expect(eleMsg.innerHTML).toEqual('No content.js loaded.');
            expect(eleBtn.innerHTML).toEqual('Unable to Mock');
            expect(eleBtn.className).toEqual('btn disabled');
        });
        it('should render correctly if is locked', function() {
            chrome.tabs.sendMessage.callsArgWith(2, {
                locked: true
            });
            window.eval(script);

            expect(eleMsg.innerHTML).toEqual('Don\'t use at the mocker website!');
            expect(eleBtn.innerHTML).toEqual('Unable to Mock');
            expect(eleBtn.className).toEqual('btn disabled');
        });
        it('should render correctly if is enabled and has client id and res.server', function() {
            chrome.tabs.sendMessage.callsArgWith(2, {
                enabled: true,
                clientid: 'abcdefgh',
                server: 'https://mockserver.com'
            });
            window.eval(script);

            expectEnabledUI('abcdefgh', 'https://mockserver.com');
        });
        it('should render correctly if is enabled with client id and localStorage server', function() {
            chrome.tabs.sendMessage.callsArgWith(2, {
                enabled: true,
                clientid: 'abcdefgh'
            });
            window.localStorage.getItem.mockImplementation(function(key) {
                if (key === LS_MOCK_SERVER) return 'https://mockserver.com';
                throw new Error('unexpected key for localStorage.getItem');
            });
            window.eval(script);

            expectEnabledUI('abcdefgh', 'https://mockserver.com');
        });
        it('should render correctly if is enabled with client id but no server', function() {
            chrome.tabs.sendMessage.callsArgWith(2, {
                enabled: true,
                clientid: 'abcdefgh'
            });
            window.eval(script);

            expectEnabledUI('abcdefgh', '');
        });
        it('should render correctly if is enabled but no client id', function() {
            chrome.tabs.sendMessage.callsArgWith(2, {
                enabled: true,
                clientid: ''
            });
            window.eval(script);

            expect(eleMsg.innerHTML).toEqual('Invalid! Mocking without client id!');
            expect(eleBtn.innerHTML).toEqual('Click to Stop');
            expect(eleBtn.className).toEqual('btn stop');
        });
        it('should render correctly if is disabled and has client id', function() {
            chrome.tabs.sendMessage.callsArgWith(2, {
                enabled: false,
                clientid: 'abcdefgh'
            });
            window.eval(script);

            expectDisabledUI('abcdefgh');
        });
        it('should render correctly if is disabled but no client id', function() {
            chrome.tabs.sendMessage.callsArgWith(2, {
                enabled: false,
                clientid: ''
            });
            window.eval(script);

            expect(eleInput.getAttribute('disabled')).toBeFalsy();
            expect(eleMsg.innerHTML).toEqual('Hmm...');
            expect(eleBtn.innerHTML).toEqual('Click to Mock');
            expect(eleBtn.className).toEqual('btn');
        });
    });
    describe('input and settings button', function() {
        it('should select if focus', function() {
            eleInput.onselect = jest.fn();
            window.eval(script);
            window.eval(`
                document.getElementById('mockserver').focus();
            `);

            expect(eleInput.onselect).toHaveBeenCalledTimes(1);
        });
        it('should click if enter pressed', function() {
            eleBtn.click = jest.fn();
            window.eval(script);
            window.eval(`
                var event = new KeyboardEvent('keydown', {
                    keyCode: 13 // enter
                });
                document.getElementById('mockserver').dispatchEvent(event);
            `);

            expect(eleBtn.click).toHaveBeenCalledTimes(1);
        });
        it('should open settings page', function() {
            window.eval(script);
            window.eval(`
                document.getElementById('btn-settings').click();
            `);

            assert.calledOnce(chrome.runtime.openOptionsPage);
        });
    });
    describe('mock button click', function() {
        it('should ignore if is locked', function() {
            chrome.tabs.sendMessage.callsArgWith(2, {
                locked: true
            });
            window.eval(script);
            simulateBtnClick();

            assert.notCalled(chrome.cookies.get);
        });
        it('should ignore if https pages with non-https server', function() {
            chrome.tabs.sendMessage.callsArgWith(2, {
                ishttps: true,
                server: 'http://non-https.com'
            });
            window.eval(script);
            simulateBtnClick();

            expect(eleMsg.innerHTML).toEqual('HTTPS pages require HTTPS mock server!');
            assert.notCalled(chrome.cookies.get);
        });
        it('should ignore if no client id', function() {
            chrome.tabs.sendMessage.callsArgWith(2, {
                enabled: false,
                clientid: ''
            });
            chrome.cookies.get.callsArgWith(1, '');
            window.eval(script);
            simulateBtnClick();

            expect(eleMsg.innerHTML).toEqual('No client id is found in this mock server!');
            assert.calledOnce(chrome.cookies.get);
        });
        it('should able to enable', function() {
            chrome.tabs.sendMessage.onFirstCall().callsArgWith(2, {
                enabled: false,
                clientid: 'abcdefgh',
                server: 'https://mockserver.com'
            });
            chrome.cookies.get.withArgs({
                url: 'https://newmock.com',
                name: COOKIE_MOCK_CLIENTID
            }).callsArgWith(1, {
                value: 'newclientid'
            });
            window.localStorage.getItem.mockImplementation(function(key) {
                switch (key) {
                case LS_MOCK_DURATION: return 2;
                case LS_JSONP_PARAM_NAME: return 'cb';
                case LS_MOCK_SKIP_RULES: return 'blabla';
                default: return '';
                }
            });
            window.eval(script);
            // mock user input
            eleInput.value = 'https://newmock.com';
            simulateBtnClick();

            assert.calledOnce(chrome.cookies.get);
            expect(window.localStorage.getItem).toHaveBeenCalledTimes(3);
            assert.calledWithMatch(chrome.tabs.sendMessage.secondCall, 123, {
                server: 'https://newmock.com',
                clientid: 'newclientid',
                enabled: true,
                duration: 2,
                jsonpkey: 'cb',
                skipRules: 'blabla'
            });
            expectEnabledUI('newclientid', 'https://newmock.com');
        });
        it('should able to disable', function() {
            chrome.tabs.sendMessage.onFirstCall().callsArgWith(2, {
                enabled: true,
                clientid: 'abcdefgh',
                server: 'https://mockserver.com'
            });
            window.eval(script);
            simulateBtnClick();

            assert.notCalled(chrome.cookies.get);
            assert.calledWithMatch(chrome.tabs.sendMessage.secondCall, 123, {
                server: 'https://mockserver.com',
                clientid: 'abcdefgh',
                enabled: false
            });
            expectDisabledUI('abcdefgh');
        });
    });
});

function expectEnabledUI(clientid, server) {
    expect(eleInput.value).toEqual(server);
    expect(eleInput.getAttribute('disabled')).toEqual('true');
    expect(eleMsg.innerHTML).toEqual(`Hi, ${clientid}, I\'m mocking!`);
    expect(eleBtn.innerHTML).toEqual('Click to Stop');
    expect(eleBtn.className).toEqual('btn stop');
}
function expectDisabledUI(clientid) {
    expect(eleInput.getAttribute('disabled')).toBeFalsy();
    expect(eleMsg.innerHTML).toEqual(`Hi, ${clientid}, I\'m ready!`);
    expect(eleBtn.innerHTML).toEqual('Click to Mock');
    expect(eleBtn.className).toEqual('btn');
}

function simulateBtnClick() {
    window.eval(`
        document.getElementsByClassName('btn')[0].click();
    `);
}
