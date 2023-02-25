'use strict'

const cheerio = require('cheerio')
const got = require('../util/got')

module.exports = async function gitlab (username) {
  const { body: html } = await got(`https://www.youtube.com/${username}`)
  const $ = cheerio.load(html)
  return $('meta[property="og:image"]').attr('content')
}

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
