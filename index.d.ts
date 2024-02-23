/// <reference types="node" />
import { ReadStream } from "fs";
import { Readable } from "stream";
import { AgentOptions } from "https";
import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { CipherKey, BinaryLike } from 'crypto'

/**
 * Wechatpay Axios Plugin
 */
export namespace WechatpayAxiosPlugin {
    /**
     * Aes - Advanced Encryption Standard
     */
    class Aes {
        /**
         * @property {string} hex - Alias of `hex` string
         * @deprecated v0.8.0 - Only for compatible, use the literal `hex` string instead
         */
        static get hex(): string;
        /**
         * @property {string} utf8 - Alias of `utf8` string
         * @deprecated v0.8.0 - Only for compatible, use the literal `utf8` string instead
         */
        static get utf8(): string;
        /**
         * @property {string} base64 - Alias of `base64` string
         * @deprecated v0.8.0 - Only for compatible, use the literal `base64` string instead
         */
        static get base64(): string;
        /**
         * @property {integer} BLOCK_SIZE - The `aes` block size
         * @deprecated v0.8.0 - Only for compatible, use the literal `16` number instead
         */
        static get BLOCK_SIZE(): number;
        /**
         * @property {string} ALGO_AES_256_GCM - The `aes-256-gcm` algorithm
         * @deprecated v0.8.0 - Only for compatible, use the literal `aes-256-gcm` string instead
         */
        static get ALGO_AES_256_GCM(): string;
        /**
         * @property {string} ALGO_AES_256_ECB - The `aes-256-ecb` algorithm
         * @deprecated v0.8.0 - Only for compatible, use the literal `aes-256-ecb` string instead
         */
        static get ALGO_AES_256_ECB(): string;
        /**
         * @property {string} ALGO_AES_128_CBC - The `aes-128-cbc` algorithm
         * @deprecated v0.8.0 - Only for compatible, use the literal `aes-128-cbc` string instead
         */
        static get ALGO_AES_128_CBC(): string;
        /**
         * Encrypts plaintext.
         * @deprecated v0.8.0 - Only for compatible, use the `AesGcm.encrypt` method instead
         *
         * @param {BinaryLike} iv - The initialization vector, 16 bytes string.
         * @param {CipherKey} key - The secret key, 32 bytes string.
         * @param {string} plaintext - Text to encode.
         * @param {string} aad - The additional authenticated data, maybe empty string.
         *
         * @returns {string} Base64-encoded ciphertext.
         */
        static encrypt(iv: BinaryLike, key: CipherKey, plaintext: string, aad?: string): string;
        /**
         * Decrypts ciphertext.
         * @deprecated v0.8.0 - Only for compatible, use the `AesGcm.decrypt` method instead
         *
         * @param {BinaryLike} iv - The initialization vector, 16 bytes string.
         * @param {CipherKey} key - The secret key, 32 bytes string.
         * @param {string} ciphertext - Base64-encoded ciphertext.
         * @param {string} aad - The additional authenticated data, maybe empty string.
         *
         * @returns {string} Utf-8 plaintext.
         */
        static decrypt(iv: BinaryLike, key: CipherKey, ciphertext: string, aad?: string): string;
        /**
         * @property {object} pkcs7 - The PKCS7 padding/unpadding container
         */
        static get pkcs7(): {
            /**
             * padding, 32 bytes/256 bits `secret key` may optional need the last block.
             * @see [rfc2315]{@link https://tools.ietf.org/html/rfc2315#section-10.3}
             * @memberof Aes.pkcs7#
             * @summary
             * The padding can be removed unambiguously since all input is
             *     padded and no padding string is a suffix of another. This
             *     padding method is well-defined if and only if k < 256;
             *     methods for larger k are an open issue for further study.
             *
             * @param {string|Buffer} thing - The input
             * @param {boolean} [optional = true] - The flag for the last padding, default `true`
             *
             * @return {Buffer} - The PADDING tailed payload
             */
            padding: (thing: string | Buffer, optional?: boolean | undefined) => Buffer;
            /**
             * unpadding
             * @memberof Aes.pkcs7#
             *
             * @param  {string|Buffer} thing - The input
             * @return {Buffer} - The PADDING wiped payload
             */
            unpadding: (thing: string | Buffer) => Buffer;
        };
    }

