'use strict'

const getAvatarUrl = input => {
  const handle = input.startsWith('@') ? input.slice(1) : input
  return `https://www.raycast.com/${handle}`
}

const getAvatar = $ => {
  const src = $('img[alt="Avatar"]').attr('src')
  if (!src) return

  const url = new URL(src, 'https://www.raycast.com')
  return url.searchParams.get('url') ?? src
}

module.exports = ({ createHtmlProvider }) =>
  createHtmlProvider({
    name: 'raycast',
    url: getAvatarUrl,
    getter: getAvatar
  })

module.exports.getAvatarUrl = getAvatarUrl
module.exports.getAvatar = getAvatar
