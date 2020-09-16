const assert = require('assert')
const {Parser, Builder} = require('xml2js')
const hash = require('./hash')

/*eslint-disable-next-line*/
const SECRET = Symbol('SECRET')

/*eslint-disable-next-line*/
const MCHID = Symbol('MCHID')

/**
 * An Axios customizaton transform.
 */
class Transformer {
  /**
   * @property {string} mchid - The merchant ID
   */
  static get mchid() { return this[MCHID] }
  static set mchid(value) { this[MCHID] = value }

  /**
   * @property {string} secret - The merchant secret key string
   */
  static get secret() { return this[SECRET] }
  static set secret(value) { this[SECRET] = value }

  /**
   * Compose the pre-request data signature
   *
   * Note here: While the [MCHID] is set, then checking the input data matching with it.
   *
   * @param {object} data - The API request parameters
   * @return {object} - With data signature
   */
  static signer(data) {
    const {sign_type: type = `MD5`, mch_id: mchid} = data
    Transformer.mchid === void 0 || assert.ok(
      Transformer.mchid === mchid,
      `The data.mch_id(${mchid}) doesn't matched init one(${Transformer.mchid})`
    )

    Object.assign(data, {sign: hash.sign(type, data, Transformer.secret)})

    return data
  }

  /**
   * Translation the javascript's object to the XML string
   * @param {object} data - The API request parameters
   * @return {string} - XML string
   */
  static toXml(data) {
    return new Builder({
      rootName: `xml`,
      cdata: true,
      headless: true,
      renderOpts: {
        pretty: false
      },
    }).buildObject(data)
  }

  /**
   * @property {array} request - @see {import('axios').AxiosTransformer}
   */
  static get request() {
    return [this.signer, this.toXml]
  }

  /**
   * Translation the XML string to the javascript's object.
   * @param {object} xml - The API request parameters
   * @return {string} - XML string
   */
  static toObject(xml) {
    let obj
    new Parser({
      trim: true,
      explicitArray: false,
      explicitRoot: false,
    }).parseString(xml, (_, data) => (obj = data))

    return obj
  }

  /**
   * Validation the response data with the `sign` string.
   * @param {object} data - The API response data
   * @return {object} - The API response data
   */
  static verifier(data) {
    if (!(data && data.sign)) {
      return data
    }

    const type = data.sign.length == 64 ? `HMAC-SHA256` : `MD5`
    const sign = hash.sign(type, data, Transformer.secret)
    assert.ok(data.sign === sign, `the response's sign(${data.sign}) doesn't matched the local calculated(${sign})`)

    return data
  }

  /**
   * @property {array} response - @see {import('axios').AxiosTransformer}
   */
  static get response() {
    return [this.toObject, this.verifier]
  }
}

module.exports = Transformer
module.exports.default = Transformer
