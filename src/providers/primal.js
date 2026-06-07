'use strict'

const getAvatarUrl = input => `https://primal.net/${input}`

module.exports = ({ createHtmlProvider, getOgImage }) =>
  createHtmlProvider({
    name: 'primal',
    url: getAvatarUrl,
    getter: getOgImage
  })

module.exports.getAvatarUrl = getAvatarUrl
