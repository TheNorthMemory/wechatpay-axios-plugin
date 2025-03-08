/// <reference types="node" />
import { AgentOptions } from "https";
import { CipherKey, BinaryLike, KeyLike, KeyObject } from 'crypto'
import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { default as Base } from '@thenorthmemory/multipart';

/**
 * Wechatpay Axios Plugin
 */
export namespace WechatpayAxiosPlugin {
    /**
     * Aes - Advanced Encryption Standard
     */
    class Aes {
        /**
         * @property {object} pkcs7 - The PKCS7 padding/unpadding container
         */
        static get pkcs7(): {
            /**
             * padding, 32 bytes/256 bits `secret key` may optional need the last block.
             * @memberof Aes.pkcs7#
             *
             * @param {BinaryLike} thing - The input
             * @param {boolean} [optional = true] - The flag for the last padding, default `true`
             *
             * @return {Buffer} - The PADDING tailed payload
             */
            padding(thing: BinaryLike, optional?: boolean): Buffer;
            /**
             * unpadding
             * @memberof Aes.pkcs7#
             *
             * @param  {BinaryLike} thing - The input
             * @return {Buffer} - The PADDING wiped payload
             */
            unpadding(thing: BinaryLike): Buffer;
        };
    }

    /**
     * Aes - Advanced Encryption Standard
     */
    namespace Aes {
        /**
         * Aes encrypt/decrypt using `aes-256-gcm` algorithm with `AAD`.
         */
        class AesGcm {
            /**
             * Encrypts plaintext.
             *
             * @param {string} plaintext - Text to encode.
             * @param {CipherKey} key - The secret key.
             * @param {BinaryLike} iv - The initialization vector.
             * @param {string} aad - The additional authenticated data, maybe empty string.
             *
             * @returns {string} Base64-encoded ciphertext.
             */
            static encrypt(plaintext: string, key: CipherKey, iv: BinaryLike, aad?: string): string;
            /**
             * Decrypts ciphertext.
             *
             * @param {string} ciphertext - Base64-encoded ciphertext.
             * @param {CipherKey} key - The secret key.
             * @param {BinaryLike} iv - The initialization vector.
             * @param {string} aad - The additional authenticated data, maybe empty string.
             *
             * @returns {string} Utf-8 plaintext.
             */
            static decrypt(ciphertext: string, key: CipherKey, iv: BinaryLike, aad?: string): string;
        }

        /**
         * Aes encrypt/decrypt using `aes-256-ecb` algorithm with pkcs7padding.
         */
        class AesEcb {
            /**
             * Encrypts plaintext.
             *
             * @param {string} plaintext - Text to encode.
             * @param {CipherKey} key - The secret key.
             *
             * @returns {string} Base64-encoded ciphertext.
             */
            static encrypt(plaintext: string, key: CipherKey): string;
            /**
             * Decrypts ciphertext.
             *
             * @param {string} ciphertext - Base64-encoded ciphertext.
             * @param {CipherKey} key - The secret key.
             *
             * @returns {string} Utf-8 plaintext.
             */
            static decrypt(ciphertext: string, key: CipherKey): string;
        }

        /**
         * Aes encrypt/decrypt using `aes-128-cbc` algorithm with pkcs7padding.
         */
        class AesCbc {
            /**
             * Encrypts plaintext.
             *
             * @param {string} plaintext - Text to encode.
             * @param {CipherKey} key - The secret key.
             * @param {BinaryLike} [iv] - The initialization vector.
             *
             * @returns {string} Base64-encoded ciphertext.
             */
            static encrypt(plaintext: string, key: CipherKey, iv: BinaryLike): string;
            /**
             * Decrypts ciphertext.
             *
             * @param {string} ciphertext - Base64-encoded ciphertext.
             * @param {CipherKey} key - The secret key.
             * @param {BinaryLike} [iv] - The initialization vector.
             *
             * @returns {string} Utf-8 plaintext.
             */
            static decrypt(ciphertext: string, key: CipherKey, iv: BinaryLike): string;
        }
    }

    /**
     * Crypto hash functions utils.
     */
    class Hash {
        static ALGO_MD5: 'MD5';

