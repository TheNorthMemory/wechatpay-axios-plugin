const should = require('should')
const Transformer = require('../../lib/transformer')

describe('lib/transformer', () => {
  it('should be class Transformer', () => {
    Transformer.should.be.a.Function().and.have.property('name', 'Transformer')
  })

  describe('Transformer::mchid', () => {
    it('method `mchid` should be static and descriped as `get`, `set`, `enumerable` and `configurable` properties', () => {
      should(Transformer.mchid).be.Undefined()
      should((new Transformer).mchid).is.Undefined()
      const describe = Object.getOwnPropertyDescriptor(Transformer, 'mchid')
      should(describe).have.properties('get', 'set', 'enumerable', 'configurable')
      should(describe.get).be.a.Function()
      should(describe.set).be.a.Function()
    })

    it('method `mchid` should be static usage after called `set("1900000109")` descriptor', () => {
      Transformer.mchid = '1900000109'
      should(Transformer.mchid).be.String().and.equal('1900000109')
      Transformer.mchid = undefined
      should(Transformer.mchid).be.Undefined()
    })
  })

  describe('Transformer::secret', () => {
    it('method `secret` should be static and descriped as `get`, `set`, `enumerable` and `configurable` properties', () => {
      should(Transformer.secret).be.Undefined()
      should((new Transformer).secret).is.Undefined()
      const describe = Object.getOwnPropertyDescriptor(Transformer, 'secret')
      should(describe).have.properties('get', 'set', 'enumerable', 'configurable')
      should(describe.get).be.a.Function()
      should(describe.set).be.a.Function()
    })

    it('method `secret` should be static usage after called `set("test")` descriptor', () => {
      Transformer.secret = 'test'
      should(Transformer.secret).be.String().and.equal('test')
      Transformer.secret = undefined
      should(Transformer.secret).be.Undefined()
    })
  })

  describe('Transformer::signer', () => {
    it('method `signer` should be static', () => {
      should(Transformer.signer).be.a.Function()
      should((new Transformer).signer).is.Undefined()
    })

    it('method `signer` should thrown a TypeError while none argument passed in', () => {
      should(() => {
        Transformer.signer()
      }).throw(TypeError)
    })

    it('method `signer` should returns the origin inputs while those are one of the number, string or symbol', () => {
      Transformer.signer(1).should.be.equal(1)
      Transformer.signer('').should.be.equal('')
      /*eslint-disable-next-line*/
      const symbol = Symbol('test')
      Transformer.signer(symbol).should.be.equal(symbol)
    })

    it('method `signer` should returns the object which contains `sign` property while the input is object', () => {
      Transformer.signer({}).should.be.Object().have.property('sign')
    })

    it('method `signer` should returns the `{sign}` which is string and have length(32)', () => {
      const target = Transformer.signer({})
      target.should.be.Object().have.property('sign')
      target.sign.should.be.String().and.have.length(32)
    })

    it('method `signer` should throw a `TypeError` while the input object has `sign_type:HMAC-SHA256` annotation and `Transformer.secret` wasn\'t setting', () => {
      // mock doesn't setting
      Transformer.secret = undefined
      should(() => {
        Transformer.signer({sign_type: 'HMAC-SHA256'})
      }).throw(TypeError)
    })

    it('method `signer` should returns the `{sign}` is length(64) string while the input object has `sign_type:HMAC-SHA256` annotation', () => {
      // mock setting up
      Transformer.secret = ''
      const target = Transformer.signer({sign_type: 'HMAC-SHA256'})
      Transformer.secret = undefined
      target.should.be.Object().have.property('sign')
      target.sign.should.be.String().and.have.length(64)
    })
  })

  describe('Transformer::toXml', () => {
    it('method `toXml` should be static', () => {
      should(Transformer.toXml).be.a.Function()
      should((new Transformer).toXml).is.Undefined()
    })
  })

  describe('Transformer::request', () => {
    it('method `request` should be static', () => {
      should(Transformer.request).be.Array()
      should((new Transformer).request).is.Undefined()
    })
  })

  describe('Transformer::toObject', () => {
    it('method `toObject` should be static', () => {
      should(Transformer.toObject).be.a.Function()
      should((new Transformer).toObject).is.Undefined()
    })
  })

  describe('Transformer::verifier', () => {
    it('method `verifier` should be static', () => {
      should(Transformer.verifier).be.a.Function()
      should((new Transformer).verifier).is.Undefined()
    })
  })

  describe('Transformer::response', () => {
    it('method `response` should be static', () => {
      should(Transformer.response).be.Array()
      should((new Transformer).response).is.Undefined()
    })
  })
})
