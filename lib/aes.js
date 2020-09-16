const crypto = require('crypto')
/**
 * Aes - Advanced Encryption Standard
 */
class Aes {
  /**
   * @property {string} hex - Alias of `hex` string
   */
  static get hex() { return `hex` }

  /**
   * @property {string} utf8 - Alias of `utf8` string
   */
  static get utf8() { return `utf8` }

  /**
   * @property {string} base64 - Alias of `base64` string
   */
  static get base64() { return `base64` }

  /**
   * @property {string} BLOCK_SIZE - The `aes` block size
   */
  static get BLOCK_SIZE() { return 16 }

  /**
   * @property {string} ALGO_AES_256_GCM - The `aes-256-gcm` algorithm
   */
  static get ALGO_AES_256_GCM() { return `aes-256-gcm` }

  /**
   * @property {string} ALGO_AES_256_ECB - The `aes-256-ecb` algorithm
   */
  static get ALGO_AES_256_ECB() { return `aes-256-ecb` }

  /**
   * Back compatible {@link AesGcm.encrypt}, shall removed future
   * @returns {string} Base64-encoded ciphertext.
   */
  static encrypt(...arg) {
    /*eslint-disable-next-line*/
    return AesGcm.encrypt(...arg)
  }

  /**
   * Back compatible {@link AesGcm.decrypt}, shall removed future
   * @returns {string} Utf-8 plaintext.
   */
  static decrypt(...arg) {
    /*eslint-disable-next-line*/
    return AesGcm.decrypt(...arg)
  }

  /**
   * @property {object} pkcs7 - The PKCS7 padding/unpadding container
   */
  static get pkcs7() {
    const {BLOCK_SIZE} = this

    return {
      /**
       * padding, 32 bytes/256 bits `secret key` may optional need the last block.
       * @see https://tools.ietf.org/html/rfc2315#section-10.3
       * <quote>
       * The padding can be removed unambiguously since all input is
       *     padded and no padding string is a suffix of another. This
       *     padding method is well-defined if and only if k < 256;
       *     methods for larger k are an open issue for further study.
       * </quote>
       *
       * @param {string|Buffer} thing - The input
       * @param {boolean} [optional = true] - The flag for the last padding
       *
       * @return {Buffer} - The PADDING tailed payload
       */
      padding: (thing, optional = true) => {
        const payload = Buffer.from(thing)
        const pad = BLOCK_SIZE - payload.length % BLOCK_SIZE

        if (optional && pad === BLOCK_SIZE) {
          return payload
        }

        return Buffer.concat([payload, Buffer.alloc(pad, pad)])
      },

      /**
       * unpadding
       *
       * @param  {string|Buffer} thing - The input
       * @return {Buffer} - The PADDING wiped payload
       */
      unpadding: thing => {
        const byte = Buffer.alloc(1)
        const payload = Buffer.from(thing)
        payload.copy(byte, 0, payload.length - 1)
        const pad = byte.readUInt8()

        if (!~~Buffer.compare(Buffer.alloc(pad, pad), payload.slice(-pad))) {
          return payload.slice(0, -pad)
        }

        return payload
      },
    }
  }
}

/**
 * Aes encrypt/decrypt using `aes-256-gcm` algorithm with `AAD`.
 */
class AesGcm extends Aes {
  /**
   * Encrypts plaintext.
   *
   * @param {string} iv - The initialization vector, 16 bytes string.
   * @param {string} key - The secret key, 32 bytes string.
   * @param {string} plaintext - Text to encode.
   * @param {string} aad - The additional authenticated data, maybe empty string.
   *
   * @returns {string} Base64-encoded ciphertext.
   */
  static encrypt(iv, key, plaintext, aad = '') {
    const cipher = crypto.createCipheriv(
      this.ALGO_AES_256_GCM, key, iv
    ).setAAD(Buffer.from(aad))

    return Buffer.concat([
      cipher.update(plaintext, this.utf8),
      cipher.final(),
      cipher.getAuthTag()
    ]).toString(this.base64)
  }

  /**
   * Decrypts ciphertext.
   *
   * @param {string} iv - The initialization vector, 16 bytes string.
   * @param {string} key - The secret key, 32 bytes string.
   * @param {string} ciphertext - Base64-encoded ciphertext.
   * @param {string} aad - The additional authenticated data, maybe empty string.
   *
   * @returns {string} Utf-8 plaintext.
   */
  static decrypt(iv, key, ciphertext, aad = '') {
    const buf = Buffer.from(ciphertext, this.base64)
    const tag = buf.slice(-this.BLOCK_SIZE)
    const payload = buf.slice(0, -this.BLOCK_SIZE)

    const decipher = crypto.createDecipheriv(
      this.ALGO_AES_256_GCM, key, iv
    ).setAuthTag(tag).setAAD(Buffer.from(aad))

    return Buffer.concat([
      decipher.update(payload, this.hex),
      decipher.final()
    ]).toString(this.utf8)
  }
}

/**
 * Aes encrypt/decrypt using `aes-256-ecb` algorithm with pkcs7padding.
 */
class AesEcb extends Aes {
  /**
   * Encrypts plaintext.
   *
   * @param {string} plaintext - Text to encode.
   * @param {string} key - The secret key, 32 bytes string.
   *
   * @returns {string} Base64-encoded ciphertext.
   */
  static encrypt(plaintext, key) {
    const payload = this.pkcs7.padding(plaintext)
    const cipher = crypto.createCipheriv(
      this.ALGO_AES_256_ECB, key, null
    ).setAutoPadding(false)

    return Buffer.concat([
      cipher.update(payload, this.utf8),
      cipher.final()
    ]).toString(this.base64)
  }

  /**
   * Decrypts ciphertext.
   * Notes here: While turns the `setAutoPadding(true)`, it works well.
   *             Beause the `pkcs5padding` is a subset of `pkcs7padding`.
   *             Let's `unpadding` self.
   *
   * @param {string} ciphertext - Base64-encoded ciphertext.
   * @param {string} key - The secret key, 32 bytes string.
   *
   * @returns {string} Utf-8 plaintext.
   */
  static decrypt(ciphertext, key) {
    const payload = Buffer.from(ciphertext, this.base64)
    const decipher = crypto.createDecipheriv(
      this.ALGO_AES_256_ECB, key, null
    ).setAutoPadding(false)

    return this.pkcs7.unpadding(Buffer.concat([
      decipher.update(payload, this.hex),
      decipher.final()
    ])).toString(this.utf8)
  }
}

module.exports = Aes
module.exports.default = Aes
module.exports.AesGcm = AesGcm
module.exports.AesEcb = AesEcb
