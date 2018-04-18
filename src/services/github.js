'use strict'

module.exports = async username =>
  `https://avatars.githubusercontent.com/${username}?size=500`

module.exports.supported = {
  email: false,
  username: true
}
