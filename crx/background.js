chrome.tabs.onActivated.addListener(function(activeInfo) {
    chrome.tabs.sendMessage(activeInfo.tabId, {
        event: 'test-activate'
    });
});

chrome.extension.onMessage.addListener(function(message, sender, sendResponse){
    if (message.event === 'set-icon') {
        update_icon(message.active);
    }
});

function update_icon(active) {
    chrome.browserAction.setIcon({
        path: active ? 'img/icon-active-64.png' : 'img/icon-inactive-64.png'
    });
}
