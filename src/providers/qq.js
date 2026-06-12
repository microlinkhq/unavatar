'use strict'

// qlogo.cn serves a default placeholder for unknown numbers (gravatar-like),
// so the URL always resolves and misses can't be detected upfront.
const getAvatarUrl = input =>
  `https://q1.qlogo.cn/g?b=qq&nk=${encodeURIComponent(input)}&s=640`

module.exports = () =>
  function qq (input) {
    return getAvatarUrl(input)
  }

module.exports.getAvatarUrl = getAvatarUrl
