const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

let window;
let eles, eleMsg, eleBtn;
describe('options.js', function() {
    let script;

    beforeAll(function() {
        script = fs.readFileSync(path.resolve(__dirname, '../../crx/options.js')).toString();
    });

    beforeEach(function() {
        return JSDOM.fromFile(path.resolve(__dirname, '../../crx/options.html'), {
            runScripts: 'outside-only'
        }).then(function(dom) {
            window = dom.window;
            window.localStorage = {
                getItem: jest.fn(),
                setItem: jest.fn()
            };

            const document = window.document;
            eles = document.querySelectorAll('.item [data-key]');
            eleMsg = document.querySelector('.msg');
            eleBtn = document.querySelector('.btn');
        });
    });

    it('should select if focus', function() {
        window.eval(script);

        eles.forEach(function(el, i) {
            eles[i].onselect = jest.fn();
            window.eval(`
                document.querySelectorAll('.item [data-key]')[${i}].focus();
            `);

            expect(eles[i].onselect).toHaveBeenCalledTimes(1);
        });
    });
    it('should ignore if no data loaded', function() {
        window.eval(script);

        expect(eleMsg.innerHTML).toEqual('Hmm...');
        eles.forEach(function(el) {
            expect(el.value).toEqual('');
        });
    });
    it('should ignore if loaded data is the same with placeholders', function() {
        const values = {};
        eles.forEach(function(el) {
            values[el.getAttribute('data-key')] = el.getAttribute('placeholder');
        });

        mockLocalStorage(values);
        window.eval(script);

        expect(eleMsg.innerHTML).toEqual('Hmm...');
        eles.forEach(function(el) {
            expect(el.value).toEqual('');
        });
    });
    it('should load', function() {
        const values = {};
        eles.forEach(function(el) {
            values[el.getAttribute('data-key')] = Math.random() + '';
        });

        mockLocalStorage(values);
        window.eval(script);

        expect(eleMsg.innerHTML).toEqual('Hmm...');
        eles.forEach(function(el) {
            expect(el.value).toEqual(values[el.getAttribute('data-key')]);
        });
    });
    it('should save and update the message', function() {
        const values = {};
        eles.forEach(function(el) {
            values[el.getAttribute('data-key')] = el.getAttribute('placeholder');
        });

        mockLocalStorage(values);
        window.eval(script);
        window.eval(`
            document.querySelector('.btn').click();
        `);

        expect(eleMsg.innerHTML).toEqual('...done!');
        expect(window.localStorage.setItem).toHaveBeenCalledTimes(eles.length);

        const res = {};
        window.localStorage.setItem.mock.calls.forEach(function(args) {
             res[args[0]] = args[1];
        });
        expect(res).toEqual(values);
    });
});

function mockLocalStorage(values) {
    window.localStorage.getItem.mockImplementation(function(key) {
        return values[key];
    });
}
