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
    it('method `client` should be instanceof `Decorator` after initialized', () => {
      Wechatpay.client.should.be.instanceof(Decorator);
    });

    it('method `client.v2` should be `Function` after initialized', () => {
      Wechatpay.client.v2.should.be.an.Function();
    });

    it('method `client.v3` should be `Function` after initialized', () => {
      Wechatpay.client.v3.should.be.an.Function();
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

  describe('Wechatpay::compose', () => {
    it('method `compose` should be static', () => {
      should(Wechatpay.compose).be.a.Function();
    });

    it('Wechatpay.compose() should returns an `anonymous` Function while none-arguments or empty-arguments given', () => {
      Wechatpay.compose().should.instanceof(Function).and.have.property('name', '');
      Wechatpay.compose('').should.instanceof(Function).and.have.property('name', '');
      Wechatpay.compose('', '').should.instanceof(Function).and.have.property('name', '');
    });

    it('Wechatpay.compose(\'v2\') should returns a Function which\'s named as empty', () => {
      Wechatpay.compose('v2').should.instanceof(Function).and.have.property('name', '');
    });

    it('Wechatpay.compose(\'\', \'v2\') should returns a Function which\'s named as `v2`', () => {
      Wechatpay.compose('', 'v2').should.instanceof(Function).and.have.property('name', 'v2');
    });

    it('Wechatpay.compose(\'\', \'v3\') should returns a Function which\'s named as `v3`', () => {
      Wechatpay.compose('', 'v3').should.instanceof(Function).and.have.property('name', 'v3');
    });

    it('Wechatpay.compose(\'\', \'payscore\') should returns a Function which\'s named as `payscore`', () => {
      Wechatpay.compose('', 'payscore').should.instanceof(Function).and.have.property('name', 'payscore');
    });
  });

  describe('Wechatpay::chain', () => {
    it('method `chain` should be static', () => {
      should(Wechatpay.chain).be.a.Function();
    });

    it('Wechatpay.chain(\'\') should returns an `anonymous` named Function while empty-arguments given', () => {
      Wechatpay.chain('').should.instanceof(Function).and.have.property('name', '');
    });

    it('Wechatpay.chain(\'/v2\') should returns a Function which\'s named as `/v2`', () => {
      Wechatpay.chain('/v2').should.instanceof(Function).and.have.property('name', '/v2');
    });

    it('Wechatpay.chain(\'/v2/pay/micropay\') should returns a Function which\'s named as `/v2/pay/micropay`', () => {
      Wechatpay.chain('/v2/pay/micropay').should.instanceof(Function).and.have.property('name', '/v2/pay/micropay');
    });

    it('Wechatpay.chain(\'/v3\').delete should returns a Function which\'s named as `delete`', () => {
      Wechatpay.chain('/v3').delete.should.instanceof(Function).and.have.property('name', 'delete');
    });

    it('Wechatpay.chain(\'/v3\').get should returns a Function which\'s named as `get`', () => {
      Wechatpay.chain('/v3').get.should.instanceof(Function).and.have.property('name', 'get');
    });

    it('Wechatpay.chain(\'/v3\').post should returns a Function which\'s named as `post`', () => {
      Wechatpay.chain('/v3').post.should.instanceof(Function).and.have.property('name', 'post');
    });

    it('Wechatpay.chain(\'/v3\').put should returns a Function which\'s named as `put`', () => {
      Wechatpay.chain('/v3').put.should.instanceof(Function).and.have.property('name', 'put');
    });

    it('Wechatpay.chain(\'/v3\').patch should returns a Function which\'s named as `patch`', () => {
      Wechatpay.chain('/v3').patch.should.instanceof(Function).and.have.property('name', 'patch');
    });

    it('Wechatpay.chain(\'/v3/combine-transactions/{combin_out_trade_no}\') should returns a Function which\'s named as `/v3/combine-transactions/{combin_out_trade_no}`', () => {
      Wechatpay.chain('/v3/combine-transactions/{combin_out_trade_no}').should.instanceof(Function).and.have.property('name', '/v3/combine-transactions/{combin_out_trade_no}');
    });
  });

  describe('Wechatpay::handler', () => {
    it('Getter `handler` should be static and returns an object[get: [Function: get]]', () => {
      should(Wechatpay.handler).be.an.Object().and.have.property('get');
    });
  });
});
