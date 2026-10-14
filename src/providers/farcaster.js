'use strict'

const API_URL = 'https://api.warpcast.com/v2/user-by-username'

const parseInput = input => input.trim().replace(/^@/, '').toLowerCase()

const getAvatarUrl = input =>
  `${API_URL}?username=${encodeURIComponent(parseInput(input))}`

const getAvatar = body => {
  const pic = body?.result?.user?.pfp?.url
  return typeof pic === 'string' && pic ? pic : undefined
}

module.exports = ({ got }) =>
  async function farcaster (input) {
    const { body, statusCode } = await got(getAvatarUrl(input), {
      responseType: 'json',
      throwHttpErrors: false
    })

    if (statusCode >= 400) return

    return getAvatar(body)
  }

module.exports.parseInput = parseInput
module.exports.getAvatarUrl = getAvatarUrl
module.exports.getAvatar = getAvatar
