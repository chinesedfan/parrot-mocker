var host = '//parrotmocker.leanapp.cn';

(function() {
    testXhr();
    testJsonp();
    testFetch();
})();

function testXhr() {
    var msg;

    $.ajax({
        url: host + '/api/testxhr',
        timeout: 2000,
        success: function(json) {
            if (json && json.code == 200) {
                msg = json.msg;
            } else {
                msg = 'Invalid response';
            }
        },
        error: function() {
            msg = 'Bad xhr';
        },
        complete: function() {
            $('#xhr-result').text(msg);
        }
    });
}

function testJsonp() {
    var msg;

    $.ajax({
        url: host + '/api/testjsonp',
        dataType: 'jsonp',
        timeout: 2000,
        success: function(json) {
            if (json && json.code == 200) {
                msg = json.msg;
            } else {
                msg = 'Invalid response';
            }
        },
        error: function() {
            msg = 'Bad jsonp';
        },
        complete: function() {
            $('#jsonp-result').text(msg);
        }
    });
}

function testFetch() {
    window.fetch(host + '/api/testfetch', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 2000
    }).then(function(res) {
        if (!res || res.status != 200 || !res.ok) throw new Error('Bad response');
        return res.json();
    }).then(function(json) {
        if (json && json.code == 200) {
            return json.msg;
        } else {
            throw new Error('Invalid response');
        }
    }).catch(function() {
        return 'Bad fetch';
    }).then(function(msg) {
        $('#fetch-result').text(msg);
    });
}
