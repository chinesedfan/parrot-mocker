const fs = require('fs');
const path = require('path');
const chrome = require('sinon-chrome');
const { assert, stub } = require('sinon');
const { JSDOM } = require('jsdom');

describe('background.js', function() {
    let script;
    let window, eleInput, eleMsg, eleBtn;

    beforeAll(function() {
        script = fs.readFileSync(path.resolve(__dirname, '../../crx/popup.js')).toString();

        chrome.tabs.query.callsArgWith(1, [{id: 123}]);
    });

    beforeEach(function() {
        // TODO: chrome.flush();

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

            expect(eleInput.value).toEqual('https://mockserver.com');
            expect(eleInput.getAttribute('disabled')).toEqual('true');
            expect(eleMsg.innerHTML).toEqual(expect.stringMatching(/^Hi, .+, I\'m mocking!$/));
            expect(eleBtn.innerHTML).toEqual('Click to Stop');
            expect(eleBtn.className).toEqual('btn stop');
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

            expect(eleInput.getAttribute('disabled')).toBeFalsy();
            expect(eleMsg.innerHTML).toEqual(expect.stringMatching(/^Hi, .+, I\'m ready!$/));
            expect(eleBtn.innerHTML).toEqual('Click to Mock');
            expect(eleBtn.className).toEqual('btn');
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
        it('should ignore if is locked', function() {
        });
        it('should ignore if https pages with non-https server', function() {
        });
        it('should ignore if no client id', function() {
        });
        it('should able to enable', function() {
        });
        it('should able to disable', function() {
        });
    });
});
