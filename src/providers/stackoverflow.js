'use strict'

const AVATAR_SELECTOR = '.js-usermini-avatar-container img'

const normalizeUserId = input =>
  input
    .replace(/^\/+/, '')
    .replace(/^users\//, '')
    .split('/')[0]

const getAvatarUrl = input =>
  `https://stackoverflow.com/users/${normalizeUserId(input)}`

const getAvatar = $ =>
  $(`${AVATAR_SELECTOR}[width="128"]`).attr('src') ||
  $(AVATAR_SELECTOR).first().attr('src')

module.exports = ({ createHtmlProvider }) =>
  createHtmlProvider({
    name: 'stackoverflow',
    url: getAvatarUrl,
    getter: getAvatar
  })

module.exports.getAvatarUrl = getAvatarUrl
module.exports.getAvatar = getAvatar
