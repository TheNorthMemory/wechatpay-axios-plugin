import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

/**
 * Wechatpay Axios Plugin
 */
export namespace WechatpayAxiosPlugin {
    /**
     * Aes encrypt/decrypt using `aes-256-gcm` algorithm with `AAD`.
     */
    class Aes {
        /**
         * Encrypts plaintext.
         *
         * @param {string} iv - The initialization vector, 16 bytes string.
         * @param {string} key - The secret key, 32 bytes string.
         * @param {string} plaintext - Text to encode.
         * @param {string} aad - The additional authenticated data, maybe empty string.
         *
         * @returns {string} Base64-encoded ciphertext.
         */
        static encrypt(iv: string, key: string, plaintext: string, aad?: string): string;
        /**
         * Decrypts ciphertext.
         *
         * @param {string} iv - The initialization vector, 16 bytes string.
         * @param {string} key - The secret key, 32 bytes string.
         * @param {string} ciphertext - Base64-encoded ciphertext.
         * @param {string} aad - The additional authenticated data, maybe empty string.
         *
         * @returns {string} Utf-8 plaintext.
         */
        static decrypt(iv: string, key: string, ciphertext: string, aad?: string): string;
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
         * @param {array} keys - CSV headers.
         * @param {string} skipFirstChar - Skip the first character of the CSV line, default is true.
         * @param {string} separator - Split separator, default is ',`' (two chars).
         *
         * @returns {object} - The casted source line as Object
         */
        static castCsvLine(row: string, keys?: any[], skipFirstChar?: string, separator?: string): object;
        /**
         * Generate a random string aka `nonce`, similar as `crypto.randomBytes`.
         *
         * @param {number} size - Nonce string length, default is 32 bytes.
         *
         * @returns {string} 62 radix random string.
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
         * @param {string} body - The playload string, HTTP `GET` should be an empty string.
         *
         * @returns {string} - The content for `Rsa.sign`
         */
        static request(method: string, uri: string, timestamp: string | number, nonce: string, body?: string): string;
        /**
         * Formatting this `HTTP.response` for `Rsa.verify` input.
         *
         * @param {string|number} timestamp - The `Unix` timestamp, should be the one from `response.headers[wechatpay-timestamp]`.
         * @param {string} nonce - The `Nonce` string, should be the one from `response.headers[wechatpay-nonce]`.
         * @param {string} body - The response payload string, HTTP status(`204`) should be an empty string.
         *
         * @returns {string} - The content for `Rsa.verify`
         */
        static response(timestamp: string | number, nonce: string, body?: string): string;
    }

    /**
     * @typedef {Object} apiConfig - The wechatpay consumer side configuration
     * @prop {string|number} mchid - The merchant ID
     * @prop {string} serial - The serial number of the merchant certificate
     * @prop {string|Buffer} privateKey - The merchant private key certificate
     * @prop {platformCertificates} certs - The wechatpay provider size configuration, `{serial: publicCert}` pair
     */
    type apiConfig = {
        mchid: string | number,
        serial: string,
        privateKey: string | Buffer,
        certs: platformCertificates,
        secret?: string,
        merchant?: merchantCertificate
    }

    /**
     * @typedef {Object} merchantCertificate - The merchant certification for APIv2
     * @prop {string} key - The serial number of the wechatpay certificate
     */
    type merchantCertificate = {
        key?: string | Buffer,
        cert?: string | Buffer,
        pfx?: Buffer,
        passphase?: string
    }

    /**
     * @typedef {Object} platformCertificates - The wechatpay provider side configuration
     * @prop {string} key - The serial number of the wechatpay certificate
     */
    type platformCertificates = {
        [key: string]: string | Buffer
    }

    /**
     * register a named request as `signer`(for APIv3 Authorization)
     *      and a named response as `verifier`(for APIv3 Verification)
     * onto `Axios.interceptors`
     *
     * @param {AxiosInstance} axios - The AxiosInstance
     * @param {apiConfig} apiConfig - The wechatpay consumer side configuration
     *
     * @returns {AxiosInstance} - A decorated AxiosInstance
     */
    function interceptor(axios: AxiosInstance, {mchid, serial, privateKey, certs}: apiConfig): AxiosInstance;