    /**
     * Aes - Advanced Encryption Standard
     */
    namespace Aes {
        /**
         * Aes encrypt/decrypt using `aes-256-gcm` algorithm with `AAD`.
         */
        class AesGcm extends Aes {
            /**
             * Encrypts plaintext.
             *
             * @param {BinaryLike} iv - The initialization vector, 16 bytes.
             * @param {CipherKey} key - The secret key, 32 bytes.
             * @param {string} plaintext - Text to encode.
             * @param {string} aad - The additional authenticated data, maybe empty string.
             *
             * @returns {string} Base64-encoded ciphertext.
             */
            static encrypt(iv: BinaryLike, key: CipherKey, plaintext: string, aad?: string): string;
            /**
             * Decrypts ciphertext.
             *
             * @param {BinaryLike} iv - The initialization vector, 16 bytes.
             * @param {CipherKey} key - The secret key, 32 bytes.
             * @param {string} ciphertext - Base64-encoded ciphertext.
             * @param {string} aad - The additional authenticated data, maybe empty string.
             *
             * @returns {string} Utf-8 plaintext.
             */
            static decrypt(iv: BinaryLike, key: CipherKey, ciphertext: string, aad?: string): string;
        }

        /**
         * Aes encrypt/decrypt using `aes-256-ecb` algorithm with pkcs7padding.
         */
        class AesEcb extends Aes {
            /**
             * Encrypts plaintext.
             *
             * @param {string} plaintext - Text to encode.
             * @param {CipherKey} key - The secret key, 32 bytes.
             * @param {BinaryLike} iv - The initialization vector.
             *
             * @returns {string} Base64-encoded ciphertext.
             */
            static encrypt(plaintext: string, key: CipherKey, iv?: BinaryLike): string;
            /**
             * Decrypts ciphertext.
             * Notes here: While turns the `setAutoPadding(true)`, it works well.
             *             Beause the `pkcs5padding` is a subset of `pkcs7padding`.
             *             Let's `unpadding` self.
             *
             * @param {string} ciphertext - Base64-encoded ciphertext.
             * @param {CipherKey} key - The secret key, 32 bytes.
             * @param {BinaryLike} iv - The initialization vector.
             *
             * @returns {string} Utf-8 plaintext.
             */
            static decrypt(ciphertext: string, key: CipherKey, iv?: BinaryLike): string;
        }

        /**
         * Aes encrypt/decrypt using `aes-128-cbc` algorithm with pkcs7padding.
         */
        class AesCbc extends Aes {
            /**
             * Encrypts plaintext.
             *
             * @param {string} plaintext - Text to encode.
             * @param {CipherKey} key - The secret key, 16 bytes.
             * @param {BinaryLike} [iv] - The initialization vector, 16 bytes.
             *
             * @returns {string} Base64-encoded ciphertext.
             */
            static encrypt(plaintext: string, key: CipherKey, iv: BinaryLike): string;
            /**
             * Decrypts ciphertext.
             * Notes here: While turns the `setAutoPadding(true)`, it works well.
             *             Beause the `pkcs5padding` is a subset of `pkcs7padding`.
             *             Let's `unpadding` self.
             *
             * @param {string} ciphertext - Base64-encoded ciphertext.
             * @param {CipherKey} key - The secret key, 16 bytes.
             * @param {BinaryLike} [iv] - The initialization vector, 16 bytes.
             *
             * @returns {string} Utf-8 plaintext.
             */
            static decrypt(ciphertext: string, key: CipherKey, iv: BinaryLike): string;
        }
    }

    /**
     * Crypto hash functions utils.
     * [Specification]{@link https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=4_3}
     */
    class Hash {
        /**
         * Calculate the input string with an optional secret `key` in MD5,
         * when the `key` is Falsey, this method works as normal `MD5`.
         *
         * - [agency] is available {@since v0.4.3}, [spec]{@link https://work.weixin.qq.com/api/doc/90000/90135/90281}
         *
         * @param {BinaryLike} thing - The input string.
         * @param {BinaryLike|undefined} [key] - The secret key string.
         * @param {boolean|number|string} [agency = false] - The secret **key** is from wework, placed with `true` or better of the `AgentId` value.
         *
         * @return {string} - data signature
         */
        static md5(thing: BinaryLike, key?: BinaryLike | undefined, agency?: boolean | number | string | undefined): string;
        /**
         * Calculate the input string with a secret `key` as of `algorithm` string which is one of the 'sha256', 'sha512' etc.
         * @param {BinaryLike} thing - The input string.
         * @param {BinaryLike} key - The secret key string.
         * @param {string} [algorithm = sha256] - The algorithm string, default is `sha256`.
         * @return {string} - data signature
         */
        static hmac(thing: BinaryLike, key: BinaryLike, algorithm?: string | undefined): string;
        /**
         * @deprecated {@since v0.5.5}, instead of by `hmac`
         *
         * Calculate the input string with a secret `key` in HMAC-SHA256
         * @param {BinaryLike} thing - The input string.
         * @param {BinaryLike} key - The secret key string.
         * @return {string} - data signature
         */
        static hmacSha256(thing: BinaryLike, key: BinaryLike): string;
        /**
         * Calculate the input in SHA1.
         * @param {BinaryLike} thing - The input.
         * @return {string} - data signature
         */
        static sha1(thing: BinaryLike): string;
        /**
         * Calculate the input in SHA256.
         * @param {BinaryLike} thing - The input.
         * @return {string} - data signature
         */
        static sha256(thing: BinaryLike): string;
        /**
         * Wrapping the builtins `crypto.timingSafeEqual` function.
         * @param {string} known - The string of known length to compare against.
         * @param {string?} [user] - The user-supplied string.
         * @return {boolean} - Returns true when the two are equal, false otherwise.
         */
        static equals(known: string, user?: string|undefined|null): boolean;
        /**
         * Utils of the data signature calculation.
         * @param {string} type - The sign type, one of the MD5 or HMAC-SHA256.
         * @param {object} data - The input data.
         * @param {string} key - The secret key string.
         * @return {string} - The data signature.
         */
        static sign(type: string, data: object, key: string): object;
    }