        static ALGO_HMAC_SHA256: 'HMAC-SHA256';

        static isKeyObject(thing: any): boolean;

        static keyObjectFrom(thing: Buffer): KeyObject;

        /**
         * Calculate the input string with an optional secret `key` in MD5,
         * when the `key` is Falsey, this method works as normal `MD5`.
         *
         * @param {BinaryLike} thing - The input.
         * @param {CipherKey} [key] - The secret key.
         * @param {boolean|number|string} [agency = false] - `true` or better of the `AgentId` value.
         *
         * @return {string} - data signature
         */
        static md5(thing: BinaryLike, key?: CipherKey, agency?: boolean | number | string): string;
        /**
         * Calculate the input string with a secret `key` as of `algorithm` string which is one of the 'sha256', 'sha512' etc.
         * @param {BinaryLike} thing - The input.
         * @param {CipherKey} key - The secret key.
         * @param {string} [algorithm = 'sha256'] - The algorithm string, default is `sha256`.
         * @return {string} - data signature
         */
        static hmac(thing: BinaryLike, key: CipherKey, algorithm?: string): string;
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
         * @param {BinaryLike} known - The string of known length to compare against.
         * @param {BinaryLike} [user] - The user-supplied string.
         * @return {boolean} - Returns true when the two are equal, false otherwise.
         */
        static equals(known: BinaryLike, user?: BinaryLike): boolean;
        /**
         * Utils of the data signature calculation.
         * @param {'MD5'|'HMAC-SHA256'} type - The sign type, one of the MD5 or HMAC-SHA256.
         * @param {object} data - The input data.
         * @param {CipherKey} key - The secret key string.
         * @return {string} - The data signature.
         */
        static sign(type: 'MD5' | 'HMAC-SHA256', data: object, key: CipherKey): string;
    }

    /**
     * An Axios customizaton transform.
     */
    class Transformer {
        constructor(mchid?: string, secret?: KeyLike);
        /**
         * Compose the pre-request data signature
         *
         * Note here: While the [MCHID] is set, then checking the input data matching with it.
         *
         * @param {object} data - The API request parameters
         * @return {object} - With data signature
         */
        signer(data: object): object;
        /**
         * Translation the javascript's object to the XML string
         * @param {object} data - The API request parameters
         * @return {string} - XML string
         */
        static toXml(data: object): string;
        /**
         * @property {array} request - @see {import('axios').AxiosTransformer}
         */
        get request(): (typeof this.signer | typeof Transformer.toXml)[];
        /**
         * Translation the XML string to the javascript's object.
         * @param {string} xml - XML string
         * @return {object} - Parsed as object
         */
        static toObject(xml: string): object;
        /**
         * Validation the response data with the `sign` string.
         * @param {object} data - The API response data
         * @return {object} - The API response data
         */
        verifier(data: object): object;
        /**
         * @property {array} response - @see {import('axios').AxiosTransformer}
         */
        get response(): (typeof Transformer.toObject | typeof this.verifier)[];
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
        merchant?: AgentOptions
    }

    type platformCertificates = {
        [key: string]: KeyLike
    }

    /**
     * Signature for the extra request config such as the `uri_template` parameter(s).
     */
    type ExtraRequestConfig<T> = Omit<T, keyof AxiosRequestConfig>;

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
    class Multipart extends Base {
        static get [Symbol.toStringTag](): "FormData";
        /**
         * @returns {string} - FormData string
         */
        get [Symbol.toStringTag](): "FormData";
        /**
         * The WeChatPay APIv3' specific, the `meta` JSON
         *
         * @return {object<string, string>|null} - The `meta` information.
         */
        toJSON(): Multipart.MetaField | null;
    }
    namespace Multipart {
        type FileMetaGeneral = {
            filename: string
            sha1: string
        }
        type FileMetaSpecial = {
            file_name: string
            file_digest: string
        }
        type FileMetaWithBankType = {
            filename: string
            sha256: string
            bank_type: string
        }
        type FileMetaWithTransaction = {
            transaction_id: string
            transaction_mchid: string
            transaction_sub_mchid?: string
            out_trade_no: string
            openid: string
            sha256: string
            upload_time: string
            merchant_contact_information: {
                consultation_phone_number: string
            }
        }
        type FileMetaWithFapiao = {
            sub_mchid?: string
            file_type: 'PDF' | 'OFD'
            digest_alogrithm: 'SM3'
            digest: string
        }
        type FileMetaWithTaxiFapiao = {
            company_mchid: string
            region_id: number
            digest_algorithm: 'DIGEST_ALGORITHM_SM3'
            digest: string
        }
        type MetaField = FileMetaGeneral
            | FileMetaSpecial
            | FileMetaWithBankType
            | FileMetaWithTransaction
            | FileMetaWithFapiao
            | FileMetaWithTaxiFapiao
        class FormData extends Multipart {}
    }

