const should = require('should');

const whats = require('..');

describe('index', () => {
  it('default should be `Wechatpay` class', () => {
    should(whats).is.a.Function().and.have.property('name', 'Wechatpay');
    should(whats.default).is.a.Function().and.have.property('name', 'Wechatpay');
  });

  it('should have `Rsa` property and be a Class', () => {
    should(whats.Rsa).is.a.Function().and.have.property('name', 'Rsa');
  });

  it('should have `Aes` property and be a Class', () => {
    should(whats.Aes).is.a.Function().and.have.property('name', 'Aes');
  });

  it('should have `Hash` property and be a Class', () => {
    should(whats.Hash).is.a.Function().and.have.property('name', 'Hash');
  });

  it('should have `FormData` property and be a Class', () => {
    should(whats.FormData).is.a.Function().and.have.property('name', 'FormData');
  });

  it('should have `Multipart` property and be a Class', () => {
    should(whats.Multipart).is.a.Function().and.have.property('name', 'Multipart');
  });

  it('should have `Formatter` property and be a Class', () => {
    should(whats.Formatter).is.a.Function().and.have.property('name', 'Formatter');
  });

  it('should have `Wechatpay` property and be a Class', () => {
    should(whats.Wechatpay).is.a.Function().and.have.property('name', 'Wechatpay');
  });

  it('should have `Transformer` property and be a Class', () => {
    should(whats.Transformer).is.a.Function().and.have.property('name', 'Transformer');
  });

  it('should have `Decorator` property and be a Class', () => {
    should(whats.Decorator).is.a.Function().and.have.property('name', 'Decorator');
  });
});