    /**
     * An Axios customizaton transform.
     */
    class Transformer {
        static set mchid(value: string);
        /**
         * @property {string} mchid - The merchant ID
         */
        static get mchid(): string;
        static set secret(value: BinaryLike);
        /**
         * @property {BinaryLike} secret - The merchant secret key string
         */
        static get secret(): BinaryLike;
        /**
         * Compose the pre-request data signature
         *
         * Note here: While the [MCHID] is set, then checking the input data matching with it.
         *
         * @param {object} data - The API request parameters
         * @return {object} - With data signature
         */
        static signer(data: object): object;
        /**
         * Translation the javascript's object to the XML string
         * @param {object} data - The API request parameters
         * @return {string} - XML string
         */
        static toXml(data: object): string;
        /**
         * @property {array} request - @see {import('axios').AxiosTransformer}
         */
        static get request(): (typeof Transformer.signer | typeof Transformer.toXml)[];
        /**
         * Translation the XML string to the javascript's object.
         * @param {string} xml - XML string
         * @return {object} - Parsed as object
         */
        static toObject(xml: object): string;
        /**
         * Validation the response data with the `sign` string.
         * @param {object} data - The API response data
         * @return {object} - The API response data
         */
        static verifier(data: object): object;
        /**
         * @property {array} response - @see {import('axios').AxiosTransformer}
         */
        static get response(): (typeof Transformer.toObject | typeof Transformer.verifier)[];
    }

    /**
     * Provides easy used methods using in this project.
     */
    class Formatter {
        /**
         * Cast the `CSV` bill.
         *
         * @param {string|Buffer} buffer - CSV file content.
         *
         * @returns {object} - The casted source intputs as {rows, summary} Object
         */
        static castCsvBill(buffer: string | Buffer): object;
        /**
         * Cast the `CSV` line string by the keys named object.
         *
         * @param {string} row - CSV line.
         * @param {array} [keys] - CSV headers.
         * @param {boolean} [skipFirstChar = true] - Skip the first character of the CSV line, default is true.
         * @param {string} [separator = ',`'] - Split separator, default is ',`' (two chars).
         *
         * @returns {object} - The casted source line as Object
         */
        static castCsvLine(row: string, keys?: string[], skipFirstChar?: boolean, separator?: string): object;
        /**
         * Generate a Base62 random string aka `nonce`, similar as `crypto.randomBytes`.
         *
         * @param {number} [size = 32] - Nonce string length, default is 32 bytes.
         *
         * @returns {string} Base62 random string.
         */
        static nonce(size?: number): string;
        /**
         * Retrieve the current `Unix` timestamp.
         *
         * @returns {number} Epoch timestamp.
         */
        static timestamp(): number;
        /**
         * Formatting for the heading `Authorization` value.
         *
         * @param {string} mchid - The merchant ID.
         * @param {string} nonce - The Nonce string.
         * @param {string} signature - The base64-encoded `Rsa.sign` ciphertext.
         * @param {string|number} timestamp - The `Unix` timestamp.
         * @param {string} serial - The serial number of the merchant public certification.
         *
         * @returns {string} - The APIv3 Authorization `header` value
         */
        static authorization(mchid: string, nonce: string, signature: string, timestamp: string | number, serial: string): string;
        /**
         * Formatting this `HTTP.request` for `Rsa.sign` input.
         *
         * @param {string} method - The merchant ID.
         * @param {string} uri - Combined string with `URL.pathname` and `URL.search`.
         * @param {string|number} timestamp - The `Unix` timestamp, should be the one used in `authorization`.
         * @param {string} nonce - The `Nonce` string, should be the one used in `authorization`.
         * @param {string} [body = ''] - The playload string, HTTP `GET` should be an empty string.
         *
         * @returns {string} - The content for `Rsa.sign`
         */
        static request(method: string, uri: string, timestamp: string | number, nonce: string, body?: string): string;
        /**
         * Formatting this `HTTP.response` for `Rsa.verify` input.
         *
         * @param {string|number} timestamp - The `Unix` timestamp, should be the one from `response.headers[wechatpay-timestamp]`.
         * @param {string} nonce - The `Nonce` string, should be the one from `response.headers[wechatpay-nonce]`.
         * @param {string} [body = ''] - The response payload string, HTTP status(`204`) should be an empty string.
         *
         * @returns {string} - The content for `Rsa.verify`
         */
        static response(timestamp: string | number, nonce: string, body?: string): string;
        /**
         * Joined this inputs by for `Line Feed`(LF) char.
         *
         * @param {string[]} pieces - The string(s) joined by line feed.
         *
         * @returns {string} - The joined string.
         */
        static joinedByLineFeed(...pieces: string[]): string;
        /**
         * Sorts an Object by key.
         *
         * @param {object} thing - The input object.
         *
         * @returns {object} - The sorted object.
         */
        static ksort(thing: object): object;
        /**
         * Like `queryString` does but without the `sign` and `empty value` entities.
         *
         * @param {object} thing - The input object.
         *
         * @returns {string} - The sorted object.
         */
        static queryStringLike(thing: object): string;
    }

