'use strict'

const API_URL = 'https://www.speedrun.com/api/v1/users'
const FILE_EXTENSION_RE = /\.\w+$/

const getAvatarUrl = input => `${API_URL}/${encodeURIComponent(input)}`

const toStaticImageUrl = input => {
  const url = new URL(input)
  if (!FILE_EXTENSION_RE.test(url.pathname)) url.pathname += '.png'
  return url.toString()
}

const getAvatar = body => {
  const pic = body?.data?.assets?.image?.uri
  return typeof pic === 'string' && pic ? toStaticImageUrl(pic) : undefined
}

module.exports = ({ got }) =>
  async function speedrun (input) {
    const { body, statusCode } = await got(getAvatarUrl(input), {
      responseType: 'json',
      throwHttpErrors: false
    })

    if (statusCode >= 400) return

    return getAvatar(body)
  }

module.exports.getAvatarUrl = getAvatarUrl
module.exports.getAvatar = getAvatar
