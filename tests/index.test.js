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

  it('should have `Formatter` property and be a Class', () => {
    should(wxpay.Formatter).is.a.Function().and.have.property('name', 'Formatter')
  })
})