    /**
     * This SDK mandatory configuration
     */
    type apiConfig = {
        /** The merchant ID */
        mchid: string,
        /** The serial number of the merchant certificate, only for APIv3 */
        serial: string,
        /** The merchant private key, only for APIv3 */
        privateKey: string | Buffer,
        /** The wechatpay platform certificates in {serial: publicKey} format, only for APIv3 */
        certs: platformCertificates,
        /** The merchant secret key string, only for APIv2 */
        secret?: string,
        /** The merchant private key and certificate configuration for APIv2, while there were required in secure communication. */
        merchant?: merchantCertificate & AgentOptions
    }

    /** @deprecated - {@since v0.8.8}, use {@link AgentOptions} directly */
    type merchantCertificate = {
        /** The merchant private key certificate as PEM format */
        key?: string | Buffer,
        /** The merchant certificate as PEM format */
        cert?: string | Buffer,
        /** The merchant private key and certificate buffer in PKCS12 format */
        pfx?: Buffer,
        /** The merchant private key and certificate's passphrase */
        passphrase?: string
    }

    type platformCertificates = {
        [key: string]: string | Buffer
    }

    /**
     * Simple and lite of `multipart/form-data` implementation, most similar to `form-data`.
     *
     * @since v0.7.0
     * @example
     * // buffer style(Synchronous)
     * (new Multipart())
     *   .append('a', 1)
     *   .append('b', '2')
     *   .append('c', Buffer.from('31'))
     *   .append('d', JSON.stringify({}), 'any.json')
     *   .append('e', require('fs').readFileSync('/path/your/file.jpg'), 'file.jpg')
     *   .getBuffer();
     * // stream style(Asynchronous)
     *   .pipe(require('fs').createWriteStream('./file3.jpg'));
     */
    class Multipart extends Readable {
        /**
         * @protected
         * @memberof Multipart#
         * @prop {object<string,string>} mimeTypes - Built-in mime-type mapping
         */
        protected mimeTypes: object;
        /**
         * @readonly
         * @memberof Multipart#
         * @prop {Buffer} dashDash - Double `dash` buffer
         */
        readonly dashDash: Buffer;
        /**
         * @readonly
         * @memberof Multipart#
         * @prop {Buffer} boundary - The boundary buffer.
         */
        readonly boundary: Buffer;
        /**
         * @readonly
         * @memberof Multipart#
         * @prop {Buffer} EMPTY - An empty buffer
         */
        readonly EMPTY: Buffer;
        /**
         * @readonly
         * @memberof Multipart#
         * @prop {Buffer} CRLF - Double `dash` buffer
         */
        readonly CRLF: Buffer;
        /**
         * @protected
         * @memberof Multipart#
         * @prop {Array<Buffer|ReadStream>} data - The Multipart's instance data storage
         */
        protected data: Array<Buffer|ReadStream>;
        /**
         * @protected
         * @memberof Multipart#
         * @prop {[string|undefined, number][]} indices - The entities' value indices whose were in {@link Multipart#data}
         */
        protected indices: [string|undefined, number][];
        /**
         * To retrieve the {@link Miltipart#data} buffer
         *
         * @returns {Buffer} - The payload buffer
         */
        getBuffer(): Buffer;
        /**
         * To retrieve the `Content-Type` multipart/form-data header
         *
         * @returns {object<string, string>} - The `Content-Type` header With {@link Multipart#boundary}
         */
        getHeaders(): object;
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
        appendMimeTypes(things: object): this;
        /**
         * Append data wrapped by {@link Multipart#boundary}
         *
         * @param  {string} field - The field
         * @param  {string|Buffer} value - The value
         * @param  {String} [filename] - Optional filename, when provided, then append the `Content-Type` after of the `Content-Disposition`
         *
         * @returns {Multipart} - The `Multipart` class instance self
         */
        append(field: string, value: string | Buffer | ReadStream, filename?: string): this;
        /**
         * Formed a named value, a filename reported to the server, when a Buffer or FileStream is passed as the second parameter.
         *
         * @param {string} name - The field name
         * @param {string|Buffer|ReadStream} value - The value
         * @param {string} [filename] - Optional filename, when provided, then append the `Content-Type` after of the `Content-Disposition`
         *
         * @returns {Array<Buffer|ReadStream>} - The part of data
         */
        formed(name: string, value: string | Buffer | ReadStream, filename?: string): Array<Buffer | ReadStream>;
        /**
         * To go through all key/value pairs contained in this {@link Multipart#data} instance
         *
         * @return {Iterator<[string|undefined, Buffer|ReadStream]>} - An Array Iterator key/value pairs.
         */
        entries(): Iterator<[string | undefined, Buffer | ReadStream]>;
        /**
         * Sets a new value for an existing key inside a {@link Multipart#data} instance, or adds the key/value if it does not already exist.
         *
         * @param {string} name - The field name
         * @param {string|Buffer|ReadStream} value - The value
         * @param {string} [filename] - Optional filename, when provided, then append the `Content-Type` after of the `Content-Disposition`
         *
         * @returns {this} - The Multipart instance
         */
        set(name: string, value: string | Buffer | ReadStream, filename?: string): this;
        /**
         * Returns the first value associated with a given key from within a {@link Multipart#data} instance
         *
         * @param {string} name - The field name
         *
         * @return {Buffer|ReadStream|undefined} value - The value, undefined means none named key exists
         */
        get(name: string): Buffer | ReadStream | undefined;
        /**
         * Returns all values associated with a given key from within a {@link Multipart#data} instance
         *
         * @param {string} name - The field name
         *
         * @return {(Buffer|ReadStream)[]} value(s) - The value(s)
         */
        getAll(name: string): (Buffer | ReadStream)[];
        /**
         * Returns a boolean stating whether a {@link Multipart#data} instance contains a certain key.
         *
         * @param {string} name - The field name
         *
         * @return {boolean} - True for contains
         */
        has(name: string): boolean;
        /**
         * Deletes a key and its value(s) from a {@link Multipart#data} instance
         *
         * @param {string} name - The field name
         *
         * @returns {this} - The Multipart instance
         */
        delete(name: string): this;
        /**
         * To go through all keys contained in {@link Multipart#data} instance
         *
         * @return {Iterator<string|undefined>} - An Array Iterator key pairs.
         */
        keys(): Iterator<string | undefined>;
        /**
         * To go through all values contained in {@link Multipart#data} instance
         *
         * @returns {Iterator<Array<Buffer|ReadStream>>} - An Array Iterator value pairs.
         */
        values(): Iterator<Array<Buffer | ReadStream>>;
        /**
         * @returns {string} - FormData string
         */
        static get [Symbol.toStringTag](): "FormData";
        /**
         * @returns {string} - FormData string
         */
        get [Symbol.toStringTag](): "FormData";
        /**
         * @returns {string} - FormData string
         */
        toString(): "[object FormData]";
        /**
         * The WeChatPay APIv3' specific, the `meta` JSON
         *
         * @return {object<string, string>|null} - The `meta{filename,sha1}` information.
         */
        toJSON(): { filename: string, sha1: string } | null;
        /**
         * alias of {@link Multipart#entries}
         * @returns {Iterator<[string|undefined, Buffer|ReadStream]>} - An Array Iterator key/value pairs.
         */
        [Symbol.iterator](): Iterator<[string|undefined, Buffer|ReadStream]>;
        _read(): void;
        /**
         * Pushing {@link Multipart#data} into the readable BufferList
         *
         * @param {boolean} [end = true] - End the writer when the reader ends. Default: true.
         * @returns {Promise<this>} - The Multipart instance
         */
        flowing(end?: boolean): Promise<this>;
        /**
         * Attaches a Writable stream to the {@link Multipart} instance
         *
         * @param  {NodeJS.WritableStream} destination - The destination for writing data
         * @param {object} [options] - Pipe options
         * @param {boolean} [options.end = true] - End the writer when the reader ends. Default: true.
         * @returns {stream.Writable} - The destination, allowing for a chain of pipes
         */
        pipe<T extends NodeJS.WritableStream>(destination: T, options?: {end?: boolean}): T;
    }

