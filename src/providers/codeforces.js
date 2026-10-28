'use strict'

const API_URL = 'https://codeforces.com/api/user.info'

const HANDLES_SEPARATOR = ';'

const DEFAULT_PHOTO_RE = /\/no-(title|avatar)\.jpg$/

const USERPIC_ORIGIN = 'https://userpic.codeforces.org/'

const USERPIC_MIRROR = 'https://codeforces.com/userpic.codeforces.org/'

const toUserpicMirror = url =>
  url.startsWith(USERPIC_ORIGIN)
    ? USERPIC_MIRROR + url.slice(USERPIC_ORIGIN.length)
    : url

const getAvatarUrl = input => `${API_URL}?handles=${encodeURIComponent(input)}`

const getAvatar = body => {
  const pic = body?.result?.[0]?.titlePhoto
  if (typeof pic !== 'string' || !pic) return undefined
  if (DEFAULT_PHOTO_RE.test(pic)) return undefined
  return toUserpicMirror(pic)
}

module.exports = ({ got }) =>
  async function codeforces (input) {
    if (input.includes(HANDLES_SEPARATOR)) return

    const { body, statusCode } = await got(getAvatarUrl(input), {
      responseType: 'json',
      throwHttpErrors: false
    })

    if (statusCode >= 400) return

    return getAvatar(body)
  }

module.exports.getAvatarUrl = getAvatarUrl
module.exports.getAvatar = getAvatar
