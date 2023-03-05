'use strict'

const cheerio = require('cheerio')
const getHTML = require('../util/html-get')

module.exports = async function telegram (username) {
  const { html } = await getHTML(`https://t.me/${username}`, {
    prerender: false
  })
  const $ = cheerio.load(html)
  const el = $('img.tgme_page_photo_image')
  return el.attr('src')
}

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
