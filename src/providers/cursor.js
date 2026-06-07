'use strict'

const getAvatarUrl = input =>
  `https://cursor.com/${input.startsWith('@') ? input : `@${input}`}`

const getAvatar = $ => {
  const displayName = $('h1').first().text().trim()
  if (!displayName) return

  const value =
    $(`img[alt="${displayName}"]`).attr('src') ||
    $(`img[alt="${displayName}"]`).attr('srcset')
  const match = value?.match(/[?&]url=([^&\s]+)/)
  return match ? decodeURIComponent(match[1]) : undefined
}

module.exports = ({ createHtmlProvider }) =>
  createHtmlProvider({
    name: 'cursor',
    url: getAvatarUrl,
    getter: getAvatar
  })

module.exports.getAvatarUrl = getAvatarUrl
module.exports.getAvatar = getAvatar
