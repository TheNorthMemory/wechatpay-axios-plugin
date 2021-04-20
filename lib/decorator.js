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

    return { ...defaults, ...config };
  }

  /**
   * Create an APIv2's client
   *
   * @param {object} config - configuration
   * @param {string|number} [config.mchid] - The merchant ID
   * @param {string} [config.secret] - The merchant secret key string
   * @param {object} [config.merchant] - The merchant certificates, more @see {import('tls').createSecureContext}
   * @param {string|buffer} [config.merchant.cert] - The merchant cert chains in PEM format
   * @param {string|buffer} [config.merchant.key] - The merchant private keys in PEM format
   * @param {string|buffer} [config.merchant.pfx] - The merchant PFX or PKCS12 encoded private key and certificate chain.
   * @param {string|buffer} [config.merchant.passphrase] - The merchant shared passphrase used for a single private key and/or a PFX.
   *
   * @returns {AxiosInstance} - The axios instance
   */
  static xmlBased(config = {}) {
    const httpsAgent = new https.Agent({
      keepAlive: true,
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
        'User-Agent': utils.userAgent(),
      },
      responseType: 'text',
      transformRequest: Transformer.request,
      transformResponse: Transformer.response,
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
      /* eslint-disable-next-line function-paren-newline */
      const payload = JSON.stringify(
        // for media upload, while this instance had `meta` Object defined,
        // let's checking whether or nor the real `data` is a `form-data`
        /* eslint-disable-next-line comma-dangle */
        config.meta && utils.isProcessFormData(config.data) ? config.meta : config.data
      );
      const nonce = Formatter.nonce();
      const timestamp = Formatter.timestamp();
      // `getUri` should missing some paths whose were on `baseURL`
      const url = new URL(axios.getUri(config), config.baseURL);
      debuglog('%o', url);
      // sign the request by the merchant private key certificate
      const signature = Rsa.sign(
        Formatter.request(method, `${url.pathname}${url.search}`, timestamp, nonce, payload),
        config.privateKey,
      );

      /* eslint-disable-next-line no-param-reassign */
      config.headers = {
        ...config.headers,
        'User-Agent': utils.userAgent(),
        'Content-Type': 'application/json',
        Accept: 'application/json',
        // @see {Formatter.authorization} APIv3 `Authorization` schema
        Authorization: Formatter.authorization(config.mchid, nonce, signature, timestamp, config.serial),
      };
      debuglog('Headers %o', config.headers);

      return config;
    };
  }

  /**
   * APIv3's responseVerifier
   * @param  {object} certs The wechatpay platform serial and certificate(s), `{serial: publicCert}` pair
   * @return {function} Named as `verifier` function
   */
  static responseVerifier(certs = {}) {
    return function verifier(data, {
      'wechatpay-timestamp': timestamp, 'wechatpay-nonce': nonce, 'wechatpay-serial': serial, 'wechatpay-signature': signature,
    }) {
      const localTimestamp = Formatter.timestamp();

      assert.ok(
        Math.abs(localTimestamp - timestamp) < 301,
        `It's allowed time offset in ± 5 minutes, the response was on ${timestamp}, your's localtime on ${localTimestamp}.`,
      );

      assert.ok(
        Rsa.verify(Formatter.response(timestamp, nonce, data), signature, certs[serial]),
        `Verify the response's data with: timestamp=${timestamp}, nonce=${nonce}, signature=${signature}, cert={${serial}: publicCert} failed.`,
      );

      return data;
    };
  }

  /**
   * Create an APIv3's client
   *
   * @param {object} config - configuration
   * @param {string|number} config.mchid - The merchant ID
   * @param {string} config.serial - The serial number of the merchant certificate
   * @param {string|buffer} config.privateKey - The merchant private key certificate
   * @param {object} config.certs - The wechatpay platform serial and certificate(s), `{serial: publicCert}` pair
   *
   * @returns {AxiosInstance} - The axios instance
   */
  static jsonBased(config = {}) {
    const {
      mchid, serial, privateKey, certs = {},
    } = config;

    assert(
      utils.isString(mchid) || utils.isNumber(mchid),
      'The merchant\' ID aka `mchid` is required, usually numerical.',
    );
    assert(
      utils.isString(serial),
      'The serial number of the merchant\'s certificate aka `serial` is required, usually hexadecial.',
    );
    assert(
      utils.isString(privateKey) || utils.isBuffer(privateKey),
      'The merchant\'s private key aka `privateKey` is required, usual as pem format.',
    );
    assert(
      utils.isObject(certs) && Object.keys(certs).length > 0,
      'The platform certificate(s) aka `certs` is required, paired as of `{serial: publicCert}`.',
    );

    const instance = axios.create(this.withDefaults({
      ...config,
      transformResponse: [this.responseVerifier(certs), ...axios.defaults.transformResponse],
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
   * @param {object|buffer} [data] - The data.
   * @param {object} [config] - The config.
   *
   * @returns {PromiseLike} - The `AxiosPromise`
   */
  request(pathname, method, data, config) {
    /* eslint-disable-next-line no-useless-escape */
    const url = pathname.replace(/\{([^\}]+)\}/g, (tmpl, named) => (Object.prototype.hasOwnProperty.call(config, named) ? config[named] : tmpl));

    debuglog('prepared url: %s,  method: %s, data: %o, config: %o', url, method, data, config);

    return this[/^v2\//.test(url) ? V2 : V3].request({ ...config, ...{ data, url: url.replace(/^v2\//, ''), method } });
  }

  /**
   * Decorate factory
   * @param {object} config - configuration
   * @param {string|number} config.mchid - The merchant ID
   * @param {string} config.serial - The serial number of the merchant certificate
   * @param {string|buffer} config.privateKey - The merchant private key certificate
   * @param {object} config.certs - The wechatpay provider size configuration, `{serial: publicCert}` pair
   * @param {string} [config.secret] - The merchant secret key string
   * @param {object} [config.merchant] - The merchant certificates, more @see {import('tls').createSecureContext}
   * @param {string|buffer} [config.merchant.cert] - The merchant cert chains in PEM format
   * @param {string|buffer} [config.merchant.key] - The merchant private keys in PEM format
   * @param {string|buffer} [config.merchant.pfx] - The merchant PFX or PKCS12 encoded private key and certificate chain.
   * @param {string|buffer} [config.merchant.passphrase] - The merchant shared passphrase used for a single private key and/or a PFX.
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
