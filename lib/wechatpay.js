const Decorator = require('./decorator');

const chain = 'chain';
const CLIENT = Symbol('CLIENT');
const enumerable = true;

/**
 * Normalize the `str` by the rules: `PascalCase` -> `camelCase` & `camelCase` -> `camel-case` & `$dynamic$` -> `{dynamic}`
 * @param {string} str - The string waiting for normalization
 * @returns {string} - The transformed string
 */
function normalize(str) {
  return (str || '')
    // PascalCase` to `camelCase`
    .replace(/^[A-Z]/, (w) => w.toLowerCase())
    // `camelCase` to `camel-case`
    .replace(/[A-Z]/g, (w) => `-${w.toLowerCase()}`)
    // `$dynamic_variable$` to `{dynamic_variable}`
    .replace(/^(\$|_)(.*)\1$/, '{$2}');
}

/**
 * Promise based and chained WeChatPay OpenAPI v2&v3's client.
 *
 * @example
 * const {Wechatpay,Rsa} = require('wechatpay-axios-plugin');
 * const wxpay = new Wechatpay({
 *   mchid,
 *   serial,
 *   privateKey: Rsa.from('file:///path/to/wechatpay/apiclient_key.pem', Rsa.KEY_TYPE_PRIVATE),
 *   certs: {
 *     [`${pubkey_id}`]: Rsa.from('file:///path/to/wechatpay/publickey.pem', Rsa.KEY_TYPE_PUBLIC),
 *   },
 *   secret,
 *   merchant: {
 *     cert,
 *     key,
 *     // pfx,
 *     // passphase,
 *   }
 * });
 *
 * wxpay.v2.pay.micropay({}).then(console.info).catch(console.error);
 *
 * wxpay.v2.secapi.pay.refund.post({}).then(console.info).catch(console.error);
 *
 * wxpay.v3.marketing.busifavor.stocks.post({})
 *   .then(({data}) => console.info(data))
 *   .catch(({response: {data}}) => console.error(data));
 *
 * wxpay.v3.pay.transactions.native.post({})
 *   .then(({data: {code_url}}) => console.info(code_url))
 *   .catch(({ response: {data}}) => console.error(data));
 *
 * (async () => {
 *   try {
 *     const {data: detail} = await wxpay.v3.pay.transactions.id._transaction_id_
 *       .get({params: {mchid: '1230000109'}, transaction_id: '1217752501201407033233368018'});
 *     // or simple like this
 *     // const {data: detail} = await wxpay.v3.pay.transactions.id['{transaction_id}']
 *     //   .get({params: {mchid: '1230000109'}, transaction_id: '1217752501201407033233368018'});
 *     console.info(detail);
 *   } catch({response: {status, statusText, data}}) {
 *     console.error(status, statusText, data);
 *   }
 * })();
 */
class Wechatpay {
  /**
   * @property {Decorator} client - The Decorator instance
   */
  get client() { return this[CLIENT]; }

  static normalize = normalize

  /**
   * Compose a named function with `prefix` and `suffix` whose joined by a `slash(/)`
   *
   * @param {string} [prefix] - The prefix string.
   * @param {string} [suffix] - The suffix string.
   *
   * @returns {Proxy} - With a special `Getter` Function.
   */
  compose(prefix = '', suffix = '') {
    const name = (prefix && suffix) ? `${prefix}/${suffix}` : `${suffix}`;

    return new Proxy(this.chain(name), this.handler);
  }

  /**
   * Chain the input pathname with several HTTP verbs onto a `Function` object.
   *
   * @param {string} pathname - The pathname string.
   *
   * @returns {Function} - Named as given `pathname` function
   */
  chain(pathname) {
    const client = this[CLIENT];

    /* eslint-disable object-curly-newline, arrow-body-style, object-property-newline */
    return ['post', 'put', 'patch'].reduce((resource, method) => {
      return Object.defineProperty(resource, method, { enumerable, value: { async [method](data, config) {
        return client.request(pathname, method, data, config);
      } }[method] });
    }, ['delete', 'get'].reduce((resource, method) => {
      return Object.defineProperty(resource, method, { enumerable, value: { async [method](config) {
        return client.request(pathname, method, undefined, config);
      } }[method] });
    }, Object.defineProperty({ async [pathname](data, config) {
      return client.request(pathname, 'post', data, config);
    } }[pathname], chain, { enumerable, value: { [chain]: (thing) => this.compose(pathname, thing) }[chain] })));
    /* eslint-enable object-curly-newline, arrow-body-style, object-property-newline */
  }

  /**
   * @property {object} handler - A `Getter` handler object
   */
  get handler() {
    return {
      /**
       * Object's `getter` handler
       * @memberof Wechatpay.handler#
       * @param {object} target - The object
       * @param {string} property - The property
       * @returns {object} - An object or object's property
       */
      get: (target, property) => {
        if (typeof property === 'symbol' || property === 'inspect') {
          return target;
        }

        if (property === 'client' && !target.name/* only from the tree root */) { return this[property]; }

        if (!Object.prototype.hasOwnProperty.call(target, property)) {
          Reflect.set(target, property, this.compose(target.name, normalize(property)));
        }

        return Reflect.get(target, property);
      },
    };
  }

  /**
   * Constructor of the magic APIv2&v3's `chain`.
   *
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
   *
   * @constructor
   */
  constructor(config = {}) {
    /* eslint no-constructor-return: 0 */
    return Object.defineProperty(this, CLIENT, { value: new Decorator(config) }).compose();
  }

  static get default() { return this; }
}

module.exports = Wechatpay;
