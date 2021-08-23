const {
  publicEncrypt, privateDecrypt, createSign, createVerify, constants: { RSA_PKCS1_OAEP_PADDING },
} = require('crypto');

/** @constant {string} */
const sha1 = 'sha1';
/** @constant {string} */
const utf8 = 'utf8';
/** @constant {string} */
const base64 = 'base64';
/** @constant {string} */
const sha256WithRSAEncryption = 'sha256WithRSAEncryption';

/**
 * Provides some methods for the RSA `sha256WithRSAEncryption` with `RSA_PKCS1_OAEP_PADDING`.
 */
class Rsa {
  /**
   * Encrypts text with sha256WithRSAEncryption/RSA_PKCS1_OAEP_PADDING.
   * Recommended Node Limits Version >= 12.9.0 (`oaepHash` was available), even if it works on v10.15.0.
   *
   * @param {string} plaintext - Cleartext to encode.
   * @param {string|Buffer} publicKey - A PEM encoded public certificate.
   *
   * @returns {string} Base64-encoded ciphertext.
   */
  static encrypt(plaintext, publicKey) {
    return publicEncrypt({
      oaepHash: sha1,
      key: publicKey,
      padding: RSA_PKCS1_OAEP_PADDING,
    }, Buffer.from(plaintext, utf8)).toString(base64);
  }

  /**
   * Decrypts base64 encoded string with `privateKey`.
   * Recommended Node Limits Version >= 12.9.0 (`oaepHash` was available), even if it works on v10.15.0.
   *
   * @param {string} ciphertext - Was previously encrypted string using the corresponding public certificate.
   * @param {string|Buffer} privateKey - A PEM encoded private key certificate.
   *
   * @returns {string} Utf-8 plaintext.
   */
  static decrypt(ciphertext, privateKey) {
    return privateDecrypt({
      oaepHash: sha1,
      key: privateKey,
      padding: RSA_PKCS1_OAEP_PADDING,
    }, Buffer.from(ciphertext, base64)).toString(utf8);
  }

  /**
   * Creates and returns a `Sign` string that uses `sha256WithRSAEncryption`.
   *
   * @param {string|Buffer} message - Content will be `crypto.Sign`.
   * @param {string|Buffer} privateKey - A PEM encoded private key certificate.
   *
   * @returns {string} Base64-encoded signature.
   */
  static sign(message, privateKey) {
    return createSign(sha256WithRSAEncryption).update(message).sign(
      privateKey,
      base64,
    );
  }

  /**
   * Verifying the `message` with given `signature` string that uses `sha256WithRSAEncryption`.
   *
   * @param {string|Buffer} message - Content will be `crypto.Verify`.
   * @param {string} signature - The base64-encoded ciphertext.
   * @param {string|Buffer} publicKey - A PEM encoded public certificate.
   *
   * @returns {boolean} True is passed, false is failed.
   */
  static verify(message, signature, publicKey) {
    return createVerify(sha256WithRSAEncryption).update(message).verify(
      publicKey,
      signature,
      base64,
    );
  }
}

module.exports = Rsa;
module.exports.default = Rsa;
