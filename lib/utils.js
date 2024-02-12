const { AssertionError } = require('assert');
const { format } = require('util');

const { version: axiosVersion } = require('axios/package.json');
const { name: pkgName, version: pkgVersion } = require('../package.json');

const { isArray } = Array;

const { isBuffer } = Buffer;

const { toString } = {};

function isString(val) {
  return typeof val === 'string';
}

function isObject(val) {
  return val !== null && typeof val === 'object';
}

function isNumber(val) {
  return typeof val === 'number';
}

function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

function isPlainObject(val) {
  if (!isObject(val)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

function forEach(obj, fn) {
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  if (typeof obj !== 'object') {
    /* eslint no-param-reassign:0 */
    obj = [obj];
  }

  if (isArray(obj)) {
    for (let i = 0, l = obj.length; i < l; i += 1) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    Object.keys(obj).forEach((key) => fn.call(null, obj[key], key, obj));
  }
}

function merge(...args) {
  const result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (let i = 0, l = args.length; i < l; i += 1) {
    forEach(args[i], assignValue);
  }
  return result;
}

function isProcessEnv() {
  return typeof process !== 'undefined' && toString.call(process) === '[object process]';
}

function isProcessFormData(val) {
  return isProcessEnv() && isObject(val) && toString.call(val) === '[object FormData]';
}

module.exports = {
  isString,
  isNumber,
  isArray,
  isObject,
  isFunction,
  isStream,
  isBuffer,
  merge,

  /**
   * Similar to `isStandardBrowserEnv`, just check it's running in a Node environment
   *
   * @return {boolean} Ture on Node, otherwise false
   */
  isProcessEnv,

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
  isProcessFormData,

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
   * @return {AssertionError} - The customized AssertionError
   */
  implicityReturnValues(message, response, ...params) {
    const error = new AssertionError({ message: format(message, ...params) });
    error.response = response;

    return error;
  },
};
