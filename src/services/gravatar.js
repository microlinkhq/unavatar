'use strict'

const crypto = require('crypto')

const md5 = str =>
  crypto
    .createHash('md5')
    .update(str)
    .digest('hex')

module.exports = async username =>
  `https://gravatar.com/avatar/${md5(username)}?size=500`

module.exports.supported = {
  email: true,
  username: false
}
