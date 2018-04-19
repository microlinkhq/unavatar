'use strict'

const got = require('got')

const { avatarSize } = require('../constant')

module.exports = async url => {
  const logoUrl = `https://logo.clearbit.com/${url}?size=${avatarSize}`

  try {
    await got.head(logoUrl)
    return logoUrl
  } catch (err) {
    return null
  }
}

module.exports.supported = {
  email: false,
  username: false,
  domain: true
}
