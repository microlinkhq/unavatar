'use strict'

const { $jsonld } = require('@metascraper/helpers')

const unescapeUnicode = str =>
  str.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  )

const getRscAvatar = $ => {
  let url
  $('script').each((_, el) => {
    const text = $(el).html() || ''
    if (!text.includes('avatarPhotoImageUrls')) return
    const match = text.match(
      /avatarPhotoImageUrls[\s\S]*?\\"original\\":\\"((?:[^\\"]|\\u[0-9a-fA-F]{4})+)/
    )
    if (match) {
      url = unescapeUnicode(match[1])
      return false
    }
  })
  return url
}

const getAvatar = $ =>
  $jsonld('mainEntity.image.contentUrl')($) || getRscAvatar($)

const factory = ({ createHtmlProvider }) =>
  createHtmlProvider({
    name: 'patreon',
    url: username => `https://www.patreon.com/${username}`,
    getter: getAvatar
  })

factory.getAvatar = getAvatar

module.exports = factory
