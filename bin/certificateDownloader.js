#!/usr/bin/env node

/**
 * Downloading the WeChatPay platform certificate(s)
 *
 * @link https://wechatpay-api.gitbook.io/wechatpay-api-v3/qian-ming-zhi-nan-1/zheng-shu-he-hui-tiao-bao-wen-jie-mi
 */
const { tmpdir } = require('os');
const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

/* eslint-disable-next-line import/no-extraneous-dependencies */
const { program } = require('commander');
const axios = require('axios');
const interceptor = require('../lib/interceptor');
const pkg = require('../package.json');
const Aes = require('../lib/aes');

program
  .version(`The WeChatPay APIv3's Certificate Downloader \t\x1B[1;32mv${pkg.version}\x1B[0m`)
  .requiredOption('-m, --mchid <string>', 'The merchant\'s ID, aka \x1B[1;32mmchid\x1B[0m.')
  .requiredOption('-s, --serialno <string>', 'The serial number of the merchant\'s certificate aka \x1B[1;32mserialno\x1B[0m.')
  .requiredOption('-f, --privatekey <string>', 'The path of the merchant\'s private key certificate aka \x1B[1;32mprivatekey\x1B[0m.')
  .requiredOption('-k, --key <string>', 'The secret key string of the merchant\'s APIv3 aka \x1B[1;32mkey\x1B[0m.')
  .option('-o, --output [string]', 'Path to output the downloaded WeChatPay\'s platform certificate(s)', `${tmpdir()}`)
  .parse(process.argv);

// de-construct the CLI parameters
const {
  mchid, serialno: serial, privatekey, key: secret, output,
} = program;

// loading the merchant's private key certificaiton
const privateKey = readFileSync(privatekey);

// Thought here: It's a trick,
// not only lets the `client` pass the init,
// but also lets the `downloader` inject the pem(s).
// The looping sequences in `Axios/lib/core/transformData` should be
// #0(fn=downloader) -> #1(fn=anonymous).
// These `global` certs will be passed in #1 to verify the response' `signature`.
let certs = { any: undefined };

const instance = axios.create();

// registry a named function `downloader` before this library does
/* eslint-disable-next-line prefer-arrow-callback */
instance.interceptors.response.use(function downloader(response) {
  (response.data.data || []).map(({
    effective_time: notBefore,
    expire_time: notAfter,
    serial_no: serialNo, encrypt_certificate: { nonce, associated_data: aad, ciphertext },
  }, index) => {
    // @see {Aes.decrypt} decrypt the ciphertext which is the `WeChatPay Platform Certificate`
    const cert = Aes.decrypt(nonce, secret, ciphertext, aad);

    // injection onto the global `certs` Object, using in the next `${interceptor.response}`
    certs = Object.assign(certs, { [serialNo]: cert });

    // scope a file path based on given `--output` dir
    const savedTo = join(output, `wechatpay_${serialNo}.pem`);

    // write the PEM to file ...
    writeFileSync(savedTo, cert);

    /* eslint-disable no-console */
    console.group(`The WeChatPay Platform Certificate\x1B[1;31m#${index}\x1B[0m`);
    console.info(`serial=\x1B[1;32m${serialNo}\x1B[0m`);
    console.info(`notBefore=${(new Date(notBefore)).toUTCString()}`);
    console.info(`notAfter=${(new Date(notAfter)).toUTCString()}`);
    console.info(`Saved to: \x1B[1;32m${savedTo}\x1B[0m`);
    console.groupEnd();
    console.info('You may confirm the above infos again even if this library already did(by Rsa.verify):');
    console.info(`\t\x1B[1;32mopenssl x509 -in ${savedTo} -noout -serial -dates\x1B[0m`);
    console.info();
    /* eslint-enable no-console */

    return { notBefore, notAfter, serialNo };
  });

  return response;
});

// Standard Usage
const client = interceptor(instance, {
  mchid, serial, privateKey, certs,
});

// Execute a HTTPs request
(async () => {
  await client.get('https://api.mch.weixin.qq.com/v3/certificates');
})();