    /**
     * Provides some methods for the RSA `sha256WithRSAEncryption` with `RSA_PKCS1_OAEP_PADDING`.
     */
    class Rsa {
        /**
         * Alias of the `RSA_PKCS1_OAEP_PADDING` mode
         */
        readonly RSA_PKCS1_OAEP_PADDING: 4;
        /**
         * Alias of the `RSA_PKCS1_PADDING` mode
         */
        readonly RSA_PKCS1_PADDING: 1;
        /**
         * Encrypts text with sha256WithRSAEncryption/RSA_PKCS1_OAEP_PADDING.
         * Node Limits >= 12.9.0 (`oaepHash` was added)
         *
         * @param {string} plaintext - Cleartext to encode.
         * @param {string|Buffer} publicKey - A PEM encoded public certificate.
         * @param {number} padding - Supporting `RSA_PKCS1_OAEP_PADDING` or `RSA_PKCS1_PADDING`, default is `RSA_PKCS1_OAEP_PADDING`.
         *
         * @returns {string} Base64-encoded ciphertext.
         */
        static encrypt(plaintext: string, publicKey: string | Buffer, padding?: Number): string;
        /**
         * Decrypts base64 encoded string with `privateKey`.
         * Node Limits >= 12.9.0 (`oaepHash` was added)
         *
         * @param {string} ciphertext - Was previously encrypted string using the corresponding public certificate.
         * @param {string|Buffer} privateKey - A PEM encoded private key certificate.
         * @param {number} padding - Supporting `RSA_PKCS1_OAEP_PADDING` or `RSA_PKCS1_PADDING`, default is `RSA_PKCS1_OAEP_PADDING`.
         *
         * @returns {string} Utf-8 plaintext.
         */
        static decrypt(ciphertext: string, privateKey: string | Buffer, padding?: Number): string;
        /**
         * Creates and returns a `Sign` string that uses `sha256WithRSAEncryption`.
         *
         * @param {string} message - Content will be `crypto.Sign`.
         * @param {string|Buffer} privateKey - A PEM encoded private key certificate.
         *
         * @returns {string} Base64-encoded signature.
         */
        static sign(message: string, privateKey: string | Buffer): string;
        /**
         * Verifying the `message` with given `signature` string that uses `sha256WithRSAEncryption`.
         *
         * @param {string} message - Content will be `crypto.Verify`.
         * @param {string} signature - The base64-encoded ciphertext.
         * @param {string|Buffer} publicKey - A PEM encoded public certificate.
         *
         * @returns {boolean} True is passed, false is failed.
         */
        static verify(message: string, signature: string, publicKey: string | Buffer): boolean;
    }

