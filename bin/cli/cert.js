/**
 * Downloading the WeChatPay platform certificate(s)
 *
 * @link https://wechatpay.js.org/openapi/v3/certificates
 */
const { tmpdir } = require('os');
const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

const { Wechatpay, Aes: { AesGcm } } = require('../..');

module.exports = {
  command: 'crt',
  aliases: ['cert', 'certificateDownloader', 'downloader'],
  description: "The WeChatPay APIv3's Certificate Downloader",
  builder: {
    mchid: {
      alias: 'm',
      describe: 'The merchant\'s ID, aka \x1B[1;32mmchid\x1B[0m.',
      type: 'string',
      demandOption: true,
      group: 'cert',
    },
    serialno: {
      alias: 's',
      describe: 'The serial number of the merchant\'s certificate aka \x1B[1;32mserialno\x1B[0m.',
      type: 'string',
      demandOption: true,
      group: 'cert',
    },
    privatekey: {
      alias: 'f',
      describe: 'The path of the merchant\'s private key certificate aka \x1B[1;32mprivatekey\x1B[0m.',
      type: 'string',
      demandOption: true,
      group: 'cert',
    },
    key: {
      alias: 'k',
      describe: 'The secret key string of the merchant\'s APIv3 aka \x1B[1;32mkey\x1B[0m.',
      type: 'string',
      demandOption: true,
      group: 'cert',
    },
    output: {
      alias: 'o',
      describe: 'Path to output the downloaded WeChatPay\'s platform certificate(s)',
      type: 'string',
      default: tmpdir(),
      group: 'cert',
    },
  },
  handler(argv) {
    const {
      baseURL, mchid, serialno: serial, privatekey, key: secret, output,
    } = argv;

    const privateKey = readFileSync(privatekey);

    const certs = { any: undefined };

    const injector = (response) => {
      (JSON.parse(response).data || []).forEach(({
        serial_no: serialNo, encrypt_certificate: { nonce, associated_data: aad, ciphertext },
      }) => {
        Object.assign(certs, { [serialNo]: AesGcm.decrypt(ciphertext, secret, nonce, aad) });
      });

      return response;
    };

    const wxpay = new Wechatpay({
      baseURL, mchid, serial, privateKey, certs,
    });

    wxpay.v3.certificates.get({
      transformResponse: [injector, ...wxpay.client.v3.defaults.transformResponse],
    }).then(({ data: { data = [] } }) => {
      data.forEach(({
        effective_time: notBefore, expire_time: notAfter, serial_no: serialNo,
      }, index) => {
        // scope a file path based on given `--output` dir
        const savedTo = join(output, `wechatpay_${serialNo}.pem`);

        // write the PEM to file ...
        writeFileSync(savedTo, certs[serialNo]);

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
      });
    }).catch((thing) => {
      /* eslint-disable-next-line no-console */
      console.error(thing.response || thing);
    });
  },
};
