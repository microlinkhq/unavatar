'use strict'

const API_URL = 'https://www.wattpad.com/api/v3/users'

const MAX_AVATAR_SIZE = 256

const AVATAR_SIZE_RE = /\.\d+(\.\d+\.\w+)$/

const STOCK_DEFAULT_AVATAR_RE = /\/useravatar\/[0-9a-f]\.\d+\.\w+$/

const getAvatarUrl = input =>
  `${API_URL}/${encodeURIComponent(input.replace(/^@/, ''))}?fields=avatar`

const getAvatar = body => {
  const avatar = body?.avatar
  if (typeof avatar !== 'string' || !avatar) return
  if (STOCK_DEFAULT_AVATAR_RE.test(avatar)) return
  return avatar.replace(AVATAR_SIZE_RE, `.${MAX_AVATAR_SIZE}$1`)
}

module.exports = ({ got }) =>
  async function wattpad (input) {
    const { body, statusCode } = await got(getAvatarUrl(input), {
      responseType: 'json',
      throwHttpErrors: false
    })

    if (statusCode >= 400) return

    return getAvatar(body)
  }

module.exports.getAvatarUrl = getAvatarUrl
module.exports.getAvatar = getAvatar
