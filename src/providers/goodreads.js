'use strict'

const GOODREADS_URL = 'https://www.goodreads.com'
const USER_ID_PATTERN = /^\d+(?:-[\w-]*)?$/
const IMAGE_SIZE_PATTERN = /p\d+(\/[^/]+)$/
const LARGEST_IMAGE_SIZE = 'p8'
const NO_PHOTO_PATH = '/nophoto/'

const MAX_INPUT_FIELDS = 2

const parseInput = input => {
  const fields = input.split(':')
  if (fields.length > MAX_INPUT_FIELDS || fields.some(field => !field)) return
  const [first, second] = fields
  return second ? { type: first, id: second } : { type: 'user', id: first }
}

const getUserProfileUrl = id =>
  USER_ID_PATTERN.test(id)
    ? `${GOODREADS_URL}/user/show/${id}`
    : `${GOODREADS_URL}/${encodeURIComponent(id)}`

const getAuthorProfileUrl = id =>
  `${GOODREADS_URL}/author/show/${encodeURIComponent(id)}`

const getAvatarUrl = input => {
  const parsed = parseInput(input)
  if (!parsed) throw new Error(`Invalid Goodreads input: ${input}`)
  const { type, id } = parsed

  switch (type) {
    case 'user':
      return getUserProfileUrl(id)
    case 'author':
      return getAuthorProfileUrl(id)
    default:
      throw new Error(`Unsupported Goodreads type: ${type}`)
  }
}

const getAvatar = ({ $, getOgImage, NOT_FOUND }) => {
  const image = getOgImage($)
  if (!image) return
  if (image.includes(NO_PHOTO_PATH)) return NOT_FOUND
  return image.replace(IMAGE_SIZE_PATTERN, `${LARGEST_IMAGE_SIZE}$1`)
}

module.exports = ({ createHtmlProvider, getOgImage, NOT_FOUND }) => {
  const htmlProvider = createHtmlProvider({
    name: 'goodreads',
    url: getAvatarUrl,
    getter: $ => getAvatar({ $, getOgImage, NOT_FOUND })
  })

  const provider = (input, context) =>
    parseInput(input) ? htmlProvider(input, context) : undefined

  provider.getUrl = getAvatarUrl
  return provider
}

module.exports.parseInput = parseInput
module.exports.getAvatarUrl = getAvatarUrl
module.exports.getAvatar = getAvatar
