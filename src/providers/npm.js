'use strict'

const NPM_URL = 'https://www.npmjs.com'

const stripAtPrefix = input => input.replace(/^@/, '')

const getAvatarUrl = input => `${NPM_URL}/~${stripAtPrefix(input)}`

const getAvatar = $ => {
  const src = $('a[aria-label="Your profile picture"] img').attr('src')
  if (!src) return

  return src.startsWith('/') ? `${NPM_URL}${src}` : src
}

module.exports = ({ createHtmlProvider }) =>
  createHtmlProvider({
    name: 'npm',
    url: getAvatarUrl,
    getter: getAvatar
  })

module.exports.getAvatarUrl = getAvatarUrl
module.exports.getAvatar = getAvatar
