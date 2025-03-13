const assert = require('assert');
const debuglog = require('util').debuglog('wechatpay:decorator');

const { default: axios, mergeConfig, AxiosHeaders } = require('axios');

const Transformer = require('./transformer');
const Formatter = require('./formatter');
const utils = require('./utils');
const Hash = require('./hash');
const Rsa = require('./rsa');

const V2 = Symbol('XML PAYLOAD');
const V3 = Symbol('JSON PAYLOAD');

const MAXIMUM_CLOCK_OFFSET = 300;

const HTTP_WECHATPAY_NONCE = 'Wechatpay-Nonce';
const HTTP_WECHATPAY_SERIAL = 'Wechatpay-Serial';
const HTTP_WECHATPAY_SIGNATURE = 'Wechatpay-Signature';
const HTTP_WECHATPAY_TIMESTAMP = 'Wechatpay-Timestamp';

const ERR_INIT_MCHID_IS_MANDATORY = 'The merchant\' ID aka `mchid` is required, usually is numerical string.';
const ERR_INIT_SERIAL_IS_MANDATORY = 'The serial number of the merchant\'s certificate aka `serial` is required, usually hexadecial.';
const ERR_INIT_PRIVATEKEY_IS_MANDATORY = 'The merchant\'s private key aka `privateKey` is required, usual as pem format.';
const ERR_INIT_CERTS_IS_MANDATORY = 'The platform certificate(s) aka `certs` is required, paired as of `{$serial: $certificate}`.';
const ERR_INIT_CERTS_EXCLUDE_MCHSERIAL = 'The `certs` contains the merchant\'s certificate serial number which is not allowed here.';

const EV3_RES_HEADERS_INCOMPLATE = 'The response\'s Headers incomplete, must have(`%s`, `%s`, `%s` and `%s`).';
const EV3_RES_HEADER_TIMESTAMP_OFFSET = 'It\'s allowed time offset in ± %s seconds, the response(header:%s) was on %s, your\'s localtime on %s.';
const EV3_RES_HEADER_PLATFORM_SERIAL = 'Cannot found the serial(`%s`)\'s configuration, which\'s from the response(header:%s), your\'s %O.';
const EV3_RES_HEADER_SIGNATURE_DIGEST = 'Verify the response\'s data with: timestamp=%s, nonce=%s, signature=%s, cert={%s: ...} failed.';

const COMPLAINT = /\/v3\/merchant-service\/images\/(?!upload).{6,}/;
const DOWNLOADS = [
  '/v3/new-tax-control-fapiao/download',
  '/v3/transferdownload/elecvoucherfile',
  '/v3/transferdownload/signfile',
  '/v3/billdownload/file',
  '/v3/global/statements',
  '/v3/statements',
];

function isValidAsymmetricKey(thing) {
  return ((utils.isString(thing) || utils.isBuffer(thing)) && thing.length > 0) || Rsa.isKeyObject(thing);
}

/**
 * Decorate the `Axios` instance
 */
class Decorator {
  /**
   * @property {object} defaults - The defaults configuration whose pased in `Axios`.
   */
  static get defaults() {
    return {
      baseURL: 'https://api.mch.weixin.qq.com/',
      headers: {
        Accept: 'application/json, text/plain, application/x-gzip, application/pdf, image/png, image/*;q=0.5',
        'Content-Type': 'application/json; charset=utf-8',
        'User-Agent': utils.userAgent(),
      },
    };
  }

  /**
   * Create an APIv2's client
   *
   * @param {object} config - configuration
   * @param {string} [config.mchid] - The merchant ID
   * @param {string|Buffer} [config.secret] - The merchant secret key for APIv2
   * @param {object} [config.merchant] - The merchant certificates, more @see {import('tls').createSecureContext}
   * @param {string|Buffer} [config.merchant.cert] - The merchant certificate in PEM format
   * @param {string|Buffer} [config.merchant.key] - The merchant private key in PEM format
   * @param {string|Buffer} [config.merchant.pfx] - The merchant private key and certificate chain in PFX or PKCS12 format.
   * @param {string|Buffer} [config.merchant.passphrase] - The merchant shared passphrase used for a single private key and/or a PFX.
   *
   * @returns {AxiosInstance} - The axios instance
   */
  static xmlBased(config = {}) {
    const { mchid, secret } = config;

    let key;
    if (secret && (utils.isString(secret) || utils.isBuffer(secret)) && secret.length === 32) {
      key = Hash.keyObjectFrom(Buffer.from(secret));
      // hidden the `secret` key string
      Reflect.set(config, 'secret', key);
    }

    const trans = new Transformer(mchid, key);

    const cfg = mergeConfig(mergeConfig(this.defaults, config), {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        Accept: 'text/xml, text/plain, application/json, application/x-gzip',
      },
      responseType: 'text',
      transformRequest: [].concat(trans.request),
      transformResponse: [].concat(trans.response),
    });
    ['serial', 'privateKey', 'certs'].forEach((prop) => Reflect.deleteProperty(cfg, prop));

