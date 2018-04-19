'use strict'

const { avatarSize } = require('../constant')

module.exports = async username =>
  `https://avatars.githubusercontent.com/${username}?size=${avatarSize}`

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
