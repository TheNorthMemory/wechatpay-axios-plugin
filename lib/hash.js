const {
  createHash, createHmac, timingSafeEqual, createSecretKey,
  KeyObject,
} = require('crypto');

const { queryStringLike, ksort } = require('./formatter');

/**
 * @typedef {import('node:crypto').CipherKey} CipherKey
 * @typedef {import('node:crypto').BinaryLike} BinaryLike
 */

const md5 = 'md5';
const hex = 'hex';
const sha256 = 'sha256';
const sha1 = 'sha1';
const ALGO_MD5 = 'MD5';
const ALGO_HMAC_SHA256 = 'HMAC-SHA256';

function isSymmetricKeyObject(thing) {
  return (thing instanceof KeyObject) && thing.type === 'secret';
}

/**
 * Crypto hash functions utils.
 */
class Hash {
  static ALGO_MD5 = ALGO_MD5

  static ALGO_HMAC_SHA256 = ALGO_HMAC_SHA256

  static isKeyObject = isSymmetricKeyObject

  static keyObjectFrom(thing) { return isSymmetricKeyObject(thing) ? thing : createSecretKey(thing); }

  /**
   * Calculate the input with an optional secret `key` in MD5,
   * when the `key` is Falsey, this method works as normal `MD5`.
   *
   * @since v0.9.2 - The first argument is supported a `KeyObject`.
   *
   * @param {BinaryLike|KeyObject} thing - The input.
   * @param {CipherKey} [key] - The secret key.
   * @param {boolean|number|string} [agency = false] - `true` or better of the `AgentId` value.
   *
   * @return {string} - data signature
   */
  static md5(thing, key = '', agency = false) {
    return createHash(md5)
      .update(thing instanceof KeyObject ? thing.export() : thing)
      .update(key ? (agency ? '&secret=' : '&key=') : '') /* eslint-disable-line no-nested-ternary */
      .update(key instanceof KeyObject ? key.export() : key)
      .digest(hex);
  }

  /**
   * Calculate the input string with a secret `key` as of `algorithm` string which is one of the 'sha256', 'sha512' etc.
   * @param {BinaryLike} thing - The input string.
   * @param {CipherKey} key - The secret key.
   * @param {string} [algorithm = sha256] - The algorithm string, default is `sha256`.
   * @return {string} - data signature
   */
  static hmac(thing, key, algorithm = sha256) {
    return createHmac(algorithm, key)
      .update(thing)
      .update('&key=')
      .update(key instanceof KeyObject ? key.export() : key)
      .digest(hex);
  }

  /**
   * Calculate the input in SHA1.
   * @param {BinaryLike} thing - The input.
   * @return {string} - data signature
   */
  static sha1(thing) {
    return createHash(sha1).update(thing).digest(hex);
  }

  /**
   * Calculate the input in SHA256.
   * @param {BinaryLike} thing - The input.
   * @return {string} - data signature
   */
  static sha256(thing) {
    return createHash(sha256).update(thing).digest(hex);
  }

  /**
   * Wrapping the builtins `crypto.timingSafeEqual` function.
   * @param {string} known - The string of known length to compare against.
   * @param {string?} [user] - The user-supplied string.
   * @return {boolean} - Returns true when the two are equal, false otherwise.
   */
  static equals(known, user) {
    const a = Buffer.from(known);
    const b = (user === undefined || user === null) ? undefined : Buffer.from(user);
    return Buffer.isBuffer(b) && a.length === b.length && timingSafeEqual(a, b);
  }

  /**
   * Utils of the data signature calculation.
   * @param {string} type - The sign type, one of the MD5 or HMAC-SHA256.
   * @param {object} data - The input data.
   * @param {CipherKey} key - The secret key.
   * @return {string} - The data signature.
   */
  static sign(type, data, key) {
    return {
      [ALGO_MD5]: this.md5,
      [ALGO_HMAC_SHA256]: this.hmac,
    }[type](queryStringLike(ksort(data)), key).toUpperCase();
  }

  static get default() { return this; }
}

module.exports = Hash;
