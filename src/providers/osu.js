'use strict'

const PROFILE_URL = 'https://osu.ppy.sh/users'
const UPLOADED_AVATAR_ORIGIN = 'https://a.ppy.sh/'

const isUploadedAvatar = url => url.startsWith(UPLOADED_AVATAR_ORIGIN)

const getAvatarUrl = input => `${PROFILE_URL}/${encodeURIComponent(input)}`

const getAvatar = ({ $, getOgImage, NOT_FOUND }) => {
  const image = getOgImage($)
  return image && isUploadedAvatar(image) ? image : NOT_FOUND
}

module.exports = ({ createHtmlProvider, getOgImage, NOT_FOUND }) =>
  createHtmlProvider({
    name: 'osu',
    url: getAvatarUrl,
    getter: $ => getAvatar({ $, getOgImage, NOT_FOUND })
  })

module.exports.getAvatarUrl = getAvatarUrl
module.exports.getAvatar = getAvatar
