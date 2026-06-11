'use strict'

const { get } = require('lodash')

const getAvatarUrl = input => `https://wise.com/pay/me/${input}`

const getAvatar = $ => {
  const text = $('#__NEXT_DATA__').contents().text()
  if (!text) return
  return get(JSON.parse(text), [
    'props',
    'pageProps',
    'match',
    'display',
    'avatar',
    'value'
  ])
}

const factory = ({ createHtmlProvider }) =>
  createHtmlProvider({
    name: 'wise',
    url: getAvatarUrl,
    getter: getAvatar
  })

factory.getAvatarUrl = getAvatarUrl
factory.getAvatar = getAvatar

module.exports = factory
