'use strict'

const { avatarSize } = require('../constant')
const got = require('got')

module.exports = async username => {
  try {
    const logoUrl = `https://github.com/${username}.png?size=${avatarSize}`
    await got.head(logoUrl)
    return logoUrl
  } catch (err) {
    return null
  }
}

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
