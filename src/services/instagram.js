'use strict'

const cheerio = require('cheerio')
const fetch = require('../fetch')

module.exports = async username => {
  const { body } = await fetch(`https://www.instagram.com/${username}`)
  const $ = cheerio.load(body)
  return $('meta[property="og:image"]').attr('content')
}

module.exports.supported = {
  email: false,
  username: true
}
