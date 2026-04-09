'use strict'

const getAvatarUrl = input =>
  `https://www.threads.com/${input.startsWith('@') ? input : `@${input}`}`

module.exports = ({ createHtmlProvider, getOgImage }) =>
  createHtmlProvider({
    name: 'threads',
    url: getAvatarUrl,
    getter: getOgImage
  })

module.exports.getAvatarUrl = getAvatarUrl
