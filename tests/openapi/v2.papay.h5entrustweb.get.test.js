require('should');
const nock = require('nock');

const { Wechatpay } = require('../..');

describe('v2/papay/h5entrustweb', () => {
  let scope;
  let instance;

  const mocks = (requestUri) => {
    requestUri.should.be.String().and.match(/^\/papay\/h5entrustweb\?mch_id=101&nonce_str=[A-Za-z0-9]{32}&sign=[A-Z0-9]{32}$/);
    return [
      '<xml>',
      '<return_code>SUCCESS</return_code>',
      '<result_code>SUCCESS</result_code>',
      '<redirect_url>http://weixin.qq.com/</redirect_url>',
      '</xml>',
    ].join('');
  };

  beforeEach(() => {
    instance = new Wechatpay({
      mchid: '101',
      serial: 'nop',
      privateKey: '',
      certs: { any: '' },
    });

    scope = nock('https://api.mch.weixin.qq.com')
      .defaultReplyHeaders({
        server: 'Nginx',
        'Content-Type': 'text/xml',
      })
      .replyDate();
  });

  describe('GET `v2/papay/h5entrustweb`', () => {
    it('GET the `v2/papay/h5entrustweb` should be a `200` response', async () => {
      scope.get((uri) => uri.startsWith('/papay/h5entrustweb')).reply(200, mocks);
      await instance['v2/papay/h5entrustweb'].get({ params: { mch_id: '101' } }).then((res) => {
        res.should.be.an.Object().and.have.keys('headers', 'data');
        res.data.should.be.an.Object().and.have.keys('return_code', 'result_code', 'redirect_url');
      });
    });
  });
});
