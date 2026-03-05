'use strict'

const crypto = require('crypto')

const stringify = require('../util/stringify')

const md5 = str => crypto.createHash('md5').update(str).digest('hex')

module.exports = ({ constants }) =>
  function gravatar ({ input }) {
    return `https://gravatar.com/avatar/${md5(input.trim().toLowerCase())}?${stringify({
      size: constants.AVATAR_SIZE,
      d: '404'
    })}`
  }
