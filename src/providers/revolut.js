'use strict'

const getAvatarUrl = input =>
  `https://revolut.me/api/web-profile/${input}/picture`

module.exports = () =>
  function revolut (input) {
    return getAvatarUrl(input)
  }

module.exports.getAvatarUrl = getAvatarUrl
