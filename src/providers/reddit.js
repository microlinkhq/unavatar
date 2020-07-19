'use strict'

const cheerio = require('cheerio')
const got = require('got')

module.exports = async username => {
  const { body } = await got(`https://www.reddit.com/user/${username}`)
  const $ = cheerio.load(body)
  return $('img[alt="User avatar"]').attr('src')
}

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
