/* eslint max-classes-per-file: ["error", 4], no-bitwise: ["error", { "allow": ["~"] }] */
const { createCipheriv, createDecipheriv } = require('crypto');

/**
 * @typedef {import('node:crypto').KeyLike} KeyLike
 * @typedef {import('node:crypto').BinaryLike} BinaryLike
 */

const utf8 = 'utf8';
const base64 = 'base64';
const hex = 'hex';
const BLOCK_SIZE = 16;
const ALGO_AES_256_GCM = 'aes-256-gcm';
const ALGO_AES_256_ECB = 'aes-256-ecb';
const ALGO_AES_128_CBC = 'aes-128-CBC';

/** The PKCS#7 padding/unpadding implementation */
const PKCS7 = {
  /**
   * padding, 32 bytes/256 bits `secret key` may optional need the last block.
   *
   * @param {BinaryLike} thing - The input
   * @param {boolean} [optional = true] - The flag for the last padding, default `true`
   *
   * @return {Buffer} - The PADDING tailed payload
   */
  padding(thing, optional = true) {
    const payload = Buffer.from(thing);
    const pad = BLOCK_SIZE - (payload.byteLength % BLOCK_SIZE);

    if (optional && pad === BLOCK_SIZE) {
      return payload;
    }

    return Buffer.concat([payload, Buffer.alloc(pad, pad)]);
  },

  /**
   * unpadding
   * @memberof Aes.pkcs7#
   *
   * @param  {BinaryLike} thing - The input
   * @return {Buffer} - The PADDING wiped payload
   */
  unpadding(thing) {
    const byte = Buffer.alloc(1);
    const payload = Buffer.from(thing);
    payload.copy(byte, 0, payload.byteLength - 1);
    const pad = byte.readUInt8();
    const len = payload.length;

    if (!~~Buffer.compare(Buffer.alloc(pad, pad), payload.subarray(len - pad, len))) {
      return payload.subarray(0, len - pad);
    }

    return payload;
  },
};

/**
 * Aes encrypt/decrypt using `aes-256-gcm` algorithm with `AAD`.
 */
class AesGcm {
  /**
   * Encrypts plaintext.
   *
   * @param {string} plaintext - Text to encode.
   * @param {KeyLike} key - The secret key.
   * @param {string} iv - The initialization vector.
   * @param {string} [aad = ''] - The additional authenticated data, maybe empty string.
   *
   * @returns {string} Base64-encoded ciphertext.
   */
  static encrypt(plaintext, key, iv, aad = '') {
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
   * @param {string} ciphertext - Base64-encoded ciphertext.
   * @param {KeyLike} key - The secret key.
   * @param {string} iv - The initialization vector.
   * @param {string} [aad = ''] - The additional authenticated data, maybe empty string.
   *
   * @returns {string} Utf-8 plaintext.
   */
  static decrypt(ciphertext, key, iv, aad = '') {
    const buf = Buffer.from(ciphertext, base64);
    const len = buf.length;
    const tag = buf.subarray(len - BLOCK_SIZE, len);
    const payload = buf.subarray(0, len - BLOCK_SIZE);

    const decipher = createDecipheriv(ALGO_AES_256_GCM, key, iv);

    // patches for Node < 18.0.0
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
class AesEcb {
  /**
   * Encrypts plaintext.
   *
   * @param {string} plaintext - Text to encode.
   * @param {KeyLike} key - The secret key.
   *
   * @returns {string} Base64-encoded ciphertext.
   */
  static encrypt(plaintext, key) {
    const payload = PKCS7.padding(plaintext);
    const cipher = createCipheriv(ALGO_AES_256_ECB, key, null).setAutoPadding(false);

    return Buffer.concat([
      cipher.update(payload, utf8),
      cipher.final(),
    ]).toString(base64);
  }

  /**
   * Decrypts ciphertext.
   *
   * @param {string} ciphertext - Base64-encoded ciphertext.
   * @param {KeyLike} key - The secret key.
   *
   * @returns {string} Utf-8 plaintext.
   */
  static decrypt(ciphertext, key) {
    const payload = Buffer.from(ciphertext, base64);
    const decipher = createDecipheriv(ALGO_AES_256_ECB, key, null).setAutoPadding(false);

    return PKCS7.unpadding(Buffer.concat([
      decipher.update(payload, hex),
      decipher.final(),
    ])).toString(utf8);
  }
}

/**
 * Aes encrypt/decrypt using `aes-128-cbc` algorithm with pkcs7padding.
 */
class AesCbc {
  /**
   * Encrypts plaintext.
   *
   * @param {string} plaintext - Text to encode.
   * @param {KeyLike} key - The secret key.
   * @param {string} iv - The initialization vector.
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
   *
   * @param {string} ciphertext - Base64-encoded ciphertext.
   * @param {KeyLike} key - The secret key.
   * @param {string} iv - The initialization vector.
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

/**
 * Aes - Advanced Encryption Standard
 */
class Aes {
  static BLOCK_SIZE = BLOCK_SIZE

  static pkcs7 = PKCS7

  static AesGcm = AesGcm

  static AesEcb = AesEcb

  static AesCbc = AesCbc

  static get default() { return this; }
}

module.exports = Aes;
