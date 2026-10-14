'use strict'

const API_URL = 'https://api.sketchfab.com/v3/users'

const DEFAULT_AVATAR_UIDS = new Set([
  '3ef1bd11d3eb4b57a0b353e8f2e5fc3e',
  '51af6a870cce449eb75b0345feebaebb',
  '78fa317e46024a5283765aa34df5e508'
])

const getAvatarUrl = input =>
  `${API_URL}/@${encodeURIComponent(input.replace(/^@/, ''))}`

const getAvatar = body => {
  const avatar = body?.avatar
  if (!avatar || DEFAULT_AVATAR_UIDS.has(avatar.uid)) return

  const largest = (avatar.images ?? []).reduce(
    (best, image) => (image.width > (best?.width ?? 0) ? image : best),
    undefined
  )

  return largest?.url || undefined
}

module.exports = ({ got }) =>
  async function sketchfab (input) {
    const { body, statusCode } = await got(getAvatarUrl(input), {
      responseType: 'json',
      throwHttpErrors: false
    })

    if (statusCode >= 400) return

    return getAvatar(body)
  }

module.exports.getAvatarUrl = getAvatarUrl
module.exports.getAvatar = getAvatar
