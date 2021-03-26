/**
 * Play the WeChatPay OpenAPI requests over command line
 */
const { readFileSync } = require('fs');

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
      describe: 'Special request HTTP headers',
      group: 'request <uri>',
    },
    data: {
      alias: 'd',
      describe: 'The request HTTP body',
      group: 'request <uri>',
    },
    params: {
      alias: 'p',
      describe: 'The request HTTP query parameters',
      group: 'request <uri>',
    },
  },
  handler(argv) {
    const {
      uri, config, method, data, params, headers,
    } = argv;
    const responseType = argv.binary ? 'arraybuffer' : undefined;
    const structure = [{ params, headers, responseType }];

    if (data) {
      structure.unshift(data);
    }
    if (config.privateKey) {
      config.privateKey = readFileSync(config.privateKey);
    }
    if (config.certs) {
      /* eslint-disable-next-line no-return-assign, no-param-reassign, no-sequences */
      config.certs = Object.entries(config.certs).reduce((o, [k, v]) => (o[k] = readFileSync(v), o), {});
    }

    (new Wechatpay(config))[uri][method](...structure)
      /* eslint-disable-next-line no-console */
      .then(console.info).catch(console.error);
  },
};
