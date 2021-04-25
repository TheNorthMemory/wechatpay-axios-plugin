/* eslint no-bitwise: ["error", { "allow": ["|"] }] */
/**
 * Provides easy used methods using in this project.
 */
class Formatter {
  /**
   * Cast the `CSV` bill.
   *
   * @param {string|buffer} buffer - CSV file content.
   *
   * @returns {object} - The casted source intputs as {rows, summary} Object
   */
  static castCsvBill(buffer) {
    const data = Buffer.from(buffer).slice(3/* BOM(EFBBBF) */).toString().split(/\r?\n/);
    const list = data.slice(1, -3);
    const foot = data.slice(-3);
    const head = data.shift().split(',');
    const rows = list.map((row) => this.castCsvLine(row, head));
    const caption = foot.shift().split(',');
    const summary = this.castCsvLine(foot.shift(), caption);

    return { rows, summary };
  }

  /**
   * Cast the `CSV` line string by the keys named object.
   *
   * @param {string} row - CSV line.
   * @param {array} keys - CSV headers.
   * @param {string} skipFirstChar - Skip the first character of the CSV line, default is true.
   * @param {string} separator - Split separator, default is ',`' (two chars).
   *
   * @returns {object} - The casted source line as Object
   */
  static castCsvLine(row, keys = [], skipFirstChar = true, separator = ',`') {
    return (row || '').substring(skipFirstChar ? 1 : 0).split(separator).reduce(
      (pool, cell, idx) => Object.assign(pool, { [keys[idx] || idx]: cell }, pool),
      {},
    );
  }

  /**
   * Generate a random string aka `nonce`, similar as `crypto.randomBytes`.
   *
   * @param {number} size - Nonce string length, default is 32 bytes.
   *
   * @returns {string} 62 radix random string.
   */
  static nonce(size = 32) {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    return '0'.repeat(size).replace(/0/g, () => chars[Math.random() * 62 | 0]);
  }

  /**
   * Retrieve the current `Unix` timestamp.
   *
   * @returns {number} Epoch timestamp.
   */
  static timestamp() {
    return +(new Date()) / 1000 | 0;
  }

  /**
   * Formatting for the heading `Authorization` value.
   *
   * @param {string|number} mchid - The merchant ID.
   * @param {string} nonce - The Nonce string.
   * @param {string} signature - The base64-encoded `Rsa.sign` ciphertext.
   * @param {string|number} timestamp - The `Unix` timestamp.
   * @param {string} serial - The serial number of the merchant public certification.
   *
   * @returns {string} - The APIv3 Authorization `header` value
   */
  static authorization(mchid, nonce, signature, timestamp, serial) {
    return `WECHATPAY2-SHA256-RSA2048 mchid="${mchid}",nonce_str="${nonce}",signature="${signature}",timestamp="${timestamp}",serial_no="${serial}"`;
  }

  /**
   * Formatting this `HTTP.request` for `Rsa.sign` input.
   *
   * @param {string} method - The HTTP verb, must be the uppercase sting.
   * @param {string} uri - Combined string with `URL.pathname` and `URL.search`.
   * @param {string|number} timestamp - The `Unix` timestamp, should be the one used in `authorization`.
   * @param {string} nonce - The `Nonce` string, should be the one used in `authorization`.
   * @param {string} body - The playload string, HTTP `GET` should be an empty string.
   *
   * @returns {string} - The content for `Rsa.sign`
   */
  static request(method, uri, timestamp, nonce, body = '') {
    return this.joinedByLineFeed(method, uri, timestamp, nonce, body);
  }

  /**
   * Formatting this `HTTP.response` for `Rsa.verify` input.
   *
   * @param {string|number} timestamp - The `Unix` timestamp, should be the one from `response.headers[wechatpay-timestamp]`.
   * @param {string} nonce - The `Nonce` string, should be the one from `response.headers[wechatpay-nonce]`.
   * @param {string} body - The response payload string, HTTP status(`204`) should be an empty string.
   *
   * @returns {string} - The content for `Rsa.verify`
   */
  static response(timestamp, nonce, body = '') {
    return this.joinedByLineFeed(timestamp, nonce, body);
  }

  /**
   * Joined this inputs by for `Line Feed`(LF) char.
   *
   * @param {string[]} pieces - The string(s) joined by line feed.
   *
   * @returns {string} - The joined string.
   */
  static joinedByLineFeed(...pieces) {
    return [...pieces, ''].join('\n');
  }

  /**
   * Sorts an Object by key.
   *
   * @param {object} thing - The input object.
   *
   * @returns {object} - The sorted object.
   */
  static ksort(thing) {
    return Object.keys(thing).sort().reduce((des, key) => Object.assign(des, { [key]: thing[key] }), {});
  }

  /**
   * Like `queryString` does but without the `sign` and `empty value` entities.
   *
   * @param {object} thing - The input object.
   *
   * @returns {string} - The sorted object.
   */
  static queryStringLike(thing) {
    return Object.entries(thing).filter(([k, v]) => k !== 'sign' && v !== undefined && v !== '').map((i) => i.join('=')).join('&');
  }
}

module.exports = Formatter;
module.exports.default = Formatter;
