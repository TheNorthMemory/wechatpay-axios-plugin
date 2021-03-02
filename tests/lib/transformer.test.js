const should = require('should')
const Transformer = require('../../lib/transformer')

describe('lib/transformer', () => {
  it('should be class Transformer', () => {
    Transformer.should.be.a.Function().and.have.property('name', 'Transformer')
  })

  describe('Transformer::secret', () => {
    Transformer.secret = 'test'
    it('method `secret` should be static', () => {
      should(Transformer.secret).be.String().and.equal('test')
      should((new Transformer).secret).is.Undefined()
    })
  })

  describe('Transformer::signer', () => {
    it('method `signer` should be static', () => {
      should(Transformer.signer).be.a.Function()
      should((new Transformer).signer).is.Undefined()
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
