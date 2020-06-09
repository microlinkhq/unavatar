'use strict'

const cheerio = require('cheerio')
const got = require('got')

module.exports = async username => {
  const { body } = await got(`https://soundcloud.com/${username}`)
  const $ = cheerio.load(body, { xmlMode: true })
  const name = $(`a[itemprop=url][href="/${username}" i]`)
  return $(`img[itemprop=image][alt="${name.text().trim()}’s avatar" i]`).attr('src')
}

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
