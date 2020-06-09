'use strict'

const { stringify } = require('querystring')
const got = require('got')

const { AVATAR_SIZE } = require('../constant')

module.exports = async username => {
  const logoUrl = `https://github.com/${username}.png?${stringify({
    size: AVATAR_SIZE
  })}`
  await got.head(logoUrl)
  return logoUrl
}

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
