'use strict'

const getAvatarUrl = input => `https://www.douban.com/people/${input}/`

const getAvatar = $ => $('img.userface').attr('src')

module.exports = ({ createHtmlProvider }) =>
  createHtmlProvider({
    name: 'douban',
    url: getAvatarUrl,
    getter: getAvatar
  })

module.exports.getAvatarUrl = getAvatarUrl
module.exports.getAvatar = getAvatar
