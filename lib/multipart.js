const { extname } = require('path');
const { Readable } = require('stream');
const { ReadStream } = require('fs');

const { iterator, toStringTag } = Symbol;

/**
 * Simple and lite of `multipart/form-data` implementation, most similar to `form-data`.
 *
 * @since v0.7.0
 * @example
 * (new Multipart())
 *   .append('a', 1)
 *   .append('b', '2')
 *   .append('c', Buffer.from('31'))
 *   .append('d', JSON.stringify({}), 'any.json')
 *   .append('e', require('fs').readFileSync('/path/your/file.jpg'), 'file.jpg')
 *   .append('f', require('fs').createReadStream('/path/your/file2.jpg'), 'file2.jpg')
 *   .getBuffer();
 */
class Multipart extends Readable {
  /**
   * Create a `multipart/form-data` buffer container for the media(image/video) file uploading.
   *
   * @constructor
   */
  constructor() {
    super({ highWaterMark: 64 * 1024 });
    Object.defineProperties(this, {
      /**
       * @protected
       * @memberof Multipart#
       * @prop {object<string,string>} mimeTypes - Built-in mime-type mapping
       */
      mimeTypes: {
        value: {
          bmp: 'image/bmp',
          gif: 'image/gif',
          png: 'image/png',
          jpg: 'image/jpeg',
          jpe: 'image/jpeg',
          jpeg: 'image/jpeg',
          mp4: 'video/mp4',
          mpeg: 'video/mpeg',
          json: 'application/json',
        },
        configurable: false,
        enumerable: false,
        writable: true,
      },

      /**
       * @readonly
       * @memberof Multipart#
       * @prop {buffer} dashDash - Double `dash` buffer
       */
      dashDash: {
        value: Buffer.from('--'),
        configurable: false,
        enumerable: false,
        writable: false,
      },

      /**
       * @readonly
       * @memberof Multipart#
       * @prop {buffer} boundary - The boundary buffer.
       */
      boundary: {
        /* eslint-disable-next-line no-bitwise */
        value: Buffer.from(`${'-'.repeat(26)}${'0'.repeat(24).replace(/0/g, () => Math.random() * 10 | 0)}`),
        configurable: false,
        enumerable: false,
        writable: false,
      },

      /**
       * @readonly
       * @memberof Multipart#
       * @prop {buffer} dashDash - Double `dash` buffer
       */
      CRLF: {
        value: Buffer.from('\r\n'),
        configurable: false,
        enumerable: false,
        writable: false,
      },

      /**
       * @protected
       * @memberof Multipart#
       * @prop {buffer[]} data - The Multipart's data storage
       */
      data: {
        value: [],
        configurable: false,
        enumerable: true,
        writable: true,
      },

      /**
       * @protected
       * @memberof Multipart#
       * @prop {object<string, number>} indices - The entities' value indices whose were in {@link Multipart#data}
       */
      indices: {
        value: {},
        configurable: false,
        enumerable: true,
        writable: true,
      },
    });
  }

  /**
   * To retrieve the {@link Miltipart#data} buffer
   *
   * @returns {Buffer} - The payload buffer
   */
  getBuffer() {
    return Buffer.concat(this.data);
  }

  /**
   * To retrieve the `Content-Type` multipart/form-data header
   *
   * @returns {object<string, string>} - The `Content-Type` header With {@link Multipart#boundary}
   */
  getHeaders() {
    return {
      'Content-Type': `multipart/form-data; boundary=${this.boundary}`,
    };
  }

  /**
   * Append a customized {@link Multipart#mimeType}
   *
   * @example
   * .appendMimeTypes({p12: 'application/x-pkcs12'})
   * .appendMimeTypes({txt: 'text/plain'})
   *
   * @param {object<string,string>} things - The mime-type
   *
   * @returns {Multipart} - The `Multipart` class instance self
   */
  appendMimeTypes(things) {
    Object.assign(this.mimeTypes, things);

    return this;
  }

