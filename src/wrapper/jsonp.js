function init(wrapUrl) {
    var createElement = document.createElement;
    /* istanbul ignore else */
    if (createElement) {
        document.createElement = function(tag) {
            var node = createElement.call(document, tag);
            if (tag.toLowerCase() == 'script') {
                var setAttribute = node.setAttribute;
                node.setAttribute = function(label, value) {
                    if (label.toLowerCase() == 'src' && /(\?|\&)callback=/.test(value)) {
                        value = wrapUrl(value, 'jsonp');
                    }
                    setAttribute.call(node, label, value);
                };
                Object.defineProperty(node, 'src', {
                    set: function(value) {
                        this.setAttribute('src', value);
                    },
                    get: function() {
                        return this.getAttribute('src');
                    }
                });
            }
            return node;
        };
    }
}

module.exports = {
    init: init
};
