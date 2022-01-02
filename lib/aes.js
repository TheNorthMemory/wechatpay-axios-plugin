/* eslint max-classes-per-file: ["error", 4],
          no-bitwise: ["error", { "allow": ["~"] }],
          no-use-before-define: ["error", { "classes": false }] */
const { createCipheriv, createDecipheriv } = require('crypto');
/** @constant 'utf8' */
const utf8 = 'utf8';
/** @constant 'base64' */
const base64 = 'base64';
/** @constant 'hex' */
const hex = 'hex';
/** @constant 16 */
const BLOCK_SIZE = 16;
/** @constant 'aes-256-gcm' */
const ALGO_AES_256_GCM = 'aes-256-gcm';
/** @constant 'aes-256-ecb' */
const ALGO_AES_256_ECB = 'aes-256-ecb';
/** @constant 'aes-128-cbc' */
const ALGO_AES_128_CBC = 'aes-128-CBC';
/** The PKCS#7 padding/unpadding implementation */
const PKCS7 = {
  /**
   * padding, 32 bytes/256 bits `secret key` may optional need the last block.
   * @see [rfc2315]{@link https://tools.ietf.org/html/rfc2315#section-10.3}
   * @memberof Aes.pkcs7#
   * @summary
   * The padding can be removed unambiguously since all input is
   *     padded and no padding string is a suffix of another. This
   *     padding method is well-defined if and only if k < 256;
   *     methods for larger k are an open issue for further study.
   *
   * @param {string|Buffer} thing - The input
   * @param {boolean} [optional = true] - The flag for the last padding, default `true`
   *
   * @return {Buffer} - The PADDING tailed payload
   */
  padding(thing, optional = true) {
    const payload = Buffer.from(thing);
    const pad = BLOCK_SIZE - (payload.length % BLOCK_SIZE);

    if (optional && pad === BLOCK_SIZE) {
      return payload;
    }

    return Buffer.concat([payload, Buffer.alloc(pad, pad)]);
  },

  /**
   * unpadding
   * @memberof Aes.pkcs7#
   *
   * @param  {string|Buffer} thing - The input
   * @return {Buffer} - The PADDING wiped payload
   */
  unpadding(thing) {
    const byte = Buffer.alloc(1);
    const payload = Buffer.from(thing);
    payload.copy(byte, 0, payload.length - 1);
    const pad = byte.readUInt8();

    if (!~~Buffer.compare(Buffer.alloc(pad, pad), payload.slice(-pad))) {
      return payload.slice(0, -pad);
    }

    return payload;
  },
};

/**
 * Aes - Advanced Encryption Standard
 */
class Aes {
  /**
   * @property {string} hex - Alias of `hex` string
   * @deprecated v0.8.0 - Only for compatible, use the literal `hex` string instead
   */
  static get hex() { return hex; }

  /**
   * @property {string} utf8 - Alias of `utf8` string
   * @deprecated v0.8.0 - Only for compatible, use the literal `utf8` string instead
   */
  static get utf8() { return utf8; }

  /**
   * @property {string} base64 - Alias of `base64` string
   * @deprecated v0.8.0 - Only for compatible, use the literal `base64` string instead
   */
  static get base64() { return base64; }

  /**
   * @property {integer} BLOCK_SIZE - The `aes` block size
   * @deprecated v0.8.0 - Only for compatible, use the literal `16` number instead
   */
  static get BLOCK_SIZE() { return BLOCK_SIZE; }

  /**
   * @property {string} ALGO_AES_256_GCM - The `aes-256-gcm` algorithm
   * @deprecated v0.8.0 - Only for compatible, use the literal `aes-256-gcm` string instead
   */
  static get ALGO_AES_256_GCM() { return ALGO_AES_256_GCM; }

  /**
   * @property {string} ALGO_AES_256_ECB - The `aes-256-ecb` algorithm
   * @deprecated v0.8.0 - Only for compatible, use the literal `aes-256-ecb` string instead
   */
  static get ALGO_AES_256_ECB() { return ALGO_AES_256_ECB; }

  /**
   * @property {string} ALGO_AES_128_CBC - The `aes-128-cbc` algorithm
   * @deprecated v0.8.0 - Only for compatible, use the literal `aes-128-cbc` string instead
   */
  static get ALGO_AES_128_CBC() { return ALGO_AES_128_CBC; }

  /**
   * Back compatible {@link AesGcm.encrypt}, shall removed future
   * @deprecated v0.8.0 - Only for compatible, use the `AesGcm.encrypt` method instead
   * @returns {string} Base64-encoded ciphertext.
   */
  static encrypt(...arg) { return AesGcm.encrypt(...arg); }

