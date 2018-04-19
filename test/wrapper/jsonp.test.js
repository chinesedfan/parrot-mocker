/**
 * @jest-environment jsdom
 */

const { JSDOM } = require('jsdom');
const { genVar, coverageVar } = require('../util.js');
const jsonp = require('../../src/wrapper/jsonp.js');

let wrapUrl;
describe('jsonp', function() {
    beforeAll(function() {
        wrapUrl = jest.fn().mockReturnValue('yy.com');
        jsonp.init(wrapUrl);
    });
    beforeEach(function() {
        wrapUrl.mockClear();
    });

    describe('no side effects', function() {
        it('should ignore non-script', function() {
            const script = document.createElement('img');
            script.src = 'xx.com?callback=jsonpcb';

            expect(wrapUrl).toHaveBeenCalledTimes(0);
            expect(script.src).toEqual('xx.com?callback=jsonpcb');
        });
        it('should ignore non-src', function() {
            const script = document.createElement('script');
            script.type = 'xx.com?callback=jsonpcb';

            expect(wrapUrl).toHaveBeenCalledTimes(0);
            expect(script.type).toEqual('xx.com?callback=jsonpcb');
        });
        it('should ignore non-jsonp src', function() {
            const script = document.createElement('script');
            script.src = 'xx.com';

            expect(wrapUrl).toHaveBeenCalledTimes(0);
            expect(script.src).toEqual('xx.com');
        });
        it('should not break src/getAttribute', function() {
            const dom = new JSDOM(``, {
                url: 'https://xx.com/otherpath',
                runScripts: 'outside-only'
            });
            const win = dom.window;
            const createElement = win.document.createElement;
            // prepare in sub-jsdom
            const sourceFileName = Object.keys(window[coverageVar])[0];
            const cv = genVar(sourceFileName);
            win[cv] = window[coverageVar][sourceFileName]; // hack
            win.wrapUrl = wrapUrl;
            win.eval(`
                (${jsonp.init.toString()})(wrapUrl);
                window.script = document.createElement('script');
                script.src = 'path';
            `);

            expect(win.document.createElement).not.toBe(createElement);
            expect(wrapUrl).toHaveBeenCalledTimes(0);

            const script = win.script;
            expect(script.src).toEqual('https://xx.com/path');
            expect(script.getAttribute('src')).toEqual('path');
        });
    });
    it('should call wrapUrl in script.src.setter', function() {
        const script = document.createElement('script');
        script.src = 'xx.com?callback=jsonpcb';

        expect(wrapUrl).toHaveBeenCalledTimes(1);
        expect(wrapUrl).toHaveBeenCalledWith('xx.com?callback=jsonpcb', 'jsonp');
        expect(script.src).toEqual('yy.com');
    });
    it('should call wrapUrl in script.setAttribute', function() {
        const script = document.createElement('script');
        script.setAttribute('src', 'xx.com?callback=jsonpcb');

        expect(wrapUrl).toHaveBeenCalledTimes(1);
        expect(wrapUrl).toHaveBeenCalledWith('xx.com?callback=jsonpcb', 'jsonp');
        expect(script.getAttribute('src')).toEqual('yy.com');
    });
});
