'use strict'

const { get } = require('lodash')

const getAvatarUrl = input => `https://cash.app/$${input.replace(/^\$/, '')}`

const getAvatar = $ => {
  const script = $('script')
    .filter((_, el) => $(el).text().includes('var profile ='))
    .text()
  const match = script.match(/var profile = (\{.+?\});/s)
  if (!match) return
  return get(JSON.parse(match[1]), ['avatar', 'image_url'])
}

const factory = ({ createHtmlProvider }) =>
  createHtmlProvider({
    name: 'cashapp',
    url: getAvatarUrl,
    getter: getAvatar
  })

factory.getAvatarUrl = getAvatarUrl
factory.getAvatar = getAvatar

module.exports = factory
