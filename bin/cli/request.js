/**
 * Play the WeChatPay OpenAPI requests over command line
 */
const { Wechatpay, Transformer: { toObject } } = require('../..');

module.exports = {
  command: '* <uri>',
  aliases: ['req', 'request', 'remote'],
  description: 'Play the WeChatPay OpenAPI requests over command line',
  builder: {
    config: {
      alias: 'c',
      describe: 'The configuration',
      group: '<uri>',
      demandOption: true,
    },
    binary: {
      alias: 'b',
      describe: 'True for the `arraybuffer` response, two for without-verifier-response, otherwise for showing the origin',
      group: '<uri>',
    },
    method: {
      alias: 'm',
      describe: 'The request HTTP verb',
      choices: ['delete', 'get', 'post', 'put', 'patch'],
      default: 'post',
      group: '<uri>',
    },
    headers: {
      alias: 'h',
      describe: 'The request HTTP header(s)',
      group: '<uri>',
    },
    data: {
      alias: 'd',
      describe: 'The request HTTP body',
      group: '<uri>',
    },
    params: {
      alias: 'p',
      describe: 'The request HTTP query parameter(s)',
      group: '<uri>',
    },
  },
  handler(argv) {
    const {
      baseURL, uri, config, method, data, params, headers,
    } = argv;
    const responseType = argv.binary && typeof argv.binary === 'boolean' ? 'arraybuffer' : undefined;
    const structure = [{ params, headers, responseType }];

    if (Array.isArray(argv.binary) && argv.binary.every((x) => x)) {
      // turn off the `verifier` for APIv2 while the `argv.binary` length is 2, otherwise for showing the origin
      Reflect.set(structure[0], 'transformResponse', argv.binary.length > 2 ? [] : [toObject]);
    }

    if (data) { structure.unshift(data); }

    uri.split(/\./).filter((i) => i).reduce((f, i) => f[i], new Wechatpay({ baseURL, ...config }))[method](...structure)
      .then(({ data: d, headers: h, config: c }) => ({ config: c, headers: h, data: d }))
      /* eslint-disable-next-line no-console, newline-per-chained-call */
      .then(console.info).catch(console.error);
  },
};
