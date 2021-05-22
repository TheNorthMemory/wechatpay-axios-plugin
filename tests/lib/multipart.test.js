const {
  existsSync, unlinkSync, readFileSync, createWriteStream,
} = require('fs');

const should = require('should');

const Multipart = require('../../lib/multipart');

const { FormData } = Multipart;

describe('lib/multipart', () => {
  it('default should be class `Multipart`', () => {
    should(Multipart).be.a.Function().and.have.property('name', 'Multipart');
  });

  it('Multipart.FormData should be class `FormData`', () => {
    should(FormData).be.a.Function().and.have.property('name', 'FormData');
  });

  describe('new Multipart', () => {
    it('should instanceOf Multipart and have properties `data` and `indices`', () => {
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

    it('The `EMPTY` Buffer property should be there and cannot be deleted/modified', () => {
      should(Multipart.EMPTY).be.Undefined();

      const form = new Multipart();

      form.EMPTY.should.not.Undefined()
        .and.be.instanceOf(Buffer)
        .and.have.length(0);

      should(delete form.EMPTY).be.False();

      const buf = Buffer.alloc(0);
      Buffer.compare(form.EMPTY, buf).should.be.equal(0);

      form.EMPTY = buf;
      Buffer.compare(form.EMPTY, buf).should.be.equal(0);
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
  });

  describe('Multipart[Symbol.toStringTag]', () => {
    it('`[Symbol.toStringTag]` on the Multipart class should returns `FormData` string', () => {
      should(Multipart[Symbol.toStringTag]).be.String().and.eql('FormData');
    });

    it('`[Symbol.toStringTag]` on the Multipart instance should returns `FormData` string', () => {
      const form = new Multipart();
      should(form[Symbol.toStringTag]).be.String().and.eql('FormData');
    });
  });

  describe('Multipart::getBuffer', () => {
    it('Method `getBuffer()` should returns a Buffer instance and had 0 length default', () => {
      should(Multipart.getBuffer).be.Undefined();
      should(() => Multipart.getBuffer()).throw(TypeError);

      const form = new Multipart();

      form.getBuffer().should.be.instanceOf(Buffer).and.have.length(0);
    });
  });

  describe('Multipart::getHeaders', () => {
    it('Method `getHeaders()` should returns a Object[`Content-type`] with `multipart/form-data; boundary=`', () => {
      should(Multipart.getHeaders).be.Undefined();
      should(() => Multipart.getHeaders()).throw(TypeError);

      const form = new Multipart();

      form.getHeaders().should.be.Object()
        .and.have.keys('Content-Type');

      should(form.getHeaders()['Content-Type']).be.a.String()
        .and.match(/^multipart\/form-data; boundary=/);
    });
  });

  describe('Multipart::appendMimeTypes', () => {
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
  });

  describe('Multipart::formed', () => {
    it('Method `formed()` should returns an Array which has fixed length of 6 and first filled with a `Content-Disposition` info', () => {
      should(() => Multipart.formed()).throw(TypeError);

      const form = new Multipart();

      form.formed().should.be.an.Array().and.have.length(6);
      form.formed().every((i) => i.should.be.instanceOf(Buffer));
      Buffer.from('Content-Disposition:').compare(form.formed()[0], 0, 20).should.equal(0);
    });
  });

  describe('Multipart::append', () => {
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
      should(() => Multipart.append()).throw(TypeError);

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

  describe('Multipart::set', () => {
    it('Method `set()` should append name="undefined" disposition onto the `form.data` property', () => {
      should(() => Multipart.set()).throw(TypeError);

      const form = new Multipart();

      form.set().should.be.instanceOf(Multipart);
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
  });

  describe('Multipart::delete', () => {
    it('Method `delete(undefined)` should removed the name="undefined" disposition from the `form.data` property', () => {
      should(() => Multipart.delete()).throw(TypeError);

      const form = new Multipart();

      form.data.should.be.length(0);
      form.set().should.be.instanceOf(Multipart);
      form.data.should.be.length(14);
      form.delete(undefined).should.be.instanceOf(Multipart);
      form.data.should.be.length(0);
      form.set().set().data.should.be.length(14);
      form.delete(undefined).data.should.be.length(0);
      form.append().append().data.should.be.length(24);
      form.delete(undefined).data.should.be.length(0);
    });
  });

  describe('Multipart::get', () => {
    it('Method `get()` should returns undefined while none named value append/set', () => {
      should(() => Multipart.get()).throw(TypeError);

      const form = new Multipart();
      should(form.get()).be.Undefined();
      should(form.set().get()).be.not.Undefined();
    });

    it('Method `get()` should returns a Buffer which equal to Buffer.from("undefined")', () => {
      should(() => Multipart.get()).throw(TypeError);

      const form = new Multipart();
      form.set().data.should.be.length(14);
      form.get().should.be.instanceOf(Buffer);
      form.get().compare(Buffer.from('undefined')).should.be.equal(0);
    });
  });

  describe('Multipart::getAll', () => {
    it('Method `getAll()` should returns an Array which equal [Buffer.from("undefined")[]]', () => {
      should(() => Multipart.getAll()).throw(TypeError);

      const form = new Multipart();
      form.getAll().should.be.Array().and.have.length(0);
      form.set().data.should.be.length(14);
      form.getAll().should.be.Array().and.have.length(1);
      form.getAll().should.be.eql([Buffer.from('undefined')]);
      form.append().data.should.be.length(24);
      form.getAll().should.be.Array().and.have.length(2);
      form.getAll().should.be.eql([Buffer.from('undefined'), Buffer.from('undefined')]);
    });
  });

  describe('Multipart::has', () => {
    it('Method `has()` should returns an Boolean False and may True after set/append method(s) was executed', () => {
      should(() => Multipart.has()).throw(TypeError);

      const form = new Multipart();
      form.has().should.be.Boolean().and.be.False();
      form.set().data.should.be.length(14);
      form.has().should.be.Boolean().and.be.True();
    });
  });

  describe('Multipart::entries', () => {
    it('Method `entries()` should returns an Iterator', () => {
      should(() => Multipart.entries()).throw(TypeError);

      const form = new Multipart();
      form.entries().toString().should.be.eql('[object Array Iterator]');
      form.set().data.should.be.length(14);
      Array.from(form.entries()).should.be.Array().and.eql([[undefined, Buffer.from('undefined')]]);
    });
  });

  describe('Multipart::keys', () => {
    it('Method `keys()` should returns an Iterator', () => {
      should(() => Multipart.keys()).throw(TypeError);

      const form = new Multipart();
      form.keys().toString().should.be.eql('[object Array Iterator]');
      form.set().data.should.be.length(14);
      Array.from(form.keys()).should.be.Array().and.eql([undefined]);
    });
  });

  describe('Multipart::values', () => {
    it('Method `values()` should returns an Iterator', () => {
      should(() => Multipart.values()).throw(TypeError);

      const form = new Multipart();
      form.values().toString().should.be.eql('[object Array Iterator]');
      form.set().data.should.be.length(14);
      Array.from(form.values()).should.be.Array().and.eql([Buffer.from('undefined')]);
    });
  });

  describe('Multipart::toJSON', () => {
    it('Method `toJSON()` should returns an Object or null while there wasnot `meta` set/append', () => {
      should(() => Multipart.toJSON()).throw(TypeError);

      const form = new Multipart();
      should(form.toJSON()).be.Null();
      form.set('meta', JSON.stringify({})).data.should.be.length(14);
      form.has('meta').should.be.True();
      form.get('meta').should.be.instanceOf(Buffer).and.eql(Buffer.from('{}'));
      form.toJSON().should.be.Object().and.eql({});
      JSON.stringify(form).should.be.String().and.eql('{}');
    });
  });

  describe('Multipart::toString', () => {
    it('Method `toString()` should returns `[object FormData]` string', () => {
      Object.prototype.toString.call(Multipart).should.be.String().and.equal('[object FormData]');

      const form = new Multipart();
      Object.prototype.toString.call(form).should.be.String().and.equal('[object FormData]');
    });

    it('literal template operation on a Multipart instance should returns `[object FormData]` string', () => {
      const form = new Multipart();
      should(`${form}`).be.String().and.eql('[object FormData]');
    });
  });

  describe('Multipart::flowing', () => {
    it('Method `flowing()` should returns a Promise', () => {
      should(() => Multipart.flowing()).throw(TypeError);

      const form = new Multipart();
      form.flowing().should.be.Promise();
      form.flowing().then((i) => i.should.be.instanceOf(Multipart));
    });
  });

  describe('Multipart::pipe', () => {
    it('Method `pipe(WriteStream)` should writen the form.data, and emitted an `finish` event', () => {
      should(() => Multipart.pipe()).throw(TypeError);

      const file = './multipart.pipe.test.log';
      if (existsSync(file)) {
        try { unlinkSync(file); } catch (e) { /* noop */ }
      }

      const fd = createWriteStream(file);
      const form = new Multipart();

      fd.on('pipe', (source) => source.should.be.instanceOf(Multipart));
      fd.on('finish', () => {
        readFileSync(file).should.eql(form.getBuffer());
        try { unlinkSync(file); } catch (e) { /* noop */ }
      });

      form.set().pipe(fd);
    });
  });

  describe('Multipart.FormData', () => {
    it('The Multipart.FormData should be class or Function, which\'s named as `FormData`', () => {
      should(Multipart.FormData).be.a.Function().and.have.property('name', 'FormData');
    });

    it('`[Symbol.toStringTag]` on the Multipart.FormData class/Function should returns `FormData` string', () => {
      should(Multipart.FormData[Symbol.toStringTag]).be.String().and.eql('FormData');
    });

    it('`[Symbol.toStringTag]` on the Multipart.FormData instance should returns `FormData` string', () => {
      const form = new Multipart.FormData();
      should(form[Symbol.toStringTag]).be.String().and.eql('FormData');
    });
  });
});
