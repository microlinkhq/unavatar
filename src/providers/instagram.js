'use strict'

const mql = require('@microlink/mql')
const { get } = require('lodash')

module.exports = async function telegram (username, { headers = {} } = {}) {
  const { data } = await mql(`https://www.instagram.com/${username}`, {
    apiKey: headers['x-api-key']
  })
  const avatarUrl = get(data, 'image.url')
  return avatarUrl && !avatarUrl.includes('/static/') && avatarUrl
}

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
