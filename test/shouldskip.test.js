const shouldSkip = require('../src/common/shouldskip.js');

describe('shouldSkip', function() {
    it('should always not skip if no rules', function() {
        expect(shouldSkip('xx.com', '')).toBe(false);
    });
    it('should always not skip if rules are empty lines', function() {
        expect(shouldSkip('', '\n')).toBe(false);
    });
    it('should not skip if it is an unmatched regexp', function() {
        expect(shouldSkip('xx.com', '/yy/')).toBe(false);
    });
    it('should not skip if it is an unmatched keyword', function() {
        expect(shouldSkip('xx.com', 'y')).toBe(false);
    });
    it('should skip if there is a matched regexp', function() {
        expect(shouldSkip('xx.com', '/xx/\nyy')).toBe(true);
    });
    it('should skip if there is a matched keyword', function() {
        expect(shouldSkip('xx.com', 'x\ny')).toBe(true);
    });
    it('should treat undefined host as empty string', function() {
        expect(shouldSkip(undefined, '\nyy'))
                .toEqual(shouldSkip('', '\nyy'));
        expect(shouldSkip(undefined, '/^$/\nyy'))
                .toEqual(shouldSkip('', '/^$/\nyy'));
    });
});
