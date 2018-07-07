/**
 * @jest-environment jsdom
 */

const { JSDOM } = require('jsdom');
const { genVar, coverageVar } = require('../util.js');
const jsonp = require('../../src/wrapper/jsonp.js');

let wrapUrl;
describe('jsonp', function() {
    const originCreateElement = document.createElement;

    beforeAll(function() {
        wrapUrl = jest.fn().mockReturnValue('yy.com');
        jsonp.init(wrapUrl, /* 'callback|jsonp' */);
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
            win.oldCreateElement = win.document.createElement;
            // prepare in sub-jsdom
            if (window[coverageVar]) {
                // hack
                const sourceFileName = Object.keys(window[coverageVar])[0];
                const cv = genVar(sourceFileName);
                win[cv] = window[coverageVar][sourceFileName];
            }
            win.wrapUrl = wrapUrl;
            win.eval(`
                (${jsonp.init.toString()})(wrapUrl);
                window.script = document.createElement('script');
                script.src = 'path'; // do nothing

                window.script2 = oldCreateElement.call(document, 'script');
                script2.src = 'path2?callback=1'; // also do nothing
            `);

            expect(win.document.createElement).not.toBe(win.oldCreateElement);
            expect(wrapUrl).toHaveBeenCalledTimes(0);

            const script = win.script;
            expect(script.src).toEqual('https://xx.com/path');
            expect(script.getAttribute('src')).toEqual('path');
            const script2 = win.script2;
            expect(script2.src).toEqual('https://xx.com/path2?callback=1');
            expect(script2.getAttribute('src')).toEqual('path2?callback=1');
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
    it('should call wrapUrl when another default jsonpKey was used', function() {
        const script = document.createElement('script');
        script.src = 'xx.com?jsonp=jsonpcb';

        expect(wrapUrl).toHaveBeenCalledTimes(1);
        expect(wrapUrl).toHaveBeenCalledWith('xx.com?jsonp=jsonpcb', 'jsonp');
        expect(script.src).toEqual('yy.com');
    });
    it('should call wrapUrl when another jsonpKey was set', function() {
        // reset in the last test
        document.createElement = originCreateElement;
        jsonp.init(wrapUrl, 'cb');

        const script = document.createElement('script');
        script.src = 'xx.com?cb=jsonpcb';

        expect(wrapUrl).toHaveBeenCalledTimes(1);
        expect(wrapUrl).toHaveBeenCalledWith('xx.com?cb=jsonpcb', 'jsonp');
        expect(script.src).toEqual('yy.com');
    });
});
