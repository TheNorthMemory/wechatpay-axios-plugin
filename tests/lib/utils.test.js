const should = require('should');

const utils = require('../../lib/utils');
const Multipart = require('../../lib/multipart');

describe('lib/utils', () => {
  it('should be an Object', () => {
    utils.should.be.an.Object();
  });

  it('should have `isString` property and be a function', () => {
    utils.should.have.property('isString');
    should(utils.isString).be.a.Function();
  });

  it('should have `isNumber` property and be a function', () => {
    utils.should.have.property('isNumber');
    should(utils.isNumber).be.a.Function();
  });

  it('should have `isBuffer` property and be a function', () => {
    utils.should.have.property('isBuffer');
    should(utils.isBuffer).be.a.Function();
  });

  it('should have `isObject` property and be a function', () => {
    utils.should.have.property('isObject');
    should(utils.isObject).be.a.Function();
  });

  it('should have `isStream` property and be a function', () => {
    utils.should.have.property('isStream');
    should(utils.isStream).be.a.Function();
  });

  it('should have `merge` property and be a function', () => {
    utils.should.have.property('merge');
    should(utils.merge).be.a.Function();
  });

  describe('utils::isProcessEnv', () => {
    it('method `isProcessEnv` should be function', () => {
      should(utils.isProcessEnv).be.a.Function();
    });

    it('method `isProcessEnv` should returns Boolean', () => {
      utils.isProcessEnv().should.be.a.Boolean();
    });

    it('method `isProcessEnv` should returns boolean `true` under Node environment', () => {
      utils.isProcessEnv().should.be.a.Boolean().and.be.True();
    });
  });

  describe('utils::isProcessFormData', () => {
    it('method `isProcessFormData` should be function', () => {
      should(utils.isProcessFormData).be.a.Function();
    });

    it('method `isProcessFormData` should returns Boolean', () => {
      utils.isProcessFormData().should.be.a.Boolean();
    });

    it('method `isProcessFormData` should returns boolean `true` under Node environment', () => {
      (new Multipart()).should.be.an.Object();
      utils.isProcessFormData(new Multipart()).should.be.a.Boolean().and.be.True();
    });

    it('method `isProcessFormData` should returns boolean `true` under Node environment', () => {
      (new Multipart.FormData()).should.be.an.Object();
      utils.isProcessFormData(new Multipart.FormData()).should.be.a.Boolean().and.be.True();
    });
  });

  describe('utils::isStream', () => {
    it('method `isStream` should be function', () => {
      should(utils.isStream).be.a.Function();
    });

    it('method `isStream` should returns Boolean', () => {
      utils.isStream().should.be.a.Boolean();
    });

    it('method `isStream` should returns boolean `true` while the `Multipart` instance passed in', () => {
      utils.isStream(new Multipart()).should.be.a.Boolean().and.be.True();
    });

    it('method `isStream` should returns boolean `true` while the `FormData` instance passed in', () => {
      utils.isStream(new Multipart.FormData()).should.be.a.Boolean().and.be.True();
    });
  });

  describe('utils::implicityReturnValues', () => {
    it('method `implicityReturnValues` should be function', () => {
      should(utils.implicityReturnValues).be.a.Function();
    });

    it('method `implicityReturnValues` should returns an Error instance with `response` property', () => {
      const err = utils.implicityReturnValues();
      err.should.be.instanceof(Error).and.have.property('code', 'ERR_ASSERTION');
      err.should.have.property('response');
    });
  });
});
