// require all polyfills based on browserslist with use of babel preset-env builtInt: entry, same as deprecated @babel/polyfill.
// Adds some overhead bundle size-wise, but otherwise we would need
// make sure all node modules are es5 compliant or else transpile them.
// another option would be to provide 2 bundles, one  for modern browsers
// and  another for old ones.
require('regenerator-runtime/runtime');
require('core-js');

// TODO: use formatjs' polyfills, load dynamically
require('intl');
require('intl/locale-data/jsonp/en.js');

if (!HTMLCanvasElement.prototype.toBlob) {
  Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
    value: function (callback, type, quality) {
      var canvas = this;
      setTimeout(function () {
        var binStr = atob(canvas.toDataURL(type, quality).split(',')[1]),
          len = binStr.length,
          arr = new Uint8Array(len);

        for (var i = 0; i < len; i++) {
          arr[i] = binStr.charCodeAt(i);
        }

        callback(new Blob([arr], { type: type || 'image/png' }));
      });
    }
  });
}
