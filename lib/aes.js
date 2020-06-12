import crypto from 'crypto'

const hex    = `hex`
const utf8   = `utf8`
const base64 = `base64`

const BLOCK_SIZES = 16
const algorithm   = `aes-256-gcm`

class Aes {

  static encrypt(iv, key, plaintext, aad = '') {
    const cipher = crypto.createCipheriv(
      algorithm, key, iv
    ).setAAD(Buffer.from(aad))

    return Buffer.concat([
      cipher.update(plaintext, utf8),
      cipher.final(),
      cipher.getAuthTag()
    ]).toString(base64)
  }

  static decrypt(iv, key, ciphertext, aad = '') {
    const buf     = Buffer.from(ciphertext, base64)
    const tag     = buf.slice(-BLOCK_SIZES)
    const payload = buf.slice(0, -BLOCK_SIZES)

    const decipher = crypto.createDecipheriv(
      algorithm, key, iv
    ).setAuthTag(tag).setAAD(Buffer.from(aad))

    return Buffer.concat([
      decipher.update(payload, hex),
      decipher.final()
    ]).toString(utf8)
  }
}

export default Aes
