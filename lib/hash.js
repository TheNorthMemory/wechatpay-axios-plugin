const crypto = require('crypto')
const Formatter = require('./formatter')

/**
 * Crypto hash functions utils.
 * Specification @link https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=4_3
 */
class Hash {
  /**
   * Calculate the input string with an optional secret `key` in MD5,
   * when the `key` is Falsey, this method works as normal `MD5`.
   *
   * - [agency] is available since v0.4.3, spec @link https://work.weixin.qq.com/api/doc/90000/90135/90281
   *
   * @param {string|buffer} thing - The input string.
   * @param {string} [key] - The secret key string.
   * @param {boolean|number|string} [agency = false] - The secret **key** is from wework, placed with `true` or better of the `AgentId` value.
   *
   * @return {string} - data signature
   */
  static md5(thing, key = '', agency = false) {
    return crypto.createHash('md5').update(thing).update(`${key ? `&${agency ? `secret` : `key`}=${key}` : ``}`).digest('hex')
  }

  /**
   * Calculate the input string with a secret `key` in HMAC-SHA256
   * @param {string|buffer} thing - The input string.
   * @param {string} key - The secret key string.
   * @return {string} - data signature
   */
  static hmacSha256(thing, key) {
    return crypto.createHmac('sha256', key).update(thing).update(`&key=${key}`).digest('hex')
  }

  /**
   * Calculate the input in SHA1.
   * @param {string|buffer} thing - The input.
   * @return {string} - data signature
   */
  static sha1(thing) {
    return crypto.createHash('sha1').update(thing).digest('hex')
  }

  /**
   * Calculate the input in SHA256.
   * @param {string|buffer} thing - The input.
   * @return {string} - data signature
   */
  static sha256(thing) {
    return crypto.createHash('sha256').update(thing).digest('hex')
  }

  /**
   * Utils of the data signature calculation.
   * @param {string} type - The sign type, one of the MD5 or HMAC-SHA256.
   * @param {object} data - The input data.
   * @param {string} key - The secret key string.
   * @return {object} - With data signature
   */
  static sign(type, data, key) {
    const alias = {
      MD5: this.md5,
      'HMAC-SHA256': this.hmacSha256,
    }

    return alias[type](Formatter.queryStringLike(Formatter.ksort(data)), key).toUpperCase()
  }
}

module.exports = Hash
module.exports.default = Hash
