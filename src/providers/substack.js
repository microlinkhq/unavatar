'use strict'

const cheerio = require('cheerio')
const got = require('got')

module.exports = async username => {
  const { body } = await got(`https://${username}.substack.com`)
  const $ = cheerio.load(body)
  return $('.publication-logo').attr('src')
}

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
