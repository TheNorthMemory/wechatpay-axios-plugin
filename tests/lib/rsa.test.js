const {readFileSync} = require('fs')
const {join} = require('path')

const should = require('should')
const rsa = require('../../lib/rsa')

describe('lib/rsa', () => {
  it('should be class Rsa', () => {
    rsa.should.be.a.Function().and.have.property('name', 'Rsa')
  })

  describe('Rsa::encrypt', () => {
    it('method `encrypt` should be static', () => {
      should(rsa.encrypt).be.a.Function()
      should((new rsa).encrypt).is.Undefined()
    })

    it('method `encrypt` should thrown TypeError when none arguments given', () => {
      should(() => {
        rsa.encrypt()
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      })
    })

    it('method `encrypt` should thrown TypeError when `publicCertificate` argument is not given', () => {
      should(() => {
        rsa.encrypt('')
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      })
    })

    it('method `encrypt` should thrown Error when `publicCertificate` is invalid', () => {
      should(() => {
        rsa.encrypt('', '')
      }).throw(Error, {
        code: /ERR_OSSL_BIO_NULL_PARAMETER|ERR_OSSL_PEM_NO_START_LINE/,
      })
    })

    it('method `encrypt` should returns a String when read the `publicCertificate` from `pem` file', () => {
      const cert = readFileSync(join(__dirname, '../fixtures/apiserver_cert.pem'))

      cert.should.be.instanceof(Buffer)
      rsa.encrypt('', cert).should.be.a.String().and.not.empty()
    })

    it('method `encrypt` should returns a String when passs the `publicCertificate` a string', () => {
      const cert = readFileSync(join(__dirname, '../fixtures/apiserver_cert.pem')).toString()

      cert.should.be.a.String().and.startWith('-----BEGIN CERTIFICATE-----').and.match(/-----END CERTIFICATE-----\n?$/)
      rsa.encrypt('', cert).should.be.a.String().and.not.empty()
    })
  })

  describe('Rsa::decrypt', () => {
    it('method `decrypt` should be static', () => {
      should(rsa.decrypt).be.a.Function()
      should((new rsa).decrypt).is.Undefined()
    })

    it('method `decrypt` should thrown TypeError when none arguments given', () => {
      should(() => {
        rsa.decrypt()
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      })
    })

    it('method `decrypt` should thrown TypeError when `privateKeyCertificate` argument is not given', () => {
      should(() => {
        rsa.decrypt('')
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      })
    })

    it('method `decrypt` should thrown Error when `privateKeyCertificate` is invalid', () => {
      should(() => {
        rsa.decrypt('', '')
      }).throw(Error, {
        code: /ERR_OSSL_BIO_NULL_PARAMETER|ERR_OSSL_PEM_NO_START_LINE/,
      })
    })

    it('method `decrypt` should thrown Error when the `privateKeyCertificate` is valid but the `ciphertext` is empty string', () => {
      const privateKey = readFileSync(join(__dirname, '../fixtures/apiclient_key.pem'))

      privateKey.should.be.instanceof(Buffer)

      should(() => {
        rsa.decrypt('', privateKey)
      }).throw(Error, {
        code: 'ERR_OSSL_RSA_OAEP_DECODING_ERROR',
      })
    })

    it('method `decrypt` should returns an empty string when `ciphertext` is the input via `Rsa.encrypt` and `privateKeyCertificate` is a `pem` buffer', () => {
      const cert = readFileSync(join(__dirname, '../fixtures/apiserver_cert.pem'))

      cert.should.be.instanceof(Buffer)

      const ciphertext = rsa.encrypt('', cert)

      ciphertext.should.be.a.String().and.not.empty()

      const privateKey = readFileSync(join(__dirname, '../fixtures/apiclient_key.pem'))

      privateKey.should.be.instanceof(Buffer)
      rsa.decrypt(ciphertext, privateKey).should.be.a.String().and.empty()
    })

    it('method `decrypt` should returns an empty string when `ciphertext` is the input via `Rsa.encrypt` and `privateKeyCertificate` is a pkcs8 `pem` String', () => {
      const cert = readFileSync(join(__dirname, '../fixtures/apiserver_cert.pem'))

      cert.should.be.instanceof(Buffer)

      const ciphertext = rsa.encrypt('', cert)

      ciphertext.should.be.a.String().and.not.empty()

      const privateKey = readFileSync(join(__dirname, '../fixtures/apiclient_key.pem')).toString()

      privateKey.should.be.a.String().and.startWith('-----BEGIN PRIVATE KEY-----').and.match(/-----END PRIVATE KEY-----\n?$/)
      rsa.decrypt(ciphertext, privateKey).should.be.a.String().and.empty()
    })
  })

  describe('Rsa::sign', () => {
    it('method `sign` should be static', () => {
      should(rsa.sign).be.a.Function()
      should((new rsa).sign).is.Undefined()
    })

    it('method `sign` should thrown TypeError when none arguments given', () => {
      should(() => {
        rsa.sign()
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      })
    })

    it('method `sign` should thrown TypeError when `privateKeyCertificate` argument is not given', () => {
      should(() => {
        rsa.sign('')
      }).throw(Error, {
        code: 'ERR_CRYPTO_SIGN_KEY_REQUIRED',
        message: 'No key provided to sign',
      })
    })

    it('method `sign` should thrown Error when `privateKeyCertificate` is invalid', () => {
      should(() => {
        rsa.sign('', '')
      }).throw(Error, {
        code: 'ERR_CRYPTO_SIGN_KEY_REQUIRED',
        message: 'No key provided to sign',
      })
    })

    it('method `sign` should returns a `String` when the `ciphertext` is empty string and the `privateKeyCertificate` is `pem` buffer', () => {
      const privateKey = readFileSync(join(__dirname, '../fixtures/apiclient_key.pem'))

      privateKey.should.be.instanceof(Buffer)
      rsa.sign('', privateKey).should.be.String().and.not.be.empty()
    })

    it('method `sign` should returns a `string` when the `ciphertext` is empty string and `privateKeyCertificate` is a pkcs8 `pem` string', () => {
      const privateKey = readFileSync(join(__dirname, '../fixtures/apiclient_key.pem')).toString()

      privateKey.should.be.a.String().and.startWith('-----BEGIN PRIVATE KEY-----').and.match(/-----END PRIVATE KEY-----\n?$/)
      rsa.sign('', privateKey).should.be.a.String().and.not.be.empty()
    })
  })

  describe('Rsa::verify', () => {
    it('method `verify` should be static', () => {
      should(rsa.verify).be.a.Function()
      should((new rsa).verify).is.Undefined()
    })

    it('method `verify` should thrown TypeError when none arguments given', () => {
      should(() => {
        rsa.verify()
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      })
    })

    it('method `verify` should thrown TypeError when the `publicCertificate` argument is not given', () => {
      should(() => {
        rsa.verify('')
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      })
    })

    it('method `verify` should thrown TypeError when the `publicCertificate` argument is is invalid', () => {
      should(() => {
        rsa.verify('', '')
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      })
    })

    it('method `verify` should thrown TypeError when the `signature` argument is undefined', () => {
      const cert = readFileSync(join(__dirname, '../fixtures/apiserver_cert.pem'))

      cert.should.be.instanceof(Buffer)
      should(() => {
        rsa.verify('', undefined, cert)
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      })
    })

    it('method `verify` should returns Boolean `False` when the `signature` argument is empty string', () => {
      const cert = readFileSync(join(__dirname, '../fixtures/apiserver_cert.pem'))

      cert.should.be.instanceof(Buffer)
      rsa.verify('', '', cert).should.be.Boolean().and.be.False()
    })

    it('method `verify` should returns Boolean `True` when given then `publicCertificate` `pem` Buffer and the `signature` as the result of the `Rsa.sign` an empty string', () => {
      const privateKey = readFileSync(join(__dirname, '../fixtures/apiclient_key.pem'))

      privateKey.should.be.instanceof(Buffer)

      const signature = rsa.sign('', privateKey)

      signature.should.be.String().and.not.be.empty()

      const cert = readFileSync(join(__dirname, '../fixtures/apiserver_cert.pem'))

      cert.should.be.instanceof(Buffer)
      rsa.verify('', signature, cert).should.be.Boolean().and.be.True()
    })

    it('method `verify` should returns Boolean `True` when given then `publicCertificate` `pem` String and the `signature` as the result of the `Rsa.sign` an empty string', () => {
      const privateKey = readFileSync(join(__dirname, '../fixtures/apiclient_key.pem'))

      privateKey.should.be.instanceof(Buffer)

      const signature = rsa.sign('', privateKey)

      signature.should.be.String().and.not.be.empty()

      const cert = readFileSync(join(__dirname, '../fixtures/apiserver_cert.pem')).toString()

      cert.should.be.a.String().and.startWith('-----BEGIN CERTIFICATE-----').and.match(/-----END CERTIFICATE-----\n?$/)
      rsa.verify('', signature, cert).should.be.Boolean().and.be.True()
    })
  })
})
