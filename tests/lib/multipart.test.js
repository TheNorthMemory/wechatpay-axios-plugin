const should = require('should');

const Multipart = require('../../lib/multipart');

const { FormData } = Multipart;

describe('lib/multipart', () => {
  it('default should be class `FormData`', () => {
    should(FormData).be.a.Function().and.have.property('name', 'FormData');
  });

  it('FormData.Multipart should be class `Multipart`', () => {
    should(Multipart).be.a.Function().and.have.property('name', 'Multipart');
  });

  describe('new Multipart', () => {
    it('should instanceOf FormData and have properties `data` and `indices`', () => {
      (new Multipart()).should.be.instanceOf(Multipart).and.have.properties('data', 'indices');
    });

    it('The `mimeTypes` property should be there and only allowed append(cannot deleted)', () => {
      should(Multipart.mimeTypes).be.Undefined();

      const form = new Multipart();

      form.mimeTypes.should.be.Object()
        .and.have.keys('bmp', 'gif', 'png', 'jpg', 'jpe', 'jpeg', 'mp4', 'mpeg', 'json');

      should(delete form.mimeTypes).be.False();

      form.mimeTypes = { any: 'mock' };
      form.mimeTypes.should.be.Object()
        .and.have.keys('any')
        .and.not.have.keys('bmp', 'json')
        .and.have.property('any', 'mock');
    });

    it('The `dashDash` Buffer property should be there and cannot be deleted/modified', () => {
      should(Multipart.dashDash).be.Undefined();

      const form = new Multipart();

      form.dashDash.should.not.Undefined().and.be.instanceOf(Buffer).and.have.length(2);

      should(delete form.dashDash).be.False();
      Buffer.compare(form.dashDash, Buffer.from('--')).should.be.equal(0);

      const buf = Buffer.alloc(2);

      form.dashDash = buf;
      Buffer.compare(form.dashDash, buf).should.be.equal(1);
    });

    it('The `boundary` Buffer property should be there and cannot be deleted/modified', () => {
      should(Multipart.boundary).be.Undefined();

      const form = new Multipart();

      form.boundary.should.not.Undefined()
        .and.be.instanceOf(Buffer)
        .and.have.length(50);

      should(delete form.boundary).be.False();

      const buf = Buffer.alloc(50);

      form.boundary = buf;
      Buffer.compare(form.boundary, buf).should.be.equal(1);
    });

    it('The `CRLF` Buffer property should be there and cannot be deleted/modified', () => {
      should(Multipart.CRLF).be.Undefined();

      const form = new Multipart();

      form.CRLF.should.not.Undefined()
        .and.be.instanceOf(Buffer)
        .and.have.length(2);

      should(delete form.CRLF).be.False();
      Buffer.compare(form.CRLF, Buffer.from('\r\n')).should.be.equal(0);

      const buf = Buffer.alloc(2);

      form.CRLF = buf;
      Buffer.compare(form.CRLF, buf).should.be.equal(1);
    });

    it('The `data` property should be instanceOf Array and cannot deleted', () => {
      should(Multipart.data).be.Undefined();

      const form = new Multipart();

      form.data.should.be.instanceOf(Array);
      should(delete form.data).be.False();
    });

    it('The `indices` property should be instanceOf Object and cannot deleted', () => {
      should(Multipart.indices).be.Undefined();

      const form = new Multipart();

      form.indices.should.be.instanceOf(Object);
      should(delete form.indices).be.False();
    });

    it('Method `getBuffer()` should returns a Buffer instance and had 0 length default', () => {
      should(Multipart.getBuffer).be.Undefined();
      should(() => Multipart.getBuffer()).throw(TypeError);

      const form = new Multipart();

      form.getBuffer().should.be.instanceOf(Buffer).and.have.length(0);
    });

    it('Method `getHeaders()` should returns a Object[`Content-type`] with `multipart/form-data; boundary=`', () => {
      should(Multipart.getHeaders).be.Undefined();
      should(() => Multipart.getHeaders()).throw(TypeError);

      const form = new Multipart();

      form.getHeaders().should.be.Object()
        .and.have.keys('Content-Type');

      should(form.getHeaders()['Content-Type']).be.a.String()
        .and.match(/^multipart\/form-data; boundary=/);
    });

    it('Method `appendMimeTypes()` should returns the Multipart instance', () => {
      should(() => Multipart.appendMimeTypes()).throw(TypeError);

      const form = new Multipart();

      form.appendMimeTypes().should.be.instanceOf(Multipart);
    });

    it('Method `appendMimeTypes({any: \'mock\'})` should returns the Multipart instance, and affected `form.data` property', () => {
      should(() => Multipart.appendMimeTypes({ any: 'mock' })).throw(TypeError);

      const form = new Multipart();

      form.appendMimeTypes({ any: 'mock' }).should.be.instanceOf(Multipart);
      form.mimeTypes.should.be.instanceOf(Object)
        .and.have.keys('bmp', 'gif', 'png', 'jpg', 'jpe', 'jpeg', 'mp4', 'mpeg', 'json', 'any')
        .and.have.property('any', 'mock');
    });

    it('Method `append()` should returns the Multipart instance, and affected `form.data` property', () => {
      should(() => Multipart.append()).throw(TypeError);

      const form = new Multipart();
      const defaults = form.data.slice();

      form.append().should.be.instanceOf(Multipart);
      const previous = form.data.slice();

      form.append();
      const current = form.data.slice();

      form.append();
      const nextone = form.data.slice();

      defaults.should.be.Array().and.have.length(0);
      previous.should.be.Array().and.have.length(1 * 10 + 4);
      current.should.be.Array().and.have.length(2 * 10 + 4);
      nextone.should.be.Array().and.have.length(3 * 10 + 4);
    });

    it('Method `append()` should append name="undefined" disposition onto the `form.data` property', () => {
      should(() => Multipart.append()).throw(TypeError);

      const form = new Multipart();

      form.append().should.be.instanceOf(Multipart);
      should(Buffer.concat(form.data).toString()).be.String()
        .and.match(/^---{26}[0-9]{24}\r\n/)
        .and.match(/Content-Disposition.*/)
        .and.match(/name="undefined"/)
        .and.match(/---{26}[0-9]{24}--\r\n$/);

      should(form.getBuffer().toString()).be.String()
        .and.match(/^---{26}[0-9]{24}\r\n/)
        .and.match(/Content-Disposition.*/)
        .and.match(/name="undefined"/)
        .and.match(/---{26}[0-9]{24}--\r\n$/);
    });

    it('Method `append({}, 1)` should append name="[object Object]" disposition onto the `form.data` property', () => {
      should(() => Multipart.append()).throw(TypeError);

      const form = new Multipart();

      form.append({}, 1).should.be.instanceOf(Multipart);
      should(Buffer.concat(form.data).toString()).be.String()
        .and.match(/^---{26}[0-9]{24}\r\n/)
        .and.match(/Content-Disposition.*/)
        .and.match(/name="\[object Object\]"/)
        .and.match(/---{26}[0-9]{24}--\r\n$/);

      should(form.getBuffer().toString()).be.String()
        .and.match(/^---{26}[0-9]{24}\r\n/)
        .and.match(/Content-Disposition.*/)
        .and.match(/name="\[object Object\]"/)
        .and.match(/---{26}[0-9]{24}--\r\n$/);
    });

    it('Method `append(\'meta\', JSON.stringify({}), \'meta.json\')` should append a `Content-Type: application/json` onto the `form.data` property', () => {
      should(() => Multipart.append()).throw(TypeError);

      const form = new Multipart();

      form.append('meta', JSON.stringify({}), 'meta.json').should.be.instanceOf(Multipart);
      should(Buffer.concat(form.data).toString()).be.String()
        .and.match(/^---{26}[0-9]{24}\r\n/)
        .and.match(/Content-Disposition.*/)
        .and.match(/name="meta"/)
        .and.match(/Content-Type: application\/json/)
        .and.match(/---{26}[0-9]{24}--\r\n$/);

      should(form.getBuffer().toString()).be.String()
        .and.match(/^---{26}[0-9]{24}\r\n/)
        .and.match(/Content-Disposition.*/)
        .and.match(/name="meta"/)
        .and.match(/Content-Type: application\/json/)
        .and.match(/---{26}[0-9]{24}--\r\n$/);
    });

    it('Method `append(\'image_content\', '
      + 'Buffer.from(\'R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==\', \'base64\'), \'demo.gif\')`'
      + ' should append a `Content-Type: image/gif` onto the `form.data` property', () => {
      const form = new Multipart();
      const buf = Buffer.from('R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==', 'base64');
      const filename = 'demo.gif';

      form.append('image_content', buf, filename).should.be.instanceOf(Multipart);

      should(Buffer.concat(form.data).toString()).be.String()
        .and.match(/^---{26}[0-9]{24}\r\n/)
        .and.match(new RegExp(`Content-Disposition:.*?filename="${filename}`))
        .and.match(/name="image_content"/)
        .and.match(/Content-Type: image\/gif/)
        .and.match(/---{26}[0-9]{24}--\r\n$/);

      should(form.getBuffer().toString()).be.String()
        .and.match(/^---{26}[0-9]{24}\r\n/)
        .and.match(new RegExp(`Content-Disposition:.*?filename="${filename}`))
        .and.match(/name="image_content"/)
        .and.match(/Content-Type: image\/gif/)
        .and.match(/---{26}[0-9]{24}--\r\n$/);

      should(Buffer.compare(form.get('image_content'), buf)).be.equal(0);
    });
  });
});
