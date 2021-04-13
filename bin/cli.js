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
    alias: 'u',
    type: 'string',
    default: 'https://api.mch.weixin.qq.com/',
    describe: 'The baseURL',
  })
  .epilog('for more information visit https://github.com/TheNorthMemory/wechatpay-axios-plugin')
  .middleware((argv) => {
    if (argv.c && argv.c.privateKey && argv.c.privateKey !== 'any') {
      Reflect.set(argv.config, 'privateKey', readFileSync(argv.c.privateKey));
    }
    if (argv.c && argv.c.certs && Object.keys(argv.c.certs)[0] !== 'any') {
      Object.entries(argv.c.certs).reduce((o, [k, v]) => Object.assign(o, { [k]: readFileSync(v) }), argv.config.certs);
    }
    if (argv.c && argv.c.merchant) {
      if (argv.c.merchant.cert && argv.c.merchant.cert !== 'any') {
        Reflect.set(argv.config.merchant, 'cert', readFileSync(argv.c.merchant.cert));
      }
      if (argv.c.merchant.key && argv.c.merchant.key !== 'any') {
        Reflect.set(argv.config.merchant, 'key', readFileSync(argv.c.merchant.key));
      }
      if (argv.c.merchant.pfx && argv.c.merchant.pfx !== 'any') {
        Reflect.set(argv.config.merchant, 'pfx', readFileSync(argv.c.merchant.pfx));
      }
    }
  }, true)
  .argv;
