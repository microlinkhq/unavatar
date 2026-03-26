'use strict'

const getAvatarUrl = input => {
  let path
  if (input.startsWith('@')) {
    path = input
  } else if (input.startsWith('UC') && input.length === 24) {
    path = `channel/${input}`
  } else {
    path = `@${input}`
  }
  return `https://www.youtube.com/${path}`
}

module.exports = ({ createHtmlProvider, getOgImage }) =>
  createHtmlProvider({
    name: 'youtube',
    url: getAvatarUrl,
    getter: getOgImage
  })

module.exports.getAvatarUrl = getAvatarUrl