    const instance = axios.create(cfg);
    instance.interceptors.response.use(this.responseDetectorInterceptor());

    return instance;
  }

  /**
   * APIv3's requestInterceptor
   *
   * @return {function} Named `signer` function
   */
  static requestInterceptor() {
    return function signer(config) {
      const method = config.method.toUpperCase();
      const payload = JSON.stringify(
        // for media upload, while this instance had `meta` Object defined,
        // let's checking whether or nor the real `data` is a `multipart/form-data` compatible instance
        config.meta && utils.isProcessFormData(config.data) ? config.meta : config.data,
      );
      const nonce = Formatter.nonce();
      const timestamp = Formatter.timestamp();
      // `getUri` should missing some paths whose were on `baseURL`
      const url = new URL(axios.getUri(config), config.baseURL);
      debuglog('%o', url);

      const signature = Rsa.sign(
        Formatter.request(method, `${url.pathname}${url.search}`, timestamp, nonce, payload),
        config.privateKey,
      );

      // A community user(JAVA) was reported there, while it contains a duplicated 'Authorization' header(mean dup-values asof the HTTP spec),
      // The server side guns away with 500 status code. Let's force using the single calculated value anyway.
      Reflect.set(config, 'headers', AxiosHeaders.from(config.headers).set(
        'Authorization', Formatter.authorization(config.mchid, nonce, signature, timestamp, config.serial), true,
      ));
      debuglog('Headers %o', config.headers);

      return config;
    };
  }

  static responseDetectorInterceptor() {
    return function detector(thing) {
      if (utils.isObject(thing) && (thing.data instanceof utils.BusinessError)) {
        throw new axios.AxiosError(
          thing.data.message, thing.data.code,
          thing.config, thing.request,
          {
            status: thing.status,
            statusText: thing.statusText,
            headers: thing.headers,
            data: thing.data.response.data,
            config: thing.config,
            request: thing.request,
          },
        );
      }

      return thing;
    };
  }

  /**
   * APIv3's responseVerifier
   * @param  {object} certs The platform public keys configuration, `{serial: publicKey}` pair
   * @return {function} Named as `verifier` function
   */
  static responseVerifier(certs = {}) {
    return function verifier(data, headers, status) {
      /** @since v0.9.0 only detect the basis pathname which may contains `/hk` or behind of the `reserved-proxy-url` */
      const pathname = utils.isString(this.url) && utils.absPath(this.url);
      if (DOWNLOADS.includes(pathname) || COMPLAINT.test(pathname)) { return data; }

      /** @since v0.8.13 no need verification anymore while the HTTP status is not 20X code. */
      if (status && this.validateStatus && !this.validateStatus(status)) { return data; }

      const hdrs = AxiosHeaders.from(headers);

      if (!(hdrs.has(HTTP_WECHATPAY_TIMESTAMP) && hdrs.has(HTTP_WECHATPAY_NONCE) && hdrs.has(HTTP_WECHATPAY_SERIAL) && hdrs.has(HTTP_WECHATPAY_SIGNATURE))) {
        return utils.buildBusinessError(
          { data, headers, status },
          EV3_RES_HEADERS_INCOMPLATE, 'EV3_RES_HEADERS_INCOMPLATE',
          HTTP_WECHATPAY_NONCE, HTTP_WECHATPAY_SERIAL, HTTP_WECHATPAY_SIGNATURE, HTTP_WECHATPAY_TIMESTAMP,
        );
      }

      const [
        timestamp, nonce, serial, signature, localTimestamp,
      ] = [
        hdrs.get(HTTP_WECHATPAY_TIMESTAMP), hdrs.get(HTTP_WECHATPAY_NONCE),
        hdrs.get(HTTP_WECHATPAY_SERIAL), hdrs.get(HTTP_WECHATPAY_SIGNATURE),
        Formatter.timestamp(),
      ];

      if (Math.abs(localTimestamp - timestamp) > MAXIMUM_CLOCK_OFFSET) {
        return utils.buildBusinessError(
          { data, headers, status },
          EV3_RES_HEADER_TIMESTAMP_OFFSET, 'EV3_RES_HEADER_TIMESTAMP_OFFSET',
          MAXIMUM_CLOCK_OFFSET, HTTP_WECHATPAY_TIMESTAMP, timestamp, localTimestamp,
        );
      }

      if (!Object.prototype.hasOwnProperty.call(certs, serial)) {
        return utils.buildBusinessError(
          { data, headers, status },
          EV3_RES_HEADER_PLATFORM_SERIAL, 'EV3_RES_HEADER_PLATFORM_SERIAL',
          serial, HTTP_WECHATPAY_SERIAL, Object.keys(certs),
        );
      }

      if (!Rsa.verify(Formatter.response(timestamp, nonce, data), signature, certs[serial])) {
        return utils.buildBusinessError(
          { data, headers, status },
          EV3_RES_HEADER_SIGNATURE_DIGEST, 'EV3_RES_HEADER_SIGNATURE_DIGEST',
          timestamp, nonce, signature, serial,
        );
      }

      return data;
    };
  }

  /**
   * Create an APIv3's client
   *
   * @param {object} config - configuration
   * @param {string} config.mchid - The merchant ID
   * @param {string} config.serial - The serial number of the merchant certificate
   * @param {string|Buffer} config.privateKey - The merchant private key certificate
   * @param {object} config.certs - The wechatpay platform serial and certificate(s), `{serial: publicKey}` pair
   *
   * @returns {AxiosInstance} - The axios instance
   */
  static jsonBased(config = {}) {
    const {
      mchid, serial, privateKey, certs = {},
    } = config;

    assert(
      utils.isString(mchid),
      ERR_INIT_MCHID_IS_MANDATORY,
    );
    assert(
      utils.isString(serial),
      ERR_INIT_SERIAL_IS_MANDATORY,
    );
    assert(
      utils.isString(privateKey) || utils.isBuffer(privateKey) || Rsa.isKeyObject(privateKey),
      ERR_INIT_PRIVATEKEY_IS_MANDATORY,
    );
    assert(
      utils.isObject(certs) && Object.keys(certs).length > 0,
      ERR_INIT_CERTS_IS_MANDATORY,
    );
    assert(
      !Object.prototype.hasOwnProperty.call(certs, serial),
      ERR_INIT_CERTS_EXCLUDE_MCHSERIAL,
    );

    if (isValidAsymmetricKey(privateKey)) {
      Reflect.set(config, 'privateKey', Rsa.from(privateKey, Rsa.KEY_TYPE_PRIVATE));
    }

    const pubs = Object.fromEntries(Object.entries(certs).map(([id, val]) => [id, isValidAsymmetricKey(val) ? Rsa.from(val, Rsa.KEY_TYPE_PUBLIC) : val]));
    Reflect.set(config, 'certs', pubs);

    const cfg = mergeConfig(mergeConfig(this.defaults, config), {
      transformResponse: [].concat(this.responseVerifier(pubs), axios.defaults.transformResponse),
    });
    ['secret', 'merchant'].forEach((prop) => Reflect.deleteProperty(cfg, prop));

    const instance = axios.create(cfg);
    instance.interceptors.request.use(this.requestInterceptor());
    instance.interceptors.response.use(this.responseDetectorInterceptor());

    return instance;
  }

  /**
   * Getter APIv2's client (xmlBased)
   *
   * @returns {AxiosInstance} - The axios instance
   */
  get v2() { return this[V2]; }

  /**
   * Getter APIv3's client (jsonBased)
   *
   * @returns {AxiosInstance} - The axios instance
   */
  get v3() { return this[V3]; }

  /**
   * Request the remote `pathname` by a HTTP `method` verb
   *
   * @param {string} [pathname] - The pathname string.
   * @param {string} [method] - The method string.
   * @param {object|Buffer} [data] - The data.
   * @param {object} [config] - The config.
   *
   * @returns {PromiseLike} - The `AxiosPromise`
   */
  request(pathname, method, data, config) {
    const url = pathname.replace(/\{([^}]+)\}/g, (tmpl, named) => (Object.prototype.hasOwnProperty.call(config, named) ? config[named] : tmpl));

    debuglog('prepared url: %s,  method: %s, data: %o, config: %o', url, method, data, config);

    const flag = url.startsWith('v2/');
    return this[flag ? V2 : V3].request(mergeConfig(config || {}, { data, url: url.slice(flag ? 3 : 0), method }));
  }

  /**
   * Decorate factory
   * @param {object} config - configuration
   * @param {string} config.mchid - The merchant ID
   * @param {string} config.serial - The serial number of the merchant certificate
   * @param {string|Buffer} config.privateKey - The merchant private key
   * @param {object} config.certs - The platform public keys configuration, `{serial: publicKey}` pair
   * @param {string} [config.secret] - The merchant secret key for APIv2
   * @param {object} [config.merchant] - The merchant certificates, more @see {import('tls').createSecureContext}
   * @param {string|Buffer} [config.merchant.cert] - The merchant certificate in PEM format
   * @param {string|Buffer} [config.merchant.key] - The merchant private key in PEM format
   * @param {string|Buffer} [config.merchant.pfx] - The merchant private key and certificate chain in PFX or PKCS12 format.
   * @param {string|Buffer} [config.merchant.passphrase] - The merchant shared passphrase used for a single private key and/or a PFX.
   * @constructor
   */
  constructor(config = {}) {
    const that = this.constructor;
    Object.defineProperties(this, {
      [V2]: { value: that.xmlBased(config) },
      [V3]: { value: that.jsonBased(config) },
    });
  }

  static get default() { return this; }
}

module.exports = Decorator;