    /**
    * Decorate the `Axios` instance
    */
    class Decorator {
        /**
        * @property {object} defaults - The defaults configuration whose pased in `Axios`.
        */
        static get defaults(): {
            baseURL: string;
            headers: {
                Accept: string,
                'Content-Type': string,
                'User-Agent': string,
            };
        };
        /**
        * Deep merge the input with the defaults
        *
        * @param {object} config - The configuration.
        *
        * @returns {object} - With the built-in configuration.
        */
        static withDefaults(config?: object): object;
        /**
        * Create an APIv2's client
        *
        * @param {object} config - configuration
        * @param {string} [config.mchid] - The merchant ID
        * @param {string} [config.secret] - The merchant secret key string
        * @param {object} [config.merchant] - The merchant private key and certificate AKA {@link AgentOptions} for APIv2, while there were required in secure communication.
        * @param {string|Buffer} [config.merchant.cert] - The merchant cert chains in PEM format
        * @param {string|Buffer} [config.merchant.key] - The merchant private keys in PEM format
        * @param {string|Buffer} [config.merchant.pfx] - The merchant PFX or PKCS12 encoded private key and certificate chain.
        * @param {string|Buffer} [config.merchant.passphrase] - The merchant shared passphrase used for a single private key and/or a PFX.
        *
        * @returns {AxiosInstance} - The axios instance
        */
        static xmlBased(config?: {
            mchid: string;
            secret: string;
            merchant: merchantCertificate;
        }): AxiosInstance;
        /**
         * APIv3's requestInterceptor
         *
         * @return {function} Named `signer` function
         */
        static requestInterceptor(): Function;
        /**
         * APIv3's responseVerifier
         * @param  {object} certs The wechatpay platform serial and certificate(s), `{serial: publicKey}` pair
         * @return {function} Named as `verifier` function
         */
        static responseVerifier(certs?: platformCertificates): Function;
        /**
        * Create an APIv3's client
        *
        * @param {object} config - configuration
        * @param {string} config.mchid - The merchant ID
        * @param {string} config.serial - The serial number of the merchant certificate
        * @param {string|Buffer} config.privateKey - The merchant private key certificate
        * @param {object} config.certs - The wechatpay provider size configuration, `{serial: publicKey}` pair
        *
        * @returns {AxiosInstance} - The axios instance
        */
        static jsonBased(config?: {
            mchid: string;
            serial: string;
            privateKey: string | Buffer;
            certs: platformCertificates;
        }): AxiosInstance;
        /**
        * Decorate factory
        * @param {object} config - configuration
        * @param {string} config.mchid - The merchant ID
        * @param {string} config.serial - The serial number of the merchant certificate
        * @param {string|Buffer} config.privateKey - The merchant private key certificate
        * @param {object} config.certs - The wechatpay provider size configuration, `{serial: publicKey}` pair
        * @param {string} [config.secret] - The merchant secret key string
        * @param {object} [config.merchant] - The merchant private key and certificate AKA {@link AgentOptions} for APIv2, while there were required in secure communication.
        * @param {string|Buffer} [config.merchant.cert] - The merchant cert chains in PEM format
        * @param {string|Buffer} [config.merchant.key] - The merchant private keys in PEM format
        * @param {string|Buffer} [config.merchant.pfx] - The merchant PFX or PKCS12 encoded private key and certificate chain.
        * @param {string|Buffer} [config.merchant.passphrase] - The merchant shared passphrase used for a single private key and/or a PFX.
        * @constructor
        */
        constructor(config: apiConfig & AxiosRequestConfig);
        /**
        * Getter APIv2's client (xmlBased)
        *
        * @returns {AxiosInstance} - The axios instance
        */
        get v2(): AxiosInstance;
        /**
        * Getter APIv3's client (jsonBased)
        *
        * @returns {AxiosInstance} - The axios instance
        */
        get v3(): AxiosInstance;
        /**
        * Request the remote `pathname` by a HTTP `method` verb
        *
        * @param {string} [pathname] - The pathname string.
        * @param {string} [method] - The method string.
        * @param {any} [data] - The data.
        * @param {any} [config] - The config.
        *
        * @returns {PromiseLike} - The `AxiosPromise`
        */
        request<T = any, R = AxiosResponse<T>>(pathname?: string | undefined, method?: string | undefined, data?: object | any, config?: AxiosRequestConfig): PromiseLike<R>;
    }

