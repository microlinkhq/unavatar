'use strict'

const { avatarSize } = require('../constant')
const got = require('got')

module.exports = async username => {
  try {
    await got.head(`https://github.com/${username}.png?size=${avatarSize}`)
  } catch (err) {
    return null
  }
}

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
