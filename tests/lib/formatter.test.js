const { readFileSync } = require('fs');
const { join } = require('path');

const should = require('should');

const Formatter = require('../../lib/formatter');

describe('lib/formatter', () => {
  it('should be class Formatter', () => {
    Formatter.should.be.a.Function().and.have.property('name', 'Formatter');
  });

  describe('Formatter::castCsvBill', () => {
    it('method `castCsvBill` should be static', () => {
      should(Formatter.castCsvBill).be.a.Function();
      should((new Formatter()).castCsvBill).is.Undefined();
    });

    it('method `castCsvBill` should thrown TypeError when none argument given', () => {
      should(() => {
        Formatter.castCsvBill();
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      });
    });

    it('method `castCsvBill` should returns {"rows":[],"summary":{"0":""}} when empty string given', () => {
      Formatter.castCsvBill('').should.be.an.Object().and.have.properties(['rows', 'summary']);
      Formatter.castCsvBill('').should.have.value('rows', []);
      Formatter.castCsvBill('').should.have.value('summary', { 0: '' });
    });

    it('method `castCsvBill` should returns {"rows":[],"summary":{"0":""}} when empty Buffer given', () => {
      Formatter.castCsvBill(Buffer.from('')).should.be.an.Object().and.have.properties(['rows', 'summary']);
      Formatter.castCsvBill(Buffer.from('')).should.have.value('rows', []);
      Formatter.castCsvBill(Buffer.from('')).should.have.value('summary', { 0: '' });
    });

    it('method `castCsvBill` should returns {"rows":[],"summary":{"0":""}} when the utf8 BOM Buffer.from([0xef, 0xbb, 0xbf]) given', () => {
      Formatter.castCsvBill(Buffer.from([0xef, 0xbb, 0xbf])).should.be.an.Object().and.have.properties(['rows', 'summary']);
      Formatter.castCsvBill(Buffer.from([0xef, 0xbb, 0xbf])).should.have.value('rows', []);
      Formatter.castCsvBill(Buffer.from([0xef, 0xbb, 0xbf])).should.have.value('summary', { 0: '' });
    });

    it('method `castCsvBill` should returns current when read the `CSV` from file(sample as `fixtures/bill.ALL.csv`)', () => {
      const buf = readFileSync(join(__dirname, '../fixtures/bill.ALL.csv'));
      const all = Formatter.castCsvBill(buf);

      all.should.be.an.Object().and.have.properties(['rows', 'summary']);
      all.rows.should.be.an.Array().and.have.length(45);
      all.rows[0].should.be.an.Object().and.have.property('交易时间');
      all.summary.should.have.properties(['总交易单数', '应结订单总金额', '退款总金额', '充值券退款总金额', '手续费总金额', '订单总金额', '申请退款总金额']);
      all.summary.should.have.value('总交易单数', '45.0');
    });

    it('method `castCsvBill` should returns current when simulate the `CSV` as String(sample as `fixtures/bill.ALL.csv`)', () => {
      const str = readFileSync(join(__dirname, '../fixtures/bill.ALL.csv')).toString();
      const all = Formatter.castCsvBill(str);

      all.should.be.an.Object().and.have.properties(['rows', 'summary']);
      all.rows.should.be.an.Array().and.have.length(45);
      all.rows[0].should.be.an.Object().and.have.property('交易时间');
      all.summary.should.have.properties(['总交易单数', '应结订单总金额', '退款总金额', '充值券退款总金额', '手续费总金额', '订单总金额', '申请退款总金额']);
      all.summary.should.have.value('总交易单数', '45.0');
    });
  });

  describe('Formatter::castCsvLine', () => {
    it('method `castCsvLine` should be static', () => {
      should(Formatter.castCsvLine).be.a.Function();
      should((new Formatter()).castCsvLine).is.Undefined();
    });

    it('method `castCsvLine` should returns an (not empty) plainObject when none arguments given', () => {
      Formatter.castCsvLine().should.be.Object().and.not.be.empty();
    });

    it('method `castCsvLine` should returns an {"0":"a"} when given "`a"', () => {
      Formatter.castCsvLine('`a').should.be.Object().and.not.be.empty().and.have.properties(['0']).and.have.value('0', 'a');
    });

    it('method `castCsvLine` should returns an {"0":"a","1":"b"} when given "`a,`b"', () => {
      Formatter.castCsvLine('`a,`b').should.be.Object().and.not.be.empty().and.have.properties(['0', '1']);
      Formatter.castCsvLine('`a,`b').should.have.value('0', 'a');
      Formatter.castCsvLine('`a,`b').should.have.value('1', 'b');
    });

    it('method `castCsvLine` should returns an {"Z":"a","Y":"b"} when given ("`a,`b", ["Z","Y"])', () => {
      Formatter.castCsvLine('`a,`b', ['Z', 'Y']).should.be.Object().and.not.be.empty().and.have.properties(['Z', 'Y']);
      Formatter.castCsvLine('`a,`b', ['Z', 'Y']).should.have.value('Z', 'a');
      Formatter.castCsvLine('`a,`b', ['Z', 'Y']).should.have.value('Y', 'b');
    });

    it('method `castCsvLine` should returns an {"Z":"`a","Y":"b"} when given ("`a,`b", ["Z","Y"], false)', () => {
      Formatter.castCsvLine('`a,`b', ['Z', 'Y'], false).should.be.Object().and.not.be.empty().and.have.properties(['Z', 'Y']);
      Formatter.castCsvLine('`a,`b', ['Z', 'Y'], false).should.have.value('Z', '`a');
      Formatter.castCsvLine('`a,`b', ['Z', 'Y'], false).should.have.value('Y', 'b');
    });

    it('method `castCsvLine` should returns an {"Z":"`a","Y":"`b"} when given ("`a,`b", ["Z","Y"], false, \',\')', () => {
      Formatter.castCsvLine('`a,`b', ['Z', 'Y'], false, ',').should.be.Object().and.not.be.empty().and.have.properties(['Z', 'Y']);
      Formatter.castCsvLine('`a,`b', ['Z', 'Y'], false, ',').should.have.value('Z', '`a');
      Formatter.castCsvLine('`a,`b', ['Z', 'Y'], false, ',').should.have.value('Y', '`b');
    });
  });

  describe('Formatter::nonce', () => {
    it('method `nonce` should be static', () => {
      should(Formatter.nonce).be.a.Function();
      should((new Formatter()).nonce).is.Undefined();
    });

    it('method `nonce` should returns a string and have default `size=32`', () => {
      Formatter.nonce().should.be.a.String().and.have.length(32);
      Formatter.nonce(undefined).should.be.a.String().and.have.length(32);
    });

    it('method `nonce` should returns a string and given size inputs to `16`', () => {
      Formatter.nonce(16).should.be.a.String().and.have.length(16);
    });

    it('method `nonce` should returns a string which match to `/[0-9a-zA-Z]{32}/` and not cantain any other chars', () => {
      Formatter.nonce().should.be.a.String().match(/[0-9a-zA-Z]{32}/).not.match(/[$#%^&~<>+-]/);
    });
  });

  describe('Formatter::timestamp', () => {
    it('method `timestamp` should be static', () => {
      should(Formatter.timestamp).be.a.Function();
      should((new Formatter()).timestamp).is.Undefined();
    });

    it('method `timestamp` should returns a number and `toString` length of `10`', () => {
      Formatter.timestamp().should.be.a.Number().and.not.be.Infinity();
      Formatter.timestamp().toString().should.be.length(10);
    });
  });

  describe('Formatter::authorization', () => {
    it('method `authorization` should be static', () => {
      should(Formatter.authorization).be.a.Function();
      should((new Formatter()).authorization).is.Undefined();
    });

    it('method `authorization` should returns a string, start with `WECHATPAY2-SHA256-RSA2048` and end with " char(ASCII 34)', () => {
      Formatter.authorization().should.be.a.String().startWith('WECHATPAY2-SHA256-RSA2048').and.endWith('"');
      Formatter.authorization().substr(-1).charCodeAt().should.equal(34);
    });

    it('method `authorization(1,2,3,4,5)` should returns a string, and filled as `1,2,3,4,5`', () => {
      Formatter.authorization(1, 2, 3, 4, 5).should.be.a.String()
        .and.startWith('WECHATPAY2-SHA256-RSA2048')
        .and.endWith('"')
        .and.match(/ mchid="1"/)
        .and.match(/,nonce_str="2"/)
        .and.match(/,signature="3"/)
        .and.match(/,timestamp="4"/)
        .and.match(/,serial_no="5"/)
        .and.equal('WECHATPAY2-SHA256-RSA2048 mchid="1",serial_no="5",timestamp="4",nonce_str="2",signature="3"');
    });
  });

  describe('Formatter::request', () => {
    it('method `request` should be static', () => {
      should(Formatter.request).be.a.Function();
      should((new Formatter()).request).is.Undefined();
    });

    it('method `request` should returns a string which is end with LF(ASCII 10)', () => {
      Formatter.request().should.be.a.String().endWith('\n');
      Formatter.request().substr(-1).charCodeAt().should.equal(10);
    });

    it('method `request(1,2,3,4,5)` should returns a string, and filled as `1LF2LF3LF4LF5LF`', () => {
      Formatter.request(1, 2, 3, 4, 5).should.be.a.String()
        /* eslint-disable-next-line quotes */
        .equal("1\n2\n3\n4\n5\n")
        .and.startWith('1')
        .and.endWith('\n');
    });

    it('method `request(6,7,8,9)` should accept last empty optional argument and return a string, and filled as `6LF7LF8LF9LFLF`', () => {
      Formatter.request(6, 7, 8, 9).should.be.a.String()
        /* eslint-disable-next-line quotes */
        .equal("6\n7\n8\n9\n\n")
        .and.startWith('6')
        .and.endWith('\n');
      Formatter.request(6, 7, 8, 9).substr(-2).should.equal('\n\n');
    });
  });

  describe('Formatter::response', () => {
    it('method `response` should be static', () => {
      should(Formatter.response).be.a.Function();
      should((new Formatter()).response).is.Undefined();
    });

    it('method `response` should returns a string which is end with LF(ASCII 10)', () => {
      Formatter.response().should.be.a.String().endWith('\n');
      Formatter.response().substr(-1).charCodeAt().should.equal(10);
    });

    it('method `response(3,2,1)` should returns a string, and filled as `3LF2LF1LF`', () => {
      Formatter.response(3, 2, 1).should.be.a.String()
        /* eslint-disable-next-line quotes */
        .equal("3\n2\n1\n")
        .and.startWith('3')
        .and.endWith('\n');
    });

    it('method `response(9,8)` should accept last empty optional argument and return a string, and filled as `9LF8LFLF`', () => {
      Formatter.response(9, 8).should.be.a.String()
        /* eslint-disable-next-line quotes */
        .equal("9\n8\n\n")
        .and.startWith('9')
        .and.endWith('\n');
      Formatter.response(9, 8).substr(-2).should.equal('\n\n');
    });
  });

  describe('Formatter::joinedByLineFeed', () => {
    it('method `joinedByLineFeed` should be static', () => {
      should(Formatter.joinedByLineFeed).be.a.Function();
      should((new Formatter()).joinedByLineFeed).is.Undefined();
    });

    it('method `joinedByLineFeed` should returns a string which is end with LF(ASCII 10)', () => {
      Formatter.joinedByLineFeed('').should.be.a.String().endWith('\n');
      Formatter.joinedByLineFeed('').substr(-1).charCodeAt().should.equal(10);
    });

    it('method `joinedByLineFeed(a,b,c,d,e,f,g)` should returns a string, and filled as `aLFbLFcLFdLFeLFfLFgLF`', () => {
      Formatter.joinedByLineFeed('a', 'b', 'c', 'd', 'e', 'f', 'g').should.be.a.String()
        /* eslint-disable-next-line quotes */
        .equal(`a\nb\nc\nd\ne\nf\ng\n`)
        .and.startWith('a')
        .and.endWith('\n');
    });
  });

  describe('Formatter::ksort', () => {
    it('method `ksort` should be static', () => {
      should(Formatter.ksort).be.a.Function();
      should((new Formatter()).ksort).is.Undefined();
    });

    it('method `ksort({b: 1, a: 0})` should returns an object and deepEqual to {a: 0, b: 1}', () => {
      Formatter.ksort({ b: 1, a: 0 }).should.be.an.instanceOf(Object).and.have.properties(['a', 'b']);
      Formatter.ksort({ b: 1, a: 0 }).should.deepEqual({ a: 0, b: 1 });
    });
  });

  describe('Formatter::queryStringLike', () => {
    it('method `queryStringLike` should be static', () => {
      should(Formatter.queryStringLike).be.a.Function();
      should((new Formatter()).queryStringLike).is.Undefined();
    });

    it('method `queryStringLike({appid: 3, mchid: 2, openid: \'\', sign: 0})` should returns a string and equal to `appid=3&mchid=2`', () => {
      Formatter.queryStringLike({
        appid: 3, mchid: 2, openid: '', sign: 0,
      }).should.be.a.String();
      Formatter.queryStringLike({
        appid: 3, mchid: 2, openid: '', sign: 0,
      }).should.equal('appid=3&mchid=2');
    });
  });
});
