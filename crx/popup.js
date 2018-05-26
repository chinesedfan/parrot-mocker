var cst = (function(exports) {
    // copy from src/common/constants.js
    exports.LS_MOCK_SERVER = '__mock_server';
    exports.LS_MOCK_DURATION = '__mock_duration';
    exports.LS_MOCK_SKIP_RULES = '__mock_skip_rules';

    return exports;
})({});

document.addEventListener('DOMContentLoaded', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var eleInput = document.getElementById('mockserver');
        var eleMsg = document.getElementsByClassName('msg')[0];
        var eleBtn = document.getElementsByClassName('btn')[0];
        var eleSettings = document.getElementById('btn-settings');

        var status = {
            event: 'mode-change',
            locked: true, // whether the plugin is locked
            ishttps: false, // whether the page is https
            enabled: false, // whether the mock is enabled
            clientid: '',
            server: '',
            duration: 1,
            skipRules: ''
        };

        chrome.tabs.sendMessage(tabs[0].id, {event: 'query-status'}, function(res) {
            if (!res) {
                eleMsg.innerHTML = 'No content.js loaded.';
                updateEleBtn(eleBtn, status);
                return;
            }

            status.locked = res.locked;
            status.ishttps = res.ishttps;
            status.enabled = res.enabled;
            status.clientid = res.clientid || '';
            status.server = decodeURIComponent(res.server || localStorage.getItem(cst.LS_MOCK_SERVER));

            updateStatus();
        });

        eleInput.addEventListener('focus', function() {
            this.select();
        });
        eleInput.addEventListener('keydown', function(e) {
            /* istanbul ignore else */
            if (e.keyCode === 13) { // enter
                eleBtn.click();
            }
        });
        eleSettings.addEventListener('click', function() {
            chrome.runtime.openOptionsPage();
        });
        eleBtn.addEventListener('click', function() {
            if (status.locked) return;

            // disable
            if (status.enabled) {
                status.enabled = false;
                chrome.tabs.sendMessage(tabs[0].id, status);
                updateStatus();
                return;
            }

            // enable
            if (status.ishttps && !/^https:/.test(eleInput.value)) {
                eleMsg.innerHTML = 'HTTPS pages require HTTPS mock server!';
                return;
            }

            chrome.cookies.get({
                url: eleInput.value,
                name: '__mock_clientid'
            }, function(cookie) {
                if (chrome.runtime.lastError || !cookie) {
                    eleMsg.innerHTML = 'No client id is found in this mock server!';
                    return;
                }

                status.server = eleInput.value;
                status.clientid = cookie.value;
                status.enabled = !status.enabled;
                status.duration = localStorage.getItem(cst.LS_MOCK_DURATION);
                status.skipRules = localStorage.getItem(cst.LS_MOCK_SKIP_RULES);

                chrome.tabs.sendMessage(tabs[0].id, status);
                updateStatus();
            });
        });

        function updateStatus() {
            updateEleInput(eleInput, status);
            updateEleMsg(eleMsg, status);
            updateEleBtn(eleBtn, status);
        }
    });
});

function updateEleInput(eleInput, status) {
    eleInput.value = status.server;

    if (status.enabled) {
        eleInput.setAttribute('disabled', 'true');
    } else {
        eleInput.removeAttribute('disabled');
    }
}
function updateEleMsg(eleMsg, status) {
    var msg;
    if (status.locked) {
        msg = 'Don\'t use at the mocker website!';
    } else if (status.enabled) {
        if (status.clientid) {
            msg = 'Hi, ' + status.clientid + ', I\'m mocking!';
        } else {
            msg = 'Invalid! Mocking without client id!';
        }
    } else {
        if (status.clientid) {
            msg = 'Hi, ' + status.clientid + ', I\'m ready!';
        } else {
            msg = 'Hmm...';
        }
    }
    eleMsg.innerHTML = msg;
}
function updateEleBtn(eleBtn, status) {
    if (status.locked) {
        eleBtn.innerHTML = 'Unable to Mock';
        eleBtn.className = 'btn disabled';
    } else if (status.enabled) {
        eleBtn.innerHTML = 'Click to Stop';
        eleBtn.className = 'btn stop';
    } else {
        eleBtn.innerHTML = 'Click to Mock';
        eleBtn.className = 'btn';
    }
}
