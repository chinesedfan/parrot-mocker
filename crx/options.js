var localStorage = window.localStorage;
var eles = document.querySelectorAll('.item [data-key]');

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
    eles.forEach(function(el) {
        localStorage.setItem(el.getAttribute('data-key'), el.value || el.getAttribute('placeholder'));
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
