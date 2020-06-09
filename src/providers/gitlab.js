'use strict'

const cheerio = require('cheerio')
const got = require('got')

module.exports = async username => {
  const { body } = await got(`https://gitlab.com/${username}`)
  const $ = cheerio.load(body)
  return $('.avatar').attr('data-src')
}

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
