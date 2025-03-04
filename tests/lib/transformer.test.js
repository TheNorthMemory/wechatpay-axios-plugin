const should = require('should');
const Transformer = require('../../lib/transformer');

describe('lib/transformer', () => {
  it('should be class Transformer', () => {
    Transformer.should.be.a.Function().and.have.property('name', 'Transformer');
  });

  describe('Transformer::signer', () => {
    it('method `signer` should be an instance function', () => {
      should(new Transformer().signer).be.a.Function();
    });

    it('method `signer` should thrown a TypeError while none argument passed in', () => {
      should(() => {
        new Transformer().signer();
      }).throw(TypeError);
    });

    it('method `signer` should returns the origin inputs while those are one of the number, string or symbol', () => {
      new Transformer().signer(1).should.be.equal(1);
      new Transformer().signer('').should.be.equal('');
      /* eslint-disable-next-line */
      const symbol = Symbol('test')
      new Transformer().signer(symbol).should.be.equal(symbol);
    });

    it('method `signer` should returns the object which contains `sign` property while the input is object', () => {
      new Transformer().signer({}).should.be.Object().have.property('sign');
    });

    it('method `signer` should returns the `{sign}` which is string and have length(32)', () => {
      const target = new Transformer().signer({});
      target.should.be.Object().have.property('sign');
      target.sign.should.be.String().and.have.length(32);
    });

    it('method `signer` should throw a `TypeError` while the input object has `sign_type:HMAC-SHA256` annotation and no `secret` present', () => {
      should(() => new Transformer().signer({ sign_type: 'HMAC-SHA256' })).throw(TypeError);
    });

    it('method `signer` should returns the `{sign}` is length(64) string while the input object has `sign_type:HMAC-SHA256` annotation', () => {
      const target = new Transformer(undefined, '').signer({ sign_type: 'HMAC-SHA256' });
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
    it('method `request` should be an instance function', () => {
      should(new Transformer().request).be.Array();
    });

    it('method `request` should be equal to `[Transformer.signer, Transformer.toXml]`', () => {
      new Transformer().request.should.be.Array().and.length(2);
      new Transformer().request[0].should.be.a.Function();
      new Transformer().request[1].should.be.equal(Transformer.toXml);
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
    it('method `verifier` should be an instance function', () => {
      should(new Transformer().verifier).be.a.Function();
    });
  });

  describe('Transformer::response', () => {
    it('method `response` should be an instance function', () => {
      should(new Transformer().response).be.Array();
    });

    it('method `response` should be equal to `[Transformer.toObject, Transformer.verifier]`', () => {
      new Transformer().response.should.be.Array().and.length(2);
      new Transformer().response[0].should.be.equal(Transformer.toObject);
      new Transformer().response[1].should.be.a.Function();
    });
  });
});
