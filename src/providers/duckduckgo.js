'use strict'

module.exports = async url => `https://icons.duckduckgo.com/ip3/${url}.ico`

module.exports.supported = {
  email: false,
  username: false,
  domain: true
}
