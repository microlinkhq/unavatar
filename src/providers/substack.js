'use strict'

const cheerio = require('cheerio')
const got = require('got')

module.exports = async username => {
  const { body } = await got(`https://${username}.substack.com`)
  const $ = cheerio.load(body)
  return $('link[rel=apple-touch-icon][sizes=180x180]').attr('href')
}

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
