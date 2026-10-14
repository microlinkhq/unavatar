'use strict'

const { parseInput } = require('./mastodon')

const getAvatarUrl = ({ username, server }) =>
  `https://${server}/api/v3/user?username=${encodeURIComponent(username)}`

const getAvatar = body => {
  const pic = body?.person_view?.person?.avatar
  return typeof pic === 'string' && pic ? pic : undefined
}

module.exports = ({ got, isReservedIp }) =>
  async function lemmy (input) {
    const parsed = parseInput(input)
    if (!parsed) return

    if (await isReservedIp(parsed.server)) return

    const { statusCode, body } = await got(getAvatarUrl(parsed), {
      responseType: 'json',
      throwHttpErrors: false
    })

    if (statusCode >= 400) return

    return getAvatar(body)
  }

module.exports.parseInput = parseInput
module.exports.getAvatarUrl = getAvatarUrl
module.exports.getAvatar = getAvatar
