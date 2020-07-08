const axios = require('axios')
const interceptor = require('./interceptor')

/**
 * A Wechatpay APIv3's amazing client.
 *
 * ```js
 * const {Wechatpay} = require('wechatpay-axios-plugin')
 * const wxpay = new Wechatpay({
 *   mchid,
 *   serial,
 *   privateKey: '-----BEGIN PRIVATE KEY-----' + '...' + '-----END PRIVATE KEY-----',
 *   certs: {
 *     'serial_number': '-----BEGIN CERTIFICATE-----' + '...' + '-----END CERTIFICATE-----'
 *   }
 * })
 *
 * wxpay.V3.Marketing.Busifavor.Stocks.post({})
 *   .then(({data}) => console.info(data))
 *   .catch(({response: {data}}) => console.error(data))
 *
 * wxpay.V3.Pay.Transactions.Native.post({})
 *   .then(({data: {code_url}}) => console.info(code_url))
 *   .catch(({response: {data}}) => console.error(data))
 *
 * ;(async () => {
 *   try {
 *     const {data: detail} = await wxpay.V3.Pay.Transactions.Id.$transaction_id$
 *       .withEntities({transaction_id: '1217752501201407033233368018'})
 *       .get({params: {mchid: '1230000109'}})
 *     // or simple like this
 *     // const {data: detail} = await wxpay.V3.Pay.Transactions.Id['{transaction_id}']
 *     //   .withEntities({transaction_id: '1217752501201407033233368018'})
 *     //   .get({params: {mchid: '1230000109'}})
 *     // or simple like this
 *     // const {data: detail} = await wxpay.v3.pay.transactions.id['1217752501201407033233368018']
 *     //   .get({params: {mchid: '1230000109'}})
 *     console.info(detail)
 *   } catch({response: {status, statusText, data}}) {
 *     console.error(status, statusText, data)
 *   }
 * })()
 * ```
 */
class Wechatpay {
  /**
   * @property {import('axios').AxiosInstance} client - The axios instance
   */
  static client;

  /**
   * @property {RegExp} URI_ENTITY - The URI entity which's split by slash ask `uri_template`
   */
  /*eslint-disable-next-line*/
  static URI_ENTITY = /^\{([^\}]+)\}$/;

  /**
   * Compose the `URL`.pathname based on the container's entities
   * @param {array} entities - Each `container` of `entities`
   * @returns {string} - The `URL`.pathname
   */
  static pathname(entities = []) {
    return `/${entities.join('/')}`
  }

  /**
   * Normalize the `str` by the rules: `PascalCase` -> `camelCase` & `camelCase` -> `camel-case` & `$dynamic$` -> `{dynamic}`
   * @param {string} str - The string waiting for normalization
   * @returns {string} - The transformed string
   */
  static normalize(str) {
    return (str || '')
      // PascalCase` to `camelCase`
      .replace(/^[A-Z]/, w => w.toLowerCase())
      // `camelCase` to `camel-case`
      .replace(/[A-Z]/g, w => `-${w.toLowerCase()}`)
      // `$dynamic_variable$` to `{dynamic_variable}`
      .replace(/^\$/, `{`).replace(/\$$/, `}`)
  }

  /**
   * @property {object} container - Client side the URIs' entity mapper
   */
  static container = {
    /**
     * @property {string[]} entities - The URI entities
     */
    entities: [],

    /**
     * @property {function} withEntities - Replace the `uri_template` with real entities' mapping
     * @param {string[]} list - The real entities' mapping
     * @returns {object} - the container's instance
     */
    withEntities: function(list) {
      this.entities.forEach((one, index, src) => {
        if (Wechatpay.URI_ENTITY.test(one)) {
          const sign = one.replace(Wechatpay.URI_ENTITY, `$1`)
          src[index] = list[sign] ? list[sign] : one
        }
      })

      return this
    },

    /**
     * @property {function} get - The alias of the HTTP `GET` request
     * @param {...any} arg - The request arguments
     * @returns {PromiseLike} - The `AxiosPromise`
     */
    get: async function(...arg) {
      return Wechatpay.client.get(Wechatpay.pathname(this.entities), ...arg)
    },

    /**
     * @property {function} post - The alias of the HTTP `POST` request
     * @param {...any} arg - The request arguments
     * @returns {PromiseLike} - The `AxiosPromise`
     */
    post: async function(...arg) {
      return Wechatpay.client.post(Wechatpay.pathname(this.entities), ...arg)
    },

    /**
     * @property {function} upload - The alias of the HTTP 'content-type=multipart/form-data' request
     * @param {...any} arg - The request arguments
     * @returns {PromiseLike} - The `AxiosPromise`
     */
    upload: async function(...arg) {
      //TODO: wrap the FormData and define the headers['content-type']
      return this.post(...arg)
    },
  };

  /**
   * @property {object} handler - Handler of the container instance's `getter`
   */
  static handler = {
    /**
     * @property {function} get - Object's `getter` handler
     * @param {object} target - The object
     * @param {string} property - The property
     * @returns {object} - An object or object's property
     */
    get: (target, property) => {
      if (!property || typeof property === `symbol` || property === `inspect`) {
        return target
      }
      if (!(property in target)) {
        /*eslint-disable-next-line*/
        target[property] = new Proxy({...Wechatpay.container}, Wechatpay.handler)
        if (`entities` in target) {
          target[property].entities = [...target.entities, Wechatpay.normalize(property)]
        }
      }

      return target[property]
    },
  };

  /**
   * Constructor of the magic APIv3 container
   * @param {object} wxpayConfig - @see {apiConfig}
   * @param {object} axiosConfig - @see {import('axios').AxiosRequestConfig}
   * @constructor
   * @returns {Proxy} - The magic APIv3 container
   */
  constructor(wxpayConfig = {}, axiosConfig = {baseURL: 'https://api.mch.weixin.qq.com'}) {
    Wechatpay.client = Wechatpay.client || interceptor(axios.create(axiosConfig), wxpayConfig)

    /*eslint-disable-next-line*/
    return new Proxy({...Wechatpay.container}, Wechatpay.handler)
  }
}

module.exports = Wechatpay
module.exports.default = Wechatpay
