'use strict'

module.exports = ({ createHtmlProvider, getOgImage }) =>
  createHtmlProvider({
    name: 'gitlab',
    url: input => `https://gitlab.com/${input}`,
    getter: getOgImage
  })