    /**
     * Provides some methods for the RSA `sha256WithRSAEncryption` with `RSA_PKCS1_OAEP_PADDING`.
     */
    class Rsa {
        /**
         * Encrypts text with sha256WithRSAEncryption/RSA_PKCS1_OAEP_PADDING.
         * Node Limits >= 12.9.0 (`oaepHash` was added)
         *
         * @param {string} plaintext - Cleartext to encode.
         * @param {string|Buffer} publicCertificate - A PEM encoded public certificate.
         *
         * @returns {string} Base64-encoded ciphertext.
         */
        static encrypt(plaintext: string, publicCertificate: string | Buffer): string;
        /**
         * Decrypts base64 encoded string with `privateKeyCertificate`.
         * Node Limits >= 12.9.0 (`oaepHash` was added)
         *
         * @param {string} ciphertext - Was previously encrypted string using the corresponding public certificate.
         * @param {string|Buffer} privateKeyCertificate - A PEM encoded private key certificate.
         *
         * @returns {string} Utf-8 plaintext.
         */
        static decrypt(ciphertext: string, privateKeyCertificate: string | Buffer): string;
        /**
         * Creates and returns a `Sign` string that uses `sha256WithRSAEncryption`.
         *
         * @param {string} message - Content will be `crypto.Sign`.
         * @param {string|Buffer} privateKeyCertificate - A PEM encoded private key certificate.
         *
         * @returns {string} Base64-encoded signature.
         */
        static sign(message: string, privateKeyCertificate: string | Buffer): string;
        /**
         * Verifying the `message` with given `signature` string that uses `sha256WithRSAEncryption`.
         *
         * @param {string} message - Content will be `crypto.Verify`.
         * @param {string} signature - The base64-encoded ciphertext.
         * @param {string|Buffer} publicCertificate - A PEM encoded public certificate.
         *
         * @returns {boolean} True is passed, false is failed.
         */
        static verify(message: string, signature: string, publicCertificate: string | Buffer): boolean;
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
        * @param {string|number} [config[.mchid] - The merchant ID
        * @param {string} [config.secret] - The merchant secret key string
        * @param {object} [config.merchant] - The merchant certificates, more @see {import('tls').createSecureContext}
        * @param {string|buffer} [config.merchant.cert] - The merchant cert chains in PEM format
        * @param {string|buffer} [config.merchant.key] - The merchant private keys in PEM format
        * @param {string|buffer} [config.merchant.pfx] - The merchant PFX or PKCS12 encoded private key and certificate chain.
        * @param {string|buffer} [config.merchant.passphrase] - The merchant shared passphrase used for a single private key and/or a PFX.
        *
        * @returns {AxiosInstance} - The axios instance
        */
        static xmlBased(config?: {
            mchid: string | number;
            secret: string;
            merchant: merchantCertificate;
        }): AxiosInstance;
        /**
        * Create an APIv3's client
        *
        * @param {object} config - configuration
        * @param {string|number} config.mchid - The merchant ID
        * @param {string} config.serial - The serial number of the merchant certificate
        * @param {string|Buffer} config.privateKey - The merchant private key certificate
        * @param {object} config.certs - The wechatpay provider size configuration, `{serial: publicCert}` pair
        *
        * @returns {AxiosInstance} - The axios instance
        */
        static jsonBased(config?: {
            mchid: string | number;
            serial: string;
            privateKey: string | Buffer;
            certs: platformCertificates;
        }): AxiosInstance;
        /**
        * Decorate factory
        * @param {object} config - configuration
        * @param {string|number} config.mchid - The merchant ID
        * @param {string} config.serial - The serial number of the merchant certificate
        * @param {string|Buffer} config.privateKey - The merchant private key certificate
        * @param {object} config.certs - The wechatpay provider size configuration, `{serial: publicCert}` pair
        * @param {string} [config.secret] - The merchant secret key string
        * @param {object} [config.merchant] - The merchant certificates, more @see {import('tls').createSecureContext}
        * @param {string|buffer} [config.merchant.cert] - The merchant cert chains in PEM format
        * @param {string|buffer} [config.merchant.key] - The merchant private keys in PEM format
        * @param {string|buffer} [config.merchant.pfx] - The merchant PFX or PKCS12 encoded private key and certificate chain.
        * @param {string|buffer} [config.merchant.passphrase] - The merchant shared passphrase used for a single private key and/or a PFX.
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
        * @param {object|Buffer} [data] - The data.
        * @param {object} [config] - The config.
        *
        * @returns {PromiseLike} - The `AxiosPromise`
        */
        request<T = any, R = AxiosResponse<T>>(pathname?: string | undefined, method?: string | undefined, data?: object | any, config?: AxiosRequestConfig): PromiseLike<R>;
    }

