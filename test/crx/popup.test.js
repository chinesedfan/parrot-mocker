const fs = require('fs');
const path = require('path');
const chrome = require('sinon-chrome');
const { assert, stub } = require('sinon');
const { JSDOM } = require('jsdom');
const { COOKIE_MOCK_CLIENTID } = require('../../src/common/constants');

let eleInput, eleMsg, eleBtn;
describe('popup.js', function() {
    let script;
    let window;

    beforeAll(function() {
        script = fs.readFileSync(path.resolve(__dirname, '../../crx/popup.js')).toString();
    });

    beforeEach(function() {
        chrome.flush();
        chrome.tabs.query.callsArgWith(1, [{id: 123}]);

        return JSDOM.fromFile(path.resolve(__dirname, '../../crx/popup.html'), {
            runScripts: 'outside-only'
        }).then(function(dom) {
            window = dom.window;
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
        it('should render correctly if is locked', function() {
            chrome.tabs.sendMessage.callsArgWith(2, {
                locked: true
            });
            window.eval(script);

            expect(eleMsg.innerHTML).toEqual('Don\'t use at the mocker website!');
            expect(eleBtn.innerHTML).toEqual('Unable to Mock');
            expect(eleBtn.className).toEqual('btn locked');
        });
        it('should render correctly if is enabled and has client id', function() {
            chrome.tabs.sendMessage.callsArgWith(2, {
                enabled: true,
                clientid: 'abcdefgh',
                server: 'https://mockserver.com'
            });
            window.eval(script);

            expectEnabledUI('abcdefgh', 'https://mockserver.com');
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
    describe('mock button click', function() {
        beforeEach(function() {
            eleBtn.addEventListener = stub().callsArg(1);
        });

        it('should ignore if is locked', function() {
            chrome.tabs.sendMessage.callsArgWith(2, {
                locked: true
            });
            window.eval(script);

            assert.notCalled(chrome.cookies.get);
        });
        it('should ignore if https pages with non-https server', function() {
            chrome.tabs.sendMessage.callsArgWith(2, {
                ishttps: true,
                server: 'http://non-https.com'
            });
            window.eval(script);

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
            eleBtn.addEventListener = function(type, fn) {
                eleBtn.trigger = fn;
            };
            window.eval(script);
            // mock user input
            eleInput.value = 'https://newmock.com';
            eleBtn.trigger('click');

            assert.calledOnce(chrome.cookies.get);
            assert.calledWithMatch(chrome.tabs.sendMessage.secondCall, 123, {
                server: 'https://newmock.com',
                clientid: 'newclientid',
                enabled: true
            });
            expectEnabledUI('newclientid', 'https://newmock.com');
        });
        it('should able to disable', function() {
            chrome.tabs.sendMessage.onFirstCall().callsArgWith(2, {
                enabled: true,
                clientid: 'abcdefgh',
                server: 'https://mockserver.com'
            });
            eleBtn.addEventListener = function(type, fn) {
                eleBtn.trigger = fn;
            };
            window.eval(script);
            eleBtn.trigger('click');

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
function mockBtnHandler() {
    eleBtn.addEventListener = function(type, fn) {
        eleBtn.trigger = fn;
    };
}
