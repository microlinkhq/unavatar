'use strict'

const { get } = require('lodash')

const getAvatarUrl = $ => {
  const text = $('#__UNIVERSAL_DATA_FOR_REHYDRATION__').contents().text()
  if (!text) return
  return get(JSON.parse(text), [
    '__DEFAULT_SCOPE__',
    'webapp.user-detail',
    'userInfo',
    'user',
    'avatarLarger'
  ])
}

const factory = ({ createHtmlProvider }) =>
  createHtmlProvider({
    name: 'tiktok',
    url: input => `https://www.tiktok.com/@${input}`,
    getter: getAvatarUrl
  })

factory.getAvatarUrl = getAvatarUrl

module.exports = factory
