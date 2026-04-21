'use strict'

const getAvatarUrl = input => {
  const [first, second] = input.split(':')
  const type = second ? first : 'app'
  const id = encodeURIComponent(second ?? first)

  switch (type) {
    case 'app':
      return `https://play.google.com/store/apps/details?id=${id}`
    case 'dev':
      return `https://play.google.com/store/apps/dev?id=${id}`
    default:
      throw new Error(`Unsupported Google Play type: ${type}`)
  }
}

module.exports = ({ createHtmlProvider, getOgImage }) =>
  createHtmlProvider({
    name: 'google-play',
    url: getAvatarUrl,
    getter: getOgImage
  })

module.exports.getAvatarUrl = getAvatarUrl
