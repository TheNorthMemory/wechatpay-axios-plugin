# Wechatpay [Axios](https://github.com/axios/axios) Plugin

[![NPM version](https://badge.fury.io/js/wechatpay-axios-plugin.svg)](http://badge.fury.io/js/wechatpay-axios-plugin)
[![npm module downloads per month](http://img.shields.io/npm/dm/wechatpay-axios-plugin.svg)](https://www.npmjs.com/package/wechatpay-axios-plugin)


## Features

- [x] The Node native code of the wechatpay APIv3's AES cryptography(`aes-256-gcm`) encrypt/decrypt
- [x] The Node native code of the wechatpay APIv3's RSA cryptography(`sha256WithRSAEncryption` with `RSA_PKCS1_OAEP_PADDING`) encrypt/decrypt/sign/verify
- [x] Most of the APIv3's GET/POST requests, except the media file upload and the wechatpay public certificates download

## Installing

`$ npm install wechatpay-axios-plugin`

## Examples

### Initialization

```js
import axios from 'axios'
import wxp from 'wechatpay-axios-plugin'
import {readFileSync} from 'fs'

const merchantPrivateKey  = readFileSync('/your/home/hellowechatpay/apiclient_key.pem')
const merchantPublicCert  = readFileSync('/your/home/hellowechatpay/apiclient_cert.pem')
const wechatpayPublicCert = '-----BEGIN CERTIFICATE-----' + '...' + '-----END CERTIFICATE-----'

const instance = axios.create({
  baseURL: 'https://api.mch.weixin.qq.com',
})

const client = wxp(instance, {
  mchid: 'your_merchant_id',
  serial: 'serial_number_of_your_merchant_public_cert',
  publicCert: merchantPublicCert,
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
    console.info(error)
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
    console.info(error)
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
    console.info(error)
  }
})()
```

You may find the advanced usage examples via the [Axios](https://github.com/axios/axios) project.

## TODO

- [ ] documentation
- [ ] coding comments
- [ ] media(image/video) upload
- [ ] certificates download

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
