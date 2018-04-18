'use strict'

const cheerio = require('cheerio')
const got = require('got')

module.exports = async username => {
  const { body } = await got(`https://mobile.twitter.com/${username}`)
  const $ = cheerio.load(body)
  const el = $('.avatar img').attr('src')
  return el.replace('_normal', '_400x400')
}

module.exports.supported = {
  email: false,
  username: true
}
