/**
 * Provides easy used methods using in this project.
 */
class Formatter {

  /**
   * Generate a random string aka `nonce`, similar as `crypto.randomBytes`.
   *
   * @param {number} size - Nonce string length, default is 32 bytes.
   *
   * @returns {string} 62 radix random string.
   */
  static nonce(size = 32) {
    const chars = `0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`

    return `0`.repeat(size).replace(/0/g, _ => chars[Math.random()*62|0])
  }

  /**
   * Retrieve the current `Unix` timestamp.
   *
   * @returns {number} Epoch timestamp.
   */
  static timestamp() {
    return +(new Date)/1000|0
  }

  /**
   * Formatting for the heading `Authorization` value.
   *
   * @param {string} mchid - The merchant ID.
   * @param {string} nonce_str - The Nonce string.
   * @param {string} signature - The base64-encoded `Rsa.sign` ciphertext.
   * @param {string} timestamp - The `Unix` timestamp.
   * @param {string} serial_no - The serial number of the merchant public certification.
   *
   * @returns {string}
   */
  static authorization(mchid, nonce_str, signature, timestamp, serial_no) {
    return `WECHATPAY2-SHA256-RSA2048 mchid="${mchid}",nonce_str="${nonce_str}",signature="${signature}",timestamp="${timestamp}",serial_no="${serial_no}"`
  }

  /**
   * Formatting this `HTTP.request` for `Rsa.sign` input.
   *
   * @param {string} method - The merchant ID.
   * @param {string} uri - Combined string with `URL.pathname` and `URL.search`.
   * @param {string} timestamp - The `Unix` timestamp, should be the one used in `authorization`.
   * @param {string} nonce - The `Nonce` string, should be the one used in `authorization`.
   * @param {string} body - The playload string, HTTP `GET` should be an empty string.
   *
   * @returns {string}
   */
  static request(method, uri, timestamp, nonce, body = '') {
    return `${method}\n${uri}\n${timestamp}\n${nonce}\n${body}\n`
  }

  /**
   * Formatting this `HTTP.response` for `Rsa.verify` input.
   *
   * @param {string} timestamp - The `Unix` timestamp, should be the one from `response.headers[wechatpay-timestamp]`.
   * @param {string} nonce - The `Nonce` string, should be the one from `response.headers[wechatpay-nonce]`.
   * @param {string} body - The response payload string, HTTP status(`204`) should be an empty string.
   *
   * @returns {string}
   */
  static response(timestamp, nonce, body = '') {
    return `${timestamp}\n${nonce}\n${body}\n`
  }
}

module.exports = Formatter
module.exports.default = Formatter
