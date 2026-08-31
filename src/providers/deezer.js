'use strict'

const API_URL = 'https://api.deezer.com'

// Entities without artwork keep an empty image hash
// (cdn-images.dzcdn.net/images/artist//500x500.jpg), which resolves to a
// generic placeholder, so any empty hash segment is treated as a miss.
const isArtwork = url => !/\/images\/[^/]+\/\/\d/.test(url)

const parseInput = input => {
  const [first, second] = input.split(':')
  return {
    type: second ? first : 'artist',
    id: second ?? first
  }
}

const getAvatarUrl = input => {
  const { type, id } = parseInput(input)
  return `${API_URL}/${encodeURIComponent(type)}/${encodeURIComponent(id)}`
}

const getAvatar = body => {
  if (body?.error) return

  const pic = body?.picture_xl || body?.cover_xl || body?.album?.cover_xl
  return typeof pic === 'string' && pic && isArtwork(pic) ? pic : undefined
}

module.exports = ({ got }) =>
  async function deezer (input) {
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
