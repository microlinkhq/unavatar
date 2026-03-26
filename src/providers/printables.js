'use strict'

const getAvatarUrl = input =>
  `https://www.printables.com/${input.startsWith('@') ? input : `@${input}`}`

module.exports = ({ createHtmlProvider, getOgImage }) =>
  createHtmlProvider({
    name: 'printables',
    url: getAvatarUrl,
    getter: getOgImage
  })

module.exports.getAvatarUrl = getAvatarUrl
