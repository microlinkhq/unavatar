'use strict'

module.exports = ({ createHtmlProvider }) =>
  createHtmlProvider({
    name: 'reddit',
    url: input => `https://www.reddit.com/user/${input}/`,
    getter: $ => $('img[alt*="avatar"]').attr('src'),
    htmlOpts: () => ({ headers: { 'accept-language': 'en' } })
  })
