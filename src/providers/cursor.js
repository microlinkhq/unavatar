'use strict'

const getAvatarUrl = input =>
  `https://cursor.com/${input.startsWith('@') ? input : `@${input}`}`

const getAvatar = $ => {
  const displayName = $('h1').first().text().trim()
  if (!displayName) return

  const src = $('img')
    .filter((_, el) => $(el).attr('alt') === displayName)
    .first()
    .attr('src')
  if (!src) return

  const url = new URL(src, 'https://cursor.com')
  return url.searchParams.get('url') ?? src
}

module.exports = ({ createHtmlProvider }) =>
  createHtmlProvider({
    name: 'cursor',
    url: getAvatarUrl,
    getter: getAvatar
  })

module.exports.getAvatarUrl = getAvatarUrl
module.exports.getAvatar = getAvatar
