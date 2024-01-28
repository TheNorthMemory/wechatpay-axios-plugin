# 微信支付 OpenAPI SDK

The WeChatPay OpenAPI v2&v3' Smart Development Kit

[![GitHub actions](https://github.com/TheNorthMemory/wechatpay-axios-plugin/workflows/npm%20test/badge.svg)](https://github.com/TheNorthMemory/wechatpay-axios-plugin/actions)
[![GitHub release](https://img.shields.io/npm/v/wechatpay-axios-plugin)](https://github.com/TheNorthMemory/wechatpay-axios-plugin/releases)
[![Vulnerabilities](https://snyk.io/advisor/npm-package/tmc.js/badge.svg)](https://snyk.io/advisor/npm-package/wechatpay-axios-plugin)
[![types](https://img.shields.io/badge/types-included-blue)](https://www.npmjs.com/package/wechatpay-axios-plugin)
[![Node](https://img.shields.io/node/v/wechatpay-axios-plugin)](https://www.npmjs.com/package/wechatpay-axios-plugin)
[![NPM downloads per month](https://img.shields.io/npm/dm/wechatpay-axios-plugin)](https://www.npmjs.com/package/wechatpay-axios-plugin)
[![NPM license](https://img.shields.io/npm/l/wechatpay-axios-plugin)](https://www.npmjs.com/package/wechatpay-axios-plugin)

## 主要功能

- 使用Node原生`crypto`实现微信支付APIv3的AES加/解密功能(`aes-256-gcm` with `aad`)
- 使用Node原生`crypto`实现微信支付APIv3的RSA加/解密、签名、验签功能(`sha256WithRSAEncryption` with `RSA_PKCS1_OAEP_PADDING`)
- 支持微信支付APIv3的HTTP GET/POST/PUT/PATCH/DELETE多方法链式操作，依赖 [Axios](https://github.com/axios/axios), 示例代码如下
- 支持微信支付APIv3的媒体文件上传(图片/视频)功能，由内置 `Multipart` 类驱动，示例代码如下
- 支持微信支付APIv3的平台证书下载功能，需手动安装 [yargs](https://github.com/yargs/yargs), 使用手册如下
- 支持微信支付APIv3的帐单下载及解析功能，示例代码如下
- 支持微信支付APIv2 & APIv3面向对象编程模式，示例代码如下
- 支持 `Typescript`
- 支持微信支付XML风格的接口(通常所说v2)调用，依赖 [node-xml2js](https://github.com/Leonidas-from-XIV/node-xml2js), 示例代码如下
- 支持微信支付APIv2版的 `AES-256-ECB/PKCS7PADDING` 通知消息加/解密
- 微信支付APIv2 & APIv3 与微信交互的各种数据签名用法示例
- 支持 企业微信-企业支付-企业红包/向员工付款 功能，示例用法及代码如下

## 系统要求

NodeJs >= 10.15.0

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

命令行工具可用来做快速接入体验，用法如下:

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
  -c.serial MCHSERIAL \
  -c.privateKey /path/your/merchant/mchid.key \
  -c.certs.PLATSERIAL /path/the/platform/certificates/HEXADECIAL.pem \
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
  -c.serial nop \
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
  -c.serial nop \
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

本类库是把 `URL.pathname` 以`/`做切分，取出 `segments` 映射成实例对象属性，同时支持`APIv2`的实例对象属性映射，编码书写方式有如下约定：

1. 请求 `segments` 按照顺序作为级联对象，例如 `v3/pay/transactions/native` 即链接成 `v3.pay.transactions.native`;
2. 每个 `segments` 所支持的 `HTTP METHOD`，即作为 请求对象的末尾执行方法，例如: `v3.pay.transactions.native.post({})`;
3. 每个 `segments` 级联对象默认为HTTP`POST`方法，其同时隐式内置`GET/POST/PUT/PATCH/DELETE` 方法链，小写`verb`格式，说明见`变更历史`;
4. 每个 `segments` 有中线(dash)分隔符的，可以使用驼峰`camelCase`风格书写，例如: `merchant-service`可写成 `merchantService`，或者字面量属性，如 `v3['merchant-service']`;
5. 每个 `segments` 中，若有动态参数，例如 `business_code/{business_code}` 可写成 `business_code.$business_code$` 或者字面量属性风格，如 `business_code['{business_code}']`;
6. 如果 `segments` 以 `v2` 开始，其特殊标识为`APIv2`级联对象开始位，之后串接其他`segments`，如源 `pay/micropay` 即串接成 `v2.pay.micropay` 即以XML形式请求远端接口；
7. 建议 `segments` 按照 `PascalCase` 风格书写, `TS Definition` 已在路上(还有若干问题没解决)，将是这种风格，代码提示将会很自然;

以下示例用法，均以`Promise`或`Async/Await`结合此种编码模式展开。

## 初始化

```js
const { Wechatpay } = require('wechatpay-axios-plugin');
const { readFileSync } = require('fs');

// 商户号，支持「普通商户/特约商户」或「服务商商户」
const merchantId = '190000****';

// 「商户API证书」的「证书序列号」
const merchantCertificateSerial = '3775B6A45ACD588826D15E583A95F5DD********';

// 从本地文件中加载「商户API私钥」
const merchantPrivateKeyFilePath = '/path/to/merchant/apiclient_key.pem';
const merchantPrivateKeyInstance = readFileSync(merchantPrivateKeyFilePath);

// 「微信支付平台证书」的「证书序列号」，下载器下载后有提示`serial`序列号字段
const platformCertificateSerial = '7132d72a03e93cddf8c03bbd1f37eedf********';

// 从本地文件中加载「微信支付平台证书」，用来验证微信支付请求响应体的签名
const platformCertificateFilePath = '/path/to/wechatpay/cert.pem';
const platformCertificateInstance = readFileSync(platformCertificateFilePath);

const wxpay = new Wechatpay({
  mchid: merchantId,
  serial: merchantCertificateSerial,
  privateKey: merchantPrivateKeyInstance,
  certs: { [platformCertificateSerial]: platformCertificateInstance, },
  // 使用APIv2时，需要至少设置 `secret`字段，示例代码未开启
  // APIv2密钥(32字节)
  // secret: 'your_merchant_secret_key_string',
  // // 接口不要求证书情形，例如仅收款merchant对象参数可选
  // merchant: {
  //   cert: readFileSync('/path/to/merchant/apiclient_cert.pem'),
  //   key: merchantPrivateKeyInstance,
  //   // or
  //   // passphrase: 'your_merchant_id',
  //   // pfx: fs.readFileSync('/your/merchant/cert/apiclient_cert.p12'),
  // },
});
```

**注:** 证书序列号（「商户证书」序列号及「平台证书」序列号）均可用`OpenSSL`命令获取到，例如： `openssl x509 -in /path/to/merchant/apiclient_cert.pem -noout -serial | awk -F= '{print $2}'`

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

**注：** APIv2&APIv3以及Axios初始参数，均融合在一个型参上，APIv2已不推荐使用，推荐优先使用APIv3。

## APIv3

### Native下单
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
  .catch(({response: {status, statusText, data}}) => console.error(status, statusText, data))
```

### 查询订单
```js
wxpay.v3.pay.transactions.id._transaction_id_ // _placeholder_ 语法糖会转换成 '{placeholder}' 格式
  .get({
    params: {
      mchid: '1230000109'
    },
    transaction_id: '1217752501201407033233368018'
  })
  .then(({data}) => console.info(data))
  .catch(({response: {status, statusText, data}}) => console.error(status, statusText, data))
```

### 关闭订单
```js
wxpay.v3.pay.transactions.outTradeNo.$transaction_id$.close // $placeholder$ 语法糖会转换成 '{placeholder}' 格式
  .post({
    mchid: '1230000109'
  }, {
    transaction_id: '1217752501201407033233368018'
  })
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
})()
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
})()
```

### 商家转账到零钱

```js
const {Rsa} = require('wechatpay-axios-plugin');

;(async () => {
  try {
    const res = await wxpay.v3.transfer.batches.post({
      appid: 'wxf636efh567hg4356',
      out_batch_no: 'plfk2020042013',
      batch_name: '2019年1月深圳分部报销单',
      batch_remark: '2019年1月深圳分部报销单',
      total_amount: 4000000,
      total_num: 200,
      transfer_detail_list: [
        {
          out_detail_no: 'x23zy545Bd5436',
          transfer_amount: 200000,
          transfer_remark: '2020年4月报销',
          openid: 'o-MYE42l80oelYMDE34nYD456Xoy',
          user_name: Rsa.encrypt('张三', platformCertificateInstance),
        }
      ],
      transfer_scene_id: '1001',
    }, {
      headers: {
        'Wechatpay-Serial' => platformCertificateSerial,
      },
    });
  } catch({response: {status, statusText, data}}) {
    console.error(status, statusText, data)
  }
})()
```

### 商业投诉查询

```js
;(async () => {
  try {
    const res = await wxpay.v3.merchantService.complaintsV2.get({
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
const { Multipart } = require('wechatpay-axios-plugin')
const {createReadStream} = require('fs')

const imageMeta = {
  filename: 'hellowechatpay.png',
  sha256: '1a47b1eb40f501457eaeafb1b1417edaddfbe7a4a8f9decec2d330d1b4477fbe',
}

const imageData = new Multipart()
imageData.append('meta', JSON.stringify(imageMeta), 'meta.json')
imageData.append('file', createReadStream('./hellowechatpay.png'), 'hellowechatpay.png')

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
    const res = await wxpay.v3.marketing.favor.stocks.$stock_id$.get({
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
        'Idempotency-Key': 12345
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
const { Multipart } = require('wechatpay-axios-plugin')
const {createReadStream} = require('fs')

const videoMeta = {
  filename: 'hellowechatpay.mp4',
  sha256: '1a47b1eb40f501457eaeafb1b1417edaddfbe7a4a8f9decec2d330d1b4477fbe',
}

const videoData = new Multipart()
videoData.append('meta', JSON.stringify(videoMeta))
videoData.append('file', createReadStream('./hellowechatpay.mp4'), 'hellowechatpay.mp4')

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
    const {data: {download_url, hash_value}} = await wxpay.v3.bill.fundflowbill.get({
      params: {
        bill_date: '2020-02-12',
        bill_type: 'BASIC',
        tar_type: 'GZIP',
      }
    })
    const {data} = await wxpay.v3.billdownload.file.get({
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
wxpay.v2.pay.micropay.post({
  appid: 'wx8888888888888888',
  mch_id: '1900000109',
  nonce_str: Formatter.nonce(),
  sign_type: 'HMAC-SHA256',
  body: 'image形象店-深圳腾大-QQ公仔',
  out_trade_no: '1217752501201407033233368018',
  total_fee: '888',
  fee_type: 'CNY',
  spbill_create_ip: '8.8.8.8',
  auth_code: '120061098828009406',
})
.then(res => console.info(res.data))
.catch(({response: {status, statusText, data}}) => console.error(status, statusText, data))
```

### H5支付

```js
wxpay.v2.pay.unifiedorder.post({
  appid: 'wx2421b1c4370ec43b',
  attach: '支付测试',
  body: 'H5支付测试',
  mch_id: '10000100',
  nonce_str: Formatter.nonce(),
  notify_url: 'http://wxpay.wxutil.com/pub_v2/pay/notify.v2.php',
  openid: 'oUpF8uMuAJO_M2pxb1Q9zNjWeS6o',
  out_trade_no: '1415659990',
  spbill_create_ip: '14.23.150.211',
  total_fee: '1',
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
  total_fee: '100',
  refund_fee: '100',
  refund_fee_type: 'CNY',
  nonce_str: Formatter.nonce(),
})
.then(res => console.info(res.data))
.catch(({response: {status, statusText, data}}) => console.error(status, statusText, data))
```

### 现金红包

```js
wxpay.v2.mmpaymkttransfers.sendredpack.post({
  nonce_str: Formatter.nonce(),
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

### 企业付款到零钱

```js
wxpay.v2.mmpaymkttransfers.promotion.transfers.post({
  mch_appid: 'wx8888888888888888',
  mchid: '1900000109',// 注意这个商户号，key是`mchid`非`mch_id`
  partner_trade_no: '10000098201411111234567890',
  openid: 'oxTWIuGaIt6gTKsQRLau2M0yL16E',
  check_name: 'FORCE_CHECK',
  re_user_name: '王小王',
  amount: '10099',
  desc: '理赔',
  spbill_create_ip: '192.168.0.1',
  nonce_str: Formatter.nonce(),
}, {
  // 返回值无`sign`字段，无需数据校验
  transformResponse: [Transformer.toObject],
})
.then(res => console.info(res.data))
.catch(({response: {status, statusText, data}}) => console.error(status, statusText, data))
```

### 企业付款到银行卡-获取RSA公钥

```js
wxpay.v2.risk.getpublickey.post({
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
wxpay.v2.pay.downloadbill.post({
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

Q: `平台证书`下载工具，一直抛异常`AssertionError [ERR_ASSERTION]: The response's Headers incomplete`是为何？

> 命令行下的 `-s`参数，即：`商户证书序列号`参数给错了，就会抛上述异常，这个时候服务端其实返回的是`401`状态码，下一个版本会优化一下下载工具，对异常进行捕获，当前请校对你的`商户证书序列号`并且确保正确；

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

## 链接

如果你觉得这个`library`不错，你可以扫如下`赞赏码`以资鼓励作者，[博客](https://thenorthmemory.github.io/)更有部分"实战"内容，也可能对你的开发对接有所帮助。

<img src="https://thenorthmemory.github.io/donate.png" />


- [参与贡献](CONTRIBUTING.md)
- [贡献者公约](CODE_OF_CONDUCT.md)
- [变更历史](CHANGELOG.md)

## 许可证

[MIT](LICENSE)
