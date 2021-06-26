const { readFileSync } = require('fs');
const { join } = require('path');
const { AssertionError } = require('assert');

require('should');
const nock = require('nock');

const { Wechatpay } = require('../..');

describe('Issue #28 jsapi 请求路径有误', () => {
  let scope;
  let instance;

  const mocks = () => {
    return {
      code: 'SYSTEM_ERROR',
      message: '系统繁忙，请稍后重试',
    };
  };

  beforeEach(() => {
    // {@link ../../fixtures/README.md}
    const privateKey = readFileSync(join(__dirname, '../fixtures/apiclient_key.pem'));
    const publicCert = readFileSync(join(__dirname, '../fixtures/apiserver_cert.pem'));

    instance = new Wechatpay({
      mchid: 101,
      serial: '898DBAD30F416EC7',
      privateKey,
      certs: { BE2A2344B984167B: publicCert },
    });

    scope = nock('https://api.mch.weixin.qq.com/')
      .defaultReplyHeaders({
        server: 'Nginx',
        'Content-Type': 'application/json',
      })
      .replyDate();
  });

  describe('POST onto URI(`/v3/combine-transactions/jsapi`)', () => {
    it('post onto the `/v3/combine-transactions/jsapi` got a `500` SYSTEM_ERROR', async () => {
      scope.post('/v3/combine-transactions/jsapi').reply(500, mocks);
      await instance.v3.combineTransactions.jsapi.post({}).catch((resp) => {
        resp.should.instanceOf(AssertionError);
        resp.response.should.be.Object().and.have.keys('headers', 'data');
        resp.response.headers.should.be.Object().and.not.have.keys('Wechatpay-Timestamp');
        resp.response.data.should.be.String().and.match(/"SYSTEM_ERROR"/);
      });
    });
  });

  describe('POST onto URI(`/v3/pay/transactions/jsapi`)', () => {
    it('post onto the `/v3/pay/transactions/jsapi` got a `500` SYSTEM_ERROR', async () => {
      scope.post('/v3/pay/transactions/jsapi').reply(500, mocks);
      await instance.v3.pay.transactions.jsapi.post({}).catch((resp) => {
        resp.should.instanceOf(AssertionError);
        resp.response.should.be.Object().and.have.keys('headers', 'data');
        resp.response.headers.should.be.Object().and.not.have.keys('Wechatpay-Timestamp');
        resp.response.data.should.be.String().and.match(/"SYSTEM_ERROR"/);
      });
    });
  });
});
