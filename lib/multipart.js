const { extname } = require('path');
const { inspect: { custom } } = require('util');

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
 *   .getBuffer();
 */
class Multipart {
  /**
   * Create a `multipart/form-data` buffer container for the meida(image/video) file uploading.
   *
   * @constructor
   */
  constructor() {
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
    return Buffer.concat([
      this.dashDash, this.boundary, this.CRLF,
      ...this.data.slice(0, -2),
      this.boundary, this.dashDash, this.CRLF,
    ]);
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
   * @param  {string} field - The field
   * @param  {string|buffer} value - The value
   * @param  {String} [filename] - Optional filename, when provided, then append the `Content-Type` after of the `Content-Disposition`
   *
   * @returns {Multipart} - The `Multipart` class instance self
   */
  append(field, value, filename = '') {
    const {
      data, dashDash, boundary, CRLF, mimeTypes, indices,
    } = this;

    data.push(Buffer.from(`Content-Disposition: form-data; name="${field}"${filename && Buffer.isBuffer(value) ? `; filename="${filename}"` : ''}`));
    data.push(CRLF);
    if (filename || Buffer.isBuffer(value)) {
      data.push(Buffer.from(`Content-Type: ${mimeTypes[extname(filename).substring(1).toLowerCase()] || 'application/octet-stream'}`));
      data.push(CRLF);
    }
    data.push(CRLF);
    indices[field] = data.push(Buffer.isBuffer(value) ? value : Buffer.from(String(value))) - 1;
    data.push(CRLF);
    data.push(dashDash);
    data.push(boundary);
    data.push(CRLF);

    return this;
  }

  // @todo Implementation.
  entries() {
    return this;
  }

  // @todo Implementation.
  set() {
    return this;
  }

  // @todo Implementation.
  get() {
    return this;
  }

  // @todo Implementation.
  getAll() {
    return this;
  }

  // @todo Implementation.
  has() {
    return this;
  }

  // @todo Implementation.
  delete() {
    return this;
  }

  // @todo Implementation.
  keys() {
    return this;
  }

  // @todo Implementation.
  values() {
    return this;
  }

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
   * @returns {string} - FormData string
   */
  [custom]() {
    return this[toStringTag];
  }
}

let FormData;
try {
  FormData = require('form-data');/* eslint-disable-line global-require, import/no-unresolved, import/no-extraneous-dependencies */
  /** @see [issue#396 `Object.prototype.toString.call(form)`]{@link https://github.com/form-data/form-data/issues/396} */
  if (!Reflect.has(FormData, toStringTag)) {
    Reflect.set(FormData.prototype, toStringTag, 'FormData');
    Reflect.set(FormData, toStringTag, FormData.prototype[toStringTag]);
    Reflect.set(FormData, custom, FormData[toStringTag]);
  }
} catch (e) {
  /* eslint max-classes-per-file: ["error", 2] */
  FormData = class extends Multipart {};
}

module.exports = FormData;
module.exports.default = FormData;
module.exports.Multipart = Multipart;
