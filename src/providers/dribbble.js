'use strict'

const cheerio = require('cheerio')

const got = require('../util/got')

module.exports = async function dribbble (username) {
  const { body } = await got(`https://dribbble.com/${username}`)
  const $ = cheerio.load(body)
  return $('.profile-avatar').attr('src')
}

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
