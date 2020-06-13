const crypto = require('crypto')

const hex = `hex`
const utf8 = `utf8`
const base64 = `base64`

const BLOCK_SIZES = 16
const algorithm = `aes-256-gcm`

/**
 * Aes encrypt/decrypt using `aes-256-gcm` algorithm with `AAD`.
 */
class Aes {

  /**
   * Encrypts plaintext.
   *
   * @param {string} iv - The initialization vector, 16 bytes string.
   * @param {string} key - The secret key, 32 bytes string.
   * @param {string} plaintext - Text to encode.
   * @param {string} aad - The additional authenticated data, maybe empty string.
   *
   * @returns {string}
   */
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

  /**
   * Decrypts ciphertext.
   *
   * @param {string} iv - The initialization vector, 16 bytes string.
   * @param {string} key - The secret key, 32 bytes string.
   * @param {string} ciphertext - Base64-encoded ciphertext.
   * @param {string} aad - The additional authenticated data, maybe empty string.
   *
   * @returns {string}
   */
  static decrypt(iv, key, ciphertext, aad = '') {
    const buf = Buffer.from(ciphertext, base64)
    const tag = buf.slice(-BLOCK_SIZES)
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

module.exports = Aes
module.exports.default = Aes
