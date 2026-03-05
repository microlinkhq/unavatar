'use strict'

module.exports = ({ createHtmlProvider, getOgImage }) =>
  createHtmlProvider({
    name: 'vimeo',
    url: input => `https://vimeo.com/${input}`,
    getter: getOgImage
  })
