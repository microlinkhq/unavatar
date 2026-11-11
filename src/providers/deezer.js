'use strict'

const API_URL = 'https://api.deezer.com'

const MISSING_ERROR_CODES = new Set([600, 800])
const QUOTA_ERROR_CODE = 4

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

const isBlocked = ({ body }) => body?.error?.code === QUOTA_ERROR_CODE

const getAvatar = ({ body, NOT_FOUND }) => {
  if (MISSING_ERROR_CODES.has(body?.error?.code)) return NOT_FOUND
  if (body?.id === undefined) return undefined

  const pic = body.picture_xl || body.cover_xl || body.album?.cover_xl
  if (typeof pic !== 'string' || !pic || !isArtwork(pic)) return NOT_FOUND
  return pic
}

const hasWhitespace = input => /\s/.test(input)

const factory = ({ createApiProvider, NOT_FOUND }) => {
  const apiProvider = createApiProvider({
    name: 'deezer',
    url: getAvatarUrl,
    isBlocked,
    getter: ({ body }) => getAvatar({ body, NOT_FOUND })
  })

  const provider = (input, context) =>
    hasWhitespace(input) ? undefined : apiProvider(input, context)

  provider.getUrl = getAvatarUrl
  return provider
}

factory.parseInput = parseInput
factory.getAvatarUrl = getAvatarUrl
factory.getAvatar = getAvatar
factory.isBlocked = isBlocked

module.exports = factory
