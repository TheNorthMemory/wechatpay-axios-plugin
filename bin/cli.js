#!/usr/bin/env node
const { readFileSync } = require('fs');

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

/* eslint-disable-next-line no-unused-expressions */
yargs(hideBin(process.argv))
  .commandDir('cli')
  .demandCommand()
  .help('help')
  .wrap(null)
  .parserConfiguration({ 'camel-case-expansion': false })
  .option('baseURL', {
    type: 'string',
    alias: 'u',
    default: 'https://api.mch.weixin.qq.com/',
    describe: 'The baseURL',
    normalize: false,
  })
  .epilog('for more information visit https://github.com/TheNorthMemory/wechatpay-axios-plugin')
  .middleware((argv) => {
    if (argv.c && argv.c.privateKey && argv.c.privateKey !== 'any') {
      /* eslint-disable-next-line no-param-reassign */
      argv.config.privateKey = readFileSync(argv.c.privateKey);
    }
    if (argv.c && argv.c.certs && Object.keys(argv.c.certs)[0] !== 'any') {
      Object.entries(argv.c.certs).reduce((o, [k, v]) => Object.assign(o, { [k]: readFileSync(v) }), argv.config.certs);
    }
    if (argv.c && argv.c.merchant) {
      if (argv.c.merchant.cert && argv.c.merchant.cert !== 'any') {
        /* eslint-disable-next-line no-param-reassign */
        argv.config.merchant.cert = readFileSync(argv.c.merchant.cert);
      }
      if (argv.c.merchant.key && argv.c.merchant.key !== 'any') {
        /* eslint-disable-next-line no-param-reassign */
        argv.config.merchant.key = readFileSync(argv.c.merchant.key);
      }
      if (argv.c.merchant.pfx && argv.c.merchant.pfx !== 'any') {
        /* eslint-disable-next-line no-param-reassign */
        argv.config.merchant.pfx = readFileSync(argv.c.merchant.pfx);
      }
    }
  }, true)
  .argv;
