const should = require('should')

const wxpay = require('../')

describe('index', () => {
  it('should be Function interceptor', () => {
    should(wxpay).is.a.Function().and.have.property('name', 'interceptor')
    should(wxpay.default).is.a.Function().and.have.property('name', 'interceptor')
  })

  it('should have `Rsa` property and be a Class', () => {
    should(wxpay.Rsa).is.a.Function().and.have.property('name', 'Rsa')
  })

  it('should have `Aes` property and be a Class', () => {
    should(wxpay.Aes).is.a.Function().and.have.property('name', 'Aes')
  })

  it('should have `Hash` property and be a Class', () => {
    should(wxpay.Hash).is.a.Function().and.have.property('name', 'Hash')
  })

  it('should have `Formatter` property and be a Class', () => {
    should(wxpay.Formatter).is.a.Function().and.have.property('name', 'Formatter')
  })

  it('should have `Wechatpay` property and be a Class', () => {
    should(wxpay.Wechatpay).is.a.Function().and.have.property('name', 'Wechatpay')
  })

  it('should have `Transformer` property and be a Class', () => {
    should(wxpay.Transformer).is.a.Function().and.have.property('name', 'Transformer')
  })

  it('should have `Decorator` property and be a Class', () => {
    should(wxpay.Decorator).is.a.Function().and.have.property('name', 'Decorator')
  })
})
