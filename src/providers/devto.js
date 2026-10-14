'use strict'

const API_URL = 'https://dev.to/api'

const PLACEHOLDER_URL =
  'https://thepracticaldev.s3.amazonaws.com/i/99mvlsfu5tfj9m7ku25d.png'

const RESIZED_IMAGE_RE = /\/dynamic\/image\/[^/]+\/(https?%3A%2F%2F.+)$/i

const parseInput = input => input.trim().replace(/^@/, '').toLowerCase()

const getUserAvatarUrl = input =>
  `${API_URL}/users/by_username?url=${encodeURIComponent(input)}`

const getOrganizationAvatarUrl = input =>
  `${API_URL}/organizations/${encodeURIComponent(input)}`

const getOriginalImageUrl = url => {
  const match = RESIZED_IMAGE_RE.exec(url)
  return match ? decodeURIComponent(match[1]) : url
}

const getAvatar = body => {
  const image = body?.profile_image
  if (typeof image !== 'string' || !image) return
  const url = getOriginalImageUrl(image)
  return url === PLACEHOLDER_URL ? undefined : url
}

const fetchAvatarUrl = async ({ got, url }) => {
  const { statusCode, body } = await got(url, {
    responseType: 'json',
    throwHttpErrors: false
  })

  if (statusCode >= 400) return

  return getAvatar(body)
}

module.exports = ({ got }) =>
  async function devto (input) {
    const username = parseInput(input)

    const userAvatarUrl = await fetchAvatarUrl({
      got,
      url: getUserAvatarUrl(username)
    })
    if (userAvatarUrl) return userAvatarUrl

    return fetchAvatarUrl({ got, url: getOrganizationAvatarUrl(username) })
  }

module.exports.parseInput = parseInput
module.exports.getUserAvatarUrl = getUserAvatarUrl
module.exports.getOrganizationAvatarUrl = getOrganizationAvatarUrl
module.exports.getAvatar = getAvatar
