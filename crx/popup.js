document.addEventListener('DOMContentLoaded', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var eleInput = document.getElementById('mockserver');
        var eleMsg = document.getElementsByClassName('msg')[0];
        var eleBtn = document.getElementsByClassName('btn')[0];

        var status = {
            event: 'mode-change',
            enabled: false,
            clientid: '',
            server: ''
        };

        chrome.tabs.sendMessage(tabs[0].id, {event: 'query-status'}, function(res) {
            if (!res) return;
            status.enabled = res.enabled;
            status.clientid = res.clientid || '';
            status.server = decodeURIComponent(res.server || '');

            updateStatus();
        });

        eleBtn.addEventListener('click', function() {
            if (status.enabled) {
                status.enabled = false;
                chrome.tabs.sendMessage(tabs[0].id, status);
                updateStatus();
                return;
            }

            chrome.cookies.get({
                url: eleInput.value,
                name: '__mock_clientid'
            }, function(cookie) {
                if (chrome.runtime.lastError || !cookie) {
                    eleMsg.innerHTML = 'No client id is found!';
                    return;
                }

                status.server = eleInput.value;
                status.clientid = cookie.value;
                status.enabled = !status.enabled;

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
    if (status.enabled) {
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
    if (status.enabled) {
        eleBtn.innerHTML = 'Click to Stop';
        eleBtn.className = 'btn stop';
    } else {
        eleBtn.innerHTML = 'Click to Mock';
        eleBtn.className = 'btn';
    }
}
