# 微信支付 Axios 插件版

[![GitHub version](https://badgen.net/github/release/TheNorthMemory/wechatpay-axios-plugin)](https://github.com/TheNorthMemory/wechatpay-axios-plugin)
[![GitHub issues](https://badgen.net/github/open-issues/TheNorthMemory/wechatpay-axios-plugin)](https://github.com/TheNorthMemory/wechatpay-axios-plugin)
[![nodejs version](https://badgen.net/npm/node/wechatpay-axios-plugin)](https://github.com/TheNorthMemory/wechatpay-axios-plugin)
[![types](https://badgen.net/npm/types/wechatpay-axios-plugin)](https://www.npmjs.com/package/wechatpay-axios-plugin)
[![NPM module version](https://badgen.net/npm/v/wechatpay-axios-plugin)](https://www.npmjs.com/package/wechatpay-axios-plugin)
[![NPM module downloads per month](https://badgen.net/npm/dm/wechatpay-axios-plugin)](https://www.npmjs.com/package/wechatpay-axios-plugin)
[![NPM module license](https://badgen.net/npm/license/wechatpay-axios-plugin)](https://www.npmjs.com/package/wechatpay-axios-plugin)

## 主要功能

- [x] 使用Node原生代码实现微信支付APIv3的AES加/解密功能(`aes-256-gcm` with `aad`)
- [x] 使用Node原生代码实现微信支付APIv3的RSA加/解密、签名、验签功能(`sha256WithRSAEncryption` with `RSA_PKCS1_OAEP_PADDING`)
- [x] 大部分微信支付APIv3的HTTP GET/POST/PUT/PATCH/DELETE应该能够正常工作，依赖 [Axios](https://github.com/axios/axios), 示例代码如下
- [x] 支持微信支付APIv3的媒体文件上传(图片/视频)功能，可选依赖 [form-data](https://github.com/form-data/form-data), 示例代码如下
- [x] 支持微信支付APIv3的应答证书下载功能，可选依赖 [commander](https://github.com/tj/commander.js), 使用手册如下
- [x] 支持微信支付APIv3的帐单下载及解析功能，示例代码如下
- [x] 支持微信支付APIv3面向对象编程模式
- [x] 支持 `Typescript`
- [x] 支持微信支付XML风格的接口(通常所说v2)调用，依赖 [node-xml2js](https://github.com/Leonidas-from-XIV/node-xml2js), 示例代码如下<sup>:bulb:</sup>

## 安装

`$ npm install wechatpay-axios-plugin`

## 系统要求

此库在v10.15.0上已测试，可以正常使用。NodeJS的原生`crypto`模块，自v12.9.0在 `publicEncrypt` 及 `privateDecrypt` 增加了 `oaepHash` 入参选项，本类库在 `Rsa.encrypt` 及 `Rsa.decrypt` 显式声明了此入参，Nodejs10.15.0应该是内置了此参数的默认值，所以可以正常工作；虽然可用，不过仍旧推荐使用 Nodejs ≧ v12.9.0。

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

## 面向对象模式

`v0.2.0` 开始支持面向对象方式编程，书写请求/响应过程，有如下约定：

1. 请求 `URI` 作为级联对象，可以轻松构建请求对象，例如 `/v3/pay/transactions/native` 即自然翻译成 `v3.pay.transactions.native`;
2. 每个 `URI` 所支持的 `HTTP METHOD`，即作为 请求对象的末尾执行方法，例如: `v3.pay.transactions.native.post({})`;
3. 每个 `URI` 有中线(dash)分隔符的，可以使用驼峰`camelCase`风格书写，例如: `merchant-service`可写成 `merchantService`，或者属性风格，例如 `v3['merchant-service']`;
4. 每个 `URI`.pathname 中，若有动态参数，例如 `business_code/{business_code}` 可写成 `business_code.$business_code$` 或者属性风格书写，例如 `business_code['{business_code}']`，抑或直接按属性风格，直接写参数值也可以，例如 `business_code['2000001234567890']`;
5. 建议 `URI` 按照 `PascalCase` 风格书写, `TS Definition` 已在路上(还有若干问题没解决)，将是这种风格，代码提示将会很自然;

### 初始化

```js
const {Wechatpay} = require('wechatpay-axios-plugin')
const wxpay = new Wechatpay({
  mchid: 'your_merchant_id',
  serial: 'serial_number_of_your_merchant_public_cert',
  privateKey: '-----BEGIN PRIVATE KEY-----' + '...' + '-----END PRIVATE KEY-----',
  certs: {
    'serial_number': '-----BEGIN CERTIFICATE-----' + '...' + '-----END CERTIFICATE-----',
  }
})
```

### Native下单API
```js
wxpay.v3.pay.transactions.native
  .post({/*文档参数放这里就好*/})
  .then(({data: {code_url}}) => console.info(code_url))
  .catch(({response: {status, statusText, data}}) => console.error(status, statusText, data))
```

### 查询订单API
```js
wxpay.v3.pay.transactions.id['{transaction_id}']
  .withEntities({transaction_id: '1217752501201407033233368018'})
  .get({params: {mchid: '1230000109'}})
  .then(({data}) => console.info(data))
  .catch(({response: {status, statusText, data}}) => console.error(status, statusText, data))
```

### 关单API
```js
wxpay.v3.pay.transactions.outTradeNo['1217752501201407033233368018']
  .post({mchid: '1230000109'})
  .then(({status, statusText}) => console.info(status, statusText))
  .catch(({response: {status, statusText, data}}) => console.error(status, statusText, data))
```

### 创建商家券API
```js
wxpay.v3.marketing.busifavor.stocks
  .post({/*商家券创建条件*/})
  .then(({data}) => console.info(data))
  .catch(({response: {status, statusText, data}}) => console.error(status, statusText, data))
```

### 查询用户单张券详情API
```js
;(async () => {
  try {
    const {data: detail} = await wxpay.v3.marketing.busifavor.users.$openid$.coupons['{coupon_code}'].appids['wx233544546545989']
      .withEntities({openid: '2323dfsdf342342', coupon_code: '123446565767'})
      .get()
    console.info(detail)
  } catch({response: {status, statusText, data}}) {
    console.error(status, statusText, data)
  }
}
```

## 支持 `XML based` 接口调用

`v0.3.0` 开始支持微信支付以XML为交换负载的接口调用，使用方式如下：

### 实例化客户端

```js
const {Wechatpay, Formatter: fmt} = require('../')
const client = Wechatpay.xmlBased({
  secret: 'your_merchant_secret_key_string',
  merchant: {
    cert: '-----BEGIN CERTIFICATE-----' + '...' + '-----END CERTIFICATE-----',
    key: '-----BEGIN PRIVATE KEY-----' + '...' + '-----END PRIVATE KEY-----',
    // or
    // passphrase: 'your_merchant_id',
    // pfx: fs.readFileSync('/your/merchant/cert/apiclient_cert.p12'),
  },
})
```

### 自定义打印日志

```js
client.defaults.transformRequest.push(data => (console.log(data), data))
client.defaults.transformResponse.unshift(data => (console.log(data), data))
```

### 申请退款

```js
client.post('/secapi/pay/refund', {
  appid: 'wx8888888888888888',
  mch_id: '1900000109',
  out_trade_no: '1217752501201407033233368018',
  out_refund_no: '1217752501201407033233368018',
  total_fee: 100,
  refund_fee: 100,
  refund_fee_type: 'CNY',
  nonce_str: fmt.nonce(),
}).then(res => console.info(res.data)).catch(({response}) => console.error(response))
```

### 企业付款

```js
client.post('/mmpaymkttransfers/promotion/transfers', {
  appid: 'wx8888888888888888',
  mch_id: '1900000109',
  partner_trade_no: '10000098201411111234567890',
  openid: 'oxTWIuGaIt6gTKsQRLau2M0yL16E',
  check_name: 'FORCE_CHECK',
  re_user_name: '王小王',
  amount: 10099,
  desc: '理赔',
  spbill_create_ip: '192.168.0.1',
  nonce_str: fmt.nonce(),
}).then(res => console.info(res.data)).catch(({response}) => console.error(response))
```

# Wechatpay Axios Plugin

## Features

- [x] The Node's native code of the wechatpay APIv3's AES encrypt/decrypt cryptography(`aes-256-gcm` with `aad`)
- [x] The Node's native code of the wechatpay APIv3's RSA encrypt/decrypt/sign/verify cryptography(`sha256WithRSAEncryption` with `RSA_PKCS1_OAEP_PADDING`)
- [x] Most of the APIv3's GET/POST/PUT/PATCH/DELETE requests should working fine, dependency on [Axios](https://github.com/axios/axios), examples below
- [x] The wechatpay APIv3's media file upload is out, optional dependency on [form-data](https://github.com/form-data/form-data), examples below
- [x] The wechatpay APIv3's public certificate(s) downloader is out, optional dependency on [commander](https://github.com/tj/commander.js), usage manual followed
- [x] The wechatpay APIv3's billdownload and castCsvBill are there, examples below
- [x] The `OOP` developing style of the wechatpay APIv3
- [x] `Typescript` supported
- [x] Fulfill the XML based API requests, dependency on [node-xml2js](https://github.com/Leonidas-from-XIV/node-xml2js) <sup>:bulb:</sup>

## Installing

`$ npm install wechatpay-axios-plugin`

## Requirements

This library was tested under v10.15.0, it works. However, the recommended node version is ≧ v12.9.0. Because the `oaepHash` parameter were available since Node v12.9.0 which is used on the `Rsa.encrypt` and `Rsa.decrypt` functions even if the lower version nodejs was built in that value.

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

## OOP style development

Since `v0.2.0`, here's avaliable the `OOP` style development. All of the remote's `URI.pathname` is mapping as the `SDK`'s `Object` which contains the HTTP `get` `post` and `upload` (named for `multipart/form-data`) methods. Specially, while the `Object`(named as `container`) with dynamic veriable parameter(s) (`uri_template`), those may be transformed by the `container`'s `withEntities` method.

With this style, the following conversions should be known:

1. Each of the `URI`, eg: `/v3/pay/transactions/native` is mapping to `v3.pay.transactions.native`;
2. Each of the `URI`'s `HTTP METHOD`，are mapping to the `container`'s executor, eg: `v3.pay.transactions.native.post({})`;
3. While the `URI` contains the `dash-split-words`, the entity can be wrote as `camelCase` style, eg: `merchant-service` to `merchantService` or by the `Object.property`'s style as `v3['merchant-service']`;
4. While the `URI` contains the `dynamic_veriable_parameter`, eg: `business_code/{business_code}`, it can be `business_code.$business_code$` or `business_code['{business_code}']` or directly replaced with actual value eg: `business_code['2000001234567890']`;
5. Recommend writing the `URI` entities with `PascalCase` style. Because the `TS Definition` is on the road, those shall be this style;

With this style, the simples were shown above.

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

## `Typescript` basic example

### Initialization

```typescript
import {default as axios, AxiosRequestConfig, AxiosError} from 'axios'
import {default as wxpay, Rsa as rsa, Aes as aes, Formatter as fmt, WechatpayAxiosPlugin} from 'wechatpay-axios-plugin'

const merchantPrivateKey = '-----BEGIN PRIVATE KEY-----' + '...' + '-----END PRIVATE KEY-----'
const wechatpayPublicCert = '-----BEGIN CERTIFICATE-----' + '...' + '-----END CERTIFICATE-----'

const instance = axios.create({baseURL: `https://api.mch.weixin.qq.com`} as AxiosRequestConfig)
const client = wxpay(instance, {
  mchid: 'your_merchant_id',
  serial: 'serial_number_of_your_merchant_public_cert',
  privateKey: merchantPrivateKey,
  certs: {
    'serial_number': wechatpayPublicCert
  } as WechatpayAxiosPlugin.platformCertificates
} as WechatpayAxiosPlugin.apiConfig)
```

### Sensitive Information Decryption Usage

```typescript
;(async () => {
  try {
    const res = await client.get('/v3/merchant-service/complaints', {params: {
      limit: 50,
      offset: 0,
      begin_date: (new Date(+new Date - 29*86400*1000)).toJSON().slice(0, 10),
      end_date: (new Date).toJSON().slice(0, 10),
    }})
    // decrypt the `Sensitive Information`
    res.data.data.map(row => (row.payer_phone = rsa.decrypt(row.payer_phone, merchantPrivateKey), row))
    console.info(res.data)
  } catch({response: {status, statusText, data, headers}, request, config}) {
    console.error(status, statusText, data)
  }
})()
```

## Changelog

- v0.3.0
  - Feature: The XML based API requests.

- v0.2.3
  - Optim: Coding quality.

- v0.2.2
  - Fix: #8 `verfier` on the `204` status case.

- v0.2.1
  - Optim: Back compatiable for `12.4.0` < `Node` ≧ `10.15.0`.

- v0.2.0
  - Feature: `OOP` developing style of the wechatpay APIv3.

- v0.1.0
  - Optim: Toggle the `Nodejs` version ≧ `10.15.0`.
  - Optim: Documentation and coding comments.

- v0.0.9
  - Feature: definition of the `Typescript`

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
