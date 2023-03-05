'use strict'

const cheerio = require('cheerio')
const getHTML = require('../util/html-get')

module.exports = async function soundcloud (username) {
  const { html } = await getHTML(`https://soundcloud.com/${username}`)
  const $ = cheerio.load(html, { xmlMode: true })
  const name = $(`a[itemprop=url][href="/${username}" i]`)
  return $(`img[itemprop=image][alt="${name.text().trim()}’s avatar" i]`).attr(
    'src'
  )
}

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
