var cst = require('../src/common/constants.js');
var cookies = require('../src/common/cookies.js');
var parrot = require('../dist/parrot.js');

var handlers = {
    'mode-change': function(message) {
        if (message.enabled) {
            // sync info from crx storage to page storage
            if (message.duration) localStorage.setItem(cst.LS_MOCK_DURATION, message.duration);
            if (message.skipRules) localStorage.setItem(cst.LS_MOCK_SKIP_RULES, message.skipRules);

            writeCookie(cst.COOKIE_MOCK_ENABLED, cst.COOKIE_MOCK_ENABLED_OK);
            writeCookie(cst.COOKIE_MOCK_SERVER, message.server);
            writeCookie(cst.COOKIE_MOCK_CLIENTID, message.clientid);
        } else {
            removeCookie(cst.COOKIE_MOCK_ENABLED);
        }
        send_icon_message(message.enabled);

        var reg = new RegExp(cst.QUERY_MOCK_ENABLED + '=[^&]+');
        if (reg.test(location.href)) {
            // remove the special parameter to avoid the cookie is written back
            location.href = location.href.replace(reg, cst.QUERY_MOCK_ENABLED + '=');
        } else {
            location.reload();
        }
    },
    'test-activate': function(message) {
        send_icon_message(isActive());
    },
    'query-status': function(message, sender, sendResponse) {
        sendResponse({
            debug: cookies.getItem(document.cookie, cst.COOKIE_MOCK_DEBUG),
            locked: !!document.getElementById('parrot-mock-web-mark'), // issue #2
            ishttps: location.protocol === 'https:',
            enabled: isActive(),
            server: cookies.getItem(document.cookie, cst.COOKIE_MOCK_SERVER),
            clientid: cookies.getItem(document.cookie, cst.COOKIE_MOCK_CLIENTID)
        });
    }
};

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    var event = message.event;

    var handler = handlers[event];

    handler && handler(message, sender, sendResponse);
});

var script = document.createElement('script');
script.innerHTML = parrot;
document.documentElement.appendChild(script);

setTimeout(function() {
    // delay to wait the injected script updated the cookie according to url parameters
    send_icon_message(isActive());
}, 200);

function writeCookieHelper(key, value, vEnd) {
    cookies.setItem(key, value, vEnd, '/', location.hostname);
}
function writeCookie(key, value) {
    var duration = localStorage.getItem(cst.LS_MOCK_DURATION);
    duration = parseInt(duration) || 1;

    writeCookieHelper(key, value, 24 * 60 * 60 * duration);
}
function removeCookie(key) {
    writeCookieHelper(key, '', 'Thu, 01 Jan 1970 00:00:00 GMT');
}

function isActive() {
    return cookies.getItem(document.cookie, cst.COOKIE_MOCK_ENABLED) === cst.COOKIE_MOCK_ENABLED_OK;
}
function send_icon_message(active) {
    chrome.runtime.sendMessage({
        event: 'set-icon',
        active: active
    });
}
