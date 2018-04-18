'use strict'

const cheerio = require('cheerio')
const got = require('got')

module.exports = async username => {
  const { body } = await got(`https://www.instagram.com/${username}`)
  const $ = cheerio.load(body)
  return $('meta[property="og:image"]').attr('content')
}

module.exports.supported = {
  email: false,
  username: true
}
