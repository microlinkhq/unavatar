'use strict'

const AVATAR_SELECTOR = '.js-usermini-avatar-container img'

const normalizeUserId = input =>
  input
    .replace(/^\/+/, '')
    .replace(/^users\//, '')
    .split('/')[0]

const getProfileUrl = input =>
  `https://stackoverflow.com/users/${normalizeUserId(input)}`

const getAvatarUrl = $ =>
  $(`${AVATAR_SELECTOR}[width="128"]`).attr('src') ||
  $(AVATAR_SELECTOR).first().attr('src')

module.exports = ({ createHtmlProvider }) =>
  createHtmlProvider({
    name: 'stackoverflow',
    url: getProfileUrl,
    getter: getAvatarUrl
  })

module.exports.getProfileUrl = getProfileUrl
module.exports.getAvatarUrl = getAvatarUrl
