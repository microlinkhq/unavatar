'use strict'

module.exports = ({ createHtmlProvider }) =>
  createHtmlProvider({
    name: 'telegram',
    url: input => `https://t.me/${input}`,
    getter: $ => $('img.tgme_page_photo_image').attr('src')
  })
