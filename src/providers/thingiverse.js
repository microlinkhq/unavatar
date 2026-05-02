'use strict'

const getProfileUrl = input => `https://www.thingiverse.com/${input}`

const getAvatarUrl = ({ getOgImage, $ }) =>
  new URL(getOgImage($)).searchParams.get('url')

module.exports = ({ createHtmlProvider, getOgImage }) =>
  createHtmlProvider({
    name: 'thingiverse',
    url: getProfileUrl,
    getter: $ => getAvatarUrl({ getOgImage, $ })
  })

module.exports.getAvatarUrl = getProfileUrl
module.exports.getAvatarUrlFromMarkup = getAvatarUrl
