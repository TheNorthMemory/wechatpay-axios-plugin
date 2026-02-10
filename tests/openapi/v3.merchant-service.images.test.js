const { join } = require('path');
const fs = require('fs');
const should = require('should');
const nock = require('nock');
const {
  Wechatpay, Rsa, Formatter, Hash,
} = require('../..');

const privateKey = Rsa.from(fs.readFileSync(join(__dirname, '../fixtures/apiclient_key.pem')), Rsa.KEY_TYPE_PRIVATE);
const mockPubkey = Rsa.from(fs.readFileSync(join(__dirname, '../fixtures/apiserver_cert.pem')), Rsa.KEY_TYPE_PUBLIC);

describe('v3/merchant-service/images/[upload|{media_id}]', () => {
  let scope;
  let instance;

  function basisServerSideBehavior(headers = {}) {
    should(headers).be.an.Object().and.have.keys('accept', 'authorization', 'content-type', 'user-agent');
    should(headers.accept).be.a.String().and.match(/application\/json/);
    should(headers.authorization).be.a.String().and.match(/^WECHATPAY2-SHA256-RSA2048\s\w+/);
    should(headers['user-agent']).be.a.String().and.match(/\w+/);
  }
  const mockUploadingBehavior = () => {
    const msg = '{"media_id":"file752398_7983424"}';
    const nonce = Formatter.nonce();
    const timestamp = Formatter.timestamp();

    return [
      function mockServerSideUploadingBehavior(requestUri, requestBody) {
        requestUri.should.be.String().and.eql('/v3/merchant-service/images/upload');

        basisServerSideBehavior(this.req.headers);
        should(this.req.headers['content-type']).be.a.String().and.match(/^multipart\/form-data;\s?\w+/);

        const boundary = this.req.headers['content-type'].slice(this.req.headers['content-type'].indexOf('boundary=') + 10);
        should(requestBody).be.a.String().and.match(new RegExp(boundary));

        return msg;
      },
      {
        'Wechatpay-Nonce': nonce,
        'Wechatpay-Serial': 'BE2A2344B984167B',
        'Wechatpay-Timestamp': timestamp,
        'Wechatpay-Signature': Rsa.sign(Formatter.response(timestamp, nonce, msg), privateKey),
        'Content-Type': 'application/json',
      },
    ];
  };
  const mockDownloadingBehavior = () => [
    function mockServerSideDownloadingBehavior(requestUri) {
      requestUri.should.be.String().and.match(/^\/v3\/merchant-service\/images\/(?!upload){6,}/);

      basisServerSideBehavior(this.req.headers);

      return Buffer.from('R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==', 'base64');
    },
    {
      'Content-Type': 'image/gif',
    },
  ];

  beforeEach(() => {
    instance = new Wechatpay({
      mchid: '101',
      serial: '898DBAD30F416EC7',
      privateKey,
      certs: { BE2A2344B984167B: mockPubkey },
    });

    scope = nock('https://api.mch.weixin.qq.com/')
      .defaultReplyHeaders({
        server: 'Nginx',
      })
      .replyDate();
  });

  describe('POST `v3/merchant-service/images/upload`', () => {
    it('POST the `v3/merchant-service/images/upload` should be a `200` response', async () => {
      scope.post((uri) => uri.startsWith('/v3/merchant-service/images/upload')).reply(200, ...mockUploadingBehavior());

      const filename = 'README.md';
      const filepath = join(__dirname, '../fixtures/README.md');
      const sha256 = Hash.sha256(fs.readFileSync(filepath));

      await instance.chain('v3/merchant-service/images/upload').post({
        meta: JSON.stringify({ filename, sha256 }),
        file: fs.createReadStream(filepath),
      }, {
        meta: { filename, sha256 },
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then((res) => {
        res.should.be.an.Object().and.have.keys('headers', 'data');
        res.data.should.be.an.Object().and.have.keys('media_id');
      });
    });
  });

  describe('GET `v3/merchant-service/images/{media_id}`', () => {
    it('GET the `v3/merchant-service/images/{media_id}` should be a `200` response', async () => {
      scope.get((uri) => uri.match(/^\/v3\/merchant-service\/images\/(?!upload){6,}/)).reply(200, ...mockDownloadingBehavior());

      await instance.chain('v3/merchant-service/images/{media_id}').get({
        media_id: 'ChsyMDAyMDA1MjAyMTA3MjIxNzAwMDAxMzIwNzIYACD%2B9I6IBigBMAE4AQ==',
      }).then((res) => {
        res.should.be.an.Object().and.have.keys('headers', 'data');
        res.headers['content-type'].should.be.a.String().and.match(/image\/(?:png|gif|jpe?g)/);
      });
    });
  });
});
