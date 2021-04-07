const https = require('https');
const debuglog = require('util').debuglog('wechatpay:decorator');

const axios = require('axios');

const Transformer = require('./transformer');
const interceptor = require('./interceptor');
const utils = require('./utils');

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
      /* eslint-disable-next-line no-param-reassign */
      config.secret = secret.replace(/^(.{5})(.*)(.{5})$/, (_, b, c, e) => `${b}${'*'.repeat(c.length)}${e}`);
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
   * Create an APIv3's client
   *
   * @param {object} config - configuration
   * @param {string|number} config.mchid - The merchant ID
   * @param {string} config.serial - The serial number of the merchant certificate
   * @param {string|buffer} config.privateKey - The merchant private key certificate
   * @param {object} config.certs - The wechatpay provider size configuration, `{serial: publicCert}` pair
   *
   * @returns {AxiosInstance} - The axios instance
   */
  static jsonBased(config = {}) {
    return interceptor(axios.create(this.withDefaults(config)), config);
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
