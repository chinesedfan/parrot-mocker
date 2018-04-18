/**
 * @jest-environment jsdom
 */

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
