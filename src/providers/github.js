'use strict'

const { stringify } = require('querystring')

const { AVATAR_SIZE } = require('../constant')

module.exports = async username =>
  `https://github.com/${username}.png?${stringify({
    size: AVATAR_SIZE
  })}`

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
