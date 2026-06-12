'use strict'

const API_URL = 'https://www.zhihu.com/api/v4/members'

const getAvatarUrl = input =>
  `${API_URL}/${encodeURIComponent(input)}?include=avatar_url`

// Misses (and bot challenges) come back as an `error` payload rather than
// a plain 404, and default avatars are flagged via `use_default_avatar`.
const getAvatar = body => {
  if (!body || body.error || body.use_default_avatar) return
  return body.avatar_url || undefined
}

module.exports = ({ got }) =>
  async function zhihu (input) {
    const { body, statusCode } = await got(getAvatarUrl(input), {
      responseType: 'json',
      throwHttpErrors: false
    })

    if (statusCode >= 400) return

    return getAvatar(body)
  }

module.exports.getAvatarUrl = getAvatarUrl
module.exports.getAvatar = getAvatar
