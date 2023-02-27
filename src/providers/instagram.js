'use strict'

const cheerio = require('cheerio')
const getHTML = require('../util/html-get')

module.exports = async function instagram (username) {
  const { html } = await getHTML(`https://www.instagram.com/${username}`)
  const $ = cheerio.load(html)
  return $('meta[property="og:image"]').attr('content')
}

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
