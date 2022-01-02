const { readFileSync } = require('fs');
const { join } = require('path');

require('should');
const nock = require('nock');

const { Wechatpay } = require('../..');

describe('OpenAPI Kick Start 101', () => {
  let scope;
  let instance;
  const HTML_REGEXP_PATTERN = /^<html>.*?<\/html>\r?\n?$/s;

  const mocks = (requestUri) => {
    requestUri.should.be.String().and.eql('/');
    return [
      '<html>',
      '<head><title>404 Not Found</title></head>',
      '<body bgcolor="white">',
      '<center><h1>404 Not Found</h1></center>',
      '<hr><center>nginx</center>',
      '</body>',
      '</html>',
      '',
    ].join('\r\n');
  };

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

    scope = nock('https://api.mch.weixin.qq.com')
      .defaultReplyHeaders({
        server: 'Nginx',
        'Content-Type': 'text/html',
      })
      .replyDate();
  });

  describe('DELETE/GET/POST/PUT/PATCH the URI(`/`) resource with the default endpoints', () => {
    it('delete the `root(/)` should got a `404` HTML page', async () => {
      scope.delete('/').reply(404, mocks);
      await instance.delete({ transformResponse: [] }).catch((resp) => {
        resp.response.status.should.be.eql(404);
        resp.response.data.should.be.String().and.match(HTML_REGEXP_PATTERN);
      });
    });

    it('get the `root(/)` should got a `404` HTML page', async () => {
      scope.get('/').reply(404, mocks);
      await instance.get({ transformResponse: [] }).catch((resp) => {
        resp.response.status.should.be.eql(404);
        resp.response.data.should.be.String().and.match(HTML_REGEXP_PATTERN);
      });
    });

    it('post to the `root(/)` should got a `404` HTML page', async () => {
      scope.post('/').reply(404, mocks);
      await instance.post({ hello: 'wechatpay' }, { transformResponse: [] }).catch((resp) => {
        resp.response.status.should.be.eql(404);
        resp.response.data.should.be.String().and.match(HTML_REGEXP_PATTERN);
      });
    });

    it('patch to the `root(/)` should got a `404` HTML page', async () => {
      scope.patch('/').reply(404, mocks);
      await instance.patch({ hello: 'wechatpay' }, { transformResponse: [] }).catch((resp) => {
        resp.response.status.should.be.eql(404);
        resp.response.data.should.be.String().and.match(HTML_REGEXP_PATTERN);
      });
    });

    it('put to the `root(/)` should got a `404` HTML page', async () => {
      scope.put('/').reply(404, mocks);
      await instance.put({ hello: 'wechatpay' }, { transformResponse: [] }).catch((resp) => {
        resp.response.status.should.be.eql(404);
        resp.response.data.should.be.String().and.match(HTML_REGEXP_PATTERN);
      });
    });
  });
});
