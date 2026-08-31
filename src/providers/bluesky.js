'use strict'

const API_URL = 'https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile'

const getAvatarUrl = input => `${API_URL}?actor=${encodeURIComponent(input)}`

const getAvatar = body => {
  const pic = body?.avatar
  return typeof pic === 'string' && pic ? pic : undefined
}

module.exports = ({ got }) =>
  async function bluesky (input) {
    const { body, statusCode } = await got(getAvatarUrl(input), {
      responseType: 'json',
      throwHttpErrors: false
    })

    if (statusCode >= 400) return

    return getAvatar(body)
  }

module.exports.getAvatarUrl = getAvatarUrl
module.exports.getAvatar = getAvatar
