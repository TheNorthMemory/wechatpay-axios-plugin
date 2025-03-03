const assert = require('assert');
const should = require('should');
const Transformer = require('../../lib/transformer');

describe('lib/transformer', () => {
  it('should be class Transformer', () => {
    Transformer.should.be.a.Function().and.have.property('name', 'Transformer');
  });

  describe('Transformer::mchid', () => {
    it('method `mchid` should be static and descriped as `get`, `set`, `enumerable` and `configurable` properties', () => {
      should((new Transformer()).mchid).is.Undefined();
      const describe = Object.getOwnPropertyDescriptor(Transformer, 'mchid');
      should(describe).have.properties('get', 'set', 'enumerable', 'configurable');
      should(describe.get).be.a.Function();
      should(describe.set).be.a.Function();
    });

    it('method `mchid` should be static usage after called `set("1900000109")` descriptor', () => {
      Transformer.mchid = '1900000109';
      should(Transformer.mchid).be.String().and.equal('1900000109');
      Transformer.mchid = undefined;
      should(Transformer.mchid).be.Undefined();
    });
  });

  describe('Transformer::secret', () => {
    it('method `secret` should be static and descriped as `get`, `set`, `enumerable` and `configurable` properties', () => {
      should(Transformer.secret).be.Undefined();
      should((new Transformer()).secret).is.Undefined();
      const describe = Object.getOwnPropertyDescriptor(Transformer, 'secret');
      should(describe).have.properties('get', 'set', 'enumerable', 'configurable');
      should(describe.get).be.a.Function();
      should(describe.set).be.a.Function();
    });

    it('method `secret` should be static usage after called `set("test")` descriptor', () => {
      Transformer.secret = 'test';
      should(Transformer.secret).be.String().and.equal('test');
      Transformer.secret = undefined;
      should(Transformer.secret).be.Undefined();
    });
  });

  describe('Transformer::signer', () => {
    it('method `signer` should be static', () => {
      should(Transformer.signer).be.a.Function();
    });

    it('method `signer` should thrown a TypeError while none argument passed in', () => {
      should(() => {
        Transformer.signer();
      }).throw(TypeError);
    });

    it('method `signer` should returns the origin inputs while those are one of the number, string or symbol', () => {
      Transformer.signer(1).should.be.equal(1);
      Transformer.signer('').should.be.equal('');
      /* eslint-disable-next-line */
      const symbol = Symbol('test')
      Transformer.signer(symbol).should.be.equal(symbol);
    });

    it('method `signer` should returns the object which contains `sign` property while the input is object', () => {
      Transformer.signer({}).should.be.Object().have.property('sign');
    });

    it('method `signer` should returns the `{sign}` which is string and have length(32)', () => {
      const target = Transformer.signer({});
      target.should.be.Object().have.property('sign');
      target.sign.should.be.String().and.have.length(32);
    });

    it('method `signer` should throw a `TypeError` while the input object has `sign_type:HMAC-SHA256` annotation and `Transformer.secret` wasn\'t setting', () => {
      // mock doesn't setting
      Transformer.secret = undefined;
      should(() => Transformer.signer({ sign_type: 'HMAC-SHA256' })).throw(TypeError);
    });

    it('method `signer` should returns the `{sign}` is length(64) string while the input object has `sign_type:HMAC-SHA256` annotation', () => {
      // mock setting up
      Transformer.secret = '';
      /* eslint-disable-next-line camelcase */
      const target = Transformer.signer({ sign_type: 'HMAC-SHA256' });
      Transformer.secret = undefined;
      target.should.be.Object().have.property('sign');
      target.sign.should.be.String().and.have.length(64);
    });
  });

  describe('Transformer::toXml', () => {
    it('method `toXml` should be static', () => {
      should(Transformer.toXml).be.a.Function();
      should((new Transformer()).toXml).is.Undefined();
    });

    it('method `toXml` should throw a `TypeError` while none argument passed in', () => {
      should(() => {
        Transformer.toXml();
      }).throw(TypeError);
    });

    it('method `toXml` should throw a `TypeError` while a `Symbol` passed in', () => {
      should(() => {
        Transformer.toXml(
          /* eslint-disable-next-line */
          Symbol('test')
        );
      }).throw(TypeError);
    });

    it('method `toXml` should returns a string and equal to `<xml/>` while empty string passed in', () => {
      Transformer.toXml('').should.be.String().and.equal('<xml/>');
    });

    it('method `toXml` should returns a string and equal to `<xml>test</xml>` while a `test` string passed in', () => {
      Transformer.toXml('test').should.be.String().and.equal('<xml>test</xml>');
    });

    it('method `toXml` should returns a string and equal to `<xml><![CDATA[2>1<0]]></xml>` while a `2>1<0` string passed in', () => {
      Transformer.toXml('2>1<0').should.be.String().and.equal('<xml><![CDATA[2>1<0]]></xml>');
    });

    it('method `toXml` should returns a string and equal to `<xml/>` while an empty object passed in', () => {
      Transformer.toXml({}).should.be.String().and.equal('<xml/>');
    });

    it('method `toXml` should returns `<xml><mch_id>1900000109</mch_id><sign>mock</sign></xml>` while the `{mch_id: \'1900000109\', sign: \'mock\'}` object passed in', () => {
      /* eslint-disable-next-line camelcase */
      Transformer.toXml({ mch_id: '1900000109', sign: 'mock' }).should.be.String().and.equal('<xml><mch_id>1900000109</mch_id><sign>mock</sign></xml>');
    });
  });

  describe('Transformer::request', () => {
    it('method `request` should be static', () => {
      should(Transformer.request).be.Array();
    });

    it('method `request` should be equal to `[Transformer.signer, Transformer.toXml]`', () => {
      Transformer.request.should.be.Array().and.length(2);
      Transformer.request[0].should.be.equal(Transformer.signer);
      Transformer.request[1].should.be.equal(Transformer.toXml);
    });
  });

  describe('Transformer::toObject', () => {
    it('method `toObject` should be static', () => {
      should(Transformer.toObject).be.a.Function();
      should((new Transformer()).toObject).is.Undefined();
    });

    it('method `toObject` should returns `undefined` while none argument passed in', () => {
      should(Transformer.toObject()).be.Undefined();
    });

    it('method `toObject` should returns `undefined` while a `Symbol` passed in', () => {
      should(Transformer.toObject(
        /* eslint-disable-next-line */
        Symbol('test')
      )).be.Undefined();
    });

    it('method `toObject` should returns `undefined` while a `test` string passed in', () => {
      should(Transformer.toObject('test')).be.Undefined();
    });

    it('method `toObject` should returns `test` while a `<span>test</span>` string passed in', () => {
      should(Transformer.toObject('<span>test</span>')).be.equal('test');
    });

    it('method `toObject` should returns `{mch_id: \'10000100\'}` while a `<xml><mch_id>10000100</mch_id></xml>` string passed in', () => {
      should(Transformer.toObject('<xml><mch_id>10000100</mch_id></xml>')).be.Object().and.have.property('mch_id', '10000100');
      should(Object.keys(Transformer.toObject('<xml><mch_id>10000100</mch_id></xml>'))).be.length(1);
      /* eslint-disable-next-line camelcase */
      should(JSON.stringify(Transformer.toObject('<xml><mch_id>10000100</mch_id></xml>'))).be.eql(JSON.stringify({ mch_id: '10000100' }));
    });

    it('method `toObject` should returns `null` while a `Buffer.from([])` passed in', () => {
      should(Transformer.toObject(Buffer.from([]))).be.eql(null);
    });
  });

  describe('Transformer::verifier', () => {
    it('method `verifier` should be static', () => {
      should(Transformer.verifier).be.a.Function();
    });

    it('method `verifier` should throw `assert.AssertionError` while the input `{sign}` doesn\'t matched', () => {
      should(() => {
        Transformer.verifier({ sign: '332F17B766FC787203EBE9D6E40457A1' });
      }).throw(assert.AssertionError);
    });

    it('method `verifier` should be thrown a `assert.AssertionError` while a `test` string passed in', () => {
      should(() => Transformer.verifier('test')).throw(assert.AssertionError);
    });

    it('method `verifier` should be thrown a `assert.AssertionError` while a `{}` object passed in', () => {
      should(() => Transformer.verifier({})).throw(assert.AssertionError);
    });

    it('method `verifier` should be thrown a `assert.AssertionError` while a `Buffer.from([])` passed in', () => {
      should(() => Transformer.verifier(Buffer.from([]))).throw(assert.AssertionError);
    });
  });

  describe('Transformer::response', () => {
    it('method `response` should be static', () => {
      should(Transformer.response).be.Array();
    });

    it('method `response` should be equal to `[Transformer.toObject, Transformer.verifier]`', () => {
      Transformer.response.should.be.Array().and.length(2);
      Transformer.response[0].should.be.equal(Transformer.toObject);
      Transformer.response[1].should.be.equal(Transformer.verifier);
    });
  });
});
