'use strict'

const PCancelable = require('p-cancelable')
const cheerio = require('cheerio')

const getHTML = require('../util/html-get')

module.exports = PCancelable.fn(async function reddit ({ input }, onCancel) {
  const promise = getHTML(`https://www.reddit.com/user/${input}`, {
    headers: { 'accept-language': 'en' }
  })
  onCancel(() => promise.onCancel())
  const { html } = await promise
  const $ = cheerio.load(html)
  return $('img[alt*="avatar"]').attr('src')
})

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