  /**
   * Back compatible {@link AesGcm.decrypt}, shall removed future
   * @deprecated v0.8.0 - Only for compatible, use the `AesGcm.decrypt` method instead
   * @returns {string} Utf-8 plaintext.
   */
  static decrypt(...arg) { return AesGcm.decrypt(...arg); }

  /**
   * @property {object} pkcs7 - The PKCS7 padding/unpadding container
   */
  static get pkcs7() { return PKCS7; }
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
    const cipher = createCipheriv(ALGO_AES_256_GCM, key, iv).setAAD(Buffer.from(aad));

    return Buffer.concat([
      cipher.update(plaintext, utf8),
      cipher.final(),
      cipher.getAuthTag(),
    ]).toString(base64);
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
    const buf = Buffer.from(ciphertext, base64);
    const tag = buf.slice(-BLOCK_SIZE);
    const payload = buf.slice(0, -BLOCK_SIZE);

    const decipher = createDecipheriv(ALGO_AES_256_GCM, key, iv);

    // Restrict valid GCM tag length, patches for Node < 11.0.0
    // more @see https://github.com/nodejs/node/pull/20039
    const tagLen = tag.length;
    if (tagLen > 16 || (tagLen < 12 && tagLen !== 8 && tagLen !== 4)) {
      const backport = new TypeError(`Invalid authentication tag length: ${tagLen}`);
      backport.code = 'ERR_CRYPTO_INVALID_AUTH_TAG';
      throw backport;
    }
    decipher.setAuthTag(tag).setAAD(Buffer.from(aad));

    return Buffer.concat([
      decipher.update(payload, hex),
      decipher.final(),
    ]).toString(utf8);
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
   * @param {string} [iv] - The initialization vector, default is null.
   *
   * @returns {string} Base64-encoded ciphertext.
   */
  static encrypt(plaintext, key, iv = null) {
    const payload = PKCS7.padding(plaintext);
    const cipher = createCipheriv(ALGO_AES_256_ECB, key, iv).setAutoPadding(false);

    return Buffer.concat([
      cipher.update(payload, utf8),
      cipher.final(),
    ]).toString(base64);
  }

  /**
   * Decrypts ciphertext.
   * Notes here: While turns the `setAutoPadding(true)`, it works well.
   *             Beause the `pkcs5padding` is a subset of `pkcs7padding`.
   *             Let's `unpadding` self.
   *
   * @param {string} ciphertext - Base64-encoded ciphertext.
   * @param {string} key - The secret key, 32 bytes string.
   * @param {string} [iv] - The initialization vector, default is null.
   *
   * @returns {string} Utf-8 plaintext.
   */
  static decrypt(ciphertext, key, iv = null) {
    const payload = Buffer.from(ciphertext, base64);
    const decipher = createDecipheriv(ALGO_AES_256_ECB, key, iv).setAutoPadding(false);

    return PKCS7.unpadding(Buffer.concat([
      decipher.update(payload, hex),
      decipher.final(),
    ])).toString(utf8);
  }
}

/**
 * Aes encrypt/decrypt using `aes-128-cbc` algorithm with pkcs7padding.
 */
class AesCbc extends Aes {
  /**
   * Encrypts plaintext.
   *
   * @param {string} plaintext - Text to encode.
   * @param {string} key - The secret key, 16 bytes string.
   * @param {string} [iv] - The initialization vector, 16 bytes string.
   *
   * @returns {string} Base64-encoded ciphertext.
   */
  static encrypt(plaintext, key, iv) {
    const payload = PKCS7.padding(plaintext, false);
    const cipher = createCipheriv(ALGO_AES_128_CBC, key, iv).setAutoPadding(false);

    return Buffer.concat([
      cipher.update(payload, utf8),
      cipher.final(),
    ]).toString(base64);
  }

  /**
   * Decrypts ciphertext.
   * Notes here: While turns the `setAutoPadding(true)`, it works well.
   *             Beause the `pkcs5padding` is a subset of `pkcs7padding`.
   *             Let's `unpadding` self.
   *
   * @param {string} ciphertext - Base64-encoded ciphertext.
   * @param {string} key - The secret key, 16 bytes string.
   * @param {string} [iv] - The initialization vector, 16 bytes string.
   *
   * @returns {string} Utf-8 plaintext.
   */
  static decrypt(ciphertext, key, iv) {
    const payload = Buffer.from(ciphertext, base64);
    const decipher = createDecipheriv(ALGO_AES_128_CBC, key, iv).setAutoPadding(false);
    return PKCS7.unpadding(Buffer.concat([
      decipher.update(payload, hex),
      decipher.final(),
    ])).toString(utf8);
  }
}

module.exports = Aes;
module.exports.default = Aes;
module.exports.AesGcm = AesGcm;
module.exports.AesEcb = AesEcb;
module.exports.AesCbc = AesCbc;
