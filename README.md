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
- [x] 支持微信支付APIv3的媒体文件上传(图片/视频)功能，需手动安装 [form-data](https://github.com/form-data/form-data), 示例代码如下
- [x] 支持微信支付APIv3的应答证书下载功能，需手动安装 [yargs](https://github.com/yargs/yargs), 使用手册如下
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

## 起步

### v3平台证书

微信支付APIv3使用 (RESTful API with JSON over HTTP）接口设计，数据交换采用非对称（`RSA-OAEP`）加/解密方案。
API上行所需的`商户API私钥`，可以由商户官方专用证书生成工具生成，
API下行所需的`平台证书`须从`v3/certificates`接口获取（应答证书还经过了对称`AES-GCM`加密，须采用`APIv3密钥`才能解密）。
本项目也提供了命令行下载工具，使用手册如下：

<details>
  <summary>$ <b>./node_modules/.bin/wxpay crt --help</b> (点击显示)</summary>

```
wxpay crt

The WeChatPay APIv3's Certificate Downloader

cert
  -m, --mchid       The merchant's ID, aka mchid.  [string] [required]
  -s, --serialno    The serial number of the merchant's certificate aka serialno.  [string] [required]
  -f, --privatekey  The path of the merchant's private key certificate aka privatekey.  [string] [required]
  -k, --key         The secret key string of the merchant's APIv3 aka key.  [string] [required]
  -o, --output      Path to output the downloaded WeChatPay's platform certificate(s)  [string] [default: "/tmp"]

Options:
      --version  Show version number  [boolean]
      --help     Show help  [boolean]
  -u, --baseURL  The baseURL  [string] [default: "https://api.mch.weixin.qq.com/"]
```

**注：** 像其他通用命令行工具一样，`--help` 均会打印出帮助手册，说明档里的`[required]`指 必选参数； `[string]`指 字符串类型，`[default]`指默认值

</details>

<details>
  <summary>$ <b>./node_modules/.bin/wxpay crt</b> -m N -s S -f F.pem -k K -o .</summary>

```
The WeChatPay Platform Certificate#0
  serial=HEXADECIAL
  notBefore=Wed, 22 Apr 2020 01:43:19 GMT
  notAfter=Mon, 21 Apr 2025 01:43:19 GMT
  Saved to: wechatpay_HEXADECIAL.pem
You may confirm the above infos again even if this library already did(by Rsa.verify):
    openssl x509 -in wechatpay_HEXADECIAL.pem -noout -serial -dates

```
**注：** 提供必选参数且运行后，屏幕即打印出如上信息，提示`证书序列号`及`起、止格林威治(GMT)时间`及证书下载保存位置。
</details>

### 命令行请求

v0.5版，命令行工具做了加强，增加了基础请求方法，可以用来做快速接入体验，用法如下:

#### 帮助信息

<details>
  <summary>$ <b>./node_modules/.bin/wxpay req --help</b></summary>

```
wxpay req <uri>

Play the WeChatPay OpenAPI requests over command line

<uri>
  -c, --config   The configuration  [required]
  -b, --binary   True for the `arraybuffer` response, two for without-verifier-response, otherwise for showing the origin
  -m, --method   The request HTTP verb  [choices: "DELETE", "GET", "POST", "PUT", "PATCH", "delete", "get", "post", "put", "patch"] [default: "POST"]
  -h, --headers  The request HTTP header(s)
  -d, --data     The request HTTP body
  -p, --params   The request HTTP query parameter(s)

Options:
      --version  Show version number  [boolean]
      --help     Show help  [boolean]
  -u, --baseURL  The baseURL  [string] [default: "https://api.mch.weixin.qq.com/"]
```
</details>

#### v3版Native付
<details>
  <summary>$ <b>./node_modules/.bin/wxpay v3.pay.transactions.native</b></summary>

```
./node_modules/.bin/wxpay v3.pay.transactions.native \
  -c.mchid 1230000109 \
  -c.serial HEXADECIAL \
  -c.privateKey /path/your/merchant/mchid.key \
  -c.certs.HEXADECIAL /path/the/platform/certificates/HEXADECIAL.pem \
  -d.appid wxd678efh567hg6787 \
  -d.mchid 1230000109 \
  -d.description 'Image形象店-深圳腾大-QQ公仔' \
  -d.out_trade_no '1217752501201407033233368018' \
  -d.notify_url 'https://www.weixin.qq.com/wxpay/pay.php' \
  -d.amount.total 100 \
  -d.amount.currency CNY
```
</details>

#### v2版付款码付

<details>
  <summary>$ <b>./node_modules/.bin/wxpay v2.pay.micropay</b></summary>

```
./node_modules/.bin/wxpay v2.pay.micropay \
  -c.mchid 1230000109 \
  -c.serial any \
  -c.privateKey any \
  -c.certs.any \
  -c.secret your_merchant_secret_key_string \
  -d.appid wxd678efh567hg6787 \
  -d.mch_id 1230000109 \
  -d.device_info 013467007045764 \
  -d.nonce_str 5K8264ILTKCH16CQ2502SI8ZNMTM67VS \
  -d.detail 'Image形象店-深圳腾大-QQ公仔' \
  -d.spbill_create_ip 8.8.8.8 \
  -d.out_trade_no '1217752501201407033233368018' \
  -d.total_fee 100 \
  -d.fee_type CNY \
  -d.auth_code 120061098828009406
```
</details>

#### v2版付款码查询openid

<details>
  <summary>$ <b>./node_modules/.bin/wxpay v2/tools/authcodetoopenid</b></summary>

```
./node_modules/.bin/wxpay v2/tools/authcodetoopenid \
  -c.mchid 1230000109 \
  -c.serial any \
  -c.privateKey any \
  -c.certs.any \
  -c.secret your_merchant_secret_key_string \
  -d.appid wxd678efh567hg6787 \
  -d.mch_id 1230000109 \
  -d.nonce_str 5K8264ILTKCH16CQ2502SI8ZNMTM67VS \
  -d.auth_code 120061098828009406
```
</details>

## 面向对象模式

本类库自`0.2`开始，按照 `URL.pathname` 以`/`做切分，映射成对象属性，`0.4`版开始，支持APIv2的`pathname`映射，编码书写方式有如下约定：

1. 请求 `pathname` 作为级联对象，可以轻松构建请求对象，例如 `v3/pay/transactions/native` 即自然翻译成 `v3.pay.transactions.native`;
2. 每个 `pathname` 所支持的 `HTTP METHOD`，即作为 请求对象的末尾执行方法，例如: `v3.pay.transactions.native.post({})`;
3. 每个 `pathname` 级联对象默认为HTTP`POST`函数，其同时隐式内置`GET/POST/PUT/PATCH/DELETE` 操作方法链，支持全大写及全小写两种编码方式，说明见`变更历史`;
4. 每个 `pathname` 有中线(dash)分隔符的，可以使用驼峰`camelCase`风格书写，例如: `merchant-service`可写成 `merchantService`，或者属性风格，例如 `v3['merchant-service']`;
5. 每个 `pathname` 中，若有动态参数，例如 `business_code/{business_code}` 可写成 `business_code.$business_code$` 或者属性风格书写，例如 `business_code['{business_code}']`，抑或按属性风格，直接写值也可以，例如 `business_code['2000001234567890']`;
6. SDK内置的 `v2/` 对象，其特殊标识为APIv2级联对象，之后串接切分后的`pathname`，如源 `pay/micropay` 翻译成 `v2.pay.micropay` 即以XML形式请求远端接口；
7. 建议 `pathname` 按照 `PascalCase` 风格书写, `TS Definition` 已在路上(还有若干问题没解决)，将是这种风格，代码提示将会很自然;

以下示例用法，均以`Promise`或`Async/Await`结合此种编码模式展开，级联对象操作符的调试信息见文档末。

## 初始化

```js
const {Wechatpay, Formatter} = require('wechatpay-axios-plugin')
const wxpay = new Wechatpay({
  // 商户号
  mchid: 'your_merchant_id',
  // 商户证书序列号
  serial: 'serial_number_of_your_merchant_public_cert',
  // 商户API私钥 PEM格式的文本字符串或者文件buffer
  privateKey: '-----BEGIN PRIVATE KEY-----\n-FULL-OF-THE-FILE-CONTENT-\n-----END PRIVATE KEY-----',
  certs: {
    // CLI `wxpay crt -m {商户号} -s {商户证书序列号} -f {商户API私钥文件路径} -k {APIv3密钥(32字节)} -o {保存地址}` 生成
    'serial_number': '-----BEGIN CERTIFICATE-----\n-FULL-OF-THE-FILE-CONTENT-\n-----END CERTIFICATE-----',
  },
  // APIv2密钥(32字节) v0.4 开始支持
  secret: 'your_merchant_secret_key_string',
  // 接口不要求证书情形，例如仅收款merchant对象参数可选
  merchant: {
    // 商户证书 PEM格式的文本字符串或者文件buffer
    cert: '-----BEGIN CERTIFICATE-----\n-FULL-OF-THE-FILE-CONTENT-\n-----END CERTIFICATE-----',
    // 商户API私钥 PEM格式的文本字符串或者文件buffer
    key: '-----BEGIN PRIVATE KEY-----\n-FULL-OF-THE-FILE-CONTENT-\n-----END PRIVATE KEY-----',
    // or
    // passphrase: 'your_merchant_id',
    // pfx: fs.readFileSync('/your/merchant/cert/apiclient_cert.p12'),
  },
  // APIv2沙箱环境地址
  // baseURL: 'https://api.mch.weixin.qq.com/sandboxnew/',
  // 建议初始化设置此参数，详细说明见Axios官方README
  // maxRedirects: 0,
})
```

初始化字典说明如下：

- `mchid` 为你的商户号，一般是10字节纯数字
- `serial` 为你的商户证书序列号，一般是40字节字符串
- `privateKey` 为你的商户API私钥，一般是通过官方证书生成工具生成的文件名是`apiclient_key.pem`文件，支持纯字符串或者文件流`buffer`格式
- `certs{[serial_number]:string}` 为通过下载工具下载的平台证书`key/value`键值对，键为平台证书序列号，值为平台证书pem格式的纯字符串或者文件流`buffer`格式
- `secret` 为APIv2版的`密钥`，商户平台上设置的32字节字符串
- `merchant.cert` 为你的商户证书,一般是文件名为`apiclient_cert.pem`文件，支持纯字符串或者文件流`buffer`格式
- `merchant.key` 为你的商户API私钥，一般是通过官方证书生成工具生成的文件名是`apiclient_key.pem`文件，支持纯字符串或者文件流`buffer`格式
- `merchant.passphrase` 一般为你的商户号
- `merchant.pfx` 为你的商户`PKCS12`格式的证书，文件名一般为`apiclient_cert.p12`，支持二进制文件流`buffer`格式

**注：** 0.4版本做了重构及优化，APIv2&v3以及Axios初始参数，均融合在一个型参上。

## APIv3

### Native下单
```js
wxpay.v3.pay.transactions.native
  .post({/*文档参数放这里就好*/})
  .then(({data: {code_url}}) => console.info(code_url))
  .catch(({response: {status, statusText, data}}) => console.error(status, statusText, data))
```

### 查询订单
```js
wxpay.v3.pay.transactions.id['{transaction_id}']
  .get({params: {mchid: '1230000109'}, transaction_id: '1217752501201407033233368018'})
  .then(({data}) => console.info(data))
  .catch(({response: {status, statusText, data}}) => console.error(status, statusText, data))
```

### 关闭订单
```js
wxpay.v3.pay.transactions.outTradeNo['1217752501201407033233368018']
  .post({mchid: '1230000109'})
  .then(({status, statusText}) => console.info(status, statusText))
  .catch(({response: {status, statusText, data}}) => console.error(status, statusText, data))
```

### 合单支付下单

```js
wxpay.v3.combineTransactions.jsapi
  .post({/*文档参数放这里就好*/})
  .then(res => console.info(res.data))
  .catch(({response: {status, statusText, data}}) => console.error(status, statusText, data))
```

### H5下单
```js
wxpay.v3.pay.transactions.h5
  .post({/*文档参数放这里就好*/})
  .then(({data: {h5_url}}) => console.info(h5_url))
  .catch(console.error)
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
  responseType: 'arraybuffer', // To prevent the axios:utils.stripBOM feature
  transformResponse: [function csvDigestValidator(data) {
    assert(sha1(data) === hash_value, 'verify the SHA1 digest failed.')
    return data
  }, function csvCastor(data) { return Formatter.castCsvBill(data) }]
})).then(res => {
  console.info(res.data.summary)
}).catch(error => {
  console.error(error)
})
```

### 创建商家券
```js
wxpay.v3.marketing.busifavor.stocks
  .post({/*商家券创建条件*/})
  .then(({data}) => console.info(data))
  .catch(({response: {status, statusText, data}}) => console.error(status, statusText, data))
```

### 查询用户单张券详情

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

### 支付即服务

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

### 商业投诉查询

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
      responseType: 'arraybuffer', // To prevent the axios:utils.stripBOM feature
      transformResponse: [function csvDigestValidator(data) {
        assert(sha1(data) === res.data.hash_value, 'verify the SHA1 digest failed.')
        return data
      }]
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
      responseType: 'arraybuffer', // To prevent the axios:utils.stripBOM feature
      transformResponse: [function csvDigestValidator(data) {
        // note here: previous `hash_value` was about the source `csv`, not the `gzip` data
        //            so it needs unziped first, then to compare the `SHA1` degest
        const bill = unzipSync(data)
        assert.ok(hash_value === sha1(bill), 'SHA1 verification failed')
        return bill
      }, function csvCastor(data) { return Formatter.castCsvBill(data) }]
    })
    console.info(data.summary)
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

### H5支付

```js
wxpay.v2.pay.unifiedorder({
  appid: 'wx2421b1c4370ec43b',
  attach: '支付测试',
  body: 'H5支付测试',
  mch_id: '10000100',
  nonce_str: Formatter.nonce(),
  notify_url: 'http://wxpay.wxutil.com/pub_v2/pay/notify.v2.php',
  openid: 'oUpF8uMuAJO_M2pxb1Q9zNjWeS6o',
  out_trade_no: '1415659990',
  spbill_create_ip: '14.23.150.211',
  total_fee: 1,
  trade_type: 'MWEB',
  scene_info: JSON.stringify({
    h5_info: {
      type:"IOS",
      app_name: "王者荣耀",
      package_name: "com.tencent.tmgp.sgame"
    }
  }),
}).then(({data: {mweb_url}}) => console.info(mweb_url)).catch(console.error);
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
  baseURL: 'https://fraud.mch.weixin.qq.com/',
  // 返回值无`sign`字段，无需数据校验
  transformResponse: [Transformer.toObject],
})
.then(res => console.info(res.data))
.catch(({response: {status, statusText, data}}) => console.error(status, statusText, data))
```

### 下载交易账单

```js
wxpay.v2.pay.downloadbill({
  mch_id,
  nonce_str: fmt.nonce(),
  appid,
  bill_date,
  bill_type,
}, {
  responseType: 'arraybuffer', // To prevent the axios:utils.stripBOM feature
  transformResponse: [function detector(data) {
    // 无账单时返回值为`xml`，抛到异常`catch`处理
    assert.notDeepStrictEqual(data.slice(0, 5), Buffer.from('<xml>'), data.toString())
    return data
  }, function csvCastor(data) { return Formatter.castCsvBill(data) }]
})
.then(res => console.info(res.data.summary))
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
}, {
  // 返回值无`sign`字段，无需数据校验
  transformResponse: [Transformer.toObject],
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

## 常见问题

Q: APIv3消息通知，`AES-256-GCM`加密字段，应该如何解密？

> 官方文档有介绍，APIv3平台证书及消息通知关键信息均使用`AesGcm`加解密，依赖`APIv3密钥`，商户侧解密可参考`bin/cli/cert.js`证书下载工具，例如：
> ```js
> AesGcm.decrypt(nonce, secret, ciphertext, aad);
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

## 文末打印一波示例方法链

<details>
  <summary>console.info(wxpay)</summary>

```js
[Function (anonymous)] {
  v2: [Function: v2] {
    risk: [Function: v2/risk] {
      getpublickey: [Function: v2/risk/getpublickey]
    },
    pay: [Function: v2/pay] { micropay: [Function: v2/pay/micropay] },
    secapi: [Function: v2/secapi] {
      pay: [Function: v2/secapi/pay] {
        refund: [Function: v2/secapi/pay/refund]
      }
    },
    mmpaymkttransfers: [Function: v2/mmpaymkttransfers] {
      sendredpack: [Function: v2/mmpaymkttransfers/sendredpack],
      promotion: [Function: v2/mmpaymkttransfers/promotion] {
        transfers: [Function: v2/mmpaymkttransfers/promotion/transfers],
        paywwsptrans2pocket: [Function: v2/mmpaymkttransfers/promotion/paywwsptrans2pocket]
      },
      sendworkwxredpack: [Function: v2/mmpaymkttransfers/sendworkwxredpack]
    }
  },
  v3: [Function: v3] {
    pay: [Function: v3/pay] {
      transactions: [Function: v3/pay/transactions] {
        native: [Function: v3/pay/transactions/native],
        id: [Function: v3/pay/transactions/id] {
          '{transaction_id}': [Function: v3/pay/transactions/id/{transaction_id}]
        },
        outTradeNo: [Function: v3/pay/transactions/out-trade-no] {
          '1217752501201407033233368018': [Function: v3/pay/transactions/out-trade-no/1217752501201407033233368018]
        }
      },
      partner: [Function: v3/pay/partner] {
        transactions: [Function: v3/pay/partner/transactions] {
          native: [Function: v3/pay/partner/transactions/native]
        }
      }
    },
    marketing: [Function: v3/marketing] {
      busifavor: [Function: v3/marketing/busifavor] {
        stocks: [Function: v3/marketing/busifavor/stocks],
        users: [Function: v3/marketing/busifavor/users] {
          '$openid$': [Function: v3/marketing/busifavor/users/{openid}] {
            coupons: [Function: v3/marketing/busifavor/users/{openid}/coupons] {
              '{coupon_code}': [Function: v3/marketing/busifavor/users/{openid}/coupons/{coupon_code}] {
                appids: [Function: v3/marketing/busifavor/users/{openid}/coupons/{coupon_code}/appids] {
                  wx233544546545989: [Function: v3/marketing/busifavor/users/{openid}/coupons/{coupon_code}/appids/wx233544546545989]
                }
              }
            }
          }
        }
      },
      favor: [Function: v3/marketing/favor] {
        media: [Function: v3/marketing/favor/media] {
          imageUpload: [Function: v3/marketing/favor/media/image-upload]
        },
        stocks: [Function: v3/marketing/favor/stocks] {
          '$stock_id$': [Function: v3/marketing/favor/stocks/{stock_id}] {
            useFlow: [Function: v3/marketing/favor/stocks/{stock_id}/use-flow]
          }
        }
      },
      partnerships: [Function: v3/marketing/partnerships] {
        build: [Function: v3/marketing/partnerships/build]
      }
    },
    combineTransactions: [Function: v3/combine-transactions] {
      jsapi: [Function: v3/combine-transactions/jsapi]
    },
    bill: [Function: v3/bill] {
      tradebill: [Function: v3/bill/tradebill],
      fundflowbill: [Function: v3/bill/fundflowbill]
    },
    billdownload: [Function: v3/billdownload] {
      file: [Function: v3/billdownload/file]
    },
    smartguide: [Function: v3/smartguide] {
      guides: [Function: v3/smartguide/guides] {
        '$guide_id$': [Function: v3/smartguide/guides/{guide_id}] {
          assign: [Function: v3/smartguide/guides/{guide_id}/assign]
        }
      }
    },
    merchantService: [Function: v3/merchant-service] {
      complaints: [Function: v3/merchant-service/complaints]
    },
    merchant: [Function: v3/merchant] {
      media: [Function: v3/merchant/media] {
        video_upload: [Function: v3/merchant/media/video_upload]
      }
    }
  }
}
```
</details>

## 变更历史

- v0.6.1 (2021-04-22)
  - 优化CLI，扩展`wxpay <uri>`的`-b`参数为可变布尔量，兼容之前版本用法，以支持 [#21](https://github.com/TheNorthMemory/wechatpay-axios-plugin/issues/21)

- v0.6.0 (2021-04-20)
  - 代码重构，`APIv2`的返回数据默认强校验，特殊接口需给特殊`transformResponse`，相关见 [#20](https://github.com/TheNorthMemory/wechatpay-axios-plugin/issues/20)
  - 代码重构，删除了`interceptor.js`包装文件，不再兼容0.1系列，返回数据默认强校验，特殊接口需给特殊`transformResponse`，相关见 [#19](https://github.com/TheNorthMemory/wechatpay-axios-plugin/issues/19)

- v0.5.5 (2021-04-13)
  - 优化文档，`证书`相关名词与官方文档保持一致
  - 优化代码，使用ES6 `Reflect.set`代替`param-reassign`，性能更高
  - 新增函数`Hash.hmac`方法，广度支持`Hash-based Message Authentication Code`
  - 调整函数`Hash.hmacSha256`为不推荐方法，内部改写为固定`Hash.hmac`调用
  - 调整CLI `req <uri>`成功调用仅返回`{config, headers, data}`数据结构

- v0.5.4 (2021-04-08)
  - 优化CLI，`wxpay crt` 下载平台证书仅在成功验签完成后写入文件
  - 优化文档，`AesGcm` 解密示例
  - 优化内部`chain`逻辑，遵循 `RFC3986` 规范，`baseURL`支持带部分路径的海外接入点
  - 优化代码`SonarQube`检测结果`3A+0.5%`

- v0.5.3 (2021-04-02)
  - 优化CLI，`wxpay <uri>` 向前兼容以支持slash(/)结尾的请求，形如 `v3/applyment4sub/applyment/`

- v0.5.2 (2021-04-01)
  - 优化CLI，`wxpay <uri>` 现在支持型如 `v2.pay.micropay`, `v3.pay.transactions.native` 调用
  - 优化`README`文档，适配最新CLI用法；增加APIv3消息通知QA章节；增加技术交流QQ群说明

- v0.5.1 (2021-03-29)
  - 优化CLI，可以直接 `wxpay <uri>` 发起请求
  - 优化`README`文档，适配最新CLI用法

- v0.5.0 (2021-03-27)
  - 新增命令行方式与微信支付接口交互工具
  - 调整可选依赖包为`peerDependencies`，使用完整功能需手动安装 `form-data` 或/及 `yargs`

- v0.4.6
  - 使用最新版`eslint`及`eslint-config-airbnb-base`
  - 增加`utils.merge`依赖函数测试校验

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