    /**
     * A WeChatPay OpenAPI v2&v3's amazing client.
     *
     * @example
     * const {Wechatpay} = require('wechatpay-axios-plugin');
     * const wxpay = new Wechatpay({
     *   mchid,
     *   serial,
     *   privateKey: '-----BEGIN PRIVATE KEY-----\n-FULL-OF-THE-FILE-CONTENT-\n-----END PRIVATE KEY-----',
     *   certs: {
     *     'serial_number': '-----BEGIN CERTIFICATE-----\n-FULL-OF-THE-FILE-CONTENT-\n-----END CERTIFICATE-----',
     *   },
     *   secret,
     *   merchant: {
     *     cert,
     *     key,
     *     // pfx,
     *     // passphase,
     *   }
     * });
     *
     * wxpay.v2.pay.micropay({}).then(console.info).catch(console.error);
     *
     * wxpay.v2.secapi.pay.refund.POST({}).then(console.info).catch(console.error);
     *
     * wxpay.v3.marketing.busifavor.stocks.post({})
     *   .then(({data}) => console.info(data))
     *   .catch(({response: {data}}) => console.error(data));
     *
     * wxpay.v3.pay.transactions.native.post({})
     *   .then(({data: {code_url}}) => console.info(code_url))
     *   .catch(({ response: {data}}) => console.error(data));
     *
     * (async () => {
     *   try {
     *     const {data: detail} = await wxpay.v3.pay.transactions.id.$transaction_id$
     *       .get({params: {mchid: '1230000109'}, transaction_id: '1217752501201407033233368018'});
     *     // or simple like this
     *     // const {data: detail} = await wxpay.v3.pay.transactions.id['{transaction_id}']
     *     //   .get({params: {mchid: '1230000109'}, transaction_id: '1217752501201407033233368018'});
     *     // or simple like this
     *     // const {data: detail} = await wxpay.v3.pay.transactions.id['1217752501201407033233368018']
     *     //   .get({params: {mchid: '1230000109'}});
     *     console.info(detail);
     *   } catch({response: {status, statusText, data}}) {
     *     console.error(status, statusText, data);
     *   }
     * })();
     */
    class Wechatpay {
        /**
        * @property {Decorator} client - The Decorator instance
        *
        * @returns {Decorator}
        */
        static get client(): Decorator;
        /**
         * Constructor of the magic APIv2&v3's `chain`.
         * @param {object} config - @see {apiConfig}
         * @constructor
         * @returns {Proxy} - The magic APIv2&v3 container
         */
        constructor(config: apiConfig & AxiosRequestConfig)

