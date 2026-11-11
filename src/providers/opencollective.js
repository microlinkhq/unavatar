'use strict'

const PROFILE_URL = 'https://opencollective.com'
const IMAGES_URL = 'https://images.opencollective.com'

const getProfileUrl = input =>
  `${PROFILE_URL}/${encodeURIComponent(input)}.json`

const getAvatarUrl = ({ constants, slug }) =>
  `${IMAGES_URL}/${encodeURIComponent(slug)}/avatar/${
    constants.AVATAR_SIZE
  }.png`

const getAvatar = ({ body, constants, NOT_FOUND }) => {
  if (!body?.slug) return undefined
  if (!body.image) return NOT_FOUND
  return getAvatarUrl({ constants, slug: body.slug })
}

const factory = ({ constants, createApiProvider, NOT_FOUND }) =>
  createApiProvider({
    name: 'opencollective',
    url: getProfileUrl,
    getter: ({ body }) => getAvatar({ body, constants, NOT_FOUND })
  })

factory.getProfileUrl = getProfileUrl
factory.getAvatarUrl = getAvatarUrl
factory.getAvatar = getAvatar

module.exports = factory
