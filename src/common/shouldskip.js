/**
 * Returns true if rules matched
 *
 * @param {string} host - API host
 * @param {string} rules - filter rules
 * @return {bool} should skip or not
 */
module.exports = function(host, rules) {
    if (!rules) return false;

    var lines = rules.split('\n');
    for (var i = 0; i < lines.length; i++) {
        var str = lines[i];
        if (!str) continue;

        if (/^\/.*\/$/.test(str)) {
            var re = new RegExp(str.substring(1, str.length - 1));
            if (re.test(host || '')) return true;
        } else {
            // keyword
            return !!host && host.indexOf(str) >= 0;
        }
    }
    return false;
};
