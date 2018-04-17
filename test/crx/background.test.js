const chrome = require('sinon-chrome');
const assert = require('sinon').assert;

describe('background.js', function() {
    beforeAll(function() {
        global.chrome = chrome;
    });

    beforeEach(function() {
        chrome.flush();
        jest.resetModules();

        require('../../crx/background');
    });

    it('should send "test-activate" when tab activated', function() {
        const tabId = 123;
        chrome.tabs.onActivated.trigger({
            tabId
        });

        assert.calledOnce(chrome.tabs.sendMessage.withArgs(tabId, {
            event: 'test-activate'
        }));
    });
    it('should update icon by default', function() {
        expectUpdateIcon(false);
    });
    it('should update icon when received "set-icon"', function() {
        chrome.runtime.onMessage.trigger({
            event: 'set-icon',
            active: true
        });

        expectUpdateIcon(true);
    });
    it('should ignore when received other messages', function() {
        chrome.runtime.onMessage.trigger({
            event: 'other-event'
        });

        // only the init update called
        assert.calledOnce(chrome.browserAction.setBadgeText);
        assert.calledOnce(chrome.browserAction.setBadgeBackgroundColor);
    });
});

function expectUpdateIcon(active) {
    assert.calledOnce(chrome.browserAction.setBadgeText.withArgs({
        text: active ? 'on' : 'off'
    }));
}
