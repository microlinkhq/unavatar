'use strict'

module.exports = ({ createHtmlProvider }) =>
  createHtmlProvider({
    name: 'dribbble',
    url: input => `https://dribbble.com/${input}`,
    getter: $ => $('.profile-avatar').attr('src')
  })
