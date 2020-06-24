const should = require('should')
const aes = require('../../lib/aes')

describe('lib/aes', () => {
  it('should be class Aes', () => {
    aes.should.be.a.Function().and.have.property('name', 'Aes')
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
        message: 'The "key" argument must be of type string or an instance of Buffer, TypedArray, DataView, or KeyObject. Received undefined',
        stack: /at prepareSecretKey \(internal\/crypto\/keys\.js/,
      })
    })

    it('method `encrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when type of the `iv` is invalid', () => {
      should(() => {
        aes.encrypt(undefined, '')
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
        message: 'The "iv" argument must be of type string or an instance of Buffer, TypedArray, or DataView. Received undefined',
        stack: /at Cipheriv\.createCipherWithIV/,
      })
    })

    it('method `encrypt` should thrown Error when length of the `iv` is invalid', () => {
      should(() => {
        aes.encrypt('', '')
      }).throw(Error, {
        message: 'Invalid IV length',
        stack: /at Cipheriv\.createCipherBase/,
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
        message: 'The "data" argument must be of type string or an instance of Buffer, TypedArray, or DataView. Received undefined',
        stack: /at Cipheriv\.update/,
      })
    })

    it('method `encrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when the `aad` is number(1)', () => {
      mockupIv.should.be.String().and.have.length(16)
      mockupKey.should.be.String().and.have.length(32)
      should(() => {
        aes.encrypt(mockupIv, mockupKey, '', 1)
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
        message: 'The first argument must be of type string or an instance of Buffer, ArrayBuffer, or Array or an Array-like Object. Received type number (1)',
        stack: /at Function\.from \(buffer\.js/,
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
        message: 'The first argument must be of type string or an instance of Buffer, ArrayBuffer, or Array or an Array-like Object. Received undefined',
        stack: /at Function\.from \(buffer\.js/,
      })
    })

    it('method `decrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when type of the `key` is invalid', () => {
      should(() => {
        aes.decrypt(undefined, undefined, '')
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
        message: 'The "key" argument must be of type string or an instance of Buffer, TypedArray, DataView, or KeyObject. Received undefined',
        stack: /at prepareSecretKey \(internal\/crypto\/keys\.js/,
      })
    })

    it('method `decrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when type of the `iv` is invalid', () => {
      should(() => {
        aes.decrypt(undefined, '', '')
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
        message: 'The "iv" argument must be of type string or an instance of Buffer, TypedArray, or DataView. Received undefined',
        stack: /at Decipheriv\.createCipherWithIV/,
      })
    })

    it('method `decrypt` should thrown Error when length of the `iv` is invalid', () => {
      should(() => {
        aes.decrypt('', '', '')
      }).throw(Error, {
        message: 'Invalid IV length',
        stack: /at Decipheriv\.createCipherBase/,
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
        message: 'Invalid authentication tag length: 0',
        stack: /at Decipheriv\.setAuthTag/,
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
        message: 'The first argument must be of type string or an instance of Buffer, ArrayBuffer, or Array or an Array-like Object. Received type number (1)',
        stack: /at Function\.from \(buffer\.js/,
      })
    })

    it('method `decrypt` should returns `hello` when the `ciphertext` is `APoZlYpivU3HjbAiB4CvW1rAFr8J` and `aad`=`world`', () => {
      mockupIv.should.be.String().and.have.length(16)
      mockupKey.should.be.String().and.have.length(32)
      aes.decrypt(mockupIv, mockupKey, 'APoZlYpivU3HjbAiB4CvW1rAFr8J', 'world').should.be.String().and.equal('hello')
    })
  })
})
