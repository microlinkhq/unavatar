'use strict'

const cheerio = require('cheerio')
const getHTML = require('../util/html-get')

module.exports = async function dribbble (username) {
  const { html } = await getHTML(`https://dribbble.com/${username}`)
  const $ = cheerio.load(html)
  return $('.profile-avatar').attr('src')
}

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
