'use strict'

const { stringify } = require('querystring')

module.exports = async (username, { headers }) => {
  const endpoint = headers['x-api-key'] ? 'pro' : 'api'
  return `https://${endpoint}.microlink.io?${stringify({
    url: `https://twitter.com/${username}`,
    embed: 'logo.url'
  })}`
}

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
