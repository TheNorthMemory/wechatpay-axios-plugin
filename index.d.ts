import { AxiosStatic } from "axios";

/**
 * Wechatpay Axios Plugin
 */
export declare namespace WechatpayAxiosPlugin {
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

    type apiConfig = {
        mchid: string | number,
        serial: string,
        privateKey: string | Buffer,
        certs: platformCertificates
    }

    type platformCertificates = {
        [key: string]: string | Buffer
    }

    /**
     * `Axios.interceptors` registry a request(for APIv3 Authorization)
     *                           and a response(for APIv3 Verification)
     *
     * @param {AxiosStatic} axios The AxiosStatic
     * @param {string|number} mchid - The merchant ID
     * @param {string} serial - The serial number of the merchant public certificate
     * @param {string|Buffer} privateKey - The merchant private key certificate
     * @param {Object} certs - Pair of the `{serial: publicCert}`
     *
     * @returns {AxiosStatic} - A decorated AxiosStatic
     */
    function interceptor(axios: AxiosStatic, {mchid, serial, privateKey, certs}: apiConfig): AxiosStatic;

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
}

export declare const Formatter: WechatpayAxiosPlugin.Formatter;

export declare const Aes: WechatpayAxiosPlugin.Aes;

export declare const Rsa: WechatpayAxiosPlugin.Rsa;

export default WechatpayAxiosPlugin.interceptor;
