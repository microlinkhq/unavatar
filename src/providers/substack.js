'use strict'

const PCancelable = require('p-cancelable')
const cheerio = require('cheerio')

const getHTML = require('../util/html-get')

module.exports = PCancelable.fn(async function substack ({ input }, onCancel) {
  const promise = getHTML(`https://${input}.substack.com`)
  onCancel(() => promise.onCancel())
  const { html } = await promise
  const $ = cheerio.load(html)
  return $('.publication-logo').attr('src')
})

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
