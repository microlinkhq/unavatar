'use strict'

const getAvatarUrl = input =>
  `https://cults3d.com/en/users/${
    input.startsWith('@') ? input.slice(1) : input
  }`

module.exports = ({ createHtmlProvider, getOgImage }) =>
  createHtmlProvider({
    name: 'cults3d',
    url: getAvatarUrl,
    getter: getOgImage
  })

module.exports.getAvatarUrl = getAvatarUrl
