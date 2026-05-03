'use strict'

const API_URL = 'https://hub.docker.com/v2/users'

const getAvatarUrl = input => `${API_URL}/${encodeURIComponent(input)}/`

module.exports = ({ got }) =>
  async function dockerhub (input) {
    const { body, statusCode } = await got(getAvatarUrl(input), {
      responseType: 'json',
      throwHttpErrors: false
    })

    if (statusCode >= 400) return

    return body?.gravatar_url || undefined
  }

module.exports.getAvatarUrl = getAvatarUrl
