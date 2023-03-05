'use strict'

const mql = require('@microlink/mql')

module.exports = async function microlink (domain, { headers = {} } = {}) {
  const { data } = await mql(`https://${domain}`, {
    apiKey: headers['x-api-key']
  })
  return data.logo?.url
}

module.exports.supported = {
  email: false,
  username: false,
  domain: true
}
