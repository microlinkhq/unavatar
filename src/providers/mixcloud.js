'use strict'

const API_URL = 'https://api.mixcloud.com'

const SQUARE_SIZE_RE = /\/unsafe\/(\d+)x\1\//

const DEFAULT_PICTURE_RE = /\/unsafe\/\d+x\d+\/defaults\//

const parseInput = input => input.replace(/^@/, '')

const getAvatarUrl = input => `${API_URL}/${encodeURIComponent(input)}/`

const getSquareSize = url => Number(SQUARE_SIZE_RE.exec(url)?.[1] ?? 0)

const getAvatar = body => {
  const pictures = Object.values(body?.pictures ?? {}).filter(
    url => typeof url === 'string' && getSquareSize(url) > 0
  )
  if (pictures.length === 0) return

  const largest = pictures.reduce((best, url) =>
    getSquareSize(url) > getSquareSize(best) ? url : best
  )

  return DEFAULT_PICTURE_RE.test(largest) ? undefined : largest
}

module.exports = ({ got }) =>
  async function mixcloud (input) {
    const { body, statusCode } = await got(getAvatarUrl(parseInput(input)), {
      responseType: 'json',
      throwHttpErrors: false
    })

    if (statusCode >= 400) return

    return getAvatar(body)
  }

module.exports.parseInput = parseInput
module.exports.getAvatarUrl = getAvatarUrl
module.exports.getAvatar = getAvatar
