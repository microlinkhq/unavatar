'use strict'

const uniqueRandomArray = require('unique-random-array')

// Mobile user agents get a 403 from the members API.
const randomDesktopUserAgent = uniqueRandomArray(
  require('top-user-agents/desktop')
)

const API_URL = 'https://www.zhihu.com/api/v4/members'

const ANTIBOT_ERROR_CODE = 40352
const MISSING_MEMBER_ERROR_CODE = 4041

const getAvatarUrl = input =>
  `${API_URL}/${encodeURIComponent(input)}?include=avatar_url`

const isBlocked = ({ body }) => body?.error?.code === ANTIBOT_ERROR_CODE

const getAvatar = ({ body, NOT_FOUND }) => {
  if (body?.error?.code === MISSING_MEMBER_ERROR_CODE) return NOT_FOUND
  if (body?.error) return undefined
  if (body?.use_default_avatar) return NOT_FOUND
  return body?.avatar_url || undefined
}

const factory = ({ createApiProvider, NOT_FOUND }) =>
  createApiProvider({
    name: 'zhihu',
    url: getAvatarUrl,
    gotOpts: () => ({ headers: { 'user-agent': randomDesktopUserAgent() } }),
    isBlocked,
    getter: ({ body }) => getAvatar({ body, NOT_FOUND })
  })

factory.getAvatarUrl = getAvatarUrl
factory.getAvatar = getAvatar
factory.isBlocked = isBlocked

module.exports = factory
