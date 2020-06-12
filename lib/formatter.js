
class Formatter {

  static nonce(size = 32) {
    const chars = `0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`

    return `0`.repeat(size).replace(/0/g, _ => chars[Math.random()*62|0])
  }

  static timestamp() {
    return +(new Date)/1000|0
  }

  static authorization(mchid, nonce_str, signature, timestamp, serial_no) {
    return `WECHATPAY2-SHA256-RSA2048 mchid="${mchid}",nonce_str="${nonce_str}",signature="${signature}",timestamp="${timestamp}",serial_no="${serial_no}"`
  }

  static request(method, uri, timestamp, nonce, body = '') {
    return `${method}\n${uri}\n${timestamp}\n${nonce}\n${body}\n`
  }

  static response(timestamp, nonce, body = '') {
    return `${timestamp}\n${nonce}\n${body}\n`
  }
}

export default Formatter
