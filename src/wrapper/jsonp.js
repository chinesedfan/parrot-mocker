function init(wrapUrl, jsonpKey) {
    var createElement = document.createElement;
    var reg = new RegExp('(\\?|&)(' + (jsonpKey || 'callback|jsonp') + ')=');
    /* istanbul ignore else */
    if (createElement) {
        document.createElement = function(tag) {
            var node = createElement.call(document, tag);
            if (tag.toLowerCase() == 'script') {
                var getValue = function(value) {
                    return reg.test(value) ? wrapUrl(value, 'jsonp') : value;
                };

                var setAttribute = node.setAttribute;
                node.setAttribute = function(label, value) {
                    if (label.toLowerCase() == 'src') {
                        value = getValue(value);
                    }
                    setAttribute.call(node, label, value);
                };

                var desc = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(node), 'src');
                var setter = desc.set;
                desc.set = function(value) {
                    setter.call(this, getValue(value));
                };
                Object.defineProperty(node, 'src', desc);
            }
            return node;
        };
    }
}

module.exports = {
    init: init
};
