'use strict'

const getAvatarUrl = input => `https://www.tumblr.com/${input}`

module.exports = ({ createHtmlProvider, getOgImage }) =>
  createHtmlProvider({
    name: 'tumblr',
    url: getAvatarUrl,
    getter: getOgImage
  })

module.exports.getAvatarUrl = getAvatarUrl
