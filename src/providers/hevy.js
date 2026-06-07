'use strict'

const getAvatarUrl = input => `https://hevy.com/user/${input}`

module.exports = ({ createHtmlProvider, getOgImage }) =>
  createHtmlProvider({
    name: 'hevy',
    url: getAvatarUrl,
    getter: getOgImage
  })

module.exports.getAvatarUrl = getAvatarUrl
