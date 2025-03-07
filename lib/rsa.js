const {
  publicEncrypt, privateDecrypt, createSign, createVerify,
  KeyObject, createPrivateKey, createPublicKey,
  constants: { RSA_PKCS1_PADDING, RSA_PKCS1_OAEP_PADDING },
} = require('crypto');

const { isString } = require('./utils');

/** @constant 'sha1' */
const sha1 = 'sha1';
/** @constant 'utf8' */
const utf8 = 'utf8';
/** @constant 'base64' */
const base64 = 'base64';
/** @constant 'sha256WithRSAEncryption' */
const sha256WithRSAEncryption = 'sha256WithRSAEncryption';

const RULES = {
  /** -----BEGIN RSA PRIVATE KEY----- ... -----END RSA PRIVATE KEY----- */
  'private.pkcs1': ['der', 'pkcs1', 16],
  /** -----BEGIN PRIVATE KEY----- ... -----END PRIVATE KEY----- */
  'private.pkcs8': ['der', 'pkcs8', 16],
  /** -----BEGIN RSA PUBLIC KEY----- ... -----BEGIN RSA PUBLIC KEY----- */
  'public.pkcs1': ['der', 'pkcs1', 15],
  /** -----BEGIN PUBLIC KEY----- ... -----END PUBLIC KEY----- */
  'public.spki': ['der', 'spki', 14],
};

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
  static RSA_PKCS1_OAEP_PADDING = RSA_PKCS1_OAEP_PADDING

  static RSA_PKCS1_PADDING = RSA_PKCS1_PADDING

  /** Type string of the asymmetric key */
  static KEY_TYPE_PUBLIC = 'public'

  /** Type string of the asymmetric key */
  static KEY_TYPE_PRIVATE = 'private'

  static isKeyObject(thing) {
    return (thing instanceof KeyObject) && [this.KEY_TYPE_PUBLIC, this.KEY_TYPE_PRIVATE].includes(thing.type);
  }

  /**
   * Sugar for loading input `privateKey` string.
   *
   * @param {string} str - The string in `PKCS#8` format.
   *
   * @return {object} - The keyObjectLike `{key,format,type}` structure.
   */
  static fromPkcs8(str) { return this.from(`${this.KEY_TYPE_PRIVATE}.pkcs8://${str}`); }

  /**
   * Sugar for loading input `privateKey/publicKey` string.
   *
   * @param {string} str - The string in `PKCS#1` format.
   * @param {'public'|'private'} [type = 'private'] - The `str` is public key string.
   *
   * @return {object} - The keyObjectLike `{key,format,type}` structure.
   */
  static fromPkcs1(str, type = this.KEY_TYPE_PRIVATE) {
    return this.from(`${type === this.KEY_TYPE_PUBLIC ? this.KEY_TYPE_PUBLIC : this.KEY_TYPE_PRIVATE}.pkcs1://${str}`);
  }

  /**
   * Sugar for loading input `publicKey` string.
   *
   * @param {string} str - The string in `SPKI` format.
   *
   * @return {object} - The keyObjectLike `{key,format,type}` structure.
   */
  static fromSpki(str) { return this.from(`${this.KEY_TYPE_PUBLIC}.spki://${str}`); }

  /**
   * Loading the privateKey/publicKey from a protocol like string.
   *
   * @param {string|Buffer|KeyObject} thing - The `private.pkcs8://` or `public.spki://` protocol string OR Buffer/KeyObject.
   * @param {'public'|'private'} [type = 'private'] - The `str` is public key string.
   *
   * @return {KeyObject} - The KeyObject can be passed onto `createSign`(privateKey) or `createVerify`(publicKey).
   */
  static from(thing, type = this.KEY_TYPE_PRIVATE) {
    if (this.isKeyObject(thing) && thing.type === type) { return thing; }

    const protocol = isString(thing) && thing.indexOf('://') > 0 ? thing.slice(0, thing.indexOf('://')) : '';
    const [format, kind, offset] = RULES[protocol] || [];

    let input = thing;
    if (format && kind && offset) {
      const key = Buffer.from(thing.slice(offset), base64);
      input = { key, format, type: kind };
    }

    return (protocol.startsWith(this.KEY_TYPE_PRIVATE) || type === this.KEY_TYPE_PRIVATE ? createPrivateKey : createPublicKey)(input);
  }

  /**
   * Encrypts text with sha256WithRSAEncryption/RSA_PKCS1_OAEP_PADDING.
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

  static get default() { return this; }
}

module.exports = Rsa;
