'use strict'

const mql = require('@microlink/mql')
const { get } = require('lodash')

const REGEX_IMG_MODIFIERS = /_(?:bigger|mini|normal)\./
const ORIGINAL_IMG_SIZE = '_400x400'

module.exports = async (username, { headers = {} } = {}) => {
  const { data } = await mql(`https://twitter.com/${username}`, {
    waitForTimeout: 700,
    apiKey: headers['x-api-key'],
    force: true
  })
  const avatarUrl = get(data, 'image.url', '')
  return avatarUrl.replace(REGEX_IMG_MODIFIERS, `${ORIGINAL_IMG_SIZE}.`)
}

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
