'use strict'

const getAvatarUrl = input =>
  `https://www.snapchat.com/${input.startsWith('@') ? input : `@${input}`}`

module.exports = ({ createHtmlProvider, getOgImage }) =>
  createHtmlProvider({
    name: 'snapchat',
    url: getAvatarUrl,
    getter: getOgImage
  })

module.exports.getAvatarUrl = getAvatarUrl
