# 微信支付 APIv3 Axios 插件版

[![GitHub version](https://img.shields.io/github/package-json/v/TheNorthMemory/wechatpay-axios-plugin?label=Github)](https://github.com/TheNorthMemory/wechatpay-axios-plugin)
[![GitHub issues](https://img.shields.io/github/issues/TheNorthMemory/wechatpay-axios-plugin)](https://github.com/TheNorthMemory/wechatpay-axios-plugin)
[![GitHub dependency](https://img.shields.io/github/package-json/dependency-version/thenorthmemory/wechatpay-axios-plugin/axios)](https://github.com/axios/axios)
[![GitHub dependency](https://img.shields.io/github/package-json/dependency-version/thenorthmemory/wechatpay-axios-plugin/commander)](https://github.com/tj/commander.js)
[![NPM module version](https://img.shields.io/npm/v/wechatpay-axios-plugin)](https://www.npmjs.com/package/wechatpay-axios-plugin)
[![NPM module downloads per month](https://img.shields.io/npm/dm/wechatpay-axios-plugin)](https://www.npmjs.com/package/wechatpay-axios-plugin)
[![NPM module license](https://img.shields.io/npm/l/wechatpay-axios-plugin)](https://www.npmjs.com/package/wechatpay-axios-plugin)

## 主要功能

- [x] 使用Node原生代码实现微信支付APIv3的AES加/解密功能(`aes-256-gcm` with `aad`)
- [x] 使用Node原生代码实现微信支付APIv3的RSA加/解密、签名、验签功能(`sha256WithRSAEncryption` with `RSA_PKCS1_OAEP_PADDING`)
- [x] 大部分微信支付APIv3的HTTP GET/POST应该能够正常工作，依赖 [Axios](https://github.com/axios/axios), 示例代码如下
- [x] 支持微信支付APIv3的媒体文件上传(图片/视频)功能，可选依赖 [form-data](https://github.com/form-data/form-data), 示例代码如下
- [x] 支持微信支付APIv3的应答证书下载功能，依赖 [commander](https://github.com/tj/commander.js), 使用手册如下
- [x] 支持微信支付APIv3的帐单下载及解析功能，示例代码如下

## 安装

`$ npm install wechatpay-axios-plugin`

## 系统要求

NodeJS的原生`crypto`模块，自v12.9.0在 `publicEncrypt` 及 `privateDecrypt` 增加了 `oaepHash` 入参选项，本项目显式声明入参，本人不确定其在v12.9.0以下是否正常工作。所以Node的最低版本要求应该是v12.9.0.

## 万里长征第一步

微信支付APIv3使用了许多成熟且牛逼的接口设计（RESTful API with JSON over HTTP），数据交换使用非对称（RSA）加/解密方案，对上行数据要求（RSA）签名，对下行数据要求（RSA）验签。API上行所需的`商户RSA私钥证书`，可以由商户的`超级管理员`在`微信支付商户平台`生成并获取到，然而，API下行所需的`平台RSA公共证书`只能从`/v3/certificates`接口获取（应答证书还经过了AES对称加密，得用`APIv3密钥`才能解密 :+1: ）。本项目也提供了命令行下载工具，使用手册如下：

<details>
  <summary>$ <b>./bin/certificateDownloader -h</b> (点击显示)</summary>

```
Usage: certificateDownloader [options]

Options:
  -V, --version              output the version number
  -m, --mchid <string>       The merchant's ID, aka mchid.
  -s, --serialno <string>    The serial number of the merchant's public certificate aka serialno.
  -f, --privatekey <string>  The path of the merchant's private key certificate aka privatekey.
  -k, --key <string>         The secret key string of the merchant's APIv3 aka key.
  -o, --output [string]      Path to output the downloaded wechatpay's public certificate(s) (default: "/tmp")
  -h, --help                 display help for command
```

**注：** 像其他通用命令行工具一样，`-h` `--help` 均会打印出帮助手册，说明档里的`<string>`指 必选参数，类型是字符串； `[string]`指 可选字符串参数，默认值是 `/temp`（系统默认临时目录）

</details>

<details>
  <summary>$ <b>./bin/certificateDownloader</b> -m NUMERICAL -s HEXADECIAL -f apiclient_key.pem -k YOURAPIV3SECRETKEY -o .</summary>

```
Wechatpay Public Certificate#0
  serial=HEXADECIALHEXADECIALHEXADECIAL
  notBefore=Wed, 22 Apr 2020 01:43:19 GMT
  notAfter=Mon, 21 Apr 2025 01:43:19 GMT
  Saved to: wechatpay_HEXADECIALHEXADECIALHEXADECIAL.pem
You should verify the above infos again even if this library already did(by rsa.verify):
    openssl x509 -in wechatpay_HEXADECIALHEXADECIALHEXADECIAL.pem -noout -serial -dates

```
**注：** 提供必选参数且运行后，屏幕即打印出如上信息，提示`证书序列号`及`起、止格林威治(GMT)时间`以及证书下载保存位置。
</details>

接口通讯要用`商户RSA私钥证书`签名及`平台RSA公共证书`验签，只有获取到了`平台RSA公共证书`，后续的其他接口才能正常应答验签，所谓“万里长征第一步”就在这里。本下载工具也无例外对应答内容，做了验签处理，技法“剑(qí)走(zhāo)偏(yín)锋(jì)“而已，即：用Axios的拦截器把下载的证书(AES解密)处理完后，立即用于验签。

得到证书之后，开发者需要把所得`serial`及`wechatpay_HEXADECIALHEXADECIALHEXADECIAL.pem`（文件流或者文本内容）组成 {key:value} 对，key为证书序列号，value为证书内容，传入以下的构造函数的`certs`字段里。 其他接口使用就基本上没有啥问题了。

以下文档及示例都是基本用法，没啥花活儿，祝开心。 :smile:


# Wechatpay APIv3 Axios Plugin

## Features

- [x] The Node's native code of the wechatpay APIv3's AES encrypt/decrypt cryptography(`aes-256-gcm` with `aad`)
- [x] The Node's native code of the wechatpay APIv3's RSA encrypt/decrypt/sign/verify cryptography(`sha256WithRSAEncryption` with `RSA_PKCS1_OAEP_PADDING`)
- [x] Most of the APIv3's GET/POST requests should working fine, dependency on [Axios](https://github.com/axios/axios), examples below
- [x] The wechatpay APIv3's media file upload is out, optional dependency on [form-data](https://github.com/form-data/form-data), examples below
- [x] The wechatpay APIv3's public certificate(s) downloader is out, optional dependency on [commander](https://github.com/tj/commander.js), usage manual followed
- [x] The wechatpay APIv3's billdownload and castCsvBill are there, examples below

## Installing

`$ npm install wechatpay-axios-plugin`

## Requirements

The `oaepHash` used in `Rsa.encrypt` and `Rsa.decrypt` were added on Node v12.9.0. So that the Node minimum version should be 12.9.0(I'm not very sure).

## First of all

The Wechatpay APIv3 did a greate architecture of the HTTP(s) request/response data exchange. It was by the `RSA` cryptography(see above feature list). The merchant's `RSA` certificate which is for HTTP(s) request can be generated by the `Administrator` via the merchant management platform. However, the APIv3's response certificate(s) was only placed via `/v3/certificates`. The following CLI tools is doing the `DOWNLOAD` thing. Usage manual here:

<details>
  <summary>$ <b>./bin/certificateDownloader -h</b> (click to show)</summary>

```
Usage: certificateDownloader [options]

Options:
  -V, --version              output the version number
  -m, --mchid <string>       The merchant's ID, aka mchid.
  -s, --serialno <string>    The serial number of the merchant's public certificate aka serialno.
  -f, --privatekey <string>  The path of the merchant's private key certificate aka privatekey.
  -k, --key <string>         The secret key string of the merchant's APIv3 aka key.
  -o, --output [string]      Path to output the downloaded wechatpay's public certificate(s) (default: "/tmp")
  -h, --help                 display help for command
```
</details>

<details>
  <summary>$ <b>./bin/certificateDownloader</b> -m NUMERICAL -s HEXADECIAL -f apiclient_key.pem -k YOURAPIV3SECRETKEY -o .</summary>

```
Wechatpay Public Certificate#0
  serial=HEXADECIALHEXADECIALHEXADECIAL
  notBefore=Wed, 22 Apr 2020 01:43:19 GMT
  notAfter=Mon, 21 Apr 2025 01:43:19 GMT
  Saved to: wechatpay_HEXADECIALHEXADECIALHEXADECIAL.pem
You should verify the above infos again even if this library already did(by rsa.verify):
    openssl x509 -in wechatpay_HEXADECIALHEXADECIALHEXADECIAL.pem -noout -serial -dates

```
</details>

For now, you need pass the above `serial` and `wechatpay_HEXADECIALHEXADECIALHEXADECIAL.pem` (buffer or plaintext) as {key:value} pairs to the following `certs` Object. And then, most of the APIv3 requests/responses should working fine.

## Examples

### Initialization

```js
const axios = require('axios')
const wxp = require('wechatpay-axios-plugin')
const {readFileSync} = require('fs')

const merchantPrivateKey  = readFileSync('/your/home/hellowechatpay/apiclient_key.pem')
const wechatpayPublicCert = '-----BEGIN CERTIFICATE-----' + '...' + '-----END CERTIFICATE-----'

const instance = axios.create({
  baseURL: 'https://api.mch.weixin.qq.com',
})

const client = wxp(instance, {
  mchid: 'your_merchant_id',
  serial: 'serial_number_of_your_merchant_public_cert',
  privateKey: merchantPrivateKey,
  certs: {
    'serial_number': wechatpayPublicCert,
  }
})
```

**Note:** The `readFileSync` function is not mandatares, you may passed the plaintext certs such as `wechatpayPublicCert` sample.

### Promise style

#### POST `/v3/combine-transactions/jsapi` with `JSON` body payload

```js
client.post('/v3/combine-transactions/jsapi', {}).then(response => {
  console.info(response)
}, error => {
  console.error(error)
})
```

#### POST `/v3/smartguide/guides/{guide_id}/assign` mixed `RESTful` parameter with `JSON` body payload, response as `204` status code.

```js
client.post(`/v3/smartguide/guides/${guide_id}/assign`, {
  sub_mchid,
  out_trade_no,
}).catch(error => {
  console.error(error)
})
```

#### POST `/v3/marketing/favor/media/image-upload` with `multipart/form-data` payload

```js
const FormData = require('form-data')
const {createReadStream} = require('fs')

const imageMeta = {
  filename: 'hellowechatpay.png',
  // easy calculated by the command `sha256sum hellowechatpay.png` on OSX
  sha256: '1a47b1eb40f501457eaeafb1b1417edaddfbe7a4a8f9decec2d330d1b4477fbe',
}

const imageData = new FormData()
imageData.append('meta', JSON.stringify(imageMeta), {contentType: 'application/json'})
imageData.append('file', createReadStream('./hellowechatpay.png'))

client.post('/v3/marketing/favor/media/image-upload', imageData, {
  meta: imageMeta,
  headers: imageData.getHeaders()
}).then(res => {
  console.info(res.data.media_url)
}).catch(error => {
  console.error(error)
})
```

#### GET `/v3/bill/tradebill` chains with `/v3/billdownload/file`

```js
const assert = require('assert')
const crypto = require('crypto')
const sha1 = (data) => crypto.createHash('sha1').update(data).copy().digest('hex')

const fmt = require('./lib/formatter')

client.get('/v3/bill/tradebill', {
  params: {
    bill_date: '2020-06-01',
    bill_type: 'ALL',
  }
}).then(({data: {download_url, hash_value}}) => client.get(download_url, {
    signed: hash_value,
    responseType: 'arraybuffer',
})).then(res => {
  assert(sha1(res.data.toString()) === res.config.signed, 'verify the SHA1 digest failed.')
  console.info(fmt.castCsvBill(res.data))
}).catch(error => {
  console.error(error)
})
```

### Async/Await style

#### GET `/v3/merchant-service/complaints` with `query` parameters

```js
(async () => {
  try {
    const res = await client.get('/v3/merchant-service/complaints', {
      params: {
        limit      : 5,
        offset     : 0,
        begin_date : '2020-03-07',
        end_date   : '2020-03-14',
      }
    })
    console.info(res.data)
  } catch (error) {
    console.error(error)
  }
})()
```

#### POST `/v3/pay/partner/transactions/native` with `JSON` body payload

```js
(async () => {
  try {
    const res = await client.post('/v3/pay/partner/transactions/native', {
      sp_appid,
      sp_mchid,
      sub_mchid,
      description,
      out_trade_no,
      time_expire: new Date( (+new Date) + 33*60*1000 ), //after 33 minutes
      attach,
      notify_url,
      amount: {
        total: 1,
      }
    })
    console.info(res.data.code_url)
  } catch (error) {
    console.error(error)
  }
})()
```

#### GET `/v3/marketing/favor/stocks/{stock_id}` mixed `query` with `RESTful` parameters

```js
(async () => {
  try {
    const res = await client.post(`/v3/marketing/favor/stocks/${stock_id}`, {
      params: {
        stock_creator_mchid,
      }
    })
    console.info(res.data)
  } catch(error) {
    console.error(error)
  }
})()
```

#### POST `/v3/marketing/partnerships/build` with special `Header` field parameter

```js
(async () => {
  try {
    const res = await client.post(`/v3/marketing/partnerships/build`, {
      partner: {
        type,
        appid
      },
      authorized_data: {
        business_type,
        stock_id
      }
    }, {
      headers: {
        [`Idempotency-Key`]: 12345
      }
    })
    console.info(res.data)
  } catch (error) {
    console.error(error)
  }
})()
```

#### POST `/v3/merchant/media/video_upload` with `multipart/form-data` payload

```js
const FormData = require('form-data')
const {createReadStream} = require('fs')

(async () => {
  const videoMeta = {
    filename: 'hellowechatpay.mp4',
    // easy calculated by the command `sha256sum hellowechatpay.mp4` on OSX
    sha256: '1a47b1eb40f501457eaeafb1b1417edaddfbe7a4a8f9decec2d330d1b4477fbe',
  }

  const videoData = new FormData()
  videoData.append('meta', JSON.stringify(videoMeta), {contentType: 'application/json'})
  videoData.append('file', createReadStream('./hellowechatpay.mp4'))

  try {
    const res = await client.post('/v3/merchant/media/video_upload', videoData, {
      meta: videoMeta,
      headers: videoData.getHeaders()
    })
    console.info(res.data.media_id)
  } catch (error) {
    console.error(error)
  }
})()
```

#### GET `/v3/bill/tradebill` and `/v3/billdownload/file` with `gzip` special

```js
const {unzipSync} = require('zlib')
const assert = require('assert')
const crypto = require('crypto')
const sha1 = (data) => crypto.createHash('sha1').update(data).copy().digest('hex')

const fmt = require('./lib/formatter')

(async () => {
  try {
    // recommend way, because of limits of the network transport
    const {data: {download_url, hash_value}} = await client.get('/v3/bill/tradebill', {
      params: {
        bill_date: '2020-06-01',
        bill_type: 'ALL',
        tar_type: 'GZIP',
      }
    })
    const {data} = await client.get(download_url, {responseType: 'arraybuffer'})
    // note here: previous `hash_value` was about the source `csv`, not the `gzip` data
    //            so it needs unziped first, then to compare the `SHA1` degest
    const bill = unzipSync(data)
    assert.ok(hash_value === sha1(bill.toString()), 'SHA1 verification failed')
    console.info(fmt.castCsvBill(bill))
  } catch (error) {
    console.error(error)
  }
})()
```

You may find some advance usages via the [Axios](https://github.com/axios/axios) and [form-data](https://github.com/form-data/form-data) projects.

If you find a bug, please issue [here](https://github.com/TheNorthMemory/wechatpay-axios-plugin/issues).

## Changelog

- v0.0.8
  - Optim: on `castCsvBill`, drop the `trim` on each rows
  - Optim: on `response` validation, checking ± 5 mins first then to `Rsa.verify`
  - Optim: moved the `commander` optional dependency, because it's only for the `CLI` tool
  - Feature: shipped 99 tests(`npm test`)

- v0.0.7
  - Feature: billdownload and castCsvBill
  - eslint enabled (`npm run lint`)

- v0.0.6
  - Chinese document

- v0.0.5
  - Renew document and codes comments

- v0.0.4
  - Feature: certificate downloader, deps on `commander`

- v0.0.3
  - Feature: media file upload, optional deps on `form-data`

- v0.0.2
  - Feature: Assert the response's timestamp ± 5 mins
  - Refactor as CommonJS style(#6)
  - Limits the communicating parameters(#7)
  - Coding styles(#5)
  - Coding comments and Document(#4, #3, #2, #1)

- v0.0.1
  - Init ES2015+ style

## License

The MIT License (MIT)

Copyright (c) 2020 James ZHANG(TheNorthMemory)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
