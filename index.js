module.exports = require('./lib/wechatpay');

module.exports.Wechatpay = module.exports;
module.exports.default = module.exports;

module.exports.Rsa = require('./lib/rsa');
module.exports.Aes = require('./lib/aes');
module.exports.Hash = require('./lib/hash');
module.exports.FormData = require('./lib/multipart');
module.exports.Formatter = require('./lib/formatter');
module.exports.Transformer = require('./lib/transformer');
module.exports.Decorator = require('./lib/decorator');

module.exports.Multipart = module.exports.FormData.Multipart;
