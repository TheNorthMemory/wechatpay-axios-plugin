/**
 * Play the WeChatPay OpenAPI requests over command line
 */
const { Wechatpay } = require('../..');

module.exports = {
  command: 'req <uri>',
  aliases: ['request', 'remote'],
  description: 'Play the WeChatPay OpenAPI requests over command line',
  builder: {
    config: {
      alias: 'c',
      describe: 'The configuration',
      group: 'request <uri>',
      demandOption: true,
    },
    binary: {
      alias: 'b',
      describe: 'Point out the response as `arraybuffer`',
      type: 'boolean',
      group: 'request <uri>',
    },
    method: {
      alias: 'm',
      describe: 'The request HTTP verb',
      default: 'POST',
      group: 'request <uri>',
    },
    headers: {
      alias: 'h',
      describe: 'Special request HTTP header(s)',
      group: 'request <uri>',
    },
    data: {
      alias: 'd',
      describe: 'The request HTTP body',
      group: 'request <uri>',
    },
    params: {
      alias: 'p',
      describe: 'The request HTTP query parameter(s)',
      group: 'request <uri>',
    },
  },
  handler(argv) {
    const {
      baseURL, uri, config, method, data, params, headers,
    } = argv;
    const responseType = argv.binary ? 'arraybuffer' : undefined;
    const structure = [{ params, headers, responseType }];

    if (data) { structure.unshift(data); }

    (new Wechatpay({ baseURL, ...config }))[uri][method](...structure)
      /* eslint-disable-next-line no-console */
      .then(console.info).catch(console.error);
  },
};
