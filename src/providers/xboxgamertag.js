'use strict'

const getAvatarUrl = input =>
  `https://xboxgamertag.com/search/${encodeURIComponent(input)}`

const ensureProtocol = url =>
  typeof url === 'string' && url.startsWith('//') ? `https:${url}` : url

module.exports = ({ createHtmlProvider }) =>
  createHtmlProvider({
    name: 'xboxgamertag',
    url: getAvatarUrl,
    getter: $ => ensureProtocol($('.page-header .avatar img').attr('src'))
  })

module.exports.getAvatarUrl = getAvatarUrl
