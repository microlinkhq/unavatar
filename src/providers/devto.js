'use strict'

const API_URL = 'https://dev.to/api'

const PLACEHOLDER_URL =
  'https://thepracticaldev.s3.amazonaws.com/i/99mvlsfu5tfj9m7ku25d.png'

const RESIZED_IMAGE_RE = /^(.+\/dynamic\/image\/)([^/]+)\/(https?%3A%2F%2F.+)$/i

const DIMENSION_RE = /\b(width|height)=\d+/g

const parseInput = input => input.trim().replace(/^@/, '').toLowerCase()

const getUserAvatarUrl = input =>
  `${API_URL}/users/by_username?url=${encodeURIComponent(input)}`

const getOrganizationAvatarUrl = input =>
  `${API_URL}/organizations/${encodeURIComponent(input)}`

const getAvatar = ({ body, size }) => {
  const image = body?.profile_image
  if (typeof image !== 'string' || !image) return

  const match = RESIZED_IMAGE_RE.exec(image)
  const originalUrl = match ? decodeURIComponent(match[3]) : image
  if (originalUrl === PLACEHOLDER_URL) return
  if (!match) return image

  const [, prefix, options, encodedOriginalUrl] = match
  const resizedOptions = options.replace(DIMENSION_RE, `$1=${size}`)
  return `${prefix}${resizedOptions}/${encodedOriginalUrl}`
}

const fetchAvatarUrl = async ({ got, url, size }) => {
  const { statusCode, body } = await got(url, {
    responseType: 'json',
    throwHttpErrors: false
  })

  if (statusCode >= 400) return

  return getAvatar({ body, size })
}

module.exports = ({ constants, got }) =>
  async function devto (input) {
    const username = parseInput(input)
    const size = constants.AVATAR_SIZE

    const userAvatarUrl = await fetchAvatarUrl({
      got,
      size,
      url: getUserAvatarUrl(username)
    })
    if (userAvatarUrl) return userAvatarUrl

    return fetchAvatarUrl({
      got,
      size,
      url: getOrganizationAvatarUrl(username)
    })
  }

module.exports.parseInput = parseInput
module.exports.getUserAvatarUrl = getUserAvatarUrl
module.exports.getOrganizationAvatarUrl = getOrganizationAvatarUrl
module.exports.getAvatar = getAvatar
