'use strict'

const API_URL = 'https://hub.docker.com/v2/users'

const getUserUrl = input => `${API_URL}/${encodeURIComponent(input)}/`

module.exports = ({ got }) =>
  async function dockerhub (input) {
    const { body, statusCode } = await got(getUserUrl(input), {
      responseType: 'json',
      throwHttpErrors: false
    })

    if (statusCode >= 400) return

    return body?.gravatar_url
  }

module.exports.getUserUrl = getUserUrl
