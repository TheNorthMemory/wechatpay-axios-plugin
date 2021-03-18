# 微信支付 OpenAPI SDK

The WeChatPay OpenAPI v2&v3' Smart Development Kit

[![GitHub actions](https://github.com/TheNorthMemory/wechatpay-axios-plugin/workflows/npm%20test/badge.svg)](https://github.com/TheNorthMemory/wechatpay-axios-plugin/actions)
[![GitHub release](https://badgen.net/npm/v/wechatpay-axios-plugin)](https://github.com/TheNorthMemory/wechatpay-axios-plugin/releases)
[![types](https://badgen.net/npm/types/wechatpay-axios-plugin)](https://www.npmjs.com/package/wechatpay-axios-plugin)
[![NPM version](https://badgen.net/npm/node/wechatpay-axios-plugin)](https://www.npmjs.com/package/wechatpay-axios-plugin)
[![NPM downloads per month](https://badgen.net/npm/dm/wechatpay-axios-plugin)](https://www.npmjs.com/package/wechatpay-axios-plugin)
[![NPM license](https://badgen.net/npm/license/wechatpay-axios-plugin)](https://www.npmjs.com/package/wechatpay-axios-plugin)

## 主要功能

- [x] 使用Node原生`crypto`实现微信支付APIv3的AES加/解密功能(`aes-256-gcm` with `aad`)
- [x] 使用Node原生`crypto`实现微信支付APIv3的RSA加/解密、签名、验签功能(`sha256WithRSAEncryption` with `RSA_PKCS1_OAEP_PADDING`)
- [x] 大部分微信支付APIv3的HTTP GET/POST/PUT/PATCH/DELETE应该能够正常工作，依赖 [Axios](https://github.com/axios/axios), 示例代码如下
- [x] 支持微信支付APIv3的媒体文件上传(图片/视频)功能，可选依赖 [form-data](https://github.com/form-data/form-data), 示例代码如下
- [x] 支持微信支付APIv3的应答证书下载功能，可选依赖 [commander](https://github.com/tj/commander.js), 使用手册如下
- [x] 支持微信支付APIv3的帐单下载及解析功能，示例代码如下
- [x] 支持微信支付APIv2 & APIv3面向对象编程模式，示例代码如下
- [x] 支持 `Typescript`
- [x] 支持微信支付XML风格的接口(通常所说v2)调用，依赖 [node-xml2js](https://github.com/Leonidas-from-XIV/node-xml2js), 示例代码如下
- [x] 支持微信支付APIv2版的 `AES-256-ECB/PKCS7PADDING` 通知消息加/解密
- [x] APIv2 & APIv3 与微信交互的各种数据签名用法示例
- [x] 支持 企业微信-企业支付-企业红包/向员工付款 功能，示例用法及代码如下

## 系统要求

NodeJS原生`crypto`模块，自v12.9.0在 `publicEncrypt` 及 `privateDecrypt` 增加了 `oaepHash` 入参选项，本类库封装的 `Rsa.encrypt` 及 `Rsa.decrypt` 显式声明了此入参，测试下来在NodeJS10.15.0上可正常工作；虽然在v10.15上可用，不过仍旧推荐使用 NodeJS >= v12.9.0。

## 安装

`$ npm install wechatpay-axios-plugin`

## 万里长征第一步

微信支付APIv3使用 (RESTful API with JSON over HTTP）接口设计，数据交换采用非对称（RSA-OAEP）加/解密方案。API上行所需的`商户RSA私钥证书`，可以由商户`超级管理员`使用专用证书生成工具生成并获取到，然而，API下行所需的`平台RSA证书`只能从`/v3/certificates`接口获取（应答证书还经过了对称(AES-GCM)加密，须采用`APIv3密钥`才能解密）。本项目也提供了命令行下载工具，使用手册如下：

<details>
  <summary>$ <b>./bin/certificateDownloader.js -h</b> (点击显示)</summary>

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
  <summary>$ <b>./bin/certificateDownloader.js</b> -m N -s S -f F.pem -k K -o .</summary>

```
Wechatpay Public Certificate#0
  serial=HEXADECIAL
  notBefore=Wed, 22 Apr 2020 01:43:19 GMT
  notAfter=Mon, 21 Apr 2025 01:43:19 GMT
  Saved to: wechatpay_HEXADECIAL.pem
You should verify the above infos again even if this library already did(by rsa.verify):
    openssl x509 -in wechatpay_HEXADECIAL.pem -noout -serial -dates

```
**注：** 提供必选参数且运行后，屏幕即打印出如上信息，提示`证书序列号`及`起、止格林威治(GMT)时间`及证书下载保存位置。
</details>

以下文档及示例都是基本用法，没啥花活儿，祝开心。 :smile:

## 面向对象模式

本类库自`0.2.0`开始，按照 `URL.pathname` 以`/`做切分，映射成对象属性，`0.4`版开始，支持APIv2的`pathname`映射，编码书写方式有如下约定：

1. 请求 `URI` 作为级联对象，可以轻松构建请求对象，例如 `/v3/pay/transactions/native` 即自然翻译成 `v3.pay.transactions.native`;
2. 每个 `URI` 所支持的 `HTTP METHOD`，即作为 请求对象的末尾执行方法，例如: `v3.pay.transactions.native.post({})`;
3. 每个 `URI` 有中线(dash)分隔符的，可以使用驼峰`camelCase`风格书写，例如: `merchant-service`可写成 `merchantService`，或者属性风格，例如 `v3['merchant-service']`;
4. 每个 `URI`.pathname 中，若有动态参数，例如 `business_code/{business_code}` 可写成 `business_code.$business_code$` 或者属性风格书写，例如 `business_code['{business_code}']`，抑或直接按属性风格，直接写参数值也可以，例如 `business_code['2000001234567890']`;
5. 建议 `URI` 按照 `PascalCase` 风格书写, `TS Definition` 已在路上(还有若干问题没解决)，将是这种风格，代码提示将会很自然;
6. SDK内置的 `/v2` 对象，其特殊标识为APIv2级联对象，之后串接切分后的`pathname`，如 `/v2/pay/micropay` 即以XML形式请求远端接口；
7. 每个级联对象默认为HTTP`POST`函数，其同时隐式内置`GET/POST/PUT/PATCH/DELETE` 操作方法链，支持全大写及全小写(未来有可能会删除)两种编码方式，说明见`变更历史`;

以下示例用法，均以`Promise`或`Async/Await`结合此种编码模式展开，级联对象操作符的调试信息见文档末。

### 初始化

```js
const {Wechatpay, Formatter} = require('wechatpay-axios-plugin')
const wxpay = new Wechatpay({
  mchid: 'your_merchant_id',
  serial: 'serial_number_of_your_merchant_public_cert',
  privateKey: '-----BEGIN PRIVATE KEY-----' + '...' + '-----END PRIVATE KEY-----',
  certs: {
    'serial_number': '-----BEGIN CERTIFICATE-----' + '...' + '-----END CERTIFICATE-----',
  },
  // APIv2参数 >= 0.4.0 开始支持
  secret: 'your_merchant_secret_key_string',
  // 注： 如果不涉及资金变动，如仅收款，merchant参数可选，仅需 `secret` 一个参数，注意其为v2版的。
  merchant: {
    cert: '-----BEGIN CERTIFICATE-----' + '...' + '-----END CERTIFICATE-----',
    key: '-----BEGIN PRIVATE KEY-----' + '...' + '-----END PRIVATE KEY-----',
    // or
    // passphrase: 'your_merchant_id',
    // pfx: fs.readFileSync('/your/merchant/cert/apiclient_cert.p12'),
  },
  // APIv2沙箱环境地址
  // baseURL: 'https://api.mch.weixin.qq.com/sandboxnew',
  // 建议初始化设置此参数，详细说明见Axios官方README
  // maxRedirects: 0,
})
```

初始化字典说明如下：

- `mchid` 为你的商户号，一般是10字节纯数字
- `serial` 为你的商户证书序列号，一般是40字节字符串
- `privateKey` 为你的商户私钥证书，一般是通过官方证书生成工具生成的文件名是`apiclient_key.pem`文件，支持纯字符串或者文件流`buffer`格式
- `secret` 为APIv2版的`密钥`，商户平台上设置的32字节字符串
- `certs{[serial_number]:string}` 为通过下载工具下载的平台证书`key/value`键值对，键为平台证书序列号，值为平台证书pem格式的纯字符串或者文件流`buffer`格式
- `merchant.cert` 为你的商户证书,一般是文件名为`apiclient_cert.pem`文件，支持纯字符串或者文件流`buffer`格式
- `merchant.key` 为你的商户私钥证书，一般是通过官方证书生成工具生成的文件名是`apiclient_key.pem`文件，支持纯字符串或者文件流`buffer`格式
- `merchant.passphrase` 一般为你的商户号
- `merchant.pfx` 为你的商户`PKCS12`格式的证书，文件名一般为`apiclient_cert.p12`，支持二进制文件流`buffer`格式

**注：** 0.4.0版本做了重构及优化，APIv2&v3以及Axios初始参数，均融合在一个型参上。

## APIv3

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
  .get({params: {mchid: '1230000109'}, transaction_id: '1217752501201407033233368018'})
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

### 合单支付API

```js
wxpay.v3.combineTransactions.jsapi
  .post({/*文档参数放这里就好*/})
  .then(res => console.info(res.data))
  .catch(({response: {status, statusText, data}}) => console.error(status, statusText, data))
```

### 对账单下载及解析

```js
const assert = require('assert')
const {Hash: {sha1}} = require('wechatpay-axios-plugin')

wxpay.v3.bill.tradebill.get({
  params: {
    bill_date: '2021-02-12',
    bill_type: 'ALL',
  }
}).then(({data: {download_url, hash_value}}) => wxpay.v3.billdownload.file.get({
  params: (new URL(download_url)).searchParams,
  signed: hash_value,
  responseType: 'arraybuffer',
})).then(res => {
  assert(sha1(res.data.toString()) === res.config.signed, 'verify the SHA1 digest failed.')
  console.info(Formatter.castCsvBill(res.data))
}).catch(error => {
  console.error(error)
})
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
    const {data: detail} = await wxpay.v3.marketing.busifavor
      .users.$openid$.coupons['{coupon_code}'].appids['wx233544546545989']
      .get({openid: '2323dfsdf342342', coupon_code: '123446565767'})
    console.info(detail)
  } catch({response: {status, statusText, data}}) {
    console.error(status, statusText, data)
  }
}
```

### 服务商模式Native下单

```js
;(async () => {
  try {
    const res = await wxpay.v3.pay.partner.transactions.native({
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

### 支付即服务API

```js
;(async () => {
  try {
    const {status, statusText} = await wxpay.v3.smartguide.guides.$guide_id$.assign
      .post({sub_mchid, out_trade_no}, {guide_id})
    console.info(status, statusText)
  } catch({response: {status, statusText, data}}) {
    console.error(status, statusText, data)
  }
}
```

### 商业投诉查询API

```js
;(async () => {
  try {
    const res = await wxpay.v3.merchantService.complaints.get({
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

### 图片上传

```js
const FormData = require('form-data')
const {createReadStream} = require('fs')

const imageMeta = {
  filename: 'hellowechatpay.png',
  // easy calculated by the command `sha256sum hellowechatpay.png` on OSX
  // or by require('wechatpay-axios-plugin').Hash.sha256(filebuffer)
  sha256: '1a47b1eb40f501457eaeafb1b1417edaddfbe7a4a8f9decec2d330d1b4477fbe',
}

const imageData = new FormData()
imageData.append('meta', JSON.stringify(imageMeta), {contentType: 'application/json'})
imageData.append('file', createReadStream('./hellowechatpay.png'))

;(async () => {
  try {
    const res = await wxpay.v3.marketing.favor.media.imageUpload.post(imageData, {
      meta: imageMeta,
      headers: imageData.getHeaders()
    })
    console.info(res.data.media_url)
  } catch (error) {
    console.error(error)
  }
})()
```

### 查询优惠券详情

```js
;(async () => {
  try {
    const res = await wxpay.v3.marketing.favor.stocks.$stock_id$.post({
      params: {
        stock_creator_mchid,
      },
      stock_id,
    })
    console.info(res.data)
  } catch(error) {
    console.error(error)
  }
})()
```

### 优惠券委托营销

```js
(async () => {
  try {
    const res = await wxpay.v3.marketing.partnerships.build.post({
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

### 优惠券核销记录下载

```js
(async () => {
  try {
    let res = await wxpay.v3.marketing.favor.stocks.$stock_id$.useFlow.get({stock_id})
    res = await wxpay.v3.billdownload.file.get({
      params: (new URL(res.data.url)).searchParams,
      responseType: 'arraybuffer'
    })
    // 备注：此接口下载的文件格式与商户平台下载的不完全一致，Formatter.castCsvBill解析有差异
    console.info(res.data.toString())
  } catch (error) {
    console.error(error)
  }
})()
```

### 视频文件上传

```js
const FormData = require('form-data')
const {createReadStream} = require('fs')

const videoMeta = {
  filename: 'hellowechatpay.mp4',
  // easy calculated by the command `sha256sum hellowechatpay.mp4` on OSX
  // or by require('wechatpay-axios-plugin').Hash.sha256(filebuffer)
  sha256: '1a47b1eb40f501457eaeafb1b1417edaddfbe7a4a8f9decec2d330d1b4477fbe',
}

const videoData = new FormData()
videoData.append('meta', JSON.stringify(videoMeta), {contentType: 'application/json'})
videoData.append('file', createReadStream('./hellowechatpay.mp4'))

;(async () => {
  try {
    const res = await wxpay.v3.merchant.media.video_upload.post(videoData, {
      meta: videoMeta,
      headers: videoData.getHeaders()
    })
    console.info(res.data.media_id)
  } catch (error) {
    console.error(error)
  }
})()
```

### GZIP下载资金账单

```js
const {unzipSync} = require('zlib')
const assert = require('assert')
const {Hash: {sha1}} = require('wechatpay-axios-plugin')

;(async () => {
  try {
    const {data: {download_url, hash_value}} = await wxpay.v3.bill.fundflowbill.GET({
      params: {
        bill_date: '2020-02-12',
        bill_type: 'BASIC',
        tar_type: 'GZIP',
      }
    })
    const {data} = await wxpay.v3.billdownload.file.GET({
      params: (new URL(download_url)).searchParams,
      responseType: 'arraybuffer'
    })
    // note here: previous `hash_value` was about the source `csv`, not the `gzip` data
    //            so it needs unziped first, then to compare the `SHA1` degest
    const bill = unzipSync(data)
    assert.ok(hash_value === sha1(bill.toString()), 'SHA1 verification failed')
    console.info(Formatter.castCsvBill(bill))
  } catch (error) {
    console.error(error)
  }
})()
```

## APIv2

### 付款码(刷卡)支付

```js
wxpay.v2.pay.micropay({
  appid: 'wx8888888888888888',
  mch_id: '1900000109',
  nonce_str: Formatter.nonce(),
  sign_type: 'HMAC-SHA256',
  body: 'image形象店-深圳腾大-QQ公仔',
  out_trade_no: '1217752501201407033233368018',
  total_fee: 888,
  fee_type: 'CNY',
  spbill_create_ip: '8.8.8.8',
  auth_code: '120061098828009406',
})
.then(res => console.info(res.data))
.catch(({response: {status, statusText, data}}) => console.error(status, statusText, data))
```

### 申请退款

```js
wxpay.v2.secapi.pay.refund.post({
  appid: 'wx8888888888888888',
  mch_id: '1900000109',
  out_trade_no: '1217752501201407033233368018',
  out_refund_no: '1217752501201407033233368018',
  total_fee: 100,
  refund_fee: 100,
  refund_fee_type: 'CNY',
  nonce_str: Formatter.nonce(),
})
.then(res => console.info(res.data))
.catch(({response: {status, statusText, data}}) => console.error(status, statusText, data))
```

### 现金红包

```js
wxpay.v2.mmpaymkttransfers.sendredpack.POST({
  nonce_str: Formatter.nonce(),
  mch_billno: '10000098201411111234567890',
  mch_id: '10000098',
  wxappid: 'wx8888888888888888',
  send_name: '鹅企支付',
  re_openid: 'oxTWIuGaIt6gTKsQRLau2M0yL16E',
  total_amount: 1000,
  total_num: 1,
  wishing: 'HAPPY BIRTHDAY',
  client_ip: '192.168.0.1',
  act_name: '回馈活动',
  remark: '会员回馈活动',
  scene_id: 'PRODUCT_4',
})
.then(res => console.info(res.data))
.catch(({response: {status, statusText, data}}) => console.error(status, statusText, data))
```

### 企业付款到零钱

```js
wxpay.v2.mmpaymkttransfers.promotion.transfers({
  appid: 'wx8888888888888888',
  mch_id: '1900000109',
  partner_trade_no: '10000098201411111234567890',
  openid: 'oxTWIuGaIt6gTKsQRLau2M0yL16E',
  check_name: 'FORCE_CHECK',
  re_user_name: '王小王',
  amount: 10099,
  desc: '理赔',
  spbill_create_ip: '192.168.0.1',
  nonce_str: Formatter.nonce(),
})
.then(res => console.info(res.data))
.catch(({response: {status, statusText, data}}) => console.error(status, statusText, data))
```

### 企业付款到银行卡-获取RSA公钥

```js
wxpay.v2.risk.getpublickey({
  mch_id: '1900000109',
  sign_type: 'MD5',
  nonce_str: Formatter.nonce(),
}, {
  baseURL: 'https://fraud.mch.weixin.qq.com'
})
.then(res => console.info(res.data))
.catch(({response: {status, statusText, data}}) => console.error(status, statusText, data))
```

## 企业微信

企业微信的企业支付，数据请求包需要额外的签名，仅需做如下简单扩展适配，即可支持；以下签名注入函数所需的两个参数`agentId` `agentSecret`来自企业微信工作台，以下为示例值。

```js
const agentId = 1001001
const agentSecret = 'from_wework_agent_special_string'
const {Hash} = require('wechatpay-axios-plugin')
```

### 企业红包-注入签名规则

```js
Wechatpay.client.v2.defaults.transformRequest.unshift(function workwxredpack(data, headers) {
  const {act_name, mch_billno, mch_id, nonce_str, re_openid, total_amount, wxappid} = data

  if (!(act_name && mch_billno && mch_id && nonce_str && re_openid && total_amount && wxappid)) {
    return data
  }

  data.workwx_sign = Hash.md5(
    Formatter.queryStringLike(Formatter.ksort({
      act_name, mch_billno, mch_id, nonce_str, re_openid, total_amount, wxappid
    })), agentSecret, agentId
  ).toUpperCase()

  return data
})
```

### 发放企业红包

```js
wxpay.v2.mmpaymkttransfers.sendworkwxredpack({
  mch_billno: '123456',
  wxappid: 'wx8888888888888888',
  sender_name: 'XX活动',
  sender_header_media_id: '1G6nrLmr5EC3MMb_-zK1dDdzmd0p7cNliYu9V5w7o8K0',
  re_openid: 'oxTWIuGaIt6gTKsQRLau2M0yL16E',
  total_amount: 1000,
  wishing: '感谢您参加猜灯谜活动，祝您元宵节快乐！',
  act_name: '猜灯谜抢红包活动',
  remark: '猜越多得越多，快来抢！',
  mch_id: '1900000109',
  nonce_str: Formatter.nonce(),
})
.then(res => console.info(res.data))
.catch(console.error)
```

### 向员工付款-注入签名规则

```js
Wechatpay.client.v2.defaults.transformRequest.unshift(function wwsptrans2pocket(data, headers) {
  const {amount, appid, desc, mch_id, nonce_str, openid, partner_trade_no, ww_msg_type} = data

  if (!(amount && appid && desc && mch_id && nonce_str && openid && partner_trade_no && ww_msg_type)) {
    return data
  }

  data.workwx_sign = Hash.md5(
    Formatter.queryStringLike(Formatter.ksort({
      amount, appid, desc, mch_id, nonce_str, openid, partner_trade_no, ww_msg_type
    })), agentSecret, agentId
  ).toUpperCase()

  return data
})
```

### 向员工付款

```js
wxpay.v2.mmpaymkttransfers.promotion.paywwsptrans2pocket({
  appid: 'wxe062425f740c8888',
  device_info: '013467007045764',
  partner_trade_no: '100000982017072019616',
  openid: 'ohO4Gt7wVPxIT1A9GjFaMYMiZY1s',
  check_name: 'NO_CHECK',
  re_user_name: '张三',
  amount: '100',
  desc: '六月出差报销费用',
  spbill_create_ip: '10.2.3.10',
  ww_msg_type: 'NORMAL_MSG',
  act_name: '示例项目',
  mch_id: '1900000109',
  nonce_str: Formatter.nonce(),
})
.then(res => console.info(res.data))
.catch(console.error)
```

## 自定义打印日志

```js
// APIv2 日志
Wechatpay.client.v2.defaults.transformRequest.push(data => (console.log(data), data))
Wechatpay.client.v2.defaults.transformResponse.unshift(data => (console.log(data), data))
// APIv3 日志
Wechatpay.client.v3.defaults.transformRequest.push((data, headers) => (console.log(data, headers), data))
Wechatpay.client.v3.defaults.transformResponse.unshift((data, headers) => (console.log(data, headers), data))
```

## 获取RSA公钥

非标准接口地址，也可以这样调用

```js
Wechatpay.client.v2.post('https://fraud.mch.weixin.qq.com/risk/getpublickey', {
  mch_id: '1900000109',
  nonce_str: Formatter.nonce(),
  sign_type: 'HMAC-SHA256',
})
.then(({data}) => console.info(data))
.catch(({response}) => console.error(response))
```

## XML形式通知应答

```js
const {Transformer} = require('wechatpay-axios-plugin')
const xml = Transformer.toXml({
  return_code: 'SUCCESS',
  return_msg: 'OK',
})

console.info(xml)
```

## aes-256-ecb/pcks7padding

### 解密

```js
const {Aes: {AesEcb}, Transformer, Hash} = require('wechatpay-axios-plugin')
const secret = 'exposed_your_key_here_have_risks'
const xml = '<xml>' + ... '</xml>'
const obj = Transformer.toObject(xml)
const res = AesEcb.decrypt(obj.req_info, Hash.md5(secret))
obj.req_info = Transformer.toObject(res)
console.info(obj)
```

### 加密

```js
const obj = Transformer.toObject(xml)
const ciphertext = AesEcb.encrypt(obj.req_info, Hash.md5(secret))
console.assert(
  obj.req_info === ciphertext,
  `The notify hash digest should be matched the local one`
)
```

## APIv2数据签名

### JSAPI

```js
const {Hash, Formatter} = require('wechatpay-axios-plugin')
const v2Secret = 'exposed_your_key_here_have_risks'
const params = {
  appId: 'wx8888888888888888',
  timeStamp: `${Formatter.timestamp()}`,
  nonceStr: Formatter.nonce(),
  package: 'prepay_id=wx201410272009395522657a690389285100',
  signType: 'HMAC-SHA256',
}
params.paySign = Hash.sign(params.signType, params, v2Secret)

console.info(params)
```

### APP

```js
const {Hash, Formatter} = require('wechatpay-axios-plugin')
const v2Secret = 'exposed_your_key_here_have_risks'
const params = {
  appid: 'wx8888888888888888',
  partnerid: '1900000109',
  prepayid: 'WX1217752501201407033233368018',
  package: 'Sign=WXPay',
  timestamp: `${Formatter.timestamp()}`,
  noncestr: Formatter.nonce(),
}
params.sign = Hash.sign('MD5', params, v2Secret)

console.info(params)
```

## APIv3数据签名

### JSAPI

```js
const {Rsa, Formatter} = require('wechatpay-axios-plugin')
const privateKey = require('fs').readFileSync('/your/merchant/priviate_key.pem')

const params = {
  appId: 'wx8888888888888888',
  timeStamp: `${Formatter.timestamp()}`,
  nonceStr: Formatter.nonce(),
  package: 'prepay_id=wx201410272009395522657a690389285100',
  signType: 'RSA',
}
params.paySign = Rsa.sign(Formatter.joinedByLineFeed(
  params.appId, params.timeStamp, params.nonceStr, params.package
), privateKey)

console.info(params)
```

### 商家券-小程序发券v2版签名规则

```js
const {Hash, Formatter} = require('wechatpay-axios-plugin')
const v2Secret = 'exposed_your_key_here_have_risks'

// flat the miniprogram data transferring structure for sign
const busiFavorFlat = ({send_coupon_merchant, send_coupon_params = []} = {}) => {
  return {
    send_coupon_merchant,
    ...send_coupon_params.reduce((des, row, idx) => (
      Object.keys(row).map(one => des[`${one}${idx}`] = row[one]), des
    ), {}),
  }
}

// the miniprogram data transferring structure
const busiFavor = {
  send_coupon_params: [
    {out_request_no:'1234567',stock_id:'abc123'},
    {out_request_no:'7654321',stock_id:'321cba'},
  ],
  send_coupon_merchant: '10016226'
}

busiFavor.sign = Hash.sign('HMAC-SHA256', busiFavorFlat(busiFavor), v2Secret)

console.info(busiFavor)
```

### 商家券-H5发券v2版签名规则

```js
const {Hash, Formatter} = require('wechatpay-axios-plugin')
const v2Secret = 'exposed_your_key_here_have_risks'
const params = {
  stock_id: '12111100000001',
  out_request_no: '20191204550002',
  send_coupon_merchant: '10016226',
  open_id: 'oVvBvwEurkeUJpBzX90-6MfCHbec',
  coupon_code: '75345199',
}
params.sign = Hash.sign('HMAC-SHA256', params, v2Secret)

console.info(params)
```

## 单元测试

`npm install && npm test`

## 文末打印一波示例方法链

<details>
  <summary>console.info(wxpay)</summary>

```js
[Function (anonymous)] {
  v2: [Function: /v2] {
    risk: [Function: /v2/risk] {
      getpublickey: [Function: /v2/risk/getpublickey]
    },
    pay: [Function: /v2/pay] { micropay: [Function: /v2/pay/micropay] },
    secapi: [Function: /v2/secapi] {
      pay: [Function: /v2/secapi/pay] {
        refund: [Function: /v2/secapi/pay/refund]
      }
    },
    mmpaymkttransfers: [Function: /v2/mmpaymkttransfers] {
      sendredpack: [Function: /v2/mmpaymkttransfers/sendredpack],
      promotion: [Function: /v2/mmpaymkttransfers/promotion] {
        transfers: [Function: /v2/mmpaymkttransfers/promotion/transfers],
        paywwsptrans2pocket: [Function: /v2/mmpaymkttransfers/promotion/paywwsptrans2pocket]
      },
      sendworkwxredpack: [Function: /v2/mmpaymkttransfers/sendworkwxredpack]
    }
  },
  v3: [Function: /v3] {
    pay: [Function: /v3/pay] {
      transactions: [Function: /v3/pay/transactions] {
        native: [Function: /v3/pay/transactions/native],
        id: [Function: /v3/pay/transactions/id] {
          '{transaction_id}': [Function: /v3/pay/transactions/id/{transaction_id}]
        },
        outTradeNo: [Function: /v3/pay/transactions/out-trade-no] {
          '1217752501201407033233368018': [Function: /v3/pay/transactions/out-trade-no/1217752501201407033233368018]
        }
      },
      partner: [Function: /v3/pay/partner] {
        transactions: [Function: /v3/pay/partner/transactions] {
          native: [Function: /v3/pay/partner/transactions/native]
        }
      }
    },
    marketing: [Function: /v3/marketing] {
      busifavor: [Function: /v3/marketing/busifavor] {
        stocks: [Function: /v3/marketing/busifavor/stocks],
        users: [Function: /v3/marketing/busifavor/users] {
          '$openid$': [Function: /v3/marketing/busifavor/users/{openid}] {
            coupons: [Function: /v3/marketing/busifavor/users/{openid}/coupons] {
              '{coupon_code}': [Function: /v3/marketing/busifavor/users/{openid}/coupons/{coupon_code}] {
                appids: [Function: /v3/marketing/busifavor/users/{openid}/coupons/{coupon_code}/appids] {
                  wx233544546545989: [Function: /v3/marketing/busifavor/users/{openid}/coupons/{coupon_code}/appids/wx233544546545989]
                }
              }
            }
          }
        }
      },
      favor: [Function: /v3/marketing/favor] {
        media: [Function: /v3/marketing/favor/media] {
          imageUpload: [Function: /v3/marketing/favor/media/image-upload]
        },
        stocks: [Function: /v3/marketing/favor/stocks] {
          '$stock_id$': [Function: /v3/marketing/favor/stocks/{stock_id}] {
            useFlow: [Function: /v3/marketing/favor/stocks/{stock_id}/use-flow]
          }
        }
      },
      partnerships: [Function: /v3/marketing/partnerships] {
        build: [Function: /v3/marketing/partnerships/build]
      }
    },
    combineTransactions: [Function: /v3/combine-transactions] {
      jsapi: [Function: /v3/combine-transactions/jsapi]
    },
    bill: [Function: /v3/bill] {
      tradebill: [Function: /v3/bill/tradebill],
      fundflowbill: [Function: /v3/bill/fundflowbill]
    },
    billdownload: [Function: /v3/billdownload] {
      file: [Function: /v3/billdownload/file]
    },
    smartguide: [Function: /v3/smartguide] {
      guides: [Function: /v3/smartguide/guides] {
        '$guide_id$': [Function: /v3/smartguide/guides/{guide_id}] {
          assign: [Function: /v3/smartguide/guides/{guide_id}/assign]
        }
      }
    },
    merchantService: [Function: /v3/merchant-service] {
      complaints: [Function: /v3/merchant-service/complaints]
    },
    merchant: [Function: /v3/merchant] {
      media: [Function: /v3/merchant/media] {
        video_upload: [Function: /v3/merchant/media/video_upload]
      }
    }
  }
}
```
</details>

## 变更历史

- v0.4.5
  - 支持APIv2版的俩账单下载，调用方法与APIv3类同；
  - 增加测试用例覆盖，初始化参数`secret`(for APIv2)如未设置，`HMAC-SHA256`数据签名时，可能引发 #14

- v0.4.4
  - 优化`Wechatpay`在多次实例化时赋值`Symbol(CLIENT)`异常问题，增加`wechatpay.test.js`测试用例覆盖

- v0.4.3
  - 支持 *企业微信-企业支付* 链式调用，需要额外注入签名规则，见上述文档用法示例

- v0.4.2
  - 文件名大小写问题 #11 感谢 @LiuXiaoZhuang 报告此问题

- v0.4.1
  - 解决了一个`AES-GCM`在`Node10`上的解密兼容性问题，程序在`Node10`上有可能崩溃，建议`Node10`用户升级至此版本

- v0.4.0
  - 重构 `Wechatpay` 类，同时支持 APIv2&v3's 链式调用
  - 改变 `Wechatpay.client` 返回值为`Wechatpay.client.v3`，`Wechatpay.client.v2` 为 `xmlBased` 接口客户端
  - 废弃 `withEntities` 方法，其在链式多次调用时，有可能达不到预期，详情见 #10，感谢 @ali-pay 报告此问题
  - README 文档中文化
  - 完善补缺 `tsd` 声明

- v0.3.4
  - Typed and tips on `Wechatpay` class(#9), thanks @ipoa

- v0.3.3
  - Upgrade Axios for the CVE-2020-28168

- v0.3.2
  - Optim: Let `Aes.pkcs7.padding` strictly following the `rfc2315` spec
  - Optim: Better of the `Hash.md5` and `Hash.hmacSha256`
  - Coding comments and README

- v0.3.1
  - Optim: new param on `xmlBased({mchid})`, while passed in, then `Transformer.signer` doing the `assert` with the post data.
  - Feature: Customize the HTTP `User-Agent`.
  - Refactor: Split `aes.js` as of `Aes`, `AesGcm` and `AesEcb` classes for `aes-256-ecb/pkcs7padding` algo.

- v0.3.0
  - Feature: The XML based API requests.

- v0.2.3
  - Optim: Coding quality.

- v0.2.2
  - Fix: #8 `verfier` on the `204` status case.

- v0.2.1
  - Optim: Back compatible for `12.4.0` < `Node` ≧ `10.15.0`.

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

Copyright (c) 2020-2021 James ZHANG(TheNorthMemory)

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
