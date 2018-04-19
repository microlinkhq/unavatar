'use strict'

const { avatarSize } = require('../constant')

module.exports = async username =>
  `https://github.com/${username}.png?size=${avatarSize}`

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
