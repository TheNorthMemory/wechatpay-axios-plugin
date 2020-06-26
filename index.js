const interceptor = require('./lib/interceptor')
module.exports = interceptor
module.exports.Rsa = require('./lib/rsa')
module.exports.Aes = require('./lib/aes')
module.exports.Formatter = require('./lib/formatter')
module.exports.default = interceptor
