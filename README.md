# 微信支付 OpenAPI SDK

Promise based and chained WeChatPay OpenAPI client SDK for NodeJS

[![GitHub actions](https://github.com/TheNorthMemory/wechatpay-axios-plugin/workflows/npm%20test/badge.svg)](https://github.com/TheNorthMemory/wechatpay-axios-plugin/actions)
[![GitHub release](https://img.shields.io/npm/v/wechatpay-axios-plugin)](https://github.com/TheNorthMemory/wechatpay-axios-plugin/releases)
[![Vulnerabilities](https://snyk.io/advisor/npm-package/wechatpay-axios-plugin/badge.svg)](https://snyk.io/advisor/npm-package/wechatpay-axios-plugin)
[![types](https://img.shields.io/badge/types-included-blue)](https://www.npmjs.com/package/wechatpay-axios-plugin)
[![Node](https://img.shields.io/node/v/wechatpay-axios-plugin)](https://www.npmjs.com/package/wechatpay-axios-plugin)
[![NPM downloads per month](https://img.shields.io/npm/dm/wechatpay-axios-plugin)](https://www.npmjs.com/package/wechatpay-axios-plugin)
[![NPM license](https://img.shields.io/npm/l/wechatpay-axios-plugin)](https://www.npmjs.com/package/wechatpay-axios-plugin)

## 系统要求

NodeJs >= 12

## 安装

`$ npm install wechatpay-axios-plugin`

## [初始化](https://wechatpay.js.org/guide/getting-started#init)

```js
const { Wechatpay } = require('wechatpay-axios-plugin');
const { readFileSync } = require('fs');

// 商户号，支持「普通商户/特约商户」或「服务商商户」
const merchantId = '190000****';

// 「商户API证书」的「证书序列号」
const merchantCertificateSerial = '3775B6A45ACD588826D15E583A95F5DD********';

// 「商户API私钥」`file://`协议的本地文件绝对路径
const merchantPrivateKeyFilePath = 'file:///path/to/merchant/apiclient_key.pem';

// 「平台证书」的「证书序列号」
// 可以从「平台证书」文件解析，也可以在 商户平台 -> 账户中心 -> API安全 查询到
const platformCertificateSerial = '7132d72a03e93cddf8c03bbd1f37eedf********';

// 「平台证书」`file://`协议的本地文件绝对路径
// 「平台证书」文件可由内置的CLI工具下载到
const platformCertificateFilePath  = 'file:///path/to/wechatpay/certificate.pem';

// 「微信支付公钥」`file://`协议的本地文件绝对路径
// 需要在 商户平台 -> 账户中心 -> API安全 下载
const platformPublicKeyFilePath    = 'file:///path/to/wechatpay/publickey.pem';

// 「微信支付公钥」的「微信支付公钥ID」
// 需要在 商户平台 -> 账户中心 -> API安全 查询
const platformPublicKeyId = 'PUB_KEY_ID_01142321349124100000000000********';

// 构造一个 APIv2 & APIv3 客户端实例
const wxpay = new Wechatpay({
  mchid: merchantId,
  serial: merchantCertificateSerial,
  privateKey: merchantPrivateKeyFilePath,
  certs: {
    // 「平台证书」 模式，则 platformCertificate* 行必填，多证书时配多行
    [platformCertificateSerial]: platformCertificateFilePath,
    // 「微信支付公钥」 模式，则 platformPublicKey* 必填
    [platformPublicKeyId]: platformPublicKeyFilePath,
  },
  // 使用APIv2(密钥32字节)时，需要至少设置 `secret`字段
  secret: 'your_merchant_secret_key_string',
  // 接口不要求证书情形，例如仅收款merchant对象参数可选
  merchant: {
    cert: readFileSync('/path/to/merchant/apiclient_cert.pem'),
    key: readFileSync(merchantPrivateKeyFilePath.slice(7)),
    // 或者配置如下`passphrase`及`pfx`配置项
    // passphrase: 'your_merchant_id',
    // **注**: Node17.1开始使用OpenSSL3,老的p12文件需要额外格式转换
    // pfx: readFileSync('/your/merchant/cert/apiclient_cert.p12'),
  },
});
```

初始化字典说明如下：

- `mchid` 为你的商户号，一般是10字节纯数字
- `serial` 为你的商户证书序列号，一般是40字节字符串
- `privateKey` 为你的商户API私钥，一般是通过官方证书生成工具生成的文件名是`apiclient_key.pem`文件，支持纯字符串或者文件流`buffer`格式
- `certs{[serial_number]:string}` 为`key/value`键值对，键为平台证书序列号/微信支付公钥ID，值为平台证书/微信支付公钥pem格式的纯字符串或者文件流`buffer`格式
- `secret` 为APIv2版的`密钥`，商户平台上设置的32字节字符串
- `merchant.cert` 为你的商户证书,一般是文件名为`apiclient_cert.pem`文件，支持纯字符串或者文件流`buffer`格式
- `merchant.key` 为你的商户API私钥，一般是通过官方证书生成工具生成的文件名是`apiclient_key.pem`文件，支持纯字符串或者文件流`buffer`格式
- `merchant.passphrase` 一般为你的商户号
- `merchant.pfx` 为你的商户`PKCS12`格式的证书，文件名一般为`apiclient_cert.p12`，支持二进制文件流`buffer`格式(**注**: Node17.1开始使用OpenSSL3,老的p12文件需要额外格式转换)

**注：** APIv2&APIv3以及Axios初始参数，均融合在一个型参上。

## APIv3

### [Native下单](https://wechatpay.js.org/openapi/v3/pay/transactions/native)

<details><summary>示例代码</summary>

```js
wxpay.v3.pay.transactions.native
  .post({
    mchid: '1900006XXX',
    out_trade_no: 'native12177525012014070332333',
    appid: 'wxdace645e0bc2cXXX',
    description: 'Image形象店-深圳腾大-QQ公仔',
    notify_url: 'https://weixin.qq.com/',
    amount: {
      total: 1,
      currency: 'CNY'
    },
  })
  .then(({data: {code_url}}) => console.info(code_url))
  .catch(({response: {
    status,
    statusText,
    data
  } }) => console.error(status, statusText, data))
```
</details>

### [查询订单](https://wechatpay.js.org/openapi/v3/pay/transactions/id/{transaction_id})

<details><summary>示例代码</summary>

```js
// _placeholder_ 语法糖会转换成 '{placeholder}' 格式
wxpay.v3.pay.transactions.id._transaction_id_
  .get({
    params: {
      mchid: '1230000109'
    },
    //当商户订单号有大写字符时，只能这样参数化传递
    transaction_id: '1217752501201407033233368018'
  })
  .then(({data}) => console.info(data))
  .catch(({response: {
    status,
    statusText,
    data
  } }) => console.error(status, statusText, data))
```
</details>

### [关闭订单](https://wechatpay.js.org/openapi/v3/pay/transactions/out-trade-no/{out_trade_no}/close)

<details><summary>示例代码</summary>

```js
// $placeholder$ 语法糖会转换成 '{placeholder}' 格式
wxpay.v3.pay.transactions.outTradeNo.$out_trade_no$.close
  .post({
    mchid: '1230000109'
  }, {
    //当商户订单号有大写字符时，只能这样参数化传递
    out_trade_no: 'P1217752501201407033233368018'
  })
  .then(({status, statusText}) => console.info(status, statusText))
  .catch(({response: {
    status,
    statusText,
    data
  } }) => console.error(status, statusText, data))
```
</details>

### [发起退款](https://wechatpay.js.org/openapi/v3/refund/domestic/refunds)

<details><summary>示例代码</summary>

```js

;(async () => {
  try {
    const res = await wxpay.v3.refund.domestic.refunds.post({
      transaction_id: '1217752501201407033233368018',
      out_refund_no: '1217752501201407033233368018',
      reason: '商品已售完',
      notify_url: 'https://weixin.qq.com',
      funds_account: 'AVAILABLE',
      amount: {
        refund: 888,
        from: [{
          account: 'AVAILABLE',
          amount: 444,
        }],
        total: 888,
        currency: 'CNY'
      },
    });
  } catch({response: {status, statusText, data}}) {
    console.error(status, statusText, data)
  }
})()
```
</details>

**更多示例代码访问[这里](https://wechatpay.js.org/openapi/)**

## APIv2

### [现金红包](https://wechatpay.js.org/openapi/v2/mmpaymkttransfers/sendredpack)

<details><summary>示例代码</summary>

```js
wxpay.v2.mmpaymkttransfers.sendredpack.post({
  nonce_str: Formatter.nonce(), // 自v0.9起可以无需声明
  mch_billno: '10000098201411111234567890',
  mch_id: '10000098',
  wxappid: 'wx8888888888888888',
  send_name: '鹅企支付',
  re_openid: 'oxTWIuGaIt6gTKsQRLau2M0yL16E',
  total_amount: '1000',
  total_num: '1',
  wishing: 'HAPPY BIRTHDAY',
  client_ip: '192.168.0.1',
  act_name: '回馈活动',
  remark: '会员回馈活动',
  scene_id: 'PRODUCT_4',
})
.then(res => console.info(res.data))
.catch(({response: {status, statusText, data}}) => console.error(status, statusText, data))
```
</details>

### [企业付款到银行卡-获取RSA公钥](https://wechatpay.js.org/openapi/v2/risk/getpublickey)

<details><summary>示例代码</summary>

```js
const {Rsa} = require('wechatpay-axios-plugin')

wxpay.v2.risk.getpublickey.post({
  mch_id: '1900000109',
  sign_type: 'MD5',
  nonce_str: Formatter.nonce(), // 自v0.9起可以无需声明
}, {
  baseURL: 'https://fraud.mch.weixin.qq.com/',
  // 声明请求是私有ssl协议，对应加载初始化的 merchant{key,cert} 参数
  security: true,
})
.then(res => {
  const b64 = res.data.pub_key.slice(31, res.data.pub_key.indexOf('-----', 31 * 3)).replace(/\r|\n/g, '')
  console.info(Rsa.fromPkcs1(b64, Rsa.KEY_TYPE_PUBLIC))
})
.catch(({response: {status, statusText, data}}) => console.error(status, statusText, data))
```
</details>

**更多示例代码访问[这里](https://wechatpay.js.org/openapi/)**

## 企业微信

企业微信的企业支付，数据请求包需要额外的签名，仅需做如下简单扩展适配，即可支持；以下签名注入函数所需的两个参数`agentId` `agentSecret`来自企业微信工作台，以下为示例值。

```js
const agentId = '0' // 企业微信应用ID，0是企微内置的特殊应用
const agentSecret = 'from_wework_agent_special_string'
```

### 企业红包-注入签名规则

<details><summary>示例代码</summary>

```js
const {Hash,Formatter} = require('wechatpay-axios-plugin')

wxpay.client.v2.defaults.transformRequest.unshift(function workwxredpack(data) {
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
</details>

### 发放企业红包

<details><summary>示例代码</summary>

```js
wxpay.v2.mmpaymkttransfers.sendworkwxredpack.post({
  mch_billno: '123456',
  wxappid: 'wx8888888888888888',
  sender_name: 'XX活动',
  sender_header_media_id: '1G6nrLmr5EC3MMb_-zK1dDdzmd0p7cNliYu9V5w7o8K0',
  re_openid: 'oxTWIuGaIt6gTKsQRLau2M0yL16E',
  total_amount: '1000',
  wishing: '感谢您参加猜灯谜活动，祝您元宵节快乐！',
  act_name: '猜灯谜抢红包活动',
  remark: '猜越多得越多，快来抢！',
  mch_id: '1900000109',
  nonce_str: Formatter.nonce(), // 需要显式声明
}, {
  // 声明请求是私有ssl协议，对应加载初始化的 merchant{key,cert} 参数
  security: true,
})
.then(res => console.info(res.data))
.catch(console.error)
```
</details>

### 向员工付款-注入签名规则

<details><summary>示例代码</summary>

```js
const {Hash,Formatter} = require('wechatpay-axios-plugin')
wxpay.client.v2.defaults.transformRequest.unshift(function wwsptrans2pocket(data) {
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
</details>

### 向员工付款

<details><summary>示例代码</summary>

```js
wxpay.v2.mmpaymkttransfers.promotion.paywwsptrans2pocket.post({
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
  nonce_str: Formatter.nonce(), // 需要显式声明
}, {
  // 声明请求是私有ssl协议，对应加载初始化的 merchant{key,cert} 参数
  security: true,
})
.then(res => console.info(res.data))
.catch(console.error)
```
</details>

## 自定义打印日志

<details><summary>示例代码</summary>

```js
// APIv2 日志
wxpay.client.v2.defaults.transformRequest.push(data => (console.log(data), data))
wxpay.client.v2.defaults.transformResponse.unshift(data => (console.log(data), data))
// APIv3 日志
wxpay.client.v3.defaults.transformRequest.push((data, headers) => (console.log(data, headers), data))
wxpay.client.v3.defaults.transformResponse.unshift((data, headers) => (console.log(data, headers), data))
```
</details>

## XML形式通知应答

<details><summary>示例代码</summary>

```js
const {Transformer} = require('wechatpay-axios-plugin')
const xml = Transformer.toXml({
  return_code: 'SUCCESS',
  return_msg: 'OK',
})

console.info(xml)
```
</details>

## aes-256-ecb/pcks7padding

### 解密

<details><summary>示例代码</summary>

```js
const {Aes: {AesEcb}, Transformer, Hash} = require('wechatpay-axios-plugin')
const secret = 'exposed_your_key_here_have_risks'
const xml = '<xml>' + ... '</xml>'
const obj = Transformer.toObject(xml)
const res = AesEcb.decrypt(obj.req_info, Hash.md5(secret))
obj.req_info = Transformer.toObject(res)
console.info(obj)
```
</details>

### 加密

<details><summary>示例代码</summary>

```js
const obj = Transformer.toObject(xml)
const ciphertext = AesEcb.encrypt(obj.req_info, Hash.md5(secret))
console.assert(
  obj.req_info === ciphertext,
  `The notify hash digest should be matched the local one`
)
```
</details>

## APIv2数据签名

### JSAPI

<details><summary>示例代码</summary>

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
</details>

### APP

<details><summary>示例代码</summary>

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
</details>

## APIv3数据签名

### JSAPI

<details><summary>示例代码</summary>

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
</details>

### 商家券-小程序发券v2版签名规则

<details><summary>示例代码</summary>

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
</details>

### 商家券-H5发券v2版签名规则

<details><summary>示例代码</summary>

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
</details>

## 常见问题

Q: APIv3消息通知，`AES-256-GCM`加密字段，应该如何解密？

> 官方文档有介绍，APIv3平台证书及消息通知关键信息均使用`AesGcm`加解密，依赖`APIv3密钥`，商户侧解密可参考`bin/cli/cert.js`证书下载工具，例如：
> ```js
> AesGcm.decrypt(ciphertext, secret, nonce, aad);
> ```

Q: 敏感信息或者幂等操作要求额外头信息上送时，应该如何构建请求参数？

> `DELETE`/`GET`请求的第一个参数，`POST`/`PUT`/`PATCH`请求的第二个参数，是 [AxiosRequestConfig](https://github.com/axios/axios) 对象，可以按需上送额外头参数，例如：
> ```js
> wxpay.v3.applyment4sub.applyment.$noop$(
>   {},
>   { noop: '', headers: { 'Wechatpay-Serial': '123456' } },
> ).then(console.info).catch(console.error);
> ```
> 可参考 [#17](https://github.com/TheNorthMemory/wechatpay-axios-plugin/issues/17)

Q: 接口地址为slash(`/`)结尾的，应该如何构建请求参数？

> 动态参数`uri_template`或者属性`property`方式构建，可参考 [#16](https://github.com/TheNorthMemory/wechatpay-axios-plugin/issues/16)

## 单元测试

`npm install && npm test`

## 技术交流

如果遇到困难或建议可以 提ISSUE 或 加群，交流技术，分享经验。

QQ群: **684379275**

## 链接

如果你觉得这个`library`不错，你可以扫如下`赞赏码`以资鼓励作者，[博客](https://thenorthmemory.github.io/)更有部分"实战"内容，也可能对你的开发对接有所帮助。

<img src="https://thenorthmemory.github.io/donate.png" />


- [参与贡献](CONTRIBUTING.md)
- [贡献者公约](CODE_OF_CONDUCT.md)
- [变更历史](CHANGELOG.md)

## 许可证

[MIT](LICENSE)
