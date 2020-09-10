const should = require('should')
const wechatpay = require('../../lib/wechatpay')
const assert = require('assert')

describe('lib/wechatpay', () => {
  it('should be class Wechatpay', () => {
    wechatpay.should.be.a.Function().and.have.property('name', 'Wechatpay')
  })

  describe('Wechatpay::constructor', () => {
    it('method `constructor` should be thrown exception while none-arguments passed', () => {
      should(() => {
        new wechatpay
      }).throw(assert.AssertionError)
    })
  })
})
