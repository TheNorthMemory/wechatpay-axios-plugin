// Discussion on axios/axios#3032, the `utils` is not a public API of axios.
// Using directly may not works in that future release.
const utils = require('axios/lib/utils')

// Self extends ...
utils.extend(utils, {
  /**
   * Similar to `isStandardBrowserEnv`, just check it's running in a Node environment
   *
   * @return {boolean} Ture on Node, otherwise false
   */
  isProcessEnv: function() {
    return typeof process !== 'undefined' && toString.call(process) === '[object process]'
  },

  /**
   * Determine if a value is a `form-data` node module
   *
   * @see https://github.com/axios/axios/issues/323
   * @see https://github.com/axios/axios/issues/3023
   *
   * @param {Object} val - To test value
   *
   * @returns {boolean} True if value is a `form-data` module, otherwise false
   */
  isProcessFormData: function (val) {
    // toString.call(val) returns `[object Object]`, let's checking the instance `toString`
    return this.isProcessEnv() && this.isObject(val) && val.toString() === '[object FormData]'
  },
})

module.exports = utils
