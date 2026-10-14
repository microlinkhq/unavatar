'use strict'

const API_URL = 'https://note.com/api/v2/creators'
const DEFAULT_AVATAR_PATH = '/assets/default/'

const getAvatarUrl = input => `${API_URL}/${encodeURIComponent(input)}`

const getAvatar = body => {
  const url = body?.data?.profileImageUrl
  if (typeof url !== 'string' || !url) return
  if (new URL(url).pathname.startsWith(DEFAULT_AVATAR_PATH)) return
  return url
}

module.exports = ({ got }) =>
  async function note (input) {
    const { body, statusCode } = await got(getAvatarUrl(input), {
      responseType: 'json',
      throwHttpErrors: false
    })

    if (statusCode >= 400) return

    return getAvatar(body)
  }

module.exports.getAvatarUrl = getAvatarUrl
module.exports.getAvatar = getAvatar
