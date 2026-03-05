'use strict'

module.exports = ({ createHtmlProvider, getOgImage }) =>
  createHtmlProvider({
    name: 'youtube',
    url: input => `https://www.youtube.com/@${input}`,
    getter: getOgImage
  })
