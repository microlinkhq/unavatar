'use strict'

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
    getter: getOgImage
  })

module.exports.getAvatarUrl = getAvatarUrl
