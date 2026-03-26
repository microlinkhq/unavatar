'use strict'

module.exports = ({ createHtmlProvider, getOgImage }) =>
  createHtmlProvider({
    name: 'instagram',
    url: input => `https://www.instagram.com/${input}`,
    getter: getOgImage
  })
