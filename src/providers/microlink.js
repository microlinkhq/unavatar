'use strict'

const mql = require('@microlink/mql')
const { get } = require('lodash')

module.exports = async (domain, { headers }) => {
  const { data } = await mql(`https://${domain}`, {
    apiKey: headers['x-api-key']
  })
  return get(data, 'logo.url')
}

module.exports.supported = {
  email: false,
  username: false,
  domain: true
}
