'use strict'

module.exports = ({ createHtmlProvider, getOgImage }) =>
  createHtmlProvider({
    name: 'linkedin',
    url: input => `https://www.linkedin.com/in/${input}`,
    getter: $ => getOgImage($) || false
  })
