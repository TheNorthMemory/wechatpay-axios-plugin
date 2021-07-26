const should = require('should');
const Hash = require('../../lib/hash');

describe('lib/hash', () => {
  it('should be class Hash', () => {
    Hash.should.be.a.Function().and.have.property('name', 'Hash');
  });

  describe('Hash::md5', () => {
    it('method `md5` should be static', () => {
      should(Hash.md5).be.a.Function();
      should((new Hash()).md5).is.Undefined();
    });

    it('method `md5` should thrown TypeError while none-arguments passed', () => {
      should(() => {
        Hash.md5();
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      });
    });

    it('method `md5` should accept empty string and returns a 32 length string and equal to `d41d8cd98f00b204e9800998ecf8427e`', () => {
      Hash.md5('').should.be.String().and.have.length(32);
      Hash.md5('').should.be.String().and.equal('d41d8cd98f00b204e9800998ecf8427e');
    });
  });

  describe('Hash::hmac', () => {
    it('method `hmac` should be static', () => {
      should(Hash.hmac).be.a.Function();
      should((new Hash()).hmac).is.Undefined();
    });

    it('method `hmac` should thrown TypeError while none-arguments passed', () => {
      should(() => {
        Hash.hmac();
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      });
    });

    it('method `hmac(1, 2)` should returns a 64 length string', () => {
      Hash.hmac('1', '2').should.be.String().and.have.length(64);
    });

    it('method `hmac(1, 2, SHA384)` should returns a 96 length string', () => {
      Hash.hmac('1', '2', 'SHA384').should.be.String().and.have.length(96);
    });

    it('method `hmac(1, 2, SHA1)` should returns a 40 length string', () => {
      Hash.hmac('1', '2', 'SHA1').should.be.String().and.have.length(40);
    });

    it('method `hmac(1, 2, MD5)` should returns a 32 length string', () => {
      Hash.hmac('1', '2', 'MD5').should.be.String().and.have.length(32);
    });
  });

  describe('Hash::hmacSha256', () => {
    it('method `hmacSha256` should be static', () => {
      should(Hash.hmacSha256).be.a.Function();
      should((new Hash()).hmacSha256).is.Undefined();
    });

    it('method `hmacSha256` should thrown TypeError while none-arguments passed', () => {
      should(() => {
        Hash.hmacSha256();
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      });
    });

    it('method `hmacSha256` should returns a 64 length string', () => {
      Hash.hmacSha256('1', '2').should.be.String().and.have.length(64);
    });
  });

  describe('Hash::equals', () => {
    it('method `equals` should be static', () => {
      should(Hash.equals).be.a.Function();
      should((new Hash()).equals).is.Undefined();
    });

    it('method `equals` should thrown TypeError while none-arguments passed', () => {
      should(() => {
        Hash.equals();
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      });
    });

    it('method `equals("")` should returns `false` while only the first argument(empty string) passed', () => {
      Hash.equals('').should.be.Boolean().and.equals(false);
    });

    it('method `equals("", null)` should returns `false` while the second argument(null) passed', () => {
      Hash.equals('', null).should.be.Boolean().and.equals(false);
    });

    it('method `equals("", false)` should thrown TypeError while the second argument(boolean) passed', () => {
      should(() => {
        Hash.equals('', false);
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      });
    });

    it('method `equals("", "")` should returns `false` while two arguments(empty string) passed', () => {
      Hash.equals('', '').should.be.Boolean().and.equals(true);
    });
  });

  describe('Hash::sign', () => {
    it('method `sign` should be static', () => {
      should(Hash.sign).be.a.Function();
      should((new Hash()).sign).is.Undefined();
    });

    it('method `sign` should thrown TypeError while none-arguments passed', () => {
      should(() => {
        Hash.sign();
      }).throw(TypeError);
    });

    it('method `sign(MD5, {}, 2)` should returns a 32 length UPPER string', () => {
      Hash.sign('MD5', {}, '2').should.be.String().and.match(/[0-9A-Z]{32}/);
    });

    it('method `sign(HMAC-SHA256, {}, 2)` should returns a 64 length UPPER string', () => {
      Hash.sign('HMAC-SHA256', {}, '2').should.be.String().and.match(/[0-9A-Z]{64}/);
    });
  });
});
