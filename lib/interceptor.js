const assert = require('assert');
const debuglog = require('util').debuglog('wechatpay:interceptor');

const Rsa = require('./rsa');
const Formatter = require('./formatter');
const utils = require('./utils');

/**
 * @typedef {Object} apiConfig - The wechatpay consumer side configuration
 * @prop {string|number} mchid - The merchant ID
 * @prop {string} serial - The serial number of the merchant certificate
 * @prop {string|buffer} privateKey - The merchant private key certificate
 * @prop {platformCertificates} certs - The wechatpay provider size configuration, `{serial: publicCert}` pair
 */
/**
 * @typedef {Object<string, string|buffer>} platformCertificates
 */
/**
 * register a named request as `signer`(for APIv3 Authorization)
 *      and a named response as `verifier`(for APIv3 Verification)
 * onto `Axios.interceptors`
 *
 * @param {!AxiosInstance} axios - The AxiosInstance
 * @param {!apiConfig} apiConfig - The wechatpay consumer side configuration
 *
 * @returns {AxiosInstance} - A decorated AxiosInstance
 * @constructor
 */
const interceptor = (axios, {
  mchid,
  serial,
  privateKey,
  certs = {},
} = {}) => {
  assert(
    utils.isString(mchid) || utils.isNumber(mchid),
    'The merchant\' ID aka `mchid` is required, usually numerical.',
  );
  assert(
    utils.isString(serial),
    'The serial number of the merchant\'s public certificate '
    + 'aka `serial` is required, usually hexadecial.',
  );
  assert(
    utils.isString(privateKey) || utils.isBuffer(privateKey),
    'The merchant\'s private key certificate '
    + 'aka `privateKey` is required, usual as pem format.',
  );
  assert(
    utils.isObject(certs) && Object.keys(certs).length > 0,
    'The public certificates via API downloaded '
    + '`certs` is required, '
    + 'similar and just the pair of `{serial: publicCert}` Object.',
  );

  // Add a new interceptor named as `signer` to the HTTP(s) request stack
  /* eslint-disable-next-line prefer-arrow-callback */
  axios.interceptors.request.use(function signer(config) {
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
    // sign the request by the merchant private key certificate
    debuglog('%o', url);
    const signature = Rsa.sign(
      Formatter.request(method, `${url.pathname}${url.search}`, timestamp, nonce, payload),
      privateKey,
    );

    /* eslint-disable-next-line no-param-reassign */
    config.headers = {
      ...config.headers,
      'User-Agent': utils.userAgent(),
      'Content-Type': 'application/json',
      Accept: 'application/json',
      // @see {Formatter.authorization} APIv3 `Authorization` schema
      Authorization: Formatter.authorization(mchid, nonce, signature, timestamp, serial),
    };
    debuglog('Headers %o', config.headers);

    return config;
  });

  // Add a new interceptor named as `verifier` to the HTTP(s) response stack
  /* eslint-disable-next-line prefer-arrow-callback */
  axios.interceptors.response.use(function verifier(response) {
    // @see https://github.com/axios/axios/pull/128 for binary data
    // it's useful on `v3/billdownload/file` which's none verification required
    if (response.config.responseType === 'arraybuffer') {
      return response;
    }

    const timestamp = response.headers['wechatpay-timestamp'];
    const nonce = response.headers['wechatpay-nonce'];
    const serialNo = response.headers['wechatpay-serial'];
    const signature = response.headers['wechatpay-signature'];
    // @see https://github.com/TheNorthMemory/wechatpay-axios-plugin/issues/8
    // The `204` statusCode means no content, here won't need JSON.stringify for `verify`
    const payload = response.status === 204 ? response.data : JSON.stringify(response.data);

    const localTimestamp = Formatter.timestamp();
    assert.ok(
      // here's only allowed with negative and positive 5 minutes
      Math.abs(localTimestamp - timestamp) < 300,
      `The response was on ${timestamp}, your local is ${localTimestamp}. `
      + 'Here\'s only allowed with negative and positive 5 minutes. '
      + 'Please keeping your machine\'s datetime synchronized.',
    );

    assert.ok(
      // @see {Rsa.verify} verify the response by the wechatpay public certificate
      Rsa.verify(Formatter.response(timestamp, nonce, payload), signature, certs[serialNo]),
      'Verify the response with '
      + `timestamp=${timestamp}, nonce=${nonce}, `
      + `signature=${signature}, cert={${serialNo}: publicCert} failed.`,
    );

    return response;
  });

  return axios;
};

module.exports = interceptor;
module.exports.default = interceptor;
