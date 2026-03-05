'use strict'

module.exports = ({ createHtmlProvider, getOgImage }) =>
  createHtmlProvider({
    name: 'deviantart',
    url: input => `https://www.deviantart.com/${input}`,
    getter: getOgImage
  })
