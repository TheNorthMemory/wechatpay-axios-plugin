const should = require('should')
const Aes = require('../../lib/aes')

describe('lib/aes', () => {
  it('should be class Aes', () => {
    Aes.should.be.a.Function().and.have.property('name', 'Aes')
  })

  it('should have a subclass AesGcm', () => {
    Aes.AesGcm.should.be.a.Function().and.have.property('name', 'AesGcm')
  })

  it('should have a subclass AesEcb', () => {
    Aes.AesEcb.should.be.a.Function().and.have.property('name', 'AesEcb')
  })

  describe('Aes::hex', () => {
    it('property `hex` should be static', () => {
      should(Aes.hex).be.a.String()
      should((new Aes).hex).is.Undefined()
    })

    it('property `hex` should have a fixed value `hex`', () => {
      should(Aes.hex).be.a.String().and.equal(`hex`)
    })
  })

  describe('Aes::utf8', () => {
    it('property `utf8` should be static', () => {
      should(Aes.utf8).be.a.String()
      should((new Aes).utf8).is.Undefined()
    })

    it('property `utf8` should have a fixed value `utf8`', () => {
      should(Aes.utf8).be.a.String().and.equal(`utf8`)
    })
  })

  describe('Aes::base64', () => {
    it('property `base64` should be static', () => {
      should(Aes.base64).be.a.String()
      should((new Aes).base64).is.Undefined()
    })

    it('property `base64` should have a fixed value `base64`', () => {
      should(Aes.base64).be.a.String().and.equal(`base64`)
    })
  })

  describe('Aes::BLOCK_SIZE', () => {
    it('property `BLOCK_SIZE` should be static', () => {
      should(Aes.BLOCK_SIZE).be.a.Number()
      should((new Aes).BLOCK_SIZE).is.Undefined()
    })

    it('property `BLOCK_SIZE` should have a fixed value 16', () => {
      should(Aes.BLOCK_SIZE).be.a.Number().and.equal(16)
    })
  })

  describe('Aes::ALGO_AES_256_GCM', () => {
    it('property `ALGO_AES_256_GCM` should be static', () => {
      should(Aes.ALGO_AES_256_GCM).be.a.String()
      should((new Aes).ALGO_AES_256_GCM).is.Undefined()
    })

    it('property `ALGO_AES_256_GCM` should have a fixed value `aes-256-gcm`', () => {
      should(Aes.ALGO_AES_256_GCM).be.a.String().and.equal('aes-256-gcm')
    })
  })

  describe('Aes::ALGO_AES_256_ECB', () => {
    it('property `ALGO_AES_256_ECB` should be static', () => {
      should(Aes.ALGO_AES_256_ECB).be.a.String()
      should((new Aes).ALGO_AES_256_ECB).is.Undefined()
    })

    it('property `ALGO_AES_256_ECB` should have a fixed value `aes-256-ecb`', () => {
      should(Aes.ALGO_AES_256_ECB).be.a.String().and.equal('aes-256-ecb')
    })
  })

  describe('Aes::pkcs7', () => {
    it('property `pkcs7` should be static', () => {
      should(Aes.pkcs7).be.an.Object()
      should((new Aes).pkcs7).is.Undefined()
    })

    it('property `pkcs7` should have `padding` method', () => {
      should(Aes.pkcs7.padding).be.a.Function()
    })

    it('property `pkcs7` should have `unpadding` method', () => {
      should(Aes.pkcs7.unpadding).be.a.Function()
    })

    describe('Aes::pkcs7::padding', () => {
      it('method `padding` should thrown a `TypeError` with `code:ERR_INVALID_ARG_TYPE` while none arguments passed in', () => {
        should(() => {
          Aes.pkcs7.padding()
        }).throw(TypeError, {
          code: 'ERR_INVALID_ARG_TYPE',
        })
      })

      it('method `padding` should thrown a `TypeError` with `code:ERR_INVALID_ARG_TYPE` while only a number passed in', () => {
        should(() => {
          Aes.pkcs7.padding(1)
        }).throw(TypeError, {
          code: 'ERR_INVALID_ARG_TYPE',
        })
      })

      it('method `padding` should returns an empty buffer while only an empty string passed in', () => {
        Aes.pkcs7.padding('').should.be.instanceof(Buffer).and.have.length(0)
      })

      it('method `padding` with empty string and boolean `false` should returns a buffer which\'s length(16), and equal to `Aes.BLOCK_SIZE`', () => {
        Aes.pkcs7.padding('', false).should.be.instanceof(Buffer).and.have.length(Aes.BLOCK_SIZE)
      })
    })

    describe('Aes::pkcs7::unpadding', () => {
      it('method `unpadding` should thrown a `TypeError` with `code:ERR_INVALID_ARG_TYPE` while none arguments passed in', () => {
        should(() => {
          Aes.pkcs7.unpadding()
        }).throw(TypeError, {
          code: 'ERR_INVALID_ARG_TYPE',
        })
      })

      it('method `unpadding` should thrown a `RangeError` with `code:ERR_INDEX_OUT_OF_RANGE` while an empty string passed in', () => {
        should(() => {
          Aes.pkcs7.unpadding('')
        }).throw(RangeError, {
          code: 'ERR_INDEX_OUT_OF_RANGE',
        })
      })

      it('method `unpadding` should returns a buffer which\'s length(0) while `Aes.pkcs7.padding("", false)` passed in', () => {
        Aes.pkcs7.unpadding(Aes.pkcs7.padding('', false)).should.be.instanceof(Buffer).and.have.length(0)
      })

      it('method `unpadding` should returns a buffer which\'s length(1) while `Aes.pkcs7.padding("1")` passed in', () => {
        Aes.pkcs7.unpadding(Aes.pkcs7.padding('1')).should.be.instanceof(Buffer).and.have.length(1)
      })
    })
  })

  const mockupIv = '0123456789abcdef'
  const mockupKey = '0123456789abcdef0123456789abcdef'
  describe('Aes::encrypt', () => {
    it('method `encrypt` should be static', () => {
      should(Aes.encrypt).be.a.Function()
      should((new Aes).encrypt).is.Undefined()
    })

    it('method `encrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when type of the `key` is invalid', () => {
      should(() => {
        Aes.encrypt()
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      })
    })

    it('method `encrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when type of the `iv` is invalid', () => {
      should(() => {
        Aes.encrypt(undefined, '')
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      })
    })

    it('method `encrypt` should thrown Error when length of the `iv` is invalid', () => {
      should(() => {
        Aes.encrypt('', '')
      }).throw(Error, {
      })
    })

    it('method `encrypt` should thrown Error when length of the `key` is invalid', () => {
      mockupIv.should.be.String().and.have.length(16)
      should(() => {
        Aes.encrypt(mockupIv, '')
      }).throw(Error, {
        message: 'Invalid key length',
        stack: /at Cipheriv\.createCipherBase/,
      })
    })

    it('method `encrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when type of the `plaintext` is invalid', () => {
      mockupIv.should.be.String().and.have.length(16)
      mockupKey.should.be.String().and.have.length(32)
      should(() => {
        Aes.encrypt(mockupIv, mockupKey)
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      })
    })

    it('method `encrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when the `aad` is number(1)', () => {
      mockupIv.should.be.String().and.have.length(16)
      mockupKey.should.be.String().and.have.length(32)
      should(() => {
        Aes.encrypt(mockupIv, mockupKey, '', 1)
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      })
    })

    it('method `encrypt` should returns a string while passed `plaintext` an empty string and equal to `GvpmmdtYwexXIPhySs9Tlg==`', () => {
      mockupIv.should.be.String().and.have.length(16)
      mockupKey.should.be.String().and.have.length(32)
      Aes.encrypt(mockupIv, mockupKey, '', '')
        .should.be.a.String()
        .and.equal('GvpmmdtYwexXIPhySs9Tlg==')
    })

    it('method `encrypt` should returns a string while passed `plaintext`=`hello`, `aad`=`world` and equal to `APoZlYpivU3HjbAiB4CvW1rAFr8J`', () => {
      mockupIv.should.be.String().and.have.length(16)
      mockupKey.should.be.String().and.have.length(32)
      Aes.encrypt(mockupIv, mockupKey, 'hello', 'world')
        .should.be.a.String()
        .and.equal('APoZlYpivU3HjbAiB4CvW1rAFr8J')
    })
  })

  describe('Aes::decrypt', () => {
    it('method `decrypt` should be static', () => {
      should(Aes.decrypt).be.a.Function()
      should((new Aes).decrypt).is.Undefined()
    })

    it('method `decrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when type of the `ciphertext` is invalid', () => {
      should(() => {
        Aes.decrypt()
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      })
    })

    it('method `decrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when type of the `key` is invalid', () => {
      should(() => {
        Aes.decrypt(undefined, undefined, '')
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      })
    })

    it('method `decrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when type of the `iv` is invalid', () => {
      should(() => {
        Aes.decrypt(undefined, '', '')
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      })
    })

    it('method `decrypt` should thrown Error when length of the `iv` is invalid', () => {
      should(() => {
        Aes.decrypt('', '', '')
      }).throw(Error, {
      })
    })

    it('method `decrypt` should thrown Error when length of the `key` is invalid', () => {
      mockupIv.should.be.String().and.have.length(16)
      should(() => {
        Aes.decrypt(mockupIv, '', '')
      }).throw(Error, {
        message: 'Invalid key length',
        stack: /at Decipheriv\.createCipherBase/,
      })
    })

    it('method `decrypt` should thrown Error when the `ciphertext` is empty string', () => {
      mockupIv.should.be.String().and.have.length(16)
      mockupKey.should.be.String().and.have.length(32)
      should(() => {
        Aes.decrypt(mockupIv, mockupKey, '')
      }).throw(Error, {
        code: 'ERR_CRYPTO_INVALID_AUTH_TAG',
        message: 'Invalid authentication tag length: 0',
      })
    })

    it('method `decrypt` should returns empty string when the `ciphertext` is `GvpmmdtYwexXIPhySs9Tlg==`', () => {
      mockupIv.should.be.String().and.have.length(16)
      mockupKey.should.be.String().and.have.length(32)
      Aes.decrypt(mockupIv, mockupKey, 'GvpmmdtYwexXIPhySs9Tlg==').should.be.String().and.empty().and.have.length(0)
    })

    it('method `decrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when the `aad` is number(1)', () => {
      mockupIv.should.be.String().and.have.length(16)
      mockupKey.should.be.String().and.have.length(32)
      should(() => {
        Aes.decrypt(mockupIv, mockupKey, 'GvpmmdtYwexXIPhySs9Tlg==', 1)
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      })
    })

    it('method `decrypt` should returns `hello` when the `ciphertext` is `APoZlYpivU3HjbAiB4CvW1rAFr8J` and `aad`=`world`', () => {
      mockupIv.should.be.String().and.have.length(16)
      mockupKey.should.be.String().and.have.length(32)
      Aes.decrypt(mockupIv, mockupKey, 'APoZlYpivU3HjbAiB4CvW1rAFr8J', 'world').should.be.String().and.equal('hello')
    })
  })

  describe('Aes::AesGcm', () => {
    it('should be class AesGcm', () => {
      Aes.AesGcm.should.be.a.Function().and.have.property('name', 'AesGcm')
    })

    it('`new Aes.AesGcm` should be instanceof `Aes`', () => {
      (new Aes.AesGcm).should.be.instanceof(Aes)
    })

    describe('Aes::AesGcm::encrypt', () => {
      it('method `encrypt` should be static', () => {
        should(Aes.AesGcm.encrypt).be.a.Function()
        should((new Aes.AesGcm).encrypt).is.Undefined()
      })

      it('method `encrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when type of the `key` is invalid', () => {
        should(() => {
          Aes.AesGcm.encrypt()
        }).throw(TypeError, {
          code: 'ERR_INVALID_ARG_TYPE',
        })
      })

      it('method `encrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when type of the `iv` is invalid', () => {
        should(() => {
          Aes.AesGcm.encrypt(undefined, '')
        }).throw(TypeError, {
          code: 'ERR_INVALID_ARG_TYPE',
        })
      })

      it('method `encrypt` should thrown Error when length of the `iv` is invalid', () => {
        should(() => {
          Aes.AesGcm.encrypt('', '')
        }).throw(Error, {
        })
      })

      it('method `encrypt` should thrown Error when length of the `key` is invalid', () => {
        mockupIv.should.be.String().and.have.length(16)
        should(() => {
          Aes.AesGcm.encrypt(mockupIv, '')
        }).throw(Error, {
          message: 'Invalid key length',
          stack: /at Cipheriv\.createCipherBase/,
        })
      })

      it('method `encrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when type of the `plaintext` is invalid', () => {
        mockupIv.should.be.String().and.have.length(16)
        mockupKey.should.be.String().and.have.length(32)
        should(() => {
          Aes.AesGcm.encrypt(mockupIv, mockupKey)
        }).throw(TypeError, {
          code: 'ERR_INVALID_ARG_TYPE',
        })
      })

      it('method `encrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when the `aad` is number(1)', () => {
        mockupIv.should.be.String().and.have.length(16)
        mockupKey.should.be.String().and.have.length(32)
        should(() => {
          Aes.AesGcm.encrypt(mockupIv, mockupKey, '', 1)
        }).throw(TypeError, {
          code: 'ERR_INVALID_ARG_TYPE',
        })
      })

      it('method `encrypt` should returns a string while passed `plaintext` an empty string and equal to `GvpmmdtYwexXIPhySs9Tlg==`', () => {
        mockupIv.should.be.String().and.have.length(16)
        mockupKey.should.be.String().and.have.length(32)
        Aes.AesGcm.encrypt(mockupIv, mockupKey, '', '')
          .should.be.a.String()
          .and.equal('GvpmmdtYwexXIPhySs9Tlg==')
      })

      it('method `encrypt` should returns a string while passed `plaintext`=`hello`, `aad`=`world` and equal to `APoZlYpivU3HjbAiB4CvW1rAFr8J`', () => {
        mockupIv.should.be.String().and.have.length(16)
        mockupKey.should.be.String().and.have.length(32)
        Aes.AesGcm.encrypt(mockupIv, mockupKey, 'hello', 'world')
          .should.be.a.String()
          .and.equal('APoZlYpivU3HjbAiB4CvW1rAFr8J')
      })
    })

    describe('Aes::AesGcm::decrypt', () => {
      it('method `decrypt` should be static', () => {
        should(Aes.AesGcm.decrypt).be.a.Function()
        should((new Aes.AesGcm).decrypt).is.Undefined()
      })

      it('method `decrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when type of the `ciphertext` is invalid', () => {
        should(() => {
          Aes.AesGcm.decrypt()
        }).throw(TypeError, {
          code: 'ERR_INVALID_ARG_TYPE',
        })
      })

      it('method `decrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when type of the `key` is invalid', () => {
        should(() => {
          Aes.AesGcm.decrypt(undefined, undefined, '')
        }).throw(TypeError, {
          code: 'ERR_INVALID_ARG_TYPE',
        })
      })

      it('method `decrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when type of the `iv` is invalid', () => {
        should(() => {
          Aes.AesGcm.decrypt(undefined, '', '')
        }).throw(TypeError, {
          code: 'ERR_INVALID_ARG_TYPE',
        })
      })

      it('method `decrypt` should thrown Error when length of the `iv` is invalid', () => {
        should(() => {
          Aes.AesGcm.decrypt('', '', '')
        }).throw(Error, {
        })
      })

      it('method `decrypt` should thrown Error when length of the `key` is invalid', () => {
        mockupIv.should.be.String().and.have.length(16)
        should(() => {
          Aes.AesGcm.decrypt(mockupIv, '', '')
        }).throw(Error, {
          message: 'Invalid key length',
          stack: /at Decipheriv\.createCipherBase/,
        })
      })

      it('method `decrypt` should thrown Error when the `ciphertext` is empty string', () => {
        mockupIv.should.be.String().and.have.length(16)
        mockupKey.should.be.String().and.have.length(32)
        should(() => {
          Aes.AesGcm.decrypt(mockupIv, mockupKey, '')
        }).throw(Error, {
          code: 'ERR_CRYPTO_INVALID_AUTH_TAG',
          message: 'Invalid authentication tag length: 0',
        })
      })

      it('method `decrypt` should returns empty string when the `ciphertext` is `GvpmmdtYwexXIPhySs9Tlg==`', () => {
        mockupIv.should.be.String().and.have.length(16)
        mockupKey.should.be.String().and.have.length(32)
        Aes.AesGcm.decrypt(mockupIv, mockupKey, 'GvpmmdtYwexXIPhySs9Tlg==').should.be.String().and.empty().and.have.length(0)
      })

      it('method `decrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when the `aad` is number(1)', () => {
        mockupIv.should.be.String().and.have.length(16)
        mockupKey.should.be.String().and.have.length(32)
        should(() => {
          Aes.AesGcm.decrypt(mockupIv, mockupKey, 'GvpmmdtYwexXIPhySs9Tlg==', 1)
        }).throw(TypeError, {
          code: 'ERR_INVALID_ARG_TYPE',
        })
      })

      it('method `decrypt` should returns `hello` when the `ciphertext` is `APoZlYpivU3HjbAiB4CvW1rAFr8J` and `aad`=`world`', () => {
        mockupIv.should.be.String().and.have.length(16)
        mockupKey.should.be.String().and.have.length(32)
        Aes.AesGcm.decrypt(mockupIv, mockupKey, 'APoZlYpivU3HjbAiB4CvW1rAFr8J', 'world').should.be.String().and.equal('hello')
      })
    })
  })

  describe('Aes::AesEcb', () => {
    it('should be class AesEcb', () => {
      Aes.AesEcb.should.be.a.Function().and.have.property('name', 'AesEcb')
    })

    it('`new Aes.AesEcb` should be instanceof `Aes`', () => {
      (new Aes.AesEcb).should.be.instanceof(Aes)
    })

    describe('Aes::AesEcb::encrypt', () => {
      it('method `encrypt` should be static', () => {
        should(Aes.AesEcb.encrypt).be.a.Function()
        should((new Aes.AesEcb).encrypt).is.Undefined()
      })

      it('method `encrypt` should thrown a TypeError with `code:ERR_INVALID_ARG_TYPE` while none arguments passed in', () => {
        should(() => {
          Aes.AesEcb.encrypt()
        }).throw(TypeError, {
          code: 'ERR_INVALID_ARG_TYPE',
        })
      })

      it('method `encrypt` should thrown a TypeError with `code:ERR_INVALID_ARG_TYPE` while only an empty string passed in', () => {
        should(() => {
          Aes.AesEcb.encrypt('')
        }).throw(TypeError, {
          code: 'ERR_INVALID_ARG_TYPE',
        })
      })

      it('method `encrypt` should thrown an Error with `message: Invalid key length` while two empty string passed in', () => {
        should(() => {
          Aes.AesEcb.encrypt('', '')
        }).throw(Error, {
          message: 'Invalid key length',
        })
      })

      it('method `encrypt` should returns an empty string while empty string and a valid `key` passed in', () => {
        Aes.AesEcb.encrypt('', mockupKey).should.be.String().have.length(0)
      })
    })

    describe('Aes::AesEcb::decrypt', () => {
      it('method `decrypt` should be static', () => {
        should(Aes.AesEcb.decrypt).be.a.Function()
        should((new Aes.AesEcb).decrypt).is.Undefined()
      })

      it('method `decrypt` should thrown a TypeError with `code:ERR_INVALID_ARG_TYPE` while none arguments passed in', () => {
        should(() => {
          Aes.AesEcb.decrypt()
        }).throw(TypeError, {
          code: 'ERR_INVALID_ARG_TYPE',
        })
      })

      it('method `decrypt` should thrown a TypeError with `code:ERR_INVALID_ARG_TYPE` while only an empty string passed in', () => {
        should(() => {
          Aes.AesEcb.decrypt('')
        }).throw(TypeError, {
          code: 'ERR_INVALID_ARG_TYPE',
        })
      })

      it('method `decrypt` should thrown an Error with `message: Invalid key length` while two empty string passed in', () => {
        should(() => {
          Aes.AesEcb.decrypt('', '')
        }).throw(Error, {
          message: 'Invalid key length',
        })
      })

      it('method `decrypt` should thrown a RangeError with `code:ERR_INDEX_OUT_OF_RANGE` while empty string and a valid `key` passed in', () => {
        should(() => {
          Aes.AesEcb.decrypt('', mockupKey)
        }).throw(RangeError, {
          code: 'ERR_INDEX_OUT_OF_RANGE',
        })
      })
    })
  })
})
