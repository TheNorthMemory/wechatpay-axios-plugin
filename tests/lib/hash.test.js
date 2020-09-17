const should = require('should')
const hash = require('../../lib/hash')

describe('lib/hash', () => {
  it('should be class Hash', () => {
    hash.should.be.a.Function().and.have.property('name', 'Hash')
  })

  describe('Hash::md5', () => {
    it('method `md5` should be static', () => {
      should(hash.md5).be.a.Function()
      should((new hash).md5).is.Undefined()
    })

    it('method `md5` should thrown TypeError while none-arguments passed', () => {
      should(() => {
        hash.md5()
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      })
    })

    it('method `md5` should accept empty string and returns a 32 length string and equal to `d41d8cd98f00b204e9800998ecf8427e`', () => {
      hash.md5('').should.be.String().and.have.length(32)
      hash.md5('').should.be.String().and.equal('d41d8cd98f00b204e9800998ecf8427e')
    })
  })

  describe('Hash::hmacSha256', () => {
    it('method `hmacSha256` should be static', () => {
      should(hash.hmacSha256).be.a.Function()
      should((new hash).hmacSha256).is.Undefined()
    })

    it('method `hmacSha256` should thrown TypeError while none-arguments passed', () => {
      should(() => {
        hash.hmacSha256()
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      })
    })

    it('method `hmacSha256` should returns a 64 length string', () => {
      hash.hmacSha256('1', '2').should.be.String().and.have.length(64)
    })
  })

  describe('Hash::sign', () => {
    it('method `sign` should be static', () => {
      should(hash.sign).be.a.Function()
      should((new hash).sign).is.Undefined()
    })

    it('method `sign` should thrown TypeError while none-arguments passed', () => {
      should(() => {
        hash.sign()
      }).throw(TypeError)
    })

    it('method `sign(MD5, {}, 2)` should returns a 32 length UPPER string', () => {
      hash.sign('MD5', {}, '2').should.be.String().and.match(/[0-9A-Z]{32}/)
    })

    it('method `sign(HMAC-SHA256, {}, 2)` should returns a 64 length UPPER string', () => {
      hash.sign('HMAC-SHA256', {}, '2').should.be.String().and.match(/[0-9A-Z]{64}/)
    })
  })
})
