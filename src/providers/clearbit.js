'use strict'

const got = require('got')

const { AVATAR_SIZE } = require('../constant')

module.exports = async url => {
  const logoUrl = `https://logo.clearbit.com/${url}?size=${AVATAR_SIZE}`

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
