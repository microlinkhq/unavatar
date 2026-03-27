'use strict'

const getAvatarUrl = input =>
  `https://medium.com/${input.startsWith('@') ? input : `@${input}`}`

module.exports = ({ createHtmlProvider, getOgImage }) =>
  createHtmlProvider({
    name: 'medium',
    url: getAvatarUrl,
    getter: getOgImage
  })

module.exports.getAvatarUrl = getAvatarUrl
