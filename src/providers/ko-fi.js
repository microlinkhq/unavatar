'use strict'

const getAvatar = $ => $('img#profilePicture').attr('src')

const factory = ({ createHtmlProvider }) =>
  createHtmlProvider({
    name: 'ko-fi',
    url: input => `https://ko-fi.com/${input}`,
    getter: getAvatar
  })

factory.getAvatar = getAvatar

module.exports = factory
