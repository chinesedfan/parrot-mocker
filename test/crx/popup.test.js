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
        });
        it('should render correctly if is enabled but no client id', function() {
        });
        it('should render correctly if is disabled and has client id', function() {
        });
        it('should render correctly if is disabled but no client id', function() {
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
