'use strict'

const API_URL = 'https://api.stripe.com/v2/xauth_/network/business_profiles'

const normalizeHandle = input =>
  String(input || '')
    .trim()
    .replace(/^@/, '')

const getAvatarUrl = input =>
  `${API_URL}/${encodeURIComponent(normalizeHandle(input))}`

const getAvatar = body => {
  const pic = body?.branding?.icon?.original
  return typeof pic === 'string' && pic ? pic : undefined
}

module.exports = ({ got }) =>
  async function stripe (input) {
    if (!normalizeHandle(input)) return

    const { body, statusCode } = await got(getAvatarUrl(input), {
      responseType: 'json',
      throwHttpErrors: false,
      headers: { 'Stripe-Version': 'unsafe-development' }
    })

    if (statusCode >= 400) return

    return getAvatar(body)
  }

module.exports.getAvatarUrl = getAvatarUrl
module.exports.getAvatar = getAvatar
