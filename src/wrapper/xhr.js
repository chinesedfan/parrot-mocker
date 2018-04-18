function init(wrapUrl) {
    var xhr = window.XMLHttpRequest;
    /* istanbul ignore else */
    if (xhr) {
        var open = xhr.prototype.open;
        xhr.prototype.open = function() {
            arguments[1] = wrapUrl(arguments[1]);
            open.apply(this, arguments);
        };
        window.XMLHttpRequest = xhr;
    }
}

module.exports = {
    init: init
};