  /**
   * Append data wrapped by {@link Multipart#boundary}
   *
   * @param  {string} name - The field name
   * @param  {string|buffer|ReadStream} value - The value
   * @param  {String} [filename] - Optional filename, when provided, then append the `Content-Type` after of the `Content-Disposition`
   *
   * @returns {Multipart} - The `Multipart` class instance self
   */
  append(name, value, filename = '') {
    const {
      data, dashDash, boundary, CRLF, mimeTypes, indices,
    } = this;

    const isBufferOrStream = Buffer.isBuffer(value) || (value instanceof ReadStream);

    data.splice(...(data.length ? [-2, 1] : [0, 0, dashDash, boundary, CRLF]));

    data.push(Buffer.from(`Content-Disposition: form-data; name="${name}"${filename && isBufferOrStream ? `; filename="${filename}"` : ''}`));
    data.push(CRLF);
    if (filename || Buffer.isBuffer(value)) {
      data.push(Buffer.from(`Content-Type: ${mimeTypes[extname(filename).substring(1).toLowerCase()] || 'application/octet-stream'}`));
      data.push(CRLF);
    }
    data.push(CRLF);
    indices[name] = data.push(isBufferOrStream ? value : Buffer.from(String(value))) - 1;
    data.push(CRLF);
    data.push(dashDash);
    data.push(boundary);
    data.push(dashDash);
    data.push(CRLF);

    return this;
  }

  entries() { return Object.entries(this.indices).map(([name, index]) => [name, this.data[index]]); }

  set() {} /* eslint-disable-line class-methods-use-this */

  get(name) { return this.data[this.indices[name]]; }

  getAll(name) { return this.get(name); }

  has(name) { return Reflect.has(this.indices, name); }

  delete(name) {
    if (this.has(name)) {
      const index = this.indices[name];
      const hasContentType = this.data[index - 3][8] === 84;
      this.data.splice(...(hasContentType ? [index - 8, 10] : [index - 6, 8]));
      Object.entries(this.indices).filter(([, idx]) => idx > index).forEach(([key, idx]) => Reflect.set(this.indices, key, idx - (hasContentType ? 10 : 8)));
      Reflect.deleteProperty(this.indices, name);
    }

    if (!this.keys().length) {
      this.data.splice(0, this.data.length);
    }

    return this;
  }

  keys() { return Object.keys(this.indices); }

  values() { return Object.values(this.indices).map((index) => this.data[index]); }

  toJSON() { return this.has('meta') ? JSON.parse(this.get('meta')) : null; }

  get [iterator]() {
    return this.entries();
  }

  /**
   * @returns {string} - FormData string
   */
  static get [toStringTag]() {
    return 'FormData';
  }

  /**
   * @returns {string} - FormData string
   */
  get [toStringTag]() {
    return this.constructor[toStringTag];
  }

  /**
   * @returns {string} - FormData string
   */
  toString() {
    return `[object ${this[toStringTag]}]`;
  }

  /**
   * To fetch data from the underlying resource.
   * @private
   * @returns {void}
   */
  /* eslint-disable-next-line class-methods-use-this, no-underscore-dangle */
  _read() {}

  async flowing() {
    /* eslint-disable-next-line no-restricted-syntax */
    for (const value of this.data) {
      if (value instanceof ReadStream) {
        /* eslint-disable-next-line no-await-in-loop, no-restricted-syntax */
        for await (const chunk of value) {
          this.push(chunk);
        }
      } else {
        this.push(value);
      }
    }
    this.push(null);
  }

  pipe(...args) {
    super.pipe(...args);
    this.flowing();
    return args[0];
  }
}

let FormData;
try {
  FormData = require('form-data');/* eslint-disable-line global-require, import/no-unresolved, import/no-extraneous-dependencies */
  /** @see [issue#396 `Object.prototype.toString.call(form)`]{@link https://github.com/form-data/form-data/issues/396} */
  if (!Reflect.has(FormData, toStringTag)) {
    Reflect.set(FormData.prototype, toStringTag, 'FormData');
    Reflect.set(FormData, toStringTag, FormData.prototype[toStringTag]);
  }
} catch (e) {
  /* eslint max-classes-per-file: ["error", 2] */
  FormData = class extends Multipart {};
}

module.exports = Multipart;
module.exports.default = Multipart;
module.exports.FormData = FormData;
