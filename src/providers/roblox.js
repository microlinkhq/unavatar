'use strict'

const USERS_API_URL = 'https://users.roblox.com/v1/usernames/users'
const THUMBNAILS_API_URL =
  'https://thumbnails.roblox.com/v1/users/avatar-headshot'
const THUMBNAIL_SIZE = '720x720'
const THUMBNAIL_COMPLETED_STATE = 'Completed'
const USER_ID_PREFIX = 'id:'
const USER_ID_RE = /^\d+$/

const parseInput = input =>
  input.startsWith(USER_ID_PREFIX)
    ? { type: 'id', value: input.slice(USER_ID_PREFIX.length) }
    : { type: 'username', value: input }

const getAvatarUrl = userId =>
  `${THUMBNAILS_API_URL}?userIds=${encodeURIComponent(
    userId
  )}&size=${THUMBNAIL_SIZE}&format=Png&isCircular=false`

const getAvatar = body => {
  const thumbnail = body?.data?.[0]
  if (thumbnail?.state !== THUMBNAIL_COMPLETED_STATE) return
  const pic = thumbnail.imageUrl
  return typeof pic === 'string' && pic ? pic : undefined
}

const getUserId = async ({ got, username }) => {
  const { body, statusCode } = await got(USERS_API_URL, {
    method: 'POST',
    responseType: 'json',
    throwHttpErrors: false,
    json: { usernames: [username], excludeBannedUsers: true }
  })

  if (statusCode >= 400) return

  return body?.data?.[0]?.id
}

module.exports = ({ got }) =>
  async function roblox (input) {
    const { type, value } = parseInput(input)

    const userId =
      type === 'id' ? value : await getUserId({ got, username: value })
    if (!USER_ID_RE.test(String(userId ?? ''))) return

    const { body, statusCode } = await got(getAvatarUrl(userId), {
      responseType: 'json',
      throwHttpErrors: false
    })

    if (statusCode >= 400) return

    return getAvatar(body)
  }

module.exports.parseInput = parseInput
module.exports.getAvatarUrl = getAvatarUrl
module.exports.getAvatar = getAvatar
