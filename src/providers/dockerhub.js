'use strict'

const API_URL = 'https://hub.docker.com/v2/users'

const getAvatarUrl = input => `${API_URL}/${encodeURIComponent(input)}/`
const getMaxResGravatarUrl = ({ constants, input }) => {
  const url = new URL(input)

  // `d=404` makes missing avatars fail instead of falling back to placeholders.
  url.searchParams.set('s', String(constants.AVATAR_SIZE))
  url.searchParams.set('d', '404')

  return url.toString()
}

module.exports = ({ constants, got }) =>
  async function dockerhub (input) {
    const { body, statusCode } = await got(getAvatarUrl(input), {
      responseType: 'json',
      throwHttpErrors: false
    })

    if (statusCode >= 400) return

    if (!body?.gravatar_url) return undefined

    return getMaxResGravatarUrl({ constants, input: body.gravatar_url })
  }

module.exports.getAvatarUrl = getAvatarUrl
module.exports.getMaxResGravatarUrl = getMaxResGravatarUrl
