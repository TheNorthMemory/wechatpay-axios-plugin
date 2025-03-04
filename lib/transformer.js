const assert = require('assert');
const { XMLParser, XMLBuilder } = require('fast-xml-parser');
const Hash = require('./hash');
const Formatter = require('./formatter');

const SECRET = Symbol('SECRET');
const MCHID = Symbol('MCHID');
const SUCCESS = 'SUCCESS';
const NONCELESS = [
  '/cgi-bin/mch/customs/customdeclareorder',
  '/cgi-bin/mch/customs/customdeclarequery',
  '/cgi-bin/mch/newcustoms/customdeclareredeclare',
  '/papay/deletecontract',
  '/papay/h5entrustweb',
  '/papay/preentrustweb',
  '/papay/querycontract',
  '/papay/partner/h5entrustweb',
  '/papay/partner/preentrustweb',
  '/papay/partner/querycontract',
  '/pay/queryexchagerate',
  '/secapi/mch/addInstitutionsub',
  '/secapi/mch/addsubdevconfig',
  '/secapi/mch/channelsetting',
  '/secapi/mch/modifyInstitutionsub',
  '/secapi/mch/modifymchinfo',
  '/secapi/mch/queryInstitutionsub',
  '/secapi/mch/querysubdevconfig',
];
const SIGNLESS = [
  '/appauth/getaccesstoken',
  '/mchrisk/querymchrisk',
  '/mchrisk/setmchriskcallback',
  '/mchrisk/syncmchriskresult',
  '/mmpaymkttransfers/gethbinfo',
  '/mmpaymkttransfers/gettransferinfo',
  '/mmpaymkttransfers/pay_bank',
  '/mmpaymkttransfers/promotion/paywwsptrans2pocket',
  '/mmpaymkttransfers/promotion/querywwsptrans2pocket',
  '/mmpaymkttransfers/promotion/transfers',
  '/mmpaymkttransfers/query_bank',
  '/mmpaymkttransfers/sendminiprogramhb',
  '/mmpaymkttransfers/sendredpack',
  '/papay/entrustweb',
  '/papay/h5entrustweb',
  '/papay/partner/entrustweb',
  '/papay/partner/h5entrustweb',
  '/pay/downloadbill',
  '/pay/downloadfundflow',
  '/payitil/report',
  '/risk/getpublickey',
  '/risk/getviolation',
  '/secapi/mch/submchmanage',
  '/xdc/apiv2getsignkey/sign/getsignkey',
];

const parser = new XMLParser({
  ignoreDeclaration: true,
  parseTagValue: false,
  processEntities: true,
});

const builder = new XMLBuilder({
  suppressEmptyNode: true,
  processEntities: false,
  tagValueProcessor(_, val) { return /[>'&"<]/.test(val) ? `<![CDATA[${val}]]>` : `${val}`; },
});

/**
 * Translation the XML string to the javascript's object.
 * @param {string} xml - XML string
 * @return {object} - Parsed as object for xml
 */
function parse(xml) {
  if (xml === undefined) { return xml; }

  if (Buffer.isBuffer(xml) && !xml.byteLength) { return null; }

  const obj = parser.parse(xml);
  const root = Object.keys(obj)[0];

  return root && root !== '__proto__' ? obj[root] : undefined;
}

/**
 * Translation the javascript's object to the XML string
 * @param {object} data - The API request parameters
 * @return {string} - XML string
 */
function stringify(data) {
  if (data === undefined) { throw new TypeError('The input is required.'); }

  return builder.build({ xml: data });
}

/**
 * @param {string} str - pathname
 * @returns {string} - absolute pathname
 */
function absPath(str) { return '/'.concat(str).replace(/^\/{2,}/, '/'); }

/**
 * An Axios customizaton transform.
 */
class Transformer {
  /**
   * @param {string} mchid - The merchant ID
   * @param {string|Buffer} secret - The merchant secret key
   */
  constructor(mchid, secret) {
    this[MCHID] = mchid;
    this[SECRET] = secret;
  }

  get signer() {
    const key = this[SECRET];
    const mch = this[MCHID];

    /**
     * @param {object} data - The API request parameters
     * @return {object} - With data signature
     */
    return function signer(data) {
      const { sign_type: type = 'MD5' } = data;
      const mchid = data.mch_id || data.mchid || data.combine_mch_id;

      if (mch) {
        assert.ok(mch === mchid, `The data.mch_id(${mchid}) doesn't matched the init one(${mch})`);
      }

      if (!(this.nonceless && NONCELESS.includes(absPath(this.url))) && !data.nonce_str) {
        Object.assign(data, { nonce_str: Formatter.nonce() });
      }

      Object.assign(data, { sign: Hash.sign(type, data, key) });

      return data;
    };
  }

  get verifier() {
    const key = this[SECRET];

    /**
     * @param {object} data - The API response data
     * @return {object} - The API response data
     */
    return function verifier(data) {
      if (this.url && SIGNLESS.includes(absPath(this.url))) { return data; }

      if (data.return_code !== SUCCESS || (Object.prototype.hasOwnProperty.call(data, 'result_code') && data.result_code !== SUCCESS)) { return data; }

      const type = data && data.sign && data.sign.length === 64 ? 'HMAC-SHA256' : 'MD5';
      const sign = Hash.sign(type, data, key);
      assert.ok(Hash.equals(sign, data.sign), `the response's sign(${data.sign}) doesn't matched the local calculated(${sign})`);

      return data;
    };
  }

  get request() { return [this.signer, stringify]; }

  get response() { return [parse, this.verifier]; }

  static toObject = parse

  static toXml = stringify

  static get default() { return this; }

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
   * @deprecated - Not works well under the multi-tenants environment.
   * @since 0.8.15
   * @property {array} request - @see {import('axios').AxiosTransformer}
   */
  static get request() {
    return [this.signer, this.toXml];
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
}

module.exports = Transformer;
