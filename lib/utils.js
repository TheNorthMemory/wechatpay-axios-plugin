const { AssertionError } = require('assert');
const { format } = require('util');

// Discussion on axios/axios#3032, the `utils` is not a public API of axios.
// Using directly may not works in that future release.
const utils = require('axios/lib/utils');
const { version: axiosVersion } = require('axios/package.json');
const { name: pkgName, version: pkgVersion } = require('../package.json');

// Self extends ...
utils.extend(utils, {
  /**
   * Similar to `isStandardBrowserEnv`, just check it's running in a Node environment
   *
   * @return {boolean} Ture on Node, otherwise false
   */
  isProcessEnv() {
    return typeof process !== 'undefined' && toString.call(process) === '[object process]';
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
  isProcessFormData(val) {
    // @see {@link https://github.com/TheNorthMemory/wechatpay-axios-plugin/issues/22}
    return this.isProcessEnv() && this.isObject(val) && toString.call(val) === '[object FormData]';
  },

  /**
   * Compose the `User-Agent` content
   *
   * @returns {string} - The `User-Agent` value
   */
  userAgent() {
    const { platform, arch, versions: { node: nodeVersion } } = process;

    return `${pkgName}/${pkgVersion} axios/${axiosVersion} node/${nodeVersion} ${platform}/${arch}`;
  },

  /**
   * Customize an `AssertionError` with the original `data`, minimum implementated the `AxiosResponse` stucture.
   *
   * Note here: It's not a good idea that thrown the `AssertionError` from `axios.transformData` `forEach` stack.
   *            The fulfilled `AxiosResponse` is `{ status, statusText, headers, config, request }`,
   *            here can only touched the `data` and `headers`, postpone onto next major version to re-design.
   *
   * @param {string} message - The message
   * @param {string|object|any} response - the response
   * @param {string[]|int[]} ...params - the params
   *
   * @return {Error} - The customized Error
   */
  implicityReturnValues(message, response, ...params) {
    const error = new AssertionError({ message: format(message, ...params) });
    error.response = response;

    return error;
  },
});

module.exports = utils;
