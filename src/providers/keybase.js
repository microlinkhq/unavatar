'use strict'

const stringify = require('../util/stringify')

const API_URL = 'https://keybase.io/_/api/1.0/user/lookup.json'

const getAvatarUrl = input =>
  `${API_URL}?${stringify({ username: input, fields: 'pictures' })}`

const getAvatar = body => body?.them?.pictures?.primary?.url || undefined

module.exports = ({ got }) =>
  async function keybase (input) {
    const { body, statusCode } = await got(getAvatarUrl(input), {
      responseType: 'json',
      throwHttpErrors: false
    })

    if (statusCode >= 400) return

    return getAvatar(body)
  }

module.exports.getAvatarUrl = getAvatarUrl
module.exports.getAvatar = getAvatar
