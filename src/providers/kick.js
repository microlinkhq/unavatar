'use strict'

const API_URL = 'https://kick.com/api/v2/channels'

const getAvatarUrl = input => `${API_URL}/${encodeURIComponent(input)}`

const getAvatar = body => {
  const pic = body?.user?.profile_pic
  return typeof pic === 'string' && pic ? pic : undefined
}

module.exports = ({ got }) =>
  async function kick (input) {
    const { body, statusCode } = await got(getAvatarUrl(input), {
      responseType: 'json',
      throwHttpErrors: false
    })

    if (statusCode >= 400) return

    return getAvatar(body)
  }

module.exports.getAvatarUrl = getAvatarUrl
module.exports.getAvatar = getAvatar
