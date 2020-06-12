# Wechatpay Axios Plugin

[![NPM version](https://badge.fury.io/js/wechatpay-axios-plugin.svg)](http://badge.fury.io/js/wechatpay-axios-plugin)
[![npm module downloads per month](http://img.shields.io/npm/dm/wechatpay-axios-plugin.svg)](https://www.npmjs.org/package/wechatpay-axios-plugin)

## Examples

```js
import axios from 'axios'
import wxp from 'wechatpay-axios-plugin'
import {readFileSync} from 'fs'

(async () => {

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
  const res1 = await client.get('/v3/merchant-service/complaints', {
    params: {
      limit      : 5,
      offset     : 0,
      begin_date : '2020-03-07',
      end_date   : '2020-03-14',
    }
  })
  console.info(res1.data)
  cons res2 = await client.post('/v3/pay/partner/transactions/native', {
    data: {
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
    }
  })
  console.info(rers2.data.code_url)
})()
```

## TODO

- [x] AES encrypt/decrypt
- [x] RSA encrypt/decrypt/sign/verify
- [x] general API GET/POST requests
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
