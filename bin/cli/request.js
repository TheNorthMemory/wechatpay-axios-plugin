/**
 * Play the WeChatPay OpenAPI requests over command line
 */
const { Wechatpay } = require('../..');

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
      describe: 'Point out the response as `arraybuffer`',
      type: 'boolean',
      group: '<uri>',
    },
    method: {
      alias: 'm',
      describe: 'The request HTTP verb',
      choices: ['DELETE', 'GET', 'POST', 'PUT', 'PATCH', 'delete', 'get', 'post', 'put', 'patch'],
      default: 'POST',
      group: '<uri>',
    },
    headers: {
      alias: 'h',
      describe: 'Special request HTTP header(s)',
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
    const responseType = argv.binary ? 'arraybuffer' : undefined;
    const structure = [{ params, headers, responseType }];

    if (data) { structure.unshift(data); }

    (new Wechatpay({ baseURL, ...config }))[uri][method](...structure)
      /* eslint-disable-next-line no-console */
      .then(console.info).catch(console.error);
  },
};
