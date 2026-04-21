'use strict'

const crypto = require('crypto')

const stringify = require('../util/stringify')
const IS_HASH = require('../util/is-hash')

const sha256 = str => crypto.createHash('sha256').update(str).digest('hex')

const toHash = input =>
  IS_HASH.test(input) ? input.toLowerCase() : sha256(input.trim().toLowerCase())

module.exports = ({ constants }) =>
  function gravatar (input) {
    return `https://gravatar.com/avatar/${toHash(input)}?${stringify({
      size: constants.AVATAR_SIZE,
      d: '404'
    })}`
  }