    /**
     * Provides some methods for the RSA `sha256WithRSAEncryption` with `RSA_PKCS1_OAEP_PADDING`.
     */
    class Rsa {
        /**
         * Alias of the `RSA_PKCS1_OAEP_PADDING` mode
         */
        static RSA_PKCS1_OAEP_PADDING: 4;
        /**
         * Alias of the `RSA_PKCS1_PADDING` mode
         */
        static RSA_PKCS1_PADDING: 1;

        static KEY_TYPE_PUBLIC: 'public';

        static KEY_TYPE_PRIVATE: 'private';

        static isKeyObject(thing: any): boolean;

        static fromPkcs8(str: string): KeyObject;

        static fromPkcs1(str: string, type: 'public' | 'private'): KeyObject;

        static fromSpki(str: string): KeyObject;

        static from(thing: KeyLike, type: 'public' | 'private'): KeyObject;

        /**
         * Encrypts text with sha256WithRSAEncryption/RSA_PKCS1_OAEP_PADDING.
         * Node Limits >= 12.9.0 (`oaepHash` was added)
         *
         * @param {string} plaintext - Cleartext to encode.
         * @param {KeyLike} publicKey - A public key.
         * @param {number} [padding] - Supporting `RSA_PKCS1_OAEP_PADDING` or `RSA_PKCS1_PADDING`, default is `RSA_PKCS1_OAEP_PADDING`.
         *
         * @returns {string} Base64-encoded ciphertext.
         */
        static encrypt(plaintext: string, publicKey: KeyLike, padding?: number): string;
        /**
         * Decrypts base64 encoded string with `privateKey`.
         * Node Limits >= 12.9.0 (`oaepHash` was added)
         *
         * @param {string} ciphertext - Was previously encrypted string using the corresponding public certificate.
         * @param {KeyLike} privateKey - A public key.
         * @param {number} [padding] - Supporting `RSA_PKCS1_OAEP_PADDING` or `RSA_PKCS1_PADDING`, default is `RSA_PKCS1_OAEP_PADDING`.
         *
         * @returns {string} Utf-8 plaintext.
         */
        static decrypt(ciphertext: string, privateKey: KeyLike, padding?: number): string;
        /**
         * Creates and returns a `Sign` string that uses `sha256WithRSAEncryption`.
         *
         * @param {string} message - Content will be `crypto.Sign`.
         * @param {KeyLike} privateKey - A PEM encoded private key certificate.
         *
         * @returns {string} Base64-encoded signature.
         */
        static sign(message: string, privateKey: KeyLike): string;
        /**
         * Verifying the `message` with given `signature` string that uses `sha256WithRSAEncryption`.
         *
         * @param {string} message - Content will be `crypto.Verify`.
         * @param {string} signature - The base64-encoded ciphertext.
         * @param {KeyLike} publicKey - A PEM encoded public certificate.
         *
         * @returns {boolean} True is passed, false is failed.
         */
        static verify(message: string, signature: string, publicKey: KeyLike): boolean;
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
        * @param {KeyLike} [config.secret] - The merchant secret key string
        * @param {object} [config.merchant] - The merchant private key and certificate AKA {@link AgentOptions} for APIv2, while there were required in secure communication.
        * @param {BinaryLike} [config.merchant.cert] - The merchant cert chains in PEM format
        * @param {BinaryLike} [config.merchant.key] - The merchant private keys in PEM format
        * @param {BinaryLike} [config.merchant.pfx] - The merchant PFX or PKCS12 encoded private key and certificate chain.
        * @param {BinaryLike} [config.merchant.passphrase] - The merchant shared passphrase used for a single private key and/or a PFX.
        *
        * @returns {AxiosInstance} - The axios instance
        */
        static xmlBased(config?: {
            mchid?: string;
            secret?: string;
            merchant?: AgentOptions;
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
        * @param {KeyLike} config.privateKey - The merchant private key certificate
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
        * @param {KeyLike} config.privateKey - The merchant private key certificate
        * @param {object} config.certs - The wechatpay provider size configuration, `{serial: publicKey}` pair
        * @param {KeyLike} [config.secret] - The merchant secret key for APIv2
        * @param {object} [config.merchant] - The merchant private key and certificate AKA {@link AgentOptions} for APIv2, while there were required in secure communication.
        * @param {BinaryLike} [config.merchant.cert] - The merchant cert chains in PEM format
        * @param {BinaryLike} [config.merchant.key] - The merchant private keys in PEM format
        * @param {BinaryLike} [config.merchant.pfx] - The merchant PFX or PKCS12 encoded private key and certificate chain.
        * @param {BinaryLike} [config.merchant.passphrase] - The merchant shared passphrase used for a single private key and/or a PFX.
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
        request<T = any, R = AxiosResponse<T>, D = any>(pathname?: string | undefined, method?: string | undefined, data?: object | any, config?: ExtraRequestConfig<D> & AxiosRequestConfig): PromiseLike<R>;
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
        // @ts-ignore: FIXEME, needs contributing
        get client(): Decorator;

        /**
         * Constructor of the magic APIv2&v3's `chain`.
         * @param {object} config - @see {apiConfig}
         * @constructor
         */
        constructor(config: apiConfig & AxiosRequestConfig)

        /**
         * @property {function} get - The alias of the HTTP `GET` request
         * @param {any} config - The request configuration
         * @returns {PromiseLike} - The `AxiosPromise`
         */
        // @ts-ignore: FIXEME, needs contributing
        async get<T = any, R = AxiosResponse<T>>(config?: ExtraRequestConfig & AxiosRequestConfig): Promise<R>;

        /**
         * @property {function} post - The alias of the HTTP `POST` request
         * @param {any} data - The request post body
         * @param {any} config - The request configuration
         * @returns {PromiseLike} - The `AxiosPromise`
         */
        // @ts-ignore: FIXEME, needs contributing
        async post<T = any, R = AxiosResponse<T>>(data?: T, config?: ExtraRequestConfig & AxiosRequestConfig): Promise<R>;

        /**
         * @property {function} put - The alias of the HTTP 'PUT' request
         * @param {any} data - The request post body
         * @param {any} config - The request configuration
         * @returns {PromiseLike} - The `AxiosPromise`
         */
        // @ts-ignore: FIXEME, needs contributing
        async put<T = any, R = AxiosResponse<T>>(data?: T, config?: ExtraRequestConfig & AxiosRequestConfig): Promise<R>;

        /**
         * @property {function} patch - The alias of the HTTP 'PATCH' request
         * @param {any} data - The request post body
         * @param {any} config - The request configuration
         * @returns {PromiseLike} - The `AxiosPromise`
         */
        // @ts-ignore: FIXEME, needs contributing
        async patch<T = any, R = AxiosResponse<T>>(data?: T, config?: ExtraRequestConfig & AxiosRequestConfig): Promise<R>;

        /**
         * @property {function} delete - The alias of the HTTP 'DELETE' request
         * @param {any} config - The request configuration
         * @returns {PromiseLike} - The `AxiosPromise`
         */
        // @ts-ignore: FIXEME, needs contributing
        async delete<T = any, R = AxiosResponse<T>>(config?: ExtraRequestConfig & AxiosRequestConfig): Promise<R>;

        // @ts-ignore: FIXEME, needs contributing
        chain(thing: string): this

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
