var localStorage = window.localStorage;
var eles = document.querySelectorAll('.item [data-key]');
eles = Array.prototype.slice.call(eles);

// load
eles.forEach(function(el) {
    var key = el.getAttribute('data-key');
    var value = localStorage.getItem(key) || '';
    if (value && value != el.getAttribute('placeholder')) {
        el.value = value;
    }
});

// save
var eleBtn = document.querySelector('.btn');
var eleMsg = document.querySelector('.msg');
eleBtn.addEventListener('click', function() {
    var data = {};
    var invalid = eles.some(function(el) {
        var value = el.value;
        switch (el.getAttribute('data-type')) {
        case 'int':
            if (!/[1-9][0-9]*/.test(value)) {
                // TODO: if added other fields, update the text
                eleMsg.innerHTML = 'Cookie duration requires int.';
                return true;
            }
            value = parseInt(value);
            break;
        }
        data[el.getAttribute('data-key')] = value || el.getAttribute('placeholder');
    });
    if (invalid) return;

    Object.keys(data).forEach(function(key) {
        localStorage.setItem(key, data[key]);
    });
    eleMsg.innerHTML = '...done!';
});
eles.forEach(function(el) {
    el.addEventListener('input', function() {
        eleMsg.innerHTML = 'Hmm...';
    });
    el.addEventListener('focus', function() {
        this.select();
    });
});
