const should = require('should');

const interceptor = require('..');

describe('index', () => {
  it('should be Function interceptor', () => {
    should(interceptor).is.a.Function().and.have.property('name', 'interceptor');
    should(interceptor.default).is.a.Function().and.have.property('name', 'interceptor');
  });

  it('should have `Rsa` property and be a Class', () => {
    should(interceptor.Rsa).is.a.Function().and.have.property('name', 'Rsa');
  });

  it('should have `Aes` property and be a Class', () => {
    should(interceptor.Aes).is.a.Function().and.have.property('name', 'Aes');
  });

  it('should have `Hash` property and be a Class', () => {
    should(interceptor.Hash).is.a.Function().and.have.property('name', 'Hash');
  });

  it('should have `Formatter` property and be a Class', () => {
    should(interceptor.Formatter).is.a.Function().and.have.property('name', 'Formatter');
  });

  it('should have `Wechatpay` property and be a Class', () => {
    should(interceptor.Wechatpay).is.a.Function().and.have.property('name', 'Wechatpay');
  });

  it('should have `Transformer` property and be a Class', () => {
    should(interceptor.Transformer).is.a.Function().and.have.property('name', 'Transformer');
  });

  it('should have `Decorator` property and be a Class', () => {
    should(interceptor.Decorator).is.a.Function().and.have.property('name', 'Decorator');
  });
});
