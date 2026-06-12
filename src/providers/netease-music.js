'use strict'

const API_URL = 'https://music.163.com/api/v1/user/detail'

const getAvatarUrl = input => `${API_URL}/${encodeURIComponent(input)}`

// The API returns avatar URLs over plain HTTP; the CDN supports HTTPS.
const getAvatar = body => {
  const avatarUrl = body?.profile?.avatarUrl
  return avatarUrl ? avatarUrl.replace(/^http:/, 'https:') : undefined
}

module.exports = ({ got }) =>
  async function neteaseMusic (input) {
    const { body, statusCode } = await got(getAvatarUrl(input), {
      responseType: 'json',
      throwHttpErrors: false
    })

    if (statusCode >= 400) return

    return getAvatar(body)
  }

module.exports.getAvatarUrl = getAvatarUrl
module.exports.getAvatar = getAvatar
