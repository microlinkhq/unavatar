'use strict'

const API_URL = 'https://api.chess.com/pub/player'

const getAvatarUrl = input =>
  `${API_URL}/${encodeURIComponent(input.toLowerCase())}`

const getAvatar = body => {
  const pic = body?.avatar
  return typeof pic === 'string' && pic ? pic : undefined
}

module.exports = ({ got }) =>
  async function chesscom (input) {
    const { body, statusCode } = await got(getAvatarUrl(input), {
      responseType: 'json',
      throwHttpErrors: false
    })

    if (statusCode >= 400) return

    return getAvatar(body)
  }

module.exports.getAvatarUrl = getAvatarUrl
module.exports.getAvatar = getAvatar
