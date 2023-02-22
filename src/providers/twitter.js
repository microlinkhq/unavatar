'use strict'

const mql = require('@microlink/mql')
const { get } = require('lodash')

module.exports = async function twitter (username, { headers = {} } = {}) {
  const { data } = await mql(`https://twitter.com/${username}`, {
    apiKey: headers['x-api-key'],
    force: true
  })

  return get(data, 'image.url', '')
}

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
