'use strict'

const { get } = require('lodash')

const getAvatarUrl = input => `https://account.venmo.com/u/${input}`

const getAvatar = $ => {
  const text = $('#__NEXT_DATA__').contents().text()
  if (!text) return
  return get(JSON.parse(text), [
    'props',
    'pageProps',
    'user',
    'profilePictureUrl'
  ])
}

const factory = ({ createHtmlProvider }) =>
  createHtmlProvider({
    name: 'venmo',
    url: getAvatarUrl,
    getter: getAvatar
  })

factory.getAvatarUrl = getAvatarUrl
factory.getAvatar = getAvatar

module.exports = factory
