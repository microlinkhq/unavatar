'use strict'

const getAvatarUrl = input => `https://www.thingiverse.com/${input}`

const getAvatar = ({ getOgImage, $ }) =>
  new URL(getOgImage($)).searchParams.get('url')

module.exports = ({ createHtmlProvider, getOgImage }) =>
  createHtmlProvider({
    name: 'thingiverse',
    url: getAvatarUrl,
    getter: $ => getAvatar({ getOgImage, $ })
  })

module.exports.getAvatarUrl = getAvatarUrl
module.exports.getAvatar = getAvatar
