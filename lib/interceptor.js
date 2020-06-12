import rsa from './rsa.js'
import fmt from './formatter.js'
import utils from 'axios/lib/utils.js'

import assert from 'assert'

const Interceptor = (axios, {
  mchid      = undefined,
  serial     = String,
  secret     = String,
  privateKey = undefined,
  publicCert = undefined,
  certs      = Object,
} = {}) => {

  assert(utils.isString(mchid) || utils.isNumber(mchid),
    'The merchant\' ID aka `mchid` is required, usually numerical'
  )
  assert(utils.isString(serial),
    'The serial number of the merchant\'s public certification aka `serial` is required, usually hexadecial'
  )
  assert(utils.isString(privateKey) || utils.isBuffer(privateKey),
    'The merchant\'s private key certification aka `privateKey` is required, usual as pem format'
  )
  assert(utils.isString(publicCert) || utils.isBuffer(publicCert),
    'The merchant\'s public certification aka `publicCert` is required, usual as pem format'
  )
  assert(utils.isObject(certs),
    'The public certifications via API downloaded `certs` is required, similar and just pair asof `{serial: publicCert}` Object'
  )

  axios.interceptors.request.use(config => {
    const method    = config.method.toUpperCase()
    const payload   = JSON.stringify(config.data)
    const nonce     = fmt.nonce()
    const timestamp = fmt.timestamp()
    const url       = new URL(axios.getUri(config), config.baseURL)
    const signature = rsa.sign(fmt.request(method, `${url.pathname}${url.search}`, timestamp, nonce, payload), privateKey)

    config.headers = {
      ...config.headers,
      'Content-Type' : `application/json`,
      Accept         : `application/json`,
      Authorization  : fmt.authorization(mchid, nonce, signature, timestamp, serial),
    }

    return config
  })

  axios.interceptors.response.use(response => {
    const timestamp = response.headers[`wechatpay-timestamp`]
    const nonce     = response.headers[`wechatpay-nonce`]
    const serial    = response.headers[`wechatpay-serial`]
    const signature = response.headers[`wechatpay-signature`]
    const payload   = JSON.stringify(response.data)

    assert.ok(rsa.verify(fmt.response(timestamp, nonce, payload), signature, certs[serial]),
      `Verify the response with timestamp=${timestamp}, nonce=${nonce}, signature=${signature}, cert={${serial}: publicCert} failed`
    )

    return response
  })

  return axios
}

export default Interceptor
