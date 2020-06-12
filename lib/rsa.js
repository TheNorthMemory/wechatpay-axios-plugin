import crypto from 'crypto'

const sha1   = `sha1`
const utf8   = `utf8`
const base64 = `base64`

const sha256WithRSAEncryption = `sha256WithRSAEncryption`
const RSA_PKCS1_OAEP_PADDING  = crypto.constants.RSA_PKCS1_OAEP_PADDING

class Rsa {

  static encrypt(plaintext, publicCertificate) {
    return crypto.publicEncrypt({
      oaepHash : sha1,
      key      : publicCertificate,
      padding  : RSA_PKCS1_OAEP_PADDING,
    }, Buffer.from(plaintext, utf8)).toString(base64)
  }

  static decrypt(ciphertext, privateKeyCertificate) {
    return crypto.privateDecrypt({
      oaepHash : sha1,
      key      : privateKeyCertificate,
      padding  : RSA_PKCS1_OAEP_PADDING
    }, Buffer.from(ciphertext, base64)).toString(utf8)
  }

  static sign(message, privateKeyCertificate) {
    return crypto.createSign(
      sha256WithRSAEncryption
    ).update(message).sign(
      privateKeyCertificate,
      base64
    )
  }

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

export default Rsa
