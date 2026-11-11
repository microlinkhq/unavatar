'use strict'

const API_URL = 'https://api.bilibili.com/x/web-interface/card'

const OK_CODE = 0
const MISSING_CODES = new Set([-400, -404])
const ANTIBOT_CODES = new Set([-352, -412, -509, -799])

const getAvatarUrl = input => `${API_URL}?mid=${encodeURIComponent(input)}`

const isPlaceholderFace = face => face.endsWith('/noface.jpg')

const isBlocked = ({ body }) => ANTIBOT_CODES.has(body?.code)

const getAvatar = ({ body, NOT_FOUND }) => {
  if (MISSING_CODES.has(body?.code)) return NOT_FOUND
  if (body?.code !== OK_CODE) return undefined
  const face = body.data?.card?.face
  if (!face || isPlaceholderFace(face)) return NOT_FOUND
  return face
}

const factory = ({ createApiProvider, NOT_FOUND }) =>
  createApiProvider({
    name: 'bilibili',
    url: getAvatarUrl,
    isBlocked,
    getter: ({ body }) => getAvatar({ body, NOT_FOUND })
  })

factory.getAvatarUrl = getAvatarUrl
factory.getAvatar = getAvatar
factory.isBlocked = isBlocked

module.exports = factory
