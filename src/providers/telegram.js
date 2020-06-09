'use strict'

const cheerio = require('cheerio')
const got = require('got')

module.exports = async username => {
  const { body } = await got(`https://t.me/${username}`)
  const $ = cheerio.load(body)
  const el = $('img.tgme_page_photo_image')
  return el.attr('src')
}

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
