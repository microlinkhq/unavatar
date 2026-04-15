'use strict'

module.exports = ({ createHtmlProvider, getOgImage }) =>
  createHtmlProvider({
    name: 'facebook',
    url: input => `https://www.facebook.com/${input}`,
    getter: getOgImage
  })
