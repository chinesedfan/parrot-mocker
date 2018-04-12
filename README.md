# parrot-mocker [![npm version](https://badge.fury.io/js/parrot-mocker.svg)](https://badge.fury.io/js/parrot-mocker) [![Build Status](https://travis-ci.org/chinesedfan/parrot-mocker.svg?branch=master)](https://travis-ci.org/chinesedfan/parrot-mocker) [![License](https://img.shields.io/github/license/chinesedfan/parrot-mocker.svg)][license]

This package supports to intercept XHR/JSONP/Fetch requests and forward to the specified [mock server](https://github.com/chinesedfan/parrot-mocker-web).

## How to use

### Chrome plugin

Install from [Chrome web store](https://chrome.google.com/webstore/detail/parrotmocker/hdhamekapmnmceohfdbfelofidflfelm).

Or load the plugin by following Google's [development guide](https://developer.chrome.com/extensions/getstarted#unpacked). The plugin folder is `crx`.

If the development mode plugin is disabled by Chrome, you can uninstall and install it again.

### Standalone

```js
<head>
    <!-- Make sure to be loaded first -->
    <script type="text/javascript" src="dist/parrot.js"></script>
</head>
```

### Webpack

```js
// Modifiy webpack.config.js to prepend this package to dependencies of each entry
module.exports = {
    entry: ['parrot-mocker', './yours/src/entry.js']  
};
```

### Node.js

We export a function to rewrite the request url.

#### wrapUrl(urlStr, options)

- urlStr `string` the url of the API request
- options
    - reqType `string` the type of request, like `jsonp`
    - pageUrl `string` the url of the page
    - cookie `string` the cookie of the page request
    - shouldSkip `function` skip rewritting if returns true. By default, no host or including `local` will be filtered. Its arguments are:
        - host `string` the API host

For example, let's make a simple middleware for Koa,

```js
var fetch = require('node-fetch');
var wrapUrl = require('parrot-mocker').wrapUrl;

module.exports = function*(next) {
    this.fetch = (url, options) => {
        return fetch(wrapUrl(url, {
            pageUrl: this.url,
            cookie: this.header.cookie
        }));
    };

    yield* next;
};
```

## License

[MIT][license]

## Acknowledgement

* [whatwg-fetch](https://www.npmjs.com/package/whatwg-fetch), fetch polyfill
* [mozilla-doc-cookies](https://www.npmjs.com/package/mozilla-doc-cookies), cookie utils
* [cortex-cookie-manager](https://github.com/cortexjs/cortex-cookie-manager), crx sample

[license]: https://github.com/chinesedfan/parrot-mocker/blob/master/LICENSE
