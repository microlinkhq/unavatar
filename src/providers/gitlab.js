'use strict'

const GITLAB_API_URL = 'https://gitlab.com/api/v4'

const getUserAvatarUrl = input =>
  `${GITLAB_API_URL}/users?username=${encodeURIComponent(input)}`

const getGroupAvatarUrl = input =>
  `${GITLAB_API_URL}/groups/${encodeURIComponent(input)}`

const getAvatar = body => {
  const pic = Array.isArray(body) ? body[0]?.avatar_url : body?.avatar_url
  return typeof pic === 'string' && pic ? pic : undefined
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
  async function gitlab (input) {
    const userAvatarUrl = await fetchAvatarUrl({
      got,
      url: getUserAvatarUrl(input)
    })
    if (userAvatarUrl) return userAvatarUrl

    return fetchAvatarUrl({
      got,
      url: getGroupAvatarUrl(input)
    })
  }

module.exports.getUserAvatarUrl = getUserAvatarUrl
module.exports.getGroupAvatarUrl = getGroupAvatarUrl
module.exports.getAvatar = getAvatar
