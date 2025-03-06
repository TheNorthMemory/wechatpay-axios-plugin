const assert = require('assert');

const should = require('should');
const Wechatpay = require('../../lib/wechatpay');
const Decorator = require('../../lib/decorator');

describe('lib/wechatpay', () => {
  it('should be class Wechatpay', () => {
    Wechatpay.should.be.a.Function().and.have.property('name', 'Wechatpay');
  });

  describe('Wechatpay::client', () => {
    it('method `client` should be `undefined` before initialized', () => {
      should(Wechatpay.client).be.Undefined();
    });
  });

  describe('new Wechatpay', () => {
    it('Should be thrown exception while none-arguments passed', () => {
      should(() => {
        new Wechatpay();/* eslint-disable-line no-new */
      }).throw(assert.AssertionError);
    });

    it('Should be an anonymous Function while initialized', () => {
      (new Wechatpay({
        mchid: '', serial: '', privateKey: '', certs: { any: undefined },
      })).should.be.instanceof(Function).and.have.property('name', '');
    });
  });

  describe('Wechatpay::client', () => {
    const wxpay = new Wechatpay({
      mchid: '', serial: '', privateKey: '', certs: { any: undefined },
    });
    it('method `client` should be instanceof `Decorator` after initialized', () => {
      wxpay.client.should.be.instanceof(Decorator);
    });

    it('method `client.v2` should be `Function` after initialized', () => {
      wxpay.client.v2.should.be.an.Function();
    });

    it('method `client.v3` should be `Function` after initialized', () => {
      wxpay.client.v3.should.be.an.Function();
    });
  });

  describe('Wechatpay::normalize', () => {
    it('method `normalize` should be static', () => {
      should(Wechatpay.normalize).be.a.Function();
      Wechatpay.normalize().should.be.a.String().and.empty();
    });

    it('method `normalize` should be an empty string while none-arguments passed in', () => {
      Wechatpay.normalize().should.be.a.String().and.empty();
    });

    it('method `normalize` should be equal to `a` while `A` passed in', () => {
      Wechatpay.normalize('A').should.be.a.String().and.equal('a');
    });

    it('method `normalize` should be equal to `we-chat-pay` while `WeChatPay` passed in', () => {
      Wechatpay.normalize('WeChatPay').should.be.a.String().and.equal('we-chat-pay');
    });

    it('method `normalize` should be equal to `with_underline` while `With_underline` passed in', () => {
      Wechatpay.normalize('With_underline').should.be.a.String().and.equal('with_underline');
    });

    it('method `normalize` should be equal to `{variable-mixed_underline}` while `$variableMixed_underline$` passed in', () => {
      Wechatpay.normalize('$variableMixed_underline$').should.be.a.String().and.equal('{variable-mixed_underline}');
    });

    it('method `normalize` should be equal to `{variable-mixed_underline}` while `_variableMixed_underline_` passed in', () => {
      Wechatpay.normalize('_variableMixed_underline_').should.be.a.String().and.equal('{variable-mixed_underline}');
    });
  });

  describe('Wechatpay::chain', () => {
    const wxpay = new Wechatpay({
      mchid: '', serial: '', privateKey: '', certs: { any: undefined },
    });
    it('`.chain` should be an instance function', () => {
      should(wxpay.chain).be.a.Function();
    });

    it('.chain(\'\') should returns an `anonymous` named Function while empty-arguments given', () => {
      wxpay.chain('').should.instanceof(Function).and.have.property('name', '');
    });

    it('.chain(\'/v2\') should returns a Function which\'s named as `/v2`', () => {
      wxpay.chain('/v2').should.instanceof(Function).and.have.property('name', '/v2');
    });

    it('.chain(\'/v2/pay/micropay\') should returns a Function which\'s named as `/v2/pay/micropay`', () => {
      wxpay.chain('/v2/pay/micropay').should.instanceof(Function).and.have.property('name', '/v2/pay/micropay');
    });

    it('.chain(\'/v3\').delete should returns a Function which\'s named as `delete`', () => {
      wxpay.chain('/v3').delete.should.instanceof(Function).and.have.property('name', 'delete');
    });

    it('.chain(\'/v3\').get should returns a Function which\'s named as `get`', () => {
      wxpay.chain('/v3').get.should.instanceof(Function).and.have.property('name', 'get');
    });

    it('.chain(\'/v3\').post should returns a Function which\'s named as `post`', () => {
      wxpay.chain('/v3').post.should.instanceof(Function).and.have.property('name', 'post');
    });

    it('.chain(\'/v3\').put should returns a Function which\'s named as `put`', () => {
      wxpay.chain('/v3').put.should.instanceof(Function).and.have.property('name', 'put');
    });

    it('.chain(\'/v3\').patch should returns a Function which\'s named as `patch`', () => {
      wxpay.chain('/v3').patch.should.instanceof(Function).and.have.property('name', 'patch');
    });

    it('.chain(\'/v3/combine-transactions/{combin_out_trade_no}\') should returns a Function which\'s named as `/v3/combine-transactions/{combin_out_trade_no}`', () => {
      wxpay.chain('/v3/combine-transactions/{combin_out_trade_no}').should.instanceof(Function).and.have.property('name', '/v3/combine-transactions/{combin_out_trade_no}');
    });
  });
});
