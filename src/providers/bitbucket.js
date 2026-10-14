'use strict'

const WORKSPACES_URL = 'https://bitbucket.org/workspaces'
const DEFAULT_AVATAR_PATH = '/default_workspace_avatar/'

const getAvatarUrl = input =>
  `${WORKSPACES_URL}/${encodeURIComponent(input)}/avatar/`

const getAvatar = location => {
  if (!location) return
  const url = new URL(location, WORKSPACES_URL)
  return url.pathname.includes(DEFAULT_AVATAR_PATH) ? undefined : url.toString()
}

module.exports = ({ got }) =>
  async function bitbucket (input) {
    const { headers } = await got(getAvatarUrl(input), {
      method: 'HEAD',
      followRedirect: false,
      throwHttpErrors: false
    })

    return getAvatar(headers.location)
  }

module.exports.getAvatarUrl = getAvatarUrl
module.exports.getAvatar = getAvatar
