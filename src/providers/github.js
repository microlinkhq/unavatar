'use strict'

const { AVATAR_SIZE } = require('../constant')
const got = require('got')

module.exports = async username => {
  try {
    const logoUrl = `https://github.com/${username}.png?size=${AVATAR_SIZE}`
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
