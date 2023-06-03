'use strict'

const { stringify } = require('querystring')

const { AVATAR_SIZE } = require('../constant')

module.exports = async function github ({ input }) {
  return `https://github.com/${input}.png?${stringify({
    size: AVATAR_SIZE
  })}`
}

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
