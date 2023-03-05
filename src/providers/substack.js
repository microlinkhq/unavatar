'use strict'

const cheerio = require('cheerio')
const getHTML = require('../util/html-get')

module.exports = async function substack (username) {
  const { html } = await getHTML(`https://${username}.substack.com`)
  const $ = cheerio.load(html)
  return $('.publication-logo').attr('src')
}

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
