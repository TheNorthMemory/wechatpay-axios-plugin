const assert = require('assert');
const { XMLParser, XMLBuilder } = require('fast-xml-parser');
const Hash = require('./hash');

const SECRET = Symbol('SECRET');
const MCHID = Symbol('MCHID');

const parser = new XMLParser({
  ignoreDeclaration: true,
  parseTagValue: false,
  processEntities: false,
});

const builder = new XMLBuilder({
  suppressEmptyNode: true,
  processEntities: false,
  tagValueProcessor(_, val) { return /[>'&"<]/.test(val) ? `<![CDATA[${val}]]>` : `${val}`; },
});

/**
 * An Axios customizaton transform.
 */
class Transformer {
  /**
   * @property {string} mchid - The merchant ID
   * @deprecated - Not works well under the multi-tenants environment.
   * @since 0.8.15
   */
  static get mchid() { return this[MCHID]; }

  /**
   * @deprecated - Not works well under the multi-tenants environment.
   * @since 0.8.15
   * @param {string} value - The merchant ID
   */
  static set mchid(value) { this[MCHID] = value; }

  /**
   * @property {string} secret - The merchant secret key string
   * @deprecated - Not works well under the multi-tenants environment.
   * @since 0.8.15
   */
  static get secret() { return this[SECRET]; }

  /**
   * @deprecated - Not works well under the multi-tenants environment.
   * @since 0.8.15
   * @param {string} value - The merchant secret key string
   */
  static set secret(value) { this[SECRET] = value; }

  /**
   * Compose the pre-request data signature
   *
   * Note here: While the [MCHID] is set, then checking the input data matching with it.
   *
   * @deprecated - Not works well under the multi-tenants environment.
   * @since 0.8.15
   * @param {object} data - The API request parameters
   * @return {object} - With data signature
   */
  static signer(data) {
    const { sign_type: type = 'MD5' } = data;
    const mchid = data.mch_id || data.mchid || data.combine_mch_id;
    if (Transformer.mchid) {
      assert.ok(Transformer.mchid === mchid, `The data.mch_id(${mchid}) doesn't matched init one(${Transformer.mchid})`);
    }

    Object.assign(data, { sign: Hash.sign(type, data, Transformer.secret) });

    return data;
  }

  /**
   * Translation the javascript's object to the XML string
   * @param {object} data - The API request parameters
   * @return {string} - XML string
   */
  static toXml(data) {
    if (data === undefined) { throw new TypeError('The input arguments is reqiuired'); }

    return builder.build({ xml: data });
  }

  /**
   * @deprecated - Not works well under the multi-tenants environment.
   * @since 0.8.15
   * @property {array} request - @see {import('axios').AxiosTransformer}
   */
  static get request() {
    return [this.signer, this.toXml];
  }

  /**
   * Translation the XML string to the javascript's object.
   * @param {string} xml - XML string
   * @return {object} - Parsed as object for xml
   */
  static toObject(xml) {
    if (xml === undefined) { return xml; }

    if (Buffer.isBuffer(xml) && !xml.byteLength) { return null; }

    const obj = parser.parse(xml);
    const root = Object.keys(obj)[0];

    return root && root !== '__proto__' ? obj[root] : undefined;
  }

  /**
   * Validation the response data with the `sign` string.
   *
   * @deprecated - Not works well under the multi-tenants environment.
   * @since 0.8.15
   * @param {object} data - The API response data
   * @return {object} - The API response data
   */
  static verifier(data) {
    const type = data && data.sign && data.sign.length === 64 ? 'HMAC-SHA256' : 'MD5';
    const sign = Hash.sign(type, data, Transformer.secret);
    assert.ok(Hash.equals(sign, data.sign), `the response's sign(${data.sign}) doesn't matched the local calculated(${sign})`);

    return data;
  }

  /**
   * @deprecated - Not works well under the multi-tenants environment.
   * @since 0.8.15
   * @property {array} response - @see {import('axios').AxiosTransformer}
   */
  static get response() {
    return [this.toObject, this.verifier];
  }

  static get default() { return this; }
}

module.exports = Transformer;
