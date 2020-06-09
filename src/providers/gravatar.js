'use strict'

const { stringify } = require('querystring')
const crypto = require('crypto')
const got = require('got')

const { AVATAR_SIZE } = require('../constant')

const md5 = str =>
  crypto
    .createHash('md5')
    .update(str)
    .digest('hex')

module.exports = async username => {
  const avatarUrl = `https://gravatar.com/avatar/${md5(username.trim().toLowerCase())}?${stringify({
    size: AVATAR_SIZE,
    d: '404'
  })}`
  await got.head(avatarUrl)
  return avatarUrl
}

module.exports.supported = {
  email: true,
  username: false,
  domain: false
}
