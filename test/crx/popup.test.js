const chrome = require('sinon-chrome');
const assert = require('sinon').assert;

describe('background.js', function() {
    beforeAll(function() {
        global.chrome = chrome;
    });

    beforeEach(function() {
        chrome.flush();
        jest.resetModules();

        require('../../crx/popup');
    });

    describe('render', function() {
        it('should render correctly if is locked', function() {
        });
        it('should render correctly if is enabled and has client id', function() {
        });
        it('should render correctly if is enabled but no client id', function() {
        });
        it('should render correctly if is disabled and has client id', function() {
        });
        it('should render correctly if is disabled but no client id', function() {
        });
    });
    describe('mock button click', function() {
        it('should ignore if is locked', function() {
        });
        it('should ignore if https pages with non-https server', function() {
        });
        it('should ignore if no client id', function() {
        });
        it('should able to enable', function() {
        });
        it('should able to disable', function() {
        });
    });
});
