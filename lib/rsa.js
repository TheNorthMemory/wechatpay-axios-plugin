const {
  publicEncrypt, privateDecrypt, createSign, createVerify,
  constants: { RSA_PKCS1_PADDING, RSA_PKCS1_OAEP_PADDING },
} = require('crypto');

/** @constant 'sha1' */
const sha1 = 'sha1';
/** @constant 'utf8' */
const utf8 = 'utf8';
/** @constant 'base64' */
const base64 = 'base64';
/** @constant 'sha256WithRSAEncryption' */
const sha256WithRSAEncryption = 'sha256WithRSAEncryption';

/**
 * @param {number} code - Supporting `RSA_PKCS1_OAEP_PADDING` or `RSA_PKCS1_PADDING`, default is `RSA_PKCS1_OAEP_PADDING`.
 * @throws {RangeError} - While the padding isn't `RSA_PKCS1_OAEP_PADDING` nor `RSA_PKCS1_PADDING`.
 * @returns {void}
 */
const paddingModeLimitedCheck = (code) => {
  if (!(code === RSA_PKCS1_PADDING || code === RSA_PKCS1_OAEP_PADDING)) {
    throw new RangeError(`Doesn't supported the padding mode(${code}), here's only support RSA_PKCS1_OAEP_PADDING or RSA_PKCS1_PADDING.`);
  }
};

/**
 * Provides some methods for the RSA `sha256WithRSAEncryption` with `RSA_PKCS1_OAEP_PADDING`.
 */
class Rsa {
  /**
   * Alias of the `RSA_PKCS1_OAEP_PADDING` mode
   */
  static get RSA_PKCS1_OAEP_PADDING() { return RSA_PKCS1_OAEP_PADDING; }

  /**
   * Alias of the `RSA_PKCS1_PADDING` mode
   */
  static get RSA_PKCS1_PADDING() { return RSA_PKCS1_PADDING; }

  /**
   * Encrypts text with sha256WithRSAEncryption/RSA_PKCS1_OAEP_PADDING.
   * Recommended Node Limits Version >= 12.9.0 (`oaepHash` was available), even if it works on v10.15.0.
   *
   * @param {string} plaintext - Cleartext to encode.
   * @param {string|Buffer} publicKey - A PEM encoded public certificate.
   * @param {number} padding - Supporting `RSA_PKCS1_OAEP_PADDING` or `RSA_PKCS1_PADDING`, default is `RSA_PKCS1_OAEP_PADDING`.
   *
   * @returns {string} Base64-encoded ciphertext.
   * @throws {RangeError} - While the padding isn't `RSA_PKCS1_OAEP_PADDING` nor `RSA_PKCS1_PADDING`.
   */
  static encrypt(plaintext, publicKey, padding = RSA_PKCS1_OAEP_PADDING) {
    paddingModeLimitedCheck(padding);
    return publicEncrypt({
      oaepHash: sha1,
      key: publicKey,
      padding,
    }, Buffer.from(plaintext, utf8)).toString(base64);
  }

  /**
   * Decrypts base64 encoded string with `privateKey`.
   * Recommended Node Limits Version >= 12.9.0 (`oaepHash` was available), even if it works on v10.15.0.
   *
   * @param {string} ciphertext - Was previously encrypted string using the corresponding public certificate.
   * @param {string|Buffer} privateKey - A PEM encoded private key certificate.
   * @param {number} padding - Supporting `RSA_PKCS1_OAEP_PADDING` or `RSA_PKCS1_PADDING`, default is `RSA_PKCS1_OAEP_PADDING`.
   *
   * @returns {string} Utf-8 plaintext.
   * @throws {RangeError} - While the padding isn't `RSA_PKCS1_OAEP_PADDING` nor `RSA_PKCS1_PADDING`.
   */
  static decrypt(ciphertext, privateKey, padding = RSA_PKCS1_OAEP_PADDING) {
    paddingModeLimitedCheck(padding);
    return privateDecrypt({
      oaepHash: sha1,
      key: privateKey,
      padding,
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
