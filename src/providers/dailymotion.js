'use strict'

const API_URL = 'https://api.dailymotion.com/user'

const PLACEHOLDER_AVATAR_PATH_PREFIX = '/d/'

const isPlaceholderAvatar = url =>
  new URL(url).pathname.startsWith(PLACEHOLDER_AVATAR_PATH_PREFIX)

const getAvatarUrl = input =>
  `${API_URL}/${encodeURIComponent(input)}?fields=avatar_720_url`

const getAvatar = body => {
  const url = body?.avatar_720_url
  return typeof url === 'string' && url && !isPlaceholderAvatar(url)
    ? url
    : undefined
}

module.exports = ({ got }) =>
  async function dailymotion (input) {
    const { body, statusCode } = await got(getAvatarUrl(input), {
      responseType: 'json',
      throwHttpErrors: false
    })

    if (statusCode >= 400) return

    return getAvatar(body)
  }

module.exports.getAvatarUrl = getAvatarUrl
module.exports.getAvatar = getAvatar
