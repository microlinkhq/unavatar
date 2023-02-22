'use strict'

const { stringify } = require('querystring')
const crypto = require('crypto')

const { AVATAR_SIZE } = require('../constant')

const md5 = str => crypto.createHash('md5').update(str).digest('hex')

module.exports = function gravatar (username) {
  return `https://gravatar.com/avatar/${md5(
    username.trim().toLowerCase()
  )}?${stringify({
    size: AVATAR_SIZE,
    d: '404'
  })}`
}

module.exports.supported = {
  email: true,
  username: false,
  domain: false
}
