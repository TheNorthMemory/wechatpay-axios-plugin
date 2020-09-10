const crypto = require('crypto')
const fmt = require('./formatter')

/**
 * Crypto hash functions utils.
 * Specification @link https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=4_3
 */
class Hash {
  /**
   * Calculate the input string with a secret `key` in MD5
   * @param {string} str - The input string.
   * @param {string} key - The secret key string.
   * @return {string} - data signature
   */
  static md5(str, key) {
    return crypto.createHash('md5').update(`${str}&key=${key}`).digest('hex')
  }

  /**
   * Calculate the input string with a secret `key` in HMAC-SHA256
   * @param {string} str - The input string.
   * @param {string} key - The secret key string.
   * @return {string} - data signature
   */
  static hmacSha256(str, key) {
    return crypto.createHmac('sha256', key).update(`${str}&key=${key}`).digest('hex')
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

    return alias[type](fmt.queryStringLike(fmt.ksort(data)), key).toUpperCase()
  }
}

module.exports = Hash
module.exports.default = Hash
