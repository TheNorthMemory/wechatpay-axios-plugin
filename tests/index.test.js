const should = require('should')

const wxpay = require('../')

describe('index', () => {
  it('should be Function interceptor', () => {
    wxpay.should.be.a.Function().and.have.property('name', 'interceptor')
  })
})
