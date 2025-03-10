const assert = require('assert');

const should = require('should');
const Decorator = require('../../lib/decorator');

describe('lib/decorator', () => {
  it('should be class Decorator', () => {
    Decorator.should.be.a.Function().and.have.property('name', 'Decorator');
  });

  describe('Decorator::constructor', () => {
    it('Should be thrown exception while none-arguments passed', () => {
      should(() => new Decorator()).throw(assert.AssertionError, {
        code: 'ERR_ASSERTION',
      });
    });

    it('Should be an instanceof Decorator after initialized', () => {
      (new Decorator({
        mchid: '', serial: '', privateKey: '', certs: { any: undefined },
      }))
        .should.be.instanceof(Decorator);
    });

    it('Should have tow in-hidden symbol properties(Symbol(XML PAYLOAD), Symbol(JSON PAYLOAD)) after initialized', () => {
      const instance = new Decorator({
        mchid: '', serial: '', privateKey: '', certs: { any: undefined },
      });
      instance.should.be.instanceof(Decorator);
      const describe = Object.getOwnPropertySymbols(instance);
      describe.should.be.length(2);
      String(describe[0]).should.be.equal('Symbol(XML PAYLOAD)');
      String(describe[1]).should.be.equal('Symbol(JSON PAYLOAD)');
    });

    it('Function `v2` should be there after initialized', () => {
      const instance = new Decorator({
        mchid: '', serial: '', privateKey: '', certs: { any: undefined },
      });
      instance.should.be.instanceof(Decorator);
      instance.v2.should.be.Function();
    });

    it('Function `v3` should be there after initialized', () => {
      const instance = new Decorator({
        mchid: '', serial: '', privateKey: '', certs: { any: undefined },
      });
      instance.should.be.instanceof(Decorator);
      instance.v3.should.be.Function();
    });

    it('Function `request` should be there after initialized', () => {
      const instance = new Decorator({
        mchid: '', serial: '', privateKey: '', certs: { any: undefined },
      });
      instance.should.be.instanceof(Decorator);
      instance.request.should.be.Function();
    });
  });

  describe('Decorator::defaults', () => {
    it('property `defaults` should be static', () => {
      should(Decorator.defaults).be.an.Object();
      should((new Decorator({
        mchid: '', serial: '', privateKey: '', certs: { any: undefined },
      })).defaults).be.Undefined();
    });
  });

  describe('Decorator::xmlBased', () => {
    it('Function `xmlBased` should be static', () => {
      should(Decorator.xmlBased).be.Function();
      should((new Decorator({
        mchid: '', serial: '', privateKey: '', certs: { any: undefined },
      })).xmlBased).be.Undefined();
    });
  });

  describe('Decorator::requestInterceptor', () => {
    it('method `requestInterceptor` should be static', () => {
      should(Decorator.requestInterceptor).be.a.Function();
      should((new Decorator({
        mchid: '', serial: '', privateKey: '', certs: { any: undefined },
      })).requestInterceptor).be.Undefined();
    });

    it('method `requestInterceptor()` should returns a named `signer` Function', () => {
      should(Decorator.requestInterceptor()).be.a.Function().and.have.property('name', 'signer');
    });
  });

  describe('Decorator::responseVerifier', () => {
    it('method `responseVerifier` should be static', () => {
      should(Decorator.responseVerifier).be.a.Function();
      should((new Decorator({
        mchid: '', serial: '', privateKey: '', certs: { any: undefined },
      })).responseVerifier).be.Undefined();
    });

    it('method `responseVerifier()` should returns a named `verifier` Function', () => {
      should(Decorator.responseVerifier()).be.a.Function().and.have.property('name', 'verifier');
    });
  });

  describe('Decorator::jsonBased', () => {
    it('Function `jsonBased` should be static', () => {
      should(Decorator.jsonBased).be.Function();
      should((new Decorator({
        mchid: '', serial: '', privateKey: '', certs: { any: undefined },
      })).jsonBased).be.Undefined();
    });
  });
});
