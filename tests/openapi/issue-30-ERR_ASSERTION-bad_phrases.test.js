const { readFileSync } = require('fs');
const { join } = require('path');
const { AssertionError } = require('assert');

require('should');
const nock = require('nock');

const { Wechatpay } = require('../..');

describe('Issue #30 v3/pay/transcations/h5', () => {
  let scope;
  let instance;

  const mocks = () => '{}';

  const sandboxEndpoints = () => [
    '<xml>',
    '  <return_code><![CDATA[FAIL]]></return_code>',
    '  <retmsg><![CDATA[请确认请求参数是否正确param mch_id invalid]]></retmsg>',
    '  <retcode><![CDATA[1]]></retcode>',
    '</xml>',
  ].join('\r\n');

  beforeEach(() => {
    // {@link ../../fixtures/README.md}
    const privateKey = readFileSync(join(__dirname, '../fixtures/apiclient_key.pem'));
    const publicCert = readFileSync(join(__dirname, '../fixtures/apiserver_cert.pem'));

    instance = new Wechatpay({
      mchid: '101',
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

  describe('POST onto URI(`v3/pay/transactions/h5`)', () => {
    it('post onto the `v3/pay/transactions/h5` with the sandbox endpoints', async () => {
      scope.post('/sandboxnew/v3/pay/transactions/h5').reply(200, sandboxEndpoints, { 'Content-Type': 'text/plain;charset=utf-8' });
      const privateKey = readFileSync(join(__dirname, '../fixtures/apiclient_key.pem'));
      const publicCert = readFileSync(join(__dirname, '../fixtures/apiserver_cert.pem'));
      await (new Wechatpay({
        mchid: '101',
        serial: '898DBAD30F416EC7',
        privateKey,
        certs: { BE2A2344B984167B: publicCert },
        baseURL: 'https://api.mch.weixin.qq.com/sandboxnew/',
        maxRedirects: 0,
      })).v3.pay.transactions.h5.post({}).catch((resp) => {
        resp.response.should.be.Object().and.have.keys('headers', 'data');
        resp.response.headers.should.be.Object().and.not.have.keys('Wechatpay-Timestamp');
        resp.response.data.should.be.String().and.match(/<xml>.*?<\/xml>\r?\n?/s);
      });
    });

    it('post onto the `v3/pay/transactions/h5` with the dynamic(`baseURL`) to the sandbox endpoints', async () => {
      scope.post('/sandboxnew/v3/pay/transactions/h5').reply(200, sandboxEndpoints, { 'Content-Type': 'text/plain;charset=utf-8' });
      await instance.v3.pay.transactions.h5.post({}, { baseURL: 'https://api.mch.weixin.qq.com/sandboxnew/' }).catch((resp) => {
        resp.response.should.be.Object().and.have.keys('headers', 'data');
        resp.response.headers.should.be.Object().and.not.have.keys('Wechatpay-Timestamp');
        resp.response.data.should.be.String().and.match(/<xml>.*?<\/xml>\r?\n?/s);
      });
    });

    it('post onto the `v3/pay/transactions/h5` with better `AssertionError`: Headers incomplete', async () => {
      scope.post('/v3/pay/transactions/h5').reply(200, mocks);
      await instance.v3.pay.transactions.h5.post({}).catch((resp) => {
        resp.should.instanceOf(AssertionError);
        resp.message.should.be.String().and.match(/Headers incomplete/);
        resp.response.should.be.Object().and.have.keys('headers', 'data');
        resp.response.headers.should.be.Object().and.not.have.keys('Wechatpay-Nonce', 'Wechatpay-Serial', 'Wechatpay-Signature', 'Wechatpay-Timestamp');
      });
    });

    it('post onto the `v3/pay/transactions/h5` with better `AssertionError`: `Wechatpay-Timestamp`', async () => {
      scope.post('/v3/pay/transactions/h5').reply(200, mocks, {
        'Wechatpay-Nonce': 'mock',
        'Wechatpay-Serial': 'mock',
        'Wechatpay-Signature': 'mock',
        'Wechatpay-Timestamp': '1624692495',
      });
      await instance.v3.pay.transactions.h5.post({}).catch((resp) => {
        resp.should.instanceOf(AssertionError);
        resp.message.should.be.String().and.match(/Wechatpay-Timestamp/);
        resp.response.should.be.Object().and.have.keys('headers', 'data');
        resp.response.headers.should.be.Object();
        resp.response.headers.should.not.have.keys('Wechatpay-Nonce', 'Wechatpay-Serial', 'Wechatpay-Signature', 'Wechatpay-Timestamp');
        resp.response.headers.should.have.keys('wechatpay-nonce', 'wechatpay-serial', 'wechatpay-signature', 'wechatpay-timestamp');
      });
    });

    it('post onto the `v3/pay/transactions/h5` with better `AssertionError`: `Wechatpay-Serial`', async () => {
      scope.post('/v3/pay/transactions/h5').reply(200, mocks, {
        'Wechatpay-Nonce': 'mock',
        'Wechatpay-Serial': 'fake',
        'Wechatpay-Signature': 'mock',
        'Wechatpay-Timestamp': Math.floor((+new Date()) / 1000),
      });
      await instance.v3.pay.transactions.h5.post({}).catch((resp) => {
        resp.should.instanceOf(AssertionError);
        resp.message.should.be.String().and.match(/Wechatpay-Serial/);
        resp.response.should.be.Object().and.have.keys('headers', 'data');
        resp.response.headers.should.be.Object();
        resp.response.headers.should.not.have.keys('Wechatpay-Nonce', 'Wechatpay-Serial', 'Wechatpay-Signature', 'Wechatpay-Timestamp');
        resp.response.headers.should.have.keys('wechatpay-nonce', 'wechatpay-serial', 'wechatpay-signature', 'wechatpay-timestamp');
      });
    });
  });
});
