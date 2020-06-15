const crypto = require('crypto')

const sha1 = `sha1`
const utf8 = `utf8`
const base64 = `base64`

const sha256WithRSAEncryption = `sha256WithRSAEncryption`
const RSA_PKCS1_OAEP_PADDING = crypto.constants.RSA_PKCS1_OAEP_PADDING

/**
 * Provides some methods for the RSA `sha256WithRSAEncryption` with `RSA_PKCS1_OAEP_PADDING`.
 */
class Rsa {

  /**
   * Encrypts text with sha256WithRSAEncryption/RSA_PKCS1_OAEP_PADDING.
   * Node Limits >= 12.9.0 (`oaepHash` was added)
   *
   * @param {string} plaintext - Cleartext to encode.
   * @param {string|Buffer} publicCertificate - A PEM encoded public certificate.
   *
   * @returns {string} Base64-encoded ciphertext.
   */
  static encrypt(plaintext, publicCertificate) {
    return crypto.publicEncrypt({
      oaepHash: sha1,
      key: publicCertificate,
      padding: RSA_PKCS1_OAEP_PADDING,
    }, Buffer.from(plaintext, utf8)).toString(base64)
  }

  /**
   * Decrypts base64 encoded string with `privateKeyCertificate`.
   * Node Limits >= 12.9.0 (`oaepHash` was added)
   *
   * @param {string} ciphertext - Was previously encrypted string using the corresponding public certificate.
   * @param {string|Buffer} privateKeyCertificate - A PEM encoded private key certificate.
   *
   * @returns {string} Utf-8 plaintext.
   */
  static decrypt(ciphertext, privateKeyCertificate) {
    return crypto.privateDecrypt({
      oaepHash: sha1,
      key: privateKeyCertificate,
      padding: RSA_PKCS1_OAEP_PADDING
    }, Buffer.from(ciphertext, base64)).toString(utf8)
  }

  /**
   * Creates and returns a `Sign` string that uses `sha256WithRSAEncryption`.
   *
   * @param {string} message - Content will be `crypto.Sign`.
   * @param {string|Buffer} privateKeyCertificate - A PEM encoded private key certificate.
   *
   * @returns {string} Base64-encoded signature.
   */
  static sign(message, privateKeyCertificate) {
    return crypto.createSign(
      sha256WithRSAEncryption
    ).update(message).sign(
      privateKeyCertificate,
      base64
    )
  }

  /**
   * Verifying the `message` with given `signature` string that uses `sha256WithRSAEncryption`.
   *
   * @param {string} message - Content will be `crypto.Verify`.
   * @param {string} signature - The base64-encoded ciphertext.
   * @param {string|Buffer} publicCertificate - A PEM encoded public certificate.
   *
   * @returns {boolean} True is passed, false is failed.
   */
  static verify(message, signature, publicCertificate) {
    return crypto.createVerify(
      sha256WithRSAEncryption
    ).update(message).verify(
      publicCertificate,
      signature,
      base64
    )
  }
}

module.exports = Rsa
module.exports.default = Rsa
