const should = require('should');

const axios = require('axios');
const interceptor = require('../../lib/interceptor');

describe('lib/interceptor', () => {
  it('should be Function interceptor', () => {
    interceptor.should.be.a.Function().and.have.property('name', 'interceptor');
  });

  it('executed should thrown an Error(The merchant\' ID aka `mchid` is required, usually numerical.) when none arguments given', () => {
    should(() => {
      interceptor();
    }).throw(Error, {
      code: 'ERR_ASSERTION',
      message: 'The merchant\' ID aka `mchid` is required, usually numerical.',
    });
  });

  it('executed should thrown an Error(...aka `serial` is required, usually hexadecial.) when the second argument incomplete', () => {
    should(() => {
      interceptor(axios, { mchid: '' });
    }).throw(Error, {
      code: 'ERR_ASSERTION',
      message: 'The serial number of the merchant\'s public certificate aka `serial` is required, usually hexadecial.',
    });
  });

  it('executed should thrown an Error(The public certificates via API downloaded `certs` is required...) when the second argument {certs: {}} incomplete', () => {
    should(() => {
      interceptor(axios, {
        mchid: '', serial: '', privateKey: '', certs: {},
      });
    }).throw(Error, {
      code: 'ERR_ASSERTION',
      message: 'The public certificates via API downloaded `certs` is required, similar and just the pair of `{serial: publicCert}` Object.',
    });
  });

  it('executed with correct arguments should returns an Axios instance', () => {
    const instance = axios.create();

    interceptor(instance, {
      mchid: '', serial: '', privateKey: '', certs: { any: undefined },
    }).should.be.a.Function().and.have.property('name', 'wrap');
  });

  it('The Axios instance should had been registred the `signer` on request and the `verifier` on response', () => {
    const instance = axios.create();
    const client = interceptor(instance, {
      mchid: '', serial: '', privateKey: '', certs: { any: undefined },
    });

    client.should.be.a.Function().and.have.property('name', 'wrap');
    client.should.have.property('interceptors');
    client.interceptors.should.instanceof(Object).and.have.property('request');
    client.interceptors.should.instanceof(Object).and.have.property('response');
    client.interceptors.request.should.have.property('handlers').and.is.Array().and.length(1);
    client.interceptors.response.should.have.property('handlers').and.is.Array().and.length(1);

    const req = client.interceptors.request.handlers[0];
    const res = client.interceptors.response.handlers[0];

    req.should.be.an.Object();
    res.should.be.an.Object();
    should(req.fulfilled).is.an.Function().and.have.property('name', 'signer');
    should(res.fulfilled).is.an.Function().and.have.property('name', 'verifier');
  });

  it('TODO: mockup HTTP request with expected `headers`', () => {
    // It's so hard for now, the mockup server shall more logical verification on the `headers[Authorization]`.
    // The `GET` may not be allowed `POST`.
    // The `POST` may not be allowed `GET`, `PUT`, `PATCH`, `OPTIONS` etc.
    // Leave it here for contributors.
  });
});
