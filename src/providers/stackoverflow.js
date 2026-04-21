'use strict'

const AVATAR_SELECTOR = '.js-usermini-avatar-container img'

const normalizeInput = input => {
  let normalizedInput = input.replace(/^\/+/, '')
  if (normalizedInput.startsWith('users/')) {
    normalizedInput = normalizedInput.slice('users/'.length)
  }
  return normalizedInput
}

const getProfileUrl = input =>
  `https://stackoverflow.com/users/${normalizeInput(input)}`

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
