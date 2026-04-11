'use strict'

const STEAM_DEFAULT_OG_IMAGE = 'steam_share_image.jpg'

const getAvatarUrl = input => {
  const [first, second] = input.split(':')
  const type = second ? first : 'id'
  const id = encodeURIComponent(second ?? first)

  switch (type) {
    case 'id':
      return `https://steamcommunity.com/id/${id}`
    case 'profile':
    case 'profiles':
      return `https://steamcommunity.com/profiles/${id}`
    case 'group':
    case 'groups':
      return `https://steamcommunity.com/groups/${id}`
    default:
      throw new Error(`Unsupported Steam type: ${type}`)
  }
}

module.exports = ({ createHtmlProvider, getOgImage }) =>
  createHtmlProvider({
    name: 'steam',
    url: getAvatarUrl,
    getter: $ => {
      const ogImage = getOgImage($)
      const hasDefaultOgImage = ogImage?.includes(STEAM_DEFAULT_OG_IMAGE)
      if (ogImage && !hasDefaultOgImage) return ogImage
      return $('source[srcset]').attr('srcset')
    }
  })

module.exports.getAvatarUrl = getAvatarUrl
