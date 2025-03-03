/* eslint max-classes-per-file: ["error", 2] */
const Base = require('@thenorthmemory/multipart');
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
 * (new Multipart())
 *   .append('f', require('fs').createReadStream('/path/your/file2.jpg'), 'file2.jpg')
 *   .pipe(require('fs').createWriteStream('./file3.jpg'));
 */
class Multipart extends Base {
  /**
   * The WeChatPay APIv3' specific, the `meta` JSON
   *
   * @return {MetaField|null} - The `meta` information.
   */
  toJSON() { return this.has('meta') ? JSON.parse(this.get('meta')) : null; }

  static get default() { return this; }

  static get FormData() { /* eslint-disable-line no-use-before-define */ return FormData; }

  static get [Symbol.toStringTag]() { return super[Symbol.toStringTag]; }

  get [Symbol.toStringTag]() { return super[Symbol.toStringTag]; }
}

class FormData extends Multipart {}

/**
 * @typedef FileMetaGeneral
 * @prop {string} filename
 * @prop {string} sha256
 * @typedef FileMetaSpecial
 * @prop {string} file_name
 * @prop {string} file_digest
 * @typedef FileMetaWithBankType
 * @prop {string} filename
 * @prop {string} sha256
 * @prop {string} bank_type
 * @typedef FileMetaWithTransaction
 * @prop {string} transaction_id
 * @prop {string} transaction_mchid
 * @prop {string=} transaction_sub_mchid
 * @prop {string} out_trade_no
 * @prop {string} openid
 * @prop {string} sha256
 * @prop {string} upload_time
 * @prop {{consultation_phone_number: string}} merchant_contact_information
 * @typedef FileMetaWithFapiao
 * @prop {string} sub_mchid
 * @prop {'PDF'|'OFD'} file_type
 * @prop {'SM3'} digest_alogrithm
 * @prop {string} digest
 * @typedef FileMetaWithTaxiFapiao
 * @prop {string} company_mchid
 * @prop {number} region_id
 * @prop {'DIGEST_ALGORITHM_SM3'} digest_algorithm
 * @prop {string} digest
 * @typedef {FileMetaGeneral
 *  | FileMetaSpecial
 *  | FileMetaWithBankType
 *  | FileMetaWithTransaction
 *  | FileMetaWithFapiao
 *  | FileMetaWithTaxiFapiao} MetaField
 */

module.exports = Multipart;
