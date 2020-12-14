'use strict'

const got = require('got')

module.exports = async url => {
  const logoUrl = `https://icons.duckduckgo.com/ip3/${url}.ico`

  await got.head(logoUrl)
  return logoUrl
}

module.exports.supported = {
  email: false,
  username: false,
  domain: true
}
