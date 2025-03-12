const assert = require('assert');
const { XMLParser, XMLBuilder } = require('fast-xml-parser');
const utils = require('./utils');
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
  if (utils.isStream(xml) || xml === undefined) { return xml; }

  if (utils.isBuffer(xml) && !xml.byteLength) { return null; }

  if (utils.isString(this.url) && utils.absPath(this.url) === SIGNLESS[0]) {
    return JSON.parse(xml);
  }

  const obj = parser.parse(xml);
  const root = Object.keys(obj)[0];

  return root && root !== '__proto__' ? obj[root] : undefined;
}

function isGetRequest(thing) { return utils.isObject(thing) && utils.isString(thing.method) && thing.method.toUpperCase() === 'GET'; }

/**
 * Translation the javascript's object to the XML string
 * @param {object} data - The API request parameters
 * @return {string} - XML string
 */
function stringify(data) {
  if (utils.isBuffer(data) || utils.isStream(data) || isGetRequest(this)) { return data; }
  if (!utils.isObject(data) && !utils.isString(data)) { throw new TypeError('The input is required.'); }

  return builder.build({ xml: data });
}

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
      const methodIsGet = isGetRequest(this);
      if (!methodIsGet && data === undefined) { throw new TypeError('The payload(data) must be an object or Buffer or Stream.'); }
      if (!methodIsGet && !utils.isObject(data)) { return data; }

      const inter = methodIsGet ? new URLSearchParams(this.params) : new Map(Object.entries(data));
      const type = inter.get('sign_type') || Hash.ALGO_MD5;
      const mchid = inter.get('mch_id') || inter.get('mchid') || inter.get('combine_mch_id');

      if (mch) {
        assert.ok(mch === mchid, `The ${methodIsGet ? 'params' : 'data'}'s merchant ID(${mchid}) doesn't matched the init one(${mch})`);
      }

      if (!(this.nonceless && NONCELESS.includes(utils.absPath(this.url))) && !inter.has('nonce_str')) {
        inter.set('nonce_str', Formatter.nonce());
      }

      inter.set('sign', Hash.sign(type, Object.fromEntries(inter.entries()), key));

      return methodIsGet ? data : Object.fromEntries(inter.entries());
    };
  }

  get verifier() {
    const key = this[SECRET];

    return function verifier(data, headers, status) {
      const pathname = utils.isString(this.url) && utils.absPath(this.url);
      if (pathname === SIGNLESS[0] && utils.isObject(data) && data.retcode !== 0) {
        return utils.buildBusinessError(
          { data, headers, status },
          'Verify the response\'s data is failed because %s\'s value is %s.',
          'EV2_RES_RESULT_CODE_NOT_MATCHED',
          'retcode', data.retcode,
        );
      }
      if (pathname !== SIGNLESS[0] && utils.isObject(data)
        && (data.return_code !== SUCCESS || (Object.prototype.hasOwnProperty.call(data, 'result_code') && data.result_code !== SUCCESS))) {
        return utils.buildBusinessError(
          { data, headers, status },
          'Verify the response\'s data is failed because %s\'s value is %s.',
          'EV2_RES_STATUS_CODE_NOT_SUCESS',
          ...(
            data.return_code !== SUCCESS
              ? ['return_code', data.return_code]
              : ['result_code', data.result_code]
          ),
        );
      }
      if (SIGNLESS.includes(pathname)) {
        return data;
      }

      const type = data && data.sign && data.sign.length === 64 ? Hash.ALGO_HMAC_SHA256 : Hash.ALGO_MD5;
      const sign = Hash.sign(type, data, key);
      if (!Hash.equals(sign, data.sign)) {
        return utils.buildBusinessError(
          { data, headers, status },
          'The response\'s sign(%s) doesn\'t matched the local calculated(%s).',
          'EV2_RES_SIGNATURE_NOT_EQUAL',
          data.sign,
          sign,
        );
      }

      return data;
    };
  }

  get request() { return [this.signer, stringify]; }

  get response() { return [parse, this.verifier]; }

  static toObject = parse

  static toXml = stringify

  static get default() { return this; }
}

module.exports = Transformer;
