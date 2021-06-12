const should = require('should');
const Crypto = require('crypto');
const Aes = require('../../lib/aes');

describe('lib/aes', () => {
  it('should be class Aes', () => {
    Aes.should.be.a.Function().and.have.property('name', 'Aes');
  });

  it('should have a subclass AesGcm', () => {
    Aes.AesGcm.should.be.a.Function().and.have.property('name', 'AesGcm');
  });

  it('should have a subclass AesEcb', () => {
    Aes.AesEcb.should.be.a.Function().and.have.property('name', 'AesEcb');
  });

  describe('Aes::hex', () => {
    it('property `hex` should be static', () => {
      should(Aes.hex).be.a.String();
      should((new Aes()).hex).is.Undefined();
    });

    it('property `hex` should have a fixed value `hex`', () => {
      should(Aes.hex).be.a.String().and.equal('hex');
    });
  });

  describe('Aes::utf8', () => {
    it('property `utf8` should be static', () => {
      should(Aes.utf8).be.a.String();
      should((new Aes()).utf8).is.Undefined();
    });

    it('property `utf8` should have a fixed value `utf8`', () => {
      should(Aes.utf8).be.a.String().and.equal('utf8');
    });
  });

  describe('Aes::base64', () => {
    it('property `base64` should be static', () => {
      should(Aes.base64).be.a.String();
      should((new Aes()).base64).is.Undefined();
    });

    it('property `base64` should have a fixed value `base64`', () => {
      should(Aes.base64).be.a.String().and.equal('base64');
    });
  });

  describe('Aes::BLOCK_SIZE', () => {
    it('property `BLOCK_SIZE` should be static', () => {
      should(Aes.BLOCK_SIZE).be.a.Number();
      should((new Aes()).BLOCK_SIZE).is.Undefined();
    });

    it('property `BLOCK_SIZE` should have a fixed value 16', () => {
      should(Aes.BLOCK_SIZE).be.a.Number().and.equal(16);
    });
  });

  describe('Aes::ALGO_AES_256_GCM', () => {
    it('property `ALGO_AES_256_GCM` should be static', () => {
      should(Aes.ALGO_AES_256_GCM).be.a.String();
      should((new Aes()).ALGO_AES_256_GCM).is.Undefined();
    });

    it('property `ALGO_AES_256_GCM` should have a fixed value `aes-256-gcm`', () => {
      should(Aes.ALGO_AES_256_GCM).be.a.String().and.equal('aes-256-gcm');
    });
  });

  describe('Aes::ALGO_AES_256_ECB', () => {
    it('property `ALGO_AES_256_ECB` should be static', () => {
      should(Aes.ALGO_AES_256_ECB).be.a.String();
      should((new Aes()).ALGO_AES_256_ECB).is.Undefined();
    });

    it('property `ALGO_AES_256_ECB` should have a fixed value `aes-256-ecb`', () => {
      should(Aes.ALGO_AES_256_ECB).be.a.String().and.equal('aes-256-ecb');
    });
  });

  describe('Aes::pkcs7', () => {
    it('property `pkcs7` should be static', () => {
      should(Aes.pkcs7).be.an.Object();
      should((new Aes()).pkcs7).is.Undefined();
    });

    it('property `pkcs7` should have `padding` method', () => {
      should(Aes.pkcs7.padding).be.a.Function();
    });

    it('property `pkcs7` should have `unpadding` method', () => {
      should(Aes.pkcs7.unpadding).be.a.Function();
    });

    describe('Aes::pkcs7::padding', () => {
      it('method `padding` should thrown a `TypeError` with `code:ERR_INVALID_ARG_TYPE` while none arguments passed in', () => {
        should(() => {
          Aes.pkcs7.padding();
        }).throw(TypeError, {
          code: 'ERR_INVALID_ARG_TYPE',
        });
      });

      it('method `padding` should thrown a `TypeError` with `code:ERR_INVALID_ARG_TYPE` while only a number passed in', () => {
        should(() => {
          Aes.pkcs7.padding(1);
        }).throw(TypeError, {
          code: 'ERR_INVALID_ARG_TYPE',
        });
      });

      it('method `padding` should returns an empty buffer while only an empty string passed in', () => {
        Aes.pkcs7.padding('').should.be.instanceof(Buffer).and.have.length(0);
      });

      it('method `padding` with empty string and boolean `false` should returns a buffer which\'s length(16), and equal to `Aes.BLOCK_SIZE`', () => {
        Aes.pkcs7.padding('', false).should.be.instanceof(Buffer).and.have.length(Aes.BLOCK_SIZE);
      });
    });

    describe('Aes::pkcs7::unpadding', () => {
      it('method `unpadding` should thrown a `TypeError` with `code:ERR_INVALID_ARG_TYPE` while none arguments passed in', () => {
        should(() => {
          Aes.pkcs7.unpadding();
        }).throw(TypeError, {
          code: 'ERR_INVALID_ARG_TYPE',
        });
      });

      it('method `unpadding` should thrown a `RangeError` with Node10(`code:ERR_INDEX_OUT_OF_RANGE`) or above(`code:ERR_OUT_OF_RANGE`) while an empty string passed in', () => {
        should(() => {
          Aes.pkcs7.unpadding('');
        }).throw(RangeError, {
          code: /ERR_INDEX_OUT_OF_RANGE|ERR_OUT_OF_RANGE/,
        });
      });

      it('method `unpadding` should returns a buffer which\'s length(0) while `Aes.pkcs7.padding("", false)` passed in', () => {
        Aes.pkcs7.unpadding(Aes.pkcs7.padding('', false)).should.be.instanceof(Buffer).and.have.length(0);
      });

      it('method `unpadding` should returns a buffer which\'s length(1) while `Aes.pkcs7.padding("1")` passed in', () => {
        Aes.pkcs7.unpadding(Aes.pkcs7.padding('1')).should.be.instanceof(Buffer).and.have.length(1);
      });
    });
  });

  const mockupIv = '0123456789abcdef';
  const mockupKey = '0123456789abcdef0123456789abcdef';
  describe('Aes::encrypt', () => {
    it('method `encrypt` should be static', () => {
      should(Aes.encrypt).be.a.Function();
      should((new Aes()).encrypt).is.Undefined();
    });

    it('method `encrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when type of the `key` is invalid', () => {
      should(() => {
        Aes.encrypt();
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      });
    });

    it('method `encrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when type of the `iv` is invalid', () => {
      should(() => {
        Aes.encrypt(undefined, '');
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      });
    });

    it('method `encrypt` should thrown Error when length of the `iv` is invalid', () => {
      should(() => {
        Aes.encrypt('', '');
      }).throw(Error);
    });

    it('method `encrypt` should thrown Error when length of the `key` is invalid', () => {
      mockupIv.should.be.String().and.have.length(16);
      should(() => {
        Aes.encrypt(mockupIv, '');
      }).throw(Error, {
        message: 'Invalid key length',
        stack: /at Cipheriv\.createCipherBase/,
      });
    });

    it('method `encrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when type of the `plaintext` is invalid', () => {
      mockupIv.should.be.String().and.have.length(16);
      mockupKey.should.be.String().and.have.length(32);
      should(() => {
        Aes.encrypt(mockupIv, mockupKey);
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      });
    });

    it('method `encrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when the `aad` is number(1)', () => {
      mockupIv.should.be.String().and.have.length(16);
      mockupKey.should.be.String().and.have.length(32);
      should(() => {
        Aes.encrypt(mockupIv, mockupKey, '', 1);
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      });
    });

    it('method `encrypt` should returns a string while passed `plaintext` an empty string and equal to `GvpmmdtYwexXIPhySs9Tlg==`', () => {
      mockupIv.should.be.String().and.have.length(16);
      mockupKey.should.be.String().and.have.length(32);
      Aes.encrypt(mockupIv, mockupKey, '', '')
        .should.be.a.String()
        .and.equal('GvpmmdtYwexXIPhySs9Tlg==');
    });

    it('method `encrypt` should returns a string while passed `plaintext`=`hello`, `aad`=`world` and equal to `APoZlYpivU3HjbAiB4CvW1rAFr8J`', () => {
      mockupIv.should.be.String().and.have.length(16);
      mockupKey.should.be.String().and.have.length(32);
      Aes.encrypt(mockupIv, mockupKey, 'hello', 'world')
        .should.be.a.String()
        .and.equal('APoZlYpivU3HjbAiB4CvW1rAFr8J');
    });
  });

  describe('Aes::decrypt', () => {
    it('method `decrypt` should be static', () => {
      should(Aes.decrypt).be.a.Function();
      should((new Aes()).decrypt).is.Undefined();
    });

    it('method `decrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when type of the `ciphertext` is invalid', () => {
      should(() => {
        Aes.decrypt();
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      });
    });

    it('method `decrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when type of the `key` is invalid', () => {
      should(() => {
        Aes.decrypt(undefined, undefined, '');
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      });
    });

    it('method `decrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when type of the `iv` is invalid', () => {
      should(() => {
        Aes.decrypt(undefined, '', '');
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      });
    });

    it('method `decrypt` should thrown Error when length of the `iv` is invalid', () => {
      should(() => {
        Aes.decrypt('', '', '');
      }).throw(Error, {
      });
    });

    it('method `decrypt` should thrown Error when length of the `key` is invalid', () => {
      mockupIv.should.be.String().and.have.length(16);
      should(() => {
        Aes.decrypt(mockupIv, '', '');
      }).throw(Error, {
        message: 'Invalid key length',
        stack: /at Decipheriv\.createCipherBase/,
      });
    });

    it('method `decrypt` should thrown Error when the `ciphertext` is empty string', () => {
      mockupIv.should.be.String().and.have.length(16);
      mockupKey.should.be.String().and.have.length(32);
      should(() => {
        Aes.decrypt(mockupIv, mockupKey, '');
      }).throw(Error, {
        code: 'ERR_CRYPTO_INVALID_AUTH_TAG',
        message: 'Invalid authentication tag length: 0',
      });
    });

    it('method `decrypt` should returns empty string when the `ciphertext` is `GvpmmdtYwexXIPhySs9Tlg==`', () => {
      mockupIv.should.be.String().and.have.length(16);
      mockupKey.should.be.String().and.have.length(32);
      Aes.decrypt(mockupIv, mockupKey, 'GvpmmdtYwexXIPhySs9Tlg==').should.be.String().and.empty().and.have.length(0);
    });

    it('method `decrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when the `aad` is number(1)', () => {
      mockupIv.should.be.String().and.have.length(16);
      mockupKey.should.be.String().and.have.length(32);
      should(() => {
        Aes.decrypt(mockupIv, mockupKey, 'GvpmmdtYwexXIPhySs9Tlg==', 1);
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      });
    });

    it('method `decrypt` should returns `hello` when the `ciphertext` is `APoZlYpivU3HjbAiB4CvW1rAFr8J` and `aad`=`world`', () => {
      mockupIv.should.be.String().and.have.length(16);
      mockupKey.should.be.String().and.have.length(32);
      Aes.decrypt(mockupIv, mockupKey, 'APoZlYpivU3HjbAiB4CvW1rAFr8J', 'world').should.be.String().and.equal('hello');
    });
  });

  describe('Aes::AesGcm', () => {
    it('should be class AesGcm', () => {
      Aes.AesGcm.should.be.a.Function().and.have.property('name', 'AesGcm');
    });

    it('`new Aes.AesGcm` should be instanceof `Aes`', () => {
      (new Aes.AesGcm()).should.be.instanceof(Aes);
    });

    describe('Aes::AesGcm::encrypt', () => {
      it('method `encrypt` should be static', () => {
        should(Aes.AesGcm.encrypt).be.a.Function();
        should((new Aes.AesGcm()).encrypt).is.Undefined();
      });

      it('method `encrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when type of the `key` is invalid', () => {
        should(() => {
          Aes.AesGcm.encrypt();
        }).throw(TypeError, {
          code: 'ERR_INVALID_ARG_TYPE',
        });
      });

      it('method `encrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when type of the `iv` is invalid', () => {
        should(() => {
          Aes.AesGcm.encrypt(undefined, '');
        }).throw(TypeError, {
          code: 'ERR_INVALID_ARG_TYPE',
        });
      });

      it('method `encrypt` should thrown Error when length of the `iv` is invalid', () => {
        should(() => {
          Aes.AesGcm.encrypt('', '');
        }).throw(Error, {
        });
      });

      it('method `encrypt` should thrown Error when length of the `key` is invalid', () => {
        mockupIv.should.be.String().and.have.length(16);
        should(() => {
          Aes.AesGcm.encrypt(mockupIv, '');
        }).throw(Error, {
          message: 'Invalid key length',
          stack: /at Cipheriv\.createCipherBase/,
        });
      });

      it('method `encrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when type of the `plaintext` is invalid', () => {
        mockupIv.should.be.String().and.have.length(16);
        mockupKey.should.be.String().and.have.length(32);
        should(() => {
          Aes.AesGcm.encrypt(mockupIv, mockupKey);
        }).throw(TypeError, {
          code: 'ERR_INVALID_ARG_TYPE',
        });
      });

      it('method `encrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when the `aad` is number(1)', () => {
        mockupIv.should.be.String().and.have.length(16);
        mockupKey.should.be.String().and.have.length(32);
        should(() => {
          Aes.AesGcm.encrypt(mockupIv, mockupKey, '', 1);
        }).throw(TypeError, {
          code: 'ERR_INVALID_ARG_TYPE',
        });
      });

      it('method `encrypt` should returns a string while passed `plaintext` an empty string and equal to `GvpmmdtYwexXIPhySs9Tlg==`', () => {
        mockupIv.should.be.String().and.have.length(16);
        mockupKey.should.be.String().and.have.length(32);
        Aes.AesGcm.encrypt(mockupIv, mockupKey, '', '')
          .should.be.a.String()
          .and.equal('GvpmmdtYwexXIPhySs9Tlg==');
      });

      it('method `encrypt` should returns a string while passed `plaintext`=`hello`, `aad`=`world` and equal to `APoZlYpivU3HjbAiB4CvW1rAFr8J`', () => {
        mockupIv.should.be.String().and.have.length(16);
        mockupKey.should.be.String().and.have.length(32);
        Aes.AesGcm.encrypt(mockupIv, mockupKey, 'hello', 'world')
          .should.be.a.String()
          .and.equal('APoZlYpivU3HjbAiB4CvW1rAFr8J');
      });
    });

    describe('Aes::AesGcm::decrypt', () => {
      it('method `decrypt` should be static', () => {
        should(Aes.AesGcm.decrypt).be.a.Function();
        should((new Aes.AesGcm()).decrypt).is.Undefined();
      });

      it('method `decrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when type of the `ciphertext` is invalid', () => {
        should(() => {
          Aes.AesGcm.decrypt();
        }).throw(TypeError, {
          code: 'ERR_INVALID_ARG_TYPE',
        });
      });

      it('method `decrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when type of the `key` is invalid', () => {
        should(() => {
          Aes.AesGcm.decrypt(undefined, undefined, '');
        }).throw(TypeError, {
          code: 'ERR_INVALID_ARG_TYPE',
        });
      });

      it('method `decrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when type of the `iv` is invalid', () => {
        should(() => {
          Aes.AesGcm.decrypt(undefined, '', '');
        }).throw(TypeError, {
          code: 'ERR_INVALID_ARG_TYPE',
        });
      });

      it('method `decrypt` should thrown Error when length of the `iv` is invalid', () => {
        should(() => {
          Aes.AesGcm.decrypt('', '', '');
        }).throw(Error, {
        });
      });

      it('method `decrypt` should thrown Error when length of the `key` is invalid', () => {
        mockupIv.should.be.String().and.have.length(16);
        should(() => {
          Aes.AesGcm.decrypt(mockupIv, '', '');
        }).throw(Error, {
          message: 'Invalid key length',
          stack: /at Decipheriv\.createCipherBase/,
        });
      });

      it('method `decrypt` should thrown Error when the `ciphertext` is empty string', () => {
        mockupIv.should.be.String().and.have.length(16);
        mockupKey.should.be.String().and.have.length(32);
        should(() => {
          Aes.AesGcm.decrypt(mockupIv, mockupKey, '');
        }).throw(Error, {
          code: 'ERR_CRYPTO_INVALID_AUTH_TAG',
          message: 'Invalid authentication tag length: 0',
        });
      });

      it('method `decrypt` should returns empty string when the `ciphertext` is `GvpmmdtYwexXIPhySs9Tlg==`', () => {
        mockupIv.should.be.String().and.have.length(16);
        mockupKey.should.be.String().and.have.length(32);
        Aes.AesGcm.decrypt(mockupIv, mockupKey, 'GvpmmdtYwexXIPhySs9Tlg==').should.be.String().and.empty().and.have.length(0);
      });

      it('method `decrypt` should thrown TypeError with `code:ERR_INVALID_ARG_TYPE` when the `aad` is number(1)', () => {
        mockupIv.should.be.String().and.have.length(16);
        mockupKey.should.be.String().and.have.length(32);
        should(() => {
          Aes.AesGcm.decrypt(mockupIv, mockupKey, 'GvpmmdtYwexXIPhySs9Tlg==', 1);
        }).throw(TypeError, {
          code: 'ERR_INVALID_ARG_TYPE',
        });
      });

      it('method `decrypt` should returns `hello` when the `ciphertext` is `APoZlYpivU3HjbAiB4CvW1rAFr8J` and `aad`=`world`', () => {
        mockupIv.should.be.String().and.have.length(16);
        mockupKey.should.be.String().and.have.length(32);
        Aes.AesGcm.decrypt(mockupIv, mockupKey, 'APoZlYpivU3HjbAiB4CvW1rAFr8J', 'world').should.be.String().and.equal('hello');
      });
    });
  });

  describe('Aes::AesEcb', () => {
    it('should be class AesEcb', () => {
      Aes.AesEcb.should.be.a.Function().and.have.property('name', 'AesEcb');
    });

    it('`new Aes.AesEcb` should be instanceof `Aes`', () => {
      (new Aes.AesEcb()).should.be.instanceof(Aes);
    });

    describe('Aes::AesEcb::encrypt', () => {
      it('method `encrypt` should be static', () => {
        should(Aes.AesEcb.encrypt).be.a.Function();
        should((new Aes.AesEcb()).encrypt).is.Undefined();
      });

      it('method `encrypt` should thrown a TypeError with `code:ERR_INVALID_ARG_TYPE` while none arguments passed in', () => {
        should(() => {
          Aes.AesEcb.encrypt();
        }).throw(TypeError, {
          code: 'ERR_INVALID_ARG_TYPE',
        });
      });

      it('method `encrypt` should thrown a TypeError with `code:ERR_INVALID_ARG_TYPE` while only an empty string passed in', () => {
        should(() => {
          Aes.AesEcb.encrypt('');
        }).throw(TypeError, {
          code: 'ERR_INVALID_ARG_TYPE',
        });
      });

      it('method `encrypt` should thrown an Error with `message: Invalid key length` while two empty string passed in', () => {
        should(() => {
          Aes.AesEcb.encrypt('', '');
        }).throw(Error, {
          message: 'Invalid key length',
        });
      });

      it('method `encrypt` should returns an empty string while empty string and a valid `key` passed in', () => {
        Aes.AesEcb.encrypt('', mockupKey).should.be.String().have.length(0);
      });
    });

    describe('Aes::AesEcb::decrypt', () => {
      it('method `decrypt` should be static', () => {
        should(Aes.AesEcb.decrypt).be.a.Function();
        should((new Aes.AesEcb()).decrypt).is.Undefined();
      });

      it('method `decrypt` should thrown a TypeError with `code:ERR_INVALID_ARG_TYPE` while none arguments passed in', () => {
        should(() => {
          Aes.AesEcb.decrypt();
        }).throw(TypeError, {
          code: 'ERR_INVALID_ARG_TYPE',
        });
      });

      it('method `decrypt` should thrown a TypeError with `code:ERR_INVALID_ARG_TYPE` while only an empty string passed in', () => {
        should(() => {
          Aes.AesEcb.decrypt('');
        }).throw(TypeError, {
          code: 'ERR_INVALID_ARG_TYPE',
        });
      });

      it('method `decrypt` should thrown an Error with `message: Invalid key length` while two empty string passed in', () => {
        should(() => {
          Aes.AesEcb.decrypt('', '');
        }).throw(Error, {
          message: 'Invalid key length',
        });
      });

      it('method `decrypt` should be thrown a RangeError(`code:ERR_INDEX_OUT_OF_RANGE`=10 or `code:ERR_OUT_OF_RANGE`>10) while empty string and a valid `key` passed in', () => {
        should(() => {
          Aes.AesEcb.decrypt('', mockupKey);
        }).throw(RangeError, {
          code: /ERR_INDEX_OUT_OF_RANGE|ERR_OUT_OF_RANGE/,
        });
      });
    });
  });

  describe('Aes::AesCbc', () => {
    it('should be class AesCbc', () => {
      Aes.AesCbc.should.be.a.Function().and.have.property('name', 'AesCbc');
    });

    it('`new Aes.AesCbc` should be instanceof `Aes`', () => {
      (new Aes.AesCbc()).should.be.instanceof(Aes);
    });

    describe('Aes::AesCbc::encrypt', () => {
      it('method `encrypt` should be static', () => {
        should(Aes.AesCbc.encrypt).be.a.Function();
        should((new Aes.AesCbc()).encrypt).is.Undefined();
      });

      it('method `encrypt` should thrown a TypeError while none arguments passed in', () => {
        should(() => {
          Aes.AesCbc.encrypt();
        }).throw(TypeError);
      });

      it('method `encrypt` should thrown a TypeError while only an empty string passed in', () => {
        should(() => {
          Aes.AesCbc.encrypt('');
        }).throw(TypeError);
      });

      it('method `encrypt` should thrown a TypeError while an undefined vi passed in', () => {
        should(() => {
          Aes.AesCbc.encrypt('', '', undefined);
        }).throw(TypeError);
      });

      it('method `encrypt` should thrown a Error while an undefined vi passed in', () => {
        should(() => {
          Aes.AesCbc.encrypt('', '', null);
        }).throw(Error);
      });

      it('method `encrypt` should thrown an Error while two empty string passed in', () => {
        should(() => {
          Aes.AesCbc.encrypt('', '');
        }).throw(Error);
      });

      it('method `encrypt` should thrown an Error while two empty string passed in', () => {
        should(() => {
          Aes.AesCbc.encrypt('', '', '');
        }).throw(Error);
      });

      it('method `encrypt` should thrown an Error while two empty string passed in', () => {
        should(() => {
          Aes.AesCbc.encrypt('', '', Crypto.randomBytes(16));
        }).throw(Error);
      });

      it('The encoding string should be equal to the decoding string', () => {
        const key = Buffer.from('tiihtNczf5v6AKRyjwEUhQ==', 'base64');
        const iv = Buffer.from('r7BXXKkLb8qrSNn05n0qiA==', 'base64');
        const encryptData = Aes.AesCbc.encrypt('', key, iv);
        encryptData.should.be.String().eql('qJ3AQxeKzsJ9mDC9BRN4YQ==');
        Aes.AesCbc.decrypt(encryptData, key, iv).should.be.String().eql('');
      });

      it('The encoding string should be equal to the decoding string', () => {
        const key = Crypto.randomBytes(16);
        const iv = Crypto.randomBytes(16);
        const encryptData = Aes.AesCbc.encrypt('0123456789', key, iv);
        Aes.AesCbc.decrypt(encryptData, key, iv).should.be.String().eql('0123456789');
      });
    });

    describe('Aes::AesCbc::decrypt', () => {
      it('method `decrypt` should be static', () => {
        should(Aes.AesCbc.decrypt).be.a.Function();
        should((new Aes.AesCbc()).decrypt).is.Undefined();
      });

      it('method `decrypt` should thrown a TypeError while none arguments passed in', () => {
        should(() => {
          Aes.AesCbc.decrypt();
        }).throw(TypeError);
      });

      it('method `decrypt` should thrown a TypeError while only an empty string passed in', () => {
        should(() => {
          Aes.AesCbc.decrypt('');
        }).throw(TypeError);
      });

      it('method `decrypt` should thrown an Error while two empty string passed in', () => {
        should(() => {
          Aes.AesCbc.decrypt('', '');
        }).throw(TypeError);
      });

      it('method `decrypt` should thrown an Error while two empty string passed in', () => {
        should(() => {
          Aes.AesCbc.decrypt('', '', '');
        }).throw(Error);
      });

      it('method `decrypt` should thrown an Error while two empty string passed in', () => {
        should(() => {
          Aes.AesCbc.decrypt('', '', Crypto.randomBytes(16));
        }).throw(Error);
      });

      it('wx.getUserInfo example', () => {
        // AES算法aes-128-cbc使用示例
        // 例子来源：https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/signature.html#%E5%8A%A0%E5%AF%86%E6%95%B0%E6%8D%AE%E8%A7%A3%E5%AF%86%E7%AE%97%E6%B3%95
        // 初始向量
        const iv = 'r7BXXKkLb8qrSNn05n0qiA==';
        // 秘钥key
        const key = 'tiihtNczf5v6AKRyjwEUhQ==';
        // 加解密的数据
        const data = '{"openId":"oGZUI0egBJY1zhBYw2KhdUfwVJJE","nickName":"Band","gender":1,"language":"zh_CN","city":"Guangzhou","province":"Guangdong","country":"CN",'
          + '"avatarUrl":"http://wx.qlogo.cn/mmopen/vi_32/aSKcBBPpibyKNicHNTMM0qJVh8Kjgiak2AHWr8MHM4WgMEm7GFhsf8OYrySdbvAMvTsw3mo8ibKicsnfN5pRjl1p8HQ/0",'
          + '"unionId":"ocMvos6NjeKLIBqg5Mr9QjxrP1FA","watermark":{"timestamp":1477314187,"appid":"wx4f4bc4dec97d474b"}}';
        const appid = 'wx4f4bc4dec97d474b'; // 加密数据中的appid
        // 加密后的数据（校验用）
        const encryptedData = 'CiyLU1Aw2KjvrjMdj8YKliAjtP4gsMZMQmRzooG2xrDcvSnxIMXFufNstNGTyaGS9uT5geRa0W4oTOb1WT7fJlAC+oNPdbB+3hVbJSRgv+4lGOETKUQz6OYStslQ142dNCuabNPGB'
          + 'zlooOmB231qMM85d2/fV6ChevvXvQP8Hkue1poOFtnEtpyxVLW1zAo6/1Xx1COxFvrc2d7UL/lmHInNlxuacJXwu0fjpXfz/YqYzBIBzD6WUfTIF9GRHpOn/Hz7saL8xz+W//FRAUid1OksQaQ'
          + 'x4CMs8LOddcQhULW4ucetDf96JcR3g0gfRK4PC7E/r7Z6xNrXd2UIeorGj5Ef7b1pJAYB6Y5anaHqZ9J6nKEBvB4DnNLIVWSgARns/8wR2SiRS7MNACwTyrGvt9ts8p12PKFdlqYTopNHR1Vf7X'
          + 'jfhQlVsAJdNiKdYmYVoKlaRv85IfVunYzO0IKXsyl7JCUjCpoG20f0a04COwfneQAGGwd5oa+T8yO5hzuyDb/XcxxmK01EpqOyuxINew==';

        // 1、加密
        const encryptData = Aes.AesCbc.encrypt(data, Buffer.from(key, 'base64'), Buffer.from(iv, 'base64'));
        encryptData.should.be.String().eql(encryptedData);
        // 2、解密
        const decryptData = Aes.AesCbc.decrypt(encryptedData, Buffer.from(key, 'base64'), Buffer.from(iv, 'base64'));
        // 解密后的数据为
        /*
        {
          "openId": "oGZUI0egBJY1zhBYw2KhdUfwVJJE",
          "nickName": "Band",
          "gender": 1,
          "language": "zh_CN",
          "city": "Guangzhou",
          "province": "Guangdong",
          "country": "CN",
          "avatarUrl": "http://wx.qlogo.cn/mmopen/vi_32/aSKcBBPpibyKNicHNTMM0qJVh8Kjgiak2AHWr8MHM4WgMEm7GFhsf8OYrySdbvAMvTsw3mo8ibKicsnfN5pRjl1p8HQ/0",
          "unionId": "ocMvos6NjeKLIBqg5Mr9QjxrP1FA",
          "watermark": {
            "timestamp": 1477314187,
            "appid": "wx4f4bc4dec97d474b"
          }
        }
        */
        decryptData.should.be.String().eql(data);
        JSON.parse(decryptData).watermark.appid.should.be.String().eql(appid);
      });
    });
  });
});
