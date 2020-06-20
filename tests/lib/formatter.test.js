const should = require('should')

const fmt = require('../../lib/formatter')

describe('lib/formatter', () => {
  it('should be class Formatter', () => {
    fmt.should.be.a.Function().and.have.property('name', 'Formatter')
  })

  describe('Formatter::castCsvBill', () => {
    it('method `castCsvBill` should be static', () => {
      should(fmt.castCsvBill).be.a.Function()
      should((new fmt).castCsvBill).is.Undefined()
    })
  })

  describe('Formatter::castCsvLine', () => {
    it('method `castCsvLine` should be static', () => {
      should(fmt.castCsvLine).be.a.Function()
      should((new fmt).castCsvLine).is.Undefined()
    })
  })

  describe('Formatter::nonce', () => {
    it('method `nonce` should be static', () => {
      should(fmt.nonce).be.a.Function()
      should((new fmt).nonce).is.Undefined()
    })

    it('method `nonce` should returns a string and have default `size=32`', () => {
      fmt.nonce().should.be.a.String().and.have.length(32)
      fmt.nonce(undefined).should.be.a.String().and.have.length(32)
    })

    it('method `nonce` should returns a string and given size inputs to `16`', () => {
      fmt.nonce(16).should.be.a.String().and.have.length(16)
    })

    it('method `nonce` should returns a string which match to `/[0-9a-zA-Z]{32}/` and not cantain any other chars', () => {
      fmt.nonce().should.be.a.String().match(/[0-9a-zA-Z]{32}/).not.match(/[$#%^&\*~'"\/<>+-]/)
    })
  })

  describe('Formatter::timestamp', () => {
    it('method `timestamp` should be static', () => {
      should(fmt.timestamp).be.a.Function()
      should((new fmt).timestamp).is.Undefined()
    })

    it('method `timestamp` should returns a number and `toString` length of `10`', () => {
      fmt.timestamp().should.be.a.Number().and.not.be.Infinity()
      fmt.timestamp().toString().should.be.length(10)
    })
  })

  describe('Formatter::authorization', () => {
    it('method `authorization` should be static', () => {
      should(fmt.authorization).be.a.Function()
      should((new fmt).authorization).is.Undefined()
    })

    it('method `authorization` should returns a string, start with `WECHATPAY2-SHA256-RSA2048` and end with " char(ASCII 34)', () => {
      fmt.authorization().should.be.a.String().startWith('WECHATPAY2-SHA256-RSA2048').and.endWith('"')
      fmt.authorization().substr(-1).charCodeAt().should.equal(34)
    })

    it('method `authorization(1,2,3,4,5)` should returns a string, and filled as `1,2,3,4,5`', () => {
      fmt.authorization(1,2,3,4,5).should.be.a.String()
        .and.startWith('WECHATPAY2-SHA256-RSA2048')
        .and.endWith('"')
        .and.match(/ mchid="1"/)
        .and.match(/,nonce_str="2"/)
        .and.match(/,signature="3"/)
        .and.match(/,timestamp="4"/)
        .and.match(/,serial_no="5"/)
        .and.equal('WECHATPAY2-SHA256-RSA2048 mchid="1",nonce_str="2",signature="3",timestamp="4",serial_no="5"')
    })
  })

  describe('Formatter::request', () => {
    it('method `request` should be static', () => {
      should(fmt.request).be.a.Function()
      should((new fmt).request).is.Undefined()
    })

    it('method `request` should returns a string which is end with LF(ASCII 10)', () => {
      fmt.request().should.be.a.String().endWith(`\n`)
      fmt.request().substr(-1).charCodeAt().should.equal(10)
    })

    it('method `request(1,2,3,4,5)` should returns a string, and filled as `1LF2LF3LF4LF5LF`', () => {
      fmt.request(1,2,3,4,5).should.be.a.String()
        .equal("1\n2\n3\n4\n5\n")
        .and.startWith('1')
        .and.endWith("\n")
    })

    it('method `request(6,7,8,9)` should accept last empty optional argument and return a string, and filled as `6LF7LF8LF9LFLF`', () => {
      fmt.request(6,7,8,9).should.be.a.String()
        .equal("6\n7\n8\n\9\n\n")
        .and.startWith('6')
        .and.endWith("\n")
      fmt.request(6,7,8,9).substr(-2).should.equal("\n\n")
    })
  })

  describe('Formatter::response', () => {
    it('method `response` should be static', () => {
      should(fmt.response).be.a.Function()
      should((new fmt).response).is.Undefined()
    })

    it('method `response` should returns a string which is end with LF(ASCII 10)', () => {
      fmt.response().should.be.a.String().endWith(`\n`)
      fmt.response().substr(-1).charCodeAt().should.equal(10)
    })

    it('method `response(3,2,1)` should returns a string, and filled as `3LF2LF1LF`', () => {
      fmt.response(3,2,1).should.be.a.String()
        .equal("3\n2\n1\n")
        .and.startWith('3')
        .and.endWith("\n")
    })

    it('method `response(9,8)` should accept last empty optional argument and return a string, and filled as `9LF8LFLF`', () => {
      fmt.response(9,8).should.be.a.String()
        .equal("\9\n8\n\n")
        .and.startWith('9')
        .and.endWith("\n")
      fmt.response(9,8).substr(-2).should.equal("\n\n")
    })
  })
})
