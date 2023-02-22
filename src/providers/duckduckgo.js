'use strict'

module.exports = function duckduckgo (url) {
  return `https://icons.duckduckgo.com/ip3/${url}.ico`
}

module.exports.supported = {
  email: false,
  username: false,
  domain: true
}
