'use strict'

const { stringify } = require('querystring')

module.exports = async (url, { headers }) => {
  const endpoint = headers['x-api-key'] ? 'pro' : 'api'
  return `https://${endpoint}.microlink.io?${stringify({
    url: `https://${url}`,
    embed: 'logo.url'
  })}`
}

module.exports.supported = {
  email: false,
  username: false,
  domain: true
}
