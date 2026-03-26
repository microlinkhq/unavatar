'use strict'

const getAvatarUrl = $ => $('img#profilePicture').attr('src')

const factory = ({ createHtmlProvider }) =>
  createHtmlProvider({
    name: 'ko-fi',
    url: input => `https://ko-fi.com/${input}`,
    getter: getAvatarUrl
  })

factory.getAvatarUrl = getAvatarUrl

module.exports = factory
