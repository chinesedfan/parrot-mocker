/**
 * @jest-environment jsdom
 */

const xhr = require('../../src/wrapper/xhr.js');

describe('xhr', function() {
    it('should call wrapUrl in XMLHttpRequest.prototype.open', function() {
        const open = XMLHttpRequest.prototype.open = jest.fn();
        const wrapUrl = jest.fn().mockReturnValue('yy.com');
        xhr.init(wrapUrl);

        const req = new XMLHttpRequest();
        req.open('GET', 'xx.com');

        expect(wrapUrl).toHaveBeenCalledTimes(1);
        expect(wrapUrl).toHaveBeenCalledWith('xx.com');
        expect(open).toHaveBeenCalledTimes(1);
        expect(open).toHaveBeenCalledWith('GET', 'yy.com');
    });
});
