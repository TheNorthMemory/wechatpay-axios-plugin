const should = require('should')
const transformer = require('../../lib/transformer')

describe('lib/transformer', () => {
  it('should be class Transformer', () => {
    transformer.should.be.a.Function().and.have.property('name', 'Transformer')
  })

  describe('Transformer::secret', () => {
    transformer.secret = 'test'
    it('method `secret` should be static', () => {
      should(transformer.secret).be.String().and.equal('test')
      should((new transformer).secret).is.Undefined()
    })
  })

  describe('Transformer::signer', () => {
    it('method `signer` should be static', () => {
      should(transformer.signer).be.a.Function()
      should((new transformer).signer).is.Undefined()
    })
  })

  describe('Transformer::toXml', () => {
    it('method `toXml` should be static', () => {
      should(transformer.toXml).be.a.Function()
      should((new transformer).toXml).is.Undefined()
    })
  })

  describe('Transformer::request', () => {
    it('method `request` should be static', () => {
      should(transformer.request).be.Array()
      should((new transformer).request).is.Undefined()
    })
  })

  describe('Transformer::toObject', () => {
    it('method `toObject` should be static', () => {
      should(transformer.toObject).be.a.Function()
      should((new transformer).toObject).is.Undefined()
    })
  })

  describe('Transformer::verifier', () => {
    it('method `verifier` should be static', () => {
      should(transformer.verifier).be.a.Function()
      should((new transformer).verifier).is.Undefined()
    })
  })

  describe('Transformer::response', () => {
    it('method `response` should be static', () => {
      should(transformer.response).be.Array()
      should((new transformer).response).is.Undefined()
    })
  })
})