    /**
     * A Wechatpay APIv2&v3's amazing client.
     *
     * ```js
     * const {Wechatpay} = require('wechatpay-axios-plugin')
     * const wxpay = new Wechatpay({
     *   mchid,
     *   serial,
     *   privateKey: '-----BEGIN PRIVATE KEY-----' + '...' + '-----END PRIVATE KEY-----',
     *   certs: {
     *     'serial_number': '-----BEGIN CERTIFICATE-----' + '...' + '-----END CERTIFICATE-----'
     *   },
     *   secret,
     *   merchant: {
     *     cert,
     *     key,
     *     // pfx,
     *     // passphase,
     *   }
     * })
     *
     * wxpay.v2.pay.micropay({}).then(console.info).catch(console.error)
     *
     * wxpay.v2.secapi.pay.refund.POST({}).then(console.info).catch(console.error)
     *
     * wxpay.V3.Marketing.Busifavor.Stocks.post({})
     *   .then(({data}) => console.info(data))
     *   .catch(({response: {data}}) => console.error(data))
     *
     * wxpay.V3.Pay.Transactions.Native.post({})
     *   .then(({data: {code_url}}) => console.info(code_url))
     *   .catch(({response: {data}}) => console.error(data))
     *
     * ;(async () => {
     *   try {
     *     const {data: detail} = await wxpay.V3.Pay.Transactions.Id.$transaction_id$
     *       .get({params: {mchid: '1230000109'}, transaction_id: '1217752501201407033233368018'})
     *     // or simple like this
     *     // const {data: detail} = await wxpay.V3.Pay.Transactions.Id['{transaction_id}']
     *     //   .get({params: {mchid: '1230000109'}, transaction_id: '1217752501201407033233368018'})
     *     // or simple like this
     *     // const {data: detail} = await wxpay.v3.pay.transactions.id['1217752501201407033233368018']
     *     //   .get({params: {mchid: '1230000109'}})
     *     console.info(detail)
     *   } catch({response: {status, statusText, data}}) {
     *     console.error(status, statusText, data)
     *   }
     * })()
     * ```
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
         * @param {...any} arg - The request arguments
         * @returns {PromiseLike} - The `AxiosPromise`
         */
        GET<T = any, R = AxiosResponse<T>>(config?: AxiosRequestConfig): Promise<R>;

        /**
         * @property {function} POST - The alias of the HTTP `POST` request
         * @param {...any} arg - The request arguments
         * @returns {PromiseLike} - The `AxiosPromise`
         */
        POST<T = any, R = AxiosResponse<T>>(data?: any, config?: AxiosRequestConfig): Promise<R>;

        /**
         * @property {function} PUT - The alias of the HTTP 'PUT' request
         * @param {...any} arg - The request arguments
         * @returns {PromiseLike} - The `AxiosPromise`
         */
        PUT<T = any, R = AxiosResponse<T>>(data?: any, config?: AxiosRequestConfig): Promise<R>;

        /**
         * @property {function} PATCH - The alias of the HTTP 'PATCH' request
         * @param {...any} arg - The request arguments
         * @returns {PromiseLike} - The `AxiosPromise`
         */
        PATCH<T = any, R = AxiosResponse<T>>(data?: any, config?: AxiosRequestConfig): Promise<R>;

        /**
         * @property {function} DELETE - The alias of the HTTP 'DELETE' request
         * @param {...any} arg - The request arguments
         * @returns {PromiseLike} - The `AxiosPromise`
         */
        DELETE<T = any, R = AxiosResponse<T>>(config?: AxiosRequestConfig): Promise<R>;

        /**
         * @property {function} get - The alias of the HTTP `GET` request
         * @param {...any} arg - The request arguments
         * @returns {PromiseLike} - The `AxiosPromise`
         */
        get<T = any, R = AxiosResponse<T>>(config?: AxiosRequestConfig): Promise<R>;

        /**
         * @property {function} post - The alias of the HTTP `POST` request
         * @param {...any} arg - The request arguments
         * @returns {PromiseLike} - The `AxiosPromise`
         */
        post<T = any, R = AxiosResponse<T>>(data?: any, config?: AxiosRequestConfig): Promise<R>;

        /**
         * @property {function} put - The alias of the HTTP 'PUT' request
         * @param {...any} arg - The request arguments
         * @returns {PromiseLike} - The `AxiosPromise`
         */
        put<T = any, R = AxiosResponse<T>>(data?: any, config?: AxiosRequestConfig): Promise<R>;

        /**
         * @property {function} patch - The alias of the HTTP 'PATCH' request
         * @param {...any} arg - The request arguments
         * @returns {PromiseLike} - The `AxiosPromise`
         */
        patch<T = any, R = AxiosResponse<T>>(data?: any, config?: AxiosRequestConfig): Promise<R>;

        /**
         * @property {function} delete - The alias of the HTTP 'DELETE' request
         * @param {...any} arg - The request arguments
         * @returns {PromiseLike} - The `AxiosPromise`
         */
        delete<T = any, R = AxiosResponse<T>>(config?: AxiosRequestConfig): Promise<R>;

        [key: string]: this
    }
}

export class Formatter extends WechatpayAxiosPlugin.Formatter{}

export class Aes extends WechatpayAxiosPlugin.Aes{}

export class Rsa extends WechatpayAxiosPlugin.Rsa{}

export class Decorator extends WechatpayAxiosPlugin.Decorator{}

export class Wechatpay extends WechatpayAxiosPlugin.Wechatpay {}

export default WechatpayAxiosPlugin.interceptor;
