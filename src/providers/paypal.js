'use strict'

const { get } = require('lodash')

const getAvatarUrl = input => `https://www.paypal.com/paypalme/${input}`

const getAvatar = $ => {
  const text = $('#client-data').contents().text()
  if (!text) return
  return get(JSON.parse(text), [
    'recipientSlugDetails',
    'slugDetails',
    'userInfo',
    'profilePhotoUrl'
  ])
}

const factory = ({ createHtmlProvider }) =>
  createHtmlProvider({
    name: 'paypal',
    url: getAvatarUrl,
    getter: getAvatar
  })

factory.getAvatarUrl = getAvatarUrl
factory.getAvatar = getAvatar

module.exports = factory
