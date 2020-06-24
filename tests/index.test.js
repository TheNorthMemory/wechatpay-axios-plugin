const should = require('should')

const wxpay = require('../')

describe('index', () => {
  it('should be Function interceptor', () => {
    should(wxpay).is.a.Function().and.have.property('name', 'interceptor')
  })
})
