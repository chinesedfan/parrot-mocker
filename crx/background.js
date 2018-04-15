chrome.tabs.onActivated.addListener(function(activeInfo) {
    chrome.tabs.sendMessage(activeInfo.tabId, {
        event: 'test-activate'
    });
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
    if (message.event === 'set-icon') {
        update_icon(message.active);
    }
});
update_icon(false);

function update_icon(active) {
    chrome.browserAction.setBadgeText({
        text: active ? 'on' : 'off'
    });
    chrome.browserAction.setBadgeBackgroundColor({
        color: active ? [0, 100, 0, 200] : [128, 128, 128, 200]
    });
}
