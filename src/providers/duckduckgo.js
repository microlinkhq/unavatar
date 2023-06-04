'use strict'

module.exports = function duckduckgo ({ input }) {
  return `https://icons.duckduckgo.com/ip3/${input}.ico`
}

module.exports.supported = {
  email: false,
  username: false,
  domain: true
}
