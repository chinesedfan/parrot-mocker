# parrot-mocker

This package supports to intercept XHR/JSONP/Fetch requests and forward to the specified [mock server](https://github.com/chinesedfan/parrot-mocker-web).

## How to use

### Chrome plugin

Sorry for that I don't have a Google developer account to publish the plugin. But you can load the plugin by following Google's [development guide](https://developer.chrome.com/extensions/getstarted#unpacked). The plugin folder is `crx`, or use the packed .crx file from [releases](https://github.com/chinesedfan/parrot-mocker/releases).

If the plugin is disabled by Chrome, you can install it again.

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

## Acknowledgement

* [whatwg-fetch](https://www.npmjs.com/package/whatwg-fetch), fetch polyfill
* [mozilla-doc-cookies](https://www.npmjs.com/package/mozilla-doc-cookies), cookie utils
* [cortex-cookie-manager](https://github.com/cortexjs/cortex-cookie-manager), crx sample
