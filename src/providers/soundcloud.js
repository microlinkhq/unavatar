'use strict'

const cheerio = require('cheerio')
const got = require('got')

module.exports = async username => {
  const { body } = await got(`https://soundcloud.com/${username}`)
  const $ = cheerio.load(body, { xmlMode: true })
  const name = $('a[itemprop=url]')
    .filter(`[href="/${username}" i]`)
    .text()
    .trim()
  return $('img[itemprop=image]')
    .filter(`[alt="${name}’s avatar" i]`)
    .attr('src')
}

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
