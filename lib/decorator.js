const assert = require('assert');
const https = require('https');
const debuglog = require('util').debuglog('wechatpay:decorator');

const axios = require('axios');

const Transformer = require('./transformer');
const Formatter = require('./formatter');
const utils = require('./utils');
const Rsa = require('./rsa');

const V2 = Symbol('XML PAYLOAD');
const V3 = Symbol('JSON PAYLOAD');

const MAXIMUM_CLOCK_OFFSET = 300;
const WechatpayNonce = 'Wechatpay-Nonce';
const WechatpaySerial = 'Wechatpay-Serial';
const WechatpaySignature = 'Wechatpay-Signature';
const WechatpayTimestamp = 'Wechatpay-Timestamp';

const ERR_INIT_MCHID_IS_MANDATORY = 'The merchant\' ID aka `mchid` is required, usually is numerical string.';
const ERR_INIT_SERIAL_IS_MANDATORY = 'The serial number of the merchant\'s certificate aka `serial` is required, usually hexadecial.';
const ERR_INIT_PRIVATEKEY_IS_MANDATORY = 'The merchant\'s private key aka `privateKey` is required, usual as pem format.';
const ERR_INIT_CERTS_IS_MANDATORY = 'The platform certificate(s) aka `certs` is required, paired as of `{$serial: $certificate}`.';
const ERR_INIT_CERTS_EXCLUDE_MCHSERIAL = 'The `certs` contains the merchant\'s certificate serial number which is not allowed here.';

const EV3_RES_HEADERS_INCOMPLATE = 'The response\'s Headers incomplete, must have(`%s`, `%s`, `%s` and `%s`).';
const EV3_RES_HEADER_TIMESTAMP_OFFSET = 'It\'s allowed time offset in ± %s seconds, the response(header:%s) was on %s, your\'s localtime on %s.';
const EV3_RES_HEADER_PLATFORM_SERIAL = 'Cannot found the serial(`%s`)\'s configuration, which\'s from the response(header:%s), your\'s %O.';
const EV3_RES_HEADER_SIGNATURE_DIGEST = 'Verify the response\'s data with: timestamp=%s, nonce=%s, signature=%s, cert={%s: ...} failed.';

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
   * Deep merge the input with the defaults
   *
   * @param {object} config - The configuration.
   *
   * @returns {object} - With the built-in configuration.
   */
  static withDefaults(config = {}) {
    const defaults = { ...this.defaults };
    const headers = { ...defaults.headers, ...config.headers };

    return { ...defaults, ...config, ...{ headers } };
  }

  /**
   * Create an APIv2's client
   *
   * @param {object} config - configuration
   * @param {string} [config.mchid] - The merchant ID
   * @param {string} [config.secret] - The merchant secret key string
   * @param {object} [config.merchant] - The merchant certificates, more @see {import('tls').createSecureContext}
   * @param {string|Buffer} [config.merchant.cert] - The merchant cert chains in PEM format
   * @param {string|Buffer} [config.merchant.key] - The merchant private keys in PEM format
   * @param {string|Buffer} [config.merchant.pfx] - The merchant PFX or PKCS12 encoded private key and certificate chain.
   * @param {string|Buffer} [config.merchant.passphrase] - The merchant shared passphrase used for a single private key and/or a PFX.
   *
   * @returns {AxiosInstance} - The axios instance
   */
  static xmlBased(config = {}) {
    const httpsAgent = new https.Agent({
      ...config.merchant,
    });
    const { mchid, secret } = config;

    if (secret) {
      // hidden the `secret` key string
      Reflect.set(config, 'secret', secret.replace(/^(.{5})(.*)(.{5})$/, (_, b, c, e) => `${b}${'*'.repeat(c.length)}${e}`));
    }

    Transformer.mchid = mchid;
    Transformer.secret = secret;

    return axios.create(utils.merge(this.withDefaults(config), {
      httpsAgent,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        Accept: 'text/xml, text/plain, application/x-gzip',
      },
      responseType: 'text',
      transformRequest: [].concat(Transformer.request),
      transformResponse: [].concat(Transformer.response),
    }));
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

      Reflect.set(config, 'headers', {
        Authorization: Formatter.authorization(config.mchid, nonce, signature, timestamp, config.serial),
        ...config.headers,
      });
      debuglog('Headers %o', config.headers);

      return config;
    };
  }

  /**
   * APIv3's responseVerifier
   * @param  {object} certs The wechatpay platform serial and certificate(s), `{serial: publicKey}` pair
   * @return {function} Named as `verifier` function
   */
  static responseVerifier(certs = {}) {
    return function verifier(data, headers) {
      const {
        'wechatpay-timestamp': timestamp, 'wechatpay-nonce': nonce, 'wechatpay-serial': serial, 'wechatpay-signature': signature,
      } = headers;

      assert.ok(
        timestamp && nonce && serial && signature,
        utils.implicityReturnValues(EV3_RES_HEADERS_INCOMPLATE, { headers, data }, WechatpayNonce, WechatpaySerial, WechatpaySignature, WechatpayTimestamp),
      );

      const localTimestamp = Formatter.timestamp();

      assert.ok(
        Math.abs(localTimestamp - timestamp) < MAXIMUM_CLOCK_OFFSET,
        utils.implicityReturnValues(EV3_RES_HEADER_TIMESTAMP_OFFSET, { headers, data }, MAXIMUM_CLOCK_OFFSET, WechatpayTimestamp, timestamp, localTimestamp),
      );

      assert.ok(
        Object.prototype.hasOwnProperty.call(certs, serial),
        utils.implicityReturnValues(EV3_RES_HEADER_PLATFORM_SERIAL, { headers, data }, serial, WechatpaySerial, Object.keys(certs)),
      );

      assert.ok(
        Rsa.verify(Formatter.response(timestamp, nonce, data), signature, certs[serial]),
        utils.implicityReturnValues(EV3_RES_HEADER_SIGNATURE_DIGEST, { headers, data }, timestamp, nonce, signature, serial),
      );

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
      utils.isString(privateKey) || utils.isBuffer(privateKey),
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

    const instance = axios.create(this.withDefaults({
      ...config,
      transformResponse: [].concat(this.responseVerifier(certs), axios.defaults.transformResponse),
    }));

    instance.interceptors.request.use(this.requestInterceptor());

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

    return this[/^v2\//.test(url) ? V2 : V3].request({ ...config, ...{ data, url: url.replace(/^v2\//, ''), method } });
  }

  /**
   * Decorate factory
   * @param {object} config - configuration
   * @param {string} config.mchid - The merchant ID
   * @param {string} config.serial - The serial number of the merchant certificate
   * @param {string|Buffer} config.privateKey - The merchant private key certificate
   * @param {object} config.certs - The wechatpay provider size configuration, `{serial: publicKey}` pair
   * @param {string} [config.secret] - The merchant secret key string
   * @param {object} [config.merchant] - The merchant certificates, more @see {import('tls').createSecureContext}
   * @param {string|Buffer} [config.merchant.cert] - The merchant cert chains in PEM format
   * @param {string|Buffer} [config.merchant.key] - The merchant private keys in PEM format
   * @param {string|Buffer} [config.merchant.pfx] - The merchant PFX or PKCS12 encoded private key and certificate chain.
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
}

module.exports = Decorator;
module.exports.default = Decorator;
