'use strict'

const cheerio = require('cheerio')
const getHTML = require('../util/html-get')

const REGEX_IMG_MODIFIERS = /_(?:bigger|mini|normal|x96)\./
const ORIGINAL_IMG_SIZE = '_400x400'

const avatarUrl = str =>
  str?.replace(REGEX_IMG_MODIFIERS, `${ORIGINAL_IMG_SIZE}.`)

module.exports = async function twitter (username) {
  const { html } = await getHTML(`https://twitter.com/${username}`, {
    puppeteerOpts: {
      waitUntil: 'networkidle2'
    }
  })
  const $ = cheerio.load(html)
  return avatarUrl($('meta[property="og:image"]').attr('content'))
}

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
