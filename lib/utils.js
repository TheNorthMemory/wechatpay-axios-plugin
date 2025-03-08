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

/**
 * @param {string} str - pathname
 * @returns {string} - absolute pathname
 */
function absPath(str) { return '/'.concat(str).replace(/^\/{2,}/, '/'); }

class BusinessError extends Error {}

module.exports = {
  isString,
  isNumber,
  isArray,
  isObject,
  isFunction,
  isStream,
  isBuffer,
  merge,
  format,
  absPath,
  BusinessError,

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
   * Customize a `BusinessError` for the `responseInterceptor` assertion.
   *
   * @param {string|object|any} response - the response
   * @param {string} message - The message
   * @param {string} code - The code
   * @param {string|number} params - the params
   *
   * @return {BusinessError} - The customized BusinessError
   */
  buildBusinessError(response, message, code, ...params) {
    const error = new BusinessError(format(message, ...params));
    error.code = code;
    error.response = response;

    return error;
  },
};