        /**
         * @property {function} GET - The alias of the HTTP `GET` request
         * @param {any} config - The request configuration
         * @returns {PromiseLike} - The `AxiosPromise`
         */
        // @ts-ignore: FIXEME, needs contributing
        GET<T = any, R = AxiosResponse<T>>(config?: AxiosRequestConfig): Promise<R>;

        /**
         * @property {function} POST - The alias of the HTTP `POST` request
         * @param {any} data - The request post body
         * @param {any} config - The request configuration
         * @returns {PromiseLike} - The `AxiosPromise`
         */
        // @ts-ignore: FIXEME, needs contributing
        POST<T = any, R = AxiosResponse<T>>(data?: any, config?: AxiosRequestConfig): Promise<R>;

        /**
         * @property {function} PUT - The alias of the HTTP 'PUT' request
         * @param {any} data - The request post body
         * @param {any} config - The request configuration
         * @returns {PromiseLike} - The `AxiosPromise`
         */
        // @ts-ignore: FIXEME, needs contributing
        PUT<T = any, R = AxiosResponse<T>>(data?: any, config?: AxiosRequestConfig): Promise<R>;

        /**
         * @property {function} PATCH - The alias of the HTTP 'PATCH' request
         * @param {any} data - The request post body
         * @param {any} config - The request configuration
         * @returns {PromiseLike} - The `AxiosPromise`
         */
        // @ts-ignore: FIXEME, needs contributing
        PATCH<T = any, R = AxiosResponse<T>>(data?: any, config?: AxiosRequestConfig): Promise<R>;

        /**
         * @property {function} DELETE - The alias of the HTTP 'DELETE' request
         * @param {any} config - The request configuration
         * @returns {PromiseLike} - The `AxiosPromise`
         */
        // @ts-ignore: FIXEME, needs contributing
        DELETE<T = any, R = AxiosResponse<T>>(config?: AxiosRequestConfig): Promise<R>;

        /**
         * @property {function} get - The alias of the HTTP `GET` request
         * @param {any} data - The request post body
         * @param {any} config - The request configuration
         * @returns {PromiseLike} - The `AxiosPromise`
         */
        // @ts-ignore: FIXEME, needs contributing
        get<T = any, R = AxiosResponse<T>>(config?: AxiosRequestConfig): Promise<R>;

        /**
         * @property {function} post - The alias of the HTTP `POST` request
         * @param {any} data - The request post body
         * @param {any} config - The request configuration
         * @returns {PromiseLike} - The `AxiosPromise`
         */
        // @ts-ignore: FIXEME, needs contributing
        post<T = any, R = AxiosResponse<T>>(data?: any, config?: AxiosRequestConfig): Promise<R>;

        /**
         * @property {function} put - The alias of the HTTP 'PUT' request
         * @param {any} data - The request post body
         * @param {any} config - The request configuration
         * @returns {PromiseLike} - The `AxiosPromise`
         */
        // @ts-ignore: FIXEME, needs contributing
        put<T = any, R = AxiosResponse<T>>(data?: any, config?: AxiosRequestConfig): Promise<R>;

        /**
         * @property {function} patch - The alias of the HTTP 'PATCH' request
         * @param {any} data - The request post body
         * @param {any} config - The request configuration
         * @returns {PromiseLike} - The `AxiosPromise`
         */
        // @ts-ignore: FIXEME, needs contributing
        patch<T = any, R = AxiosResponse<T>>(data?: any, config?: AxiosRequestConfig): Promise<R>;

        /**
         * @property {function} delete - The alias of the HTTP 'DELETE' request
         * @param {any} config - The request configuration
         * @returns {PromiseLike} - The `AxiosPromise`
         */
        // @ts-ignore: FIXEME, needs contributing
        delete<T = any, R = AxiosResponse<T>>(config?: AxiosRequestConfig): Promise<R>;

        [key: string]: this
    }
}

export class Hash extends WechatpayAxiosPlugin.Hash{}

export class Transformer extends WechatpayAxiosPlugin.Transformer{}

export class Formatter extends WechatpayAxiosPlugin.Formatter{}

export class Aes extends WechatpayAxiosPlugin.Aes{}

export class Multipart extends WechatpayAxiosPlugin.Multipart {}

export class FormData extends Multipart {}

export class Rsa extends WechatpayAxiosPlugin.Rsa{}

export class Decorator extends WechatpayAxiosPlugin.Decorator{}

export class Wechatpay extends WechatpayAxiosPlugin.Wechatpay {}

export default Wechatpay;
