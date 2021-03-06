const should = require('should')
const Wechatpay = require('../../lib/wechatpay')
const assert = require('assert')

describe('lib/wechatpay', () => {
  it('should be class Wechatpay', () => {
    Wechatpay.should.be.a.Function().and.have.property('name', 'Wechatpay')
  })

  describe('Wechatpay::constructor', () => {
    it('method `constructor` should be thrown exception while none-arguments passed', () => {
      should(() => {
        new Wechatpay
      }).throw(assert.AssertionError)
    })
  })

  describe('Wechatpay::normalize', () => {
    it('method `normalize` should be static', () => {
      should(Wechatpay.normalize).be.a.Function()
      Wechatpay.normalize().should.be.a.String().and.empty()
    })

    it('method `normalize` should be an empty string while none-arguments passed in', () => {
      Wechatpay.normalize().should.be.a.String().and.empty()
    })

    it('method `normalize` should be equal to `a` while `A` passed in', () => {
      Wechatpay.normalize('A').should.be.a.String().and.equal('a')
    })

    it('method `normalize` should be equal to `we-chat-pay` while `WeChatPay` passed in', () => {
      Wechatpay.normalize('WeChatPay').should.be.a.String().and.equal('we-chat-pay')
    })

    it('method `normalize` should be equal to `with_underline` while `With_underline` passed in', () => {
      Wechatpay.normalize('With_underline').should.be.a.String().and.equal('with_underline')
    })

    it('method `normalize` should be equal to `{variable-mixed_underline}` while `$variableMixed_underline$` passed in', () => {
      Wechatpay.normalize('$variableMixed_underline$').should.be.a.String().and.equal('{variable-mixed_underline}')
    })
  })

  describe('Wechatpay::compose', () => {
    it('method `compose` should be static', () => {
      should(Wechatpay.compose).be.a.Function()
    })

    it('Wechatpay.compose() should returns an `anonymous` Function while none-arguments or empty-arguments given', () => {
      Wechatpay.compose().should.instanceof(Function).and.have.property('name', '')
      Wechatpay.compose('').should.instanceof(Function).and.have.property('name', '')
      Wechatpay.compose('', '').should.instanceof(Function).and.have.property('name', '')
    })

    it('Wechatpay.compose(\'v2\') should returns a Function which\'s named as `v2/`', () => {
      Wechatpay.compose('v2').should.instanceof(Function).and.have.property('name', 'v2/')
    })

    it('Wechatpay.compose(\'\', \'v2\') should returns a Function which\'s named as `/v2`', () => {
      Wechatpay.compose('', 'v2').should.instanceof(Function).and.have.property('name', '/v2')
    })

    it('Wechatpay.compose(\'\', \'v3\') should returns a Function which\'s named as `/v3`', () => {
      Wechatpay.compose('', 'v3').should.instanceof(Function).and.have.property('name', '/v3')
    })
  })

  describe('Wechatpay::chain', () => {
    it('method `chain` should be static', () => {
      should(Wechatpay.chain).be.a.Function()
    })

    it('Wechatpay.chain(\'\') should returns an `anonymous` named Function while empty-arguments given', () => {
      Wechatpay.chain('').should.instanceof(Function).and.have.property('name', '')
    })

    it('Wechatpay.chain(\'/v2\') should returns a Function which\'s named as `/v2`', () => {
      Wechatpay.chain('/v2').should.instanceof(Function).and.have.property('name', '/v2')
    })

    it('Wechatpay.chain(\'/v2/pay/micropay\') should returns a Function which\'s named as `/v2/pay/micropay`', () => {
      Wechatpay.chain('/v2/pay/micropay').should.instanceof(Function).and.have.property('name', '/v2/pay/micropay')
    })

    it('Wechatpay.chain(\'/v3/marketing/busifavor/users/{openid}/coupons/{coupon_code}/appids/wx233544546545989\') should returns a Function which\'s named as `/v3/marketing/busifavor/users/{openid}/coupons/{coupon_code}/appids/wx233544546545989`', () => {
      Wechatpay.chain('/v3/marketing/busifavor/users/{openid}/coupons/{coupon_code}/appids/wx233544546545989').should.instanceof(Function).and.have.property('name', '/v3/marketing/busifavor/users/{openid}/coupons/{coupon_code}/appids/wx233544546545989')
    })
  })

  describe('Wechatpay::handler', () => {
    it('Getter `handler` should be static and returns an object[get: [Function: get]]', () => {
      should(Wechatpay.handler).be.an.Object().and.have.property('get')
    })
  })
})
