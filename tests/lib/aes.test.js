const should = require('should')
const aes = require('../../lib/aes')

describe('lib/aes', () => {
  it('should be class Aes', () => {
    aes.should.be.a.Function().and.have.property('name', 'Aes')
  })

  it('should have a subclass AesGcm', () => {
    aes.AesGcm.should.be.a.Function().and.have.property('name', 'AesGcm')
  })

  it('should have a subclass AesEcb', () => {
    aes.AesEcb.should.be.a.Function().and.have.property('name', 'AesEcb')
  })

  describe('Aes::hex', () => {
    it('property `hex` should be static', () => {
      should(aes.hex).be.a.String()
      should((new aes).hex).is.Undefined()
    })

    it('property `hex` should have a fixed value `hex`', () => {
      should(aes.hex).be.a.String().and.equal(`hex`)
    })
  })

  describe('Aes::utf8', () => {
    it('property `utf8` should be static', () => {
      should(aes.utf8).be.a.String()
      should((new aes).utf8).is.Undefined()
    })

    it('property `utf8` should have a fixed value `utf8`', () => {
      should(aes.utf8).be.a.String().and.equal(`utf8`)
    })
  })

  describe('Aes::base64', () => {
    it('property `base64` should be static', () => {
      should(aes.base64).be.a.String()
      should((new aes).base64).is.Undefined()
    })

    it('property `base64` should have a fixed value `base64`', () => {
      should(aes.base64).be.a.String().and.equal(`base64`)
    })
  })

  describe('Aes::BLOCK_SIZE', () => {
    it('property `BLOCK_SIZE` should be static', () => {
      should(aes.BLOCK_SIZE).be.a.Number()
      should((new aes).BLOCK_SIZE).is.Undefined()
    })

    it('property `BLOCK_SIZE` should have a fixed value 16', () => {
      should(aes.BLOCK_SIZE).be.a.Number().and.equal(16)
    })
  })

  describe('Aes::ALGO_AES_256_GCM', () => {
    it('property `ALGO_AES_256_GCM` should be static', () => {
      should(aes.ALGO_AES_256_GCM).be.a.String()
      should((new aes).ALGO_AES_256_GCM).is.Undefined()
    })

    it('property `ALGO_AES_256_GCM` should have a fixed value `aes-256-gcm`', () => {
      should(aes.ALGO_AES_256_GCM).be.a.String().and.equal('aes-256-gcm')
    })
  })

  describe('Aes::ALGO_AES_256_ECB', () => {
    it('property `ALGO_AES_256_ECB` should be static', () => {
      should(aes.ALGO_AES_256_ECB).be.a.String()
      should((new aes).ALGO_AES_256_ECB).is.Undefined()
    })

    it('property `ALGO_AES_256_ECB` should have a fixed value `aes-256-ecb`', () => {
      should(aes.ALGO_AES_256_ECB).be.a.String().and.equal('aes-256-ecb')
    })
  })

  describe('Aes::pkcs7', () => {
    it('property `pkcs7` should be static', () => {
      should(aes.pkcs7).be.an.Object()
      should((new aes).pkcs7).is.Undefined()
    })

    it('property `pkcs7` should have `padding` method', () => {
      should(aes.pkcs7.padding).be.a.Function()
    })

    it('property `pkcs7` should have `unpadding` method', () => {
      should(aes.pkcs7.unpadding).be.a.Function()
    })
  })

  const mockupIv = '0123456789abcdef'
  const mockupKey = '0123456789abcdef0123456789abcdef'
  describe('Aes::encrypt', () => {
    it('method `encrypt` should be static', () => {
      should(aes.encrypt).be.a.Function()
      should((new aes).encrypt).is.Undefined()
    })

    it('method `encrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when type of the `key` is invalid', () => {
      should(() => {
        aes.encrypt()
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      })
    })

    it('method `encrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when type of the `iv` is invalid', () => {
      should(() => {
        aes.encrypt(undefined, '')
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      })
    })

    it('method `encrypt` should thrown Error when length of the `iv` is invalid', () => {
      should(() => {
        aes.encrypt('', '')
      }).throw(Error, {
      })
    })

    it('method `encrypt` should thrown Error when length of the `key` is invalid', () => {
      mockupIv.should.be.String().and.have.length(16)
      should(() => {
        aes.encrypt(mockupIv, '')
      }).throw(Error, {
        message: 'Invalid key length',
        stack: /at Cipheriv\.createCipherBase/,
      })
    })

    it('method `encrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when type of the `plaintext` is invalid', () => {
      mockupIv.should.be.String().and.have.length(16)
      mockupKey.should.be.String().and.have.length(32)
      should(() => {
        aes.encrypt(mockupIv, mockupKey)
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      })
    })

    it('method `encrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when the `aad` is number(1)', () => {
      mockupIv.should.be.String().and.have.length(16)
      mockupKey.should.be.String().and.have.length(32)
      should(() => {
        aes.encrypt(mockupIv, mockupKey, '', 1)
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      })
    })

    it('method `encrypt` should returns a string while passed `plaintext` an empty string and equal to `GvpmmdtYwexXIPhySs9Tlg==`', () => {
      mockupIv.should.be.String().and.have.length(16)
      mockupKey.should.be.String().and.have.length(32)
      aes.encrypt(mockupIv, mockupKey, '', '')
        .should.be.a.String()
        .and.equal('GvpmmdtYwexXIPhySs9Tlg==')
    })

    it('method `encrypt` should returns a string while passed `plaintext`=`hello`, `aad`=`world` and equal to `APoZlYpivU3HjbAiB4CvW1rAFr8J`', () => {
      mockupIv.should.be.String().and.have.length(16)
      mockupKey.should.be.String().and.have.length(32)
      aes.encrypt(mockupIv, mockupKey, 'hello', 'world')
        .should.be.a.String()
        .and.equal('APoZlYpivU3HjbAiB4CvW1rAFr8J')
    })
  })

  describe('Aes::decrypt', () => {
    it('method `decrypt` should be static', () => {
      should(aes.decrypt).be.a.Function()
      should((new aes).decrypt).is.Undefined()
    })

    it('method `decrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when type of the `ciphertext` is invalid', () => {
      should(() => {
        aes.decrypt()
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      })
    })

    it('method `decrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when type of the `key` is invalid', () => {
      should(() => {
        aes.decrypt(undefined, undefined, '')
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      })
    })

    it('method `decrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when type of the `iv` is invalid', () => {
      should(() => {
        aes.decrypt(undefined, '', '')
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      })
    })

    it('method `decrypt` should thrown Error when length of the `iv` is invalid', () => {
      should(() => {
        aes.decrypt('', '', '')
      }).throw(Error, {
      })
    })

    it('method `decrypt` should thrown Error when length of the `key` is invalid', () => {
      mockupIv.should.be.String().and.have.length(16)
      should(() => {
        aes.decrypt(mockupIv, '', '')
      }).throw(Error, {
        message: 'Invalid key length',
        stack: /at Decipheriv\.createCipherBase/,
      })
    })

    it('method `decrypt` should thrown Error when the `ciphertext` is empty string', () => {
      mockupIv.should.be.String().and.have.length(16)
      mockupKey.should.be.String().and.have.length(32)
      should(() => {
        aes.decrypt(mockupIv, mockupKey, '')
      }).throw(Error, {
        code: 'ERR_CRYPTO_INVALID_AUTH_TAG',
        message: 'Invalid authentication tag length: 0',
      })
    })

    it('method `decrypt` should returns empty string when the `ciphertext` is `GvpmmdtYwexXIPhySs9Tlg==`', () => {
      mockupIv.should.be.String().and.have.length(16)
      mockupKey.should.be.String().and.have.length(32)
      aes.decrypt(mockupIv, mockupKey, 'GvpmmdtYwexXIPhySs9Tlg==').should.be.String().and.empty().and.have.length(0)
    })

    it('method `decrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when the `aad` is number(1)', () => {
      mockupIv.should.be.String().and.have.length(16)
      mockupKey.should.be.String().and.have.length(32)
      should(() => {
        aes.decrypt(mockupIv, mockupKey, 'GvpmmdtYwexXIPhySs9Tlg==', 1)
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      })
    })

    it('method `decrypt` should returns `hello` when the `ciphertext` is `APoZlYpivU3HjbAiB4CvW1rAFr8J` and `aad`=`world`', () => {
      mockupIv.should.be.String().and.have.length(16)
      mockupKey.should.be.String().and.have.length(32)
      aes.decrypt(mockupIv, mockupKey, 'APoZlYpivU3HjbAiB4CvW1rAFr8J', 'world').should.be.String().and.equal('hello')
    })
  })

  describe('Aes::AesGcm', () => {
    it('should be class AesGcm', () => {
      aes.AesGcm.should.be.a.Function().and.have.property('name', 'AesGcm')
    })
  })

  describe('Aes::AesEcb', () => {
    it('should be class AesEcb', () => {
      aes.AesEcb.should.be.a.Function().and.have.property('name', 'AesEcb')
    })
  })
})
