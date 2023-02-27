'use strict'

const cheerio = require('cheerio')
const getHTML = require('../util/html-get')

module.exports = async function reddit (username) {
  const { html } = await getHTML(`https://www.reddit.com/user/${username}`, {
    headers: { 'accept-language': 'en' },
    puppeteerOpts: {
      abortTypes: ['image', 'stylesheet', 'font', 'script']
    }
  })
  const $ = cheerio.load(html)
  return $('img[alt="User avatar"]').attr('src')
}

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
