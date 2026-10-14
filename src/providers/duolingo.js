'use strict'

const stringify = require('../util/stringify')

const ORIGIN = 'https://www.duolingo.com'
const API_URL = `${ORIGIN}/2017-06-30/users`
const PICTURE_SIZE = 'xxlarge'
const DEFAULT_PICTURE_PATH_RE = /^\/avatar\/default_\d+\/?$/

const getAvatarUrl = input =>
  `${API_URL}?${stringify({ username: input, fields: 'users{picture}' })}`

const getAvatar = body => {
  const pic = body?.users?.[0]?.picture
  if (typeof pic !== 'string' || !pic) return

  const url = new URL(pic, ORIGIN)
  if (DEFAULT_PICTURE_PATH_RE.test(url.pathname)) return

  url.pathname = `${url.pathname.replace(/\/$/, '')}/${PICTURE_SIZE}`
  return url.toString()
}

module.exports = ({ got }) =>
  async function duolingo (input) {
    const { body, statusCode } = await got(getAvatarUrl(input), {
      responseType: 'json',
      throwHttpErrors: false
    })

    if (statusCode >= 400) return

    return getAvatar(body)
  }

module.exports.getAvatarUrl = getAvatarUrl
module.exports.getAvatar = getAvatar
