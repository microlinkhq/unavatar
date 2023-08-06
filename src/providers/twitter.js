'use strict'

const uniqueRandomArray = require('unique-random-array')
const PCancelable = require('p-cancelable')
const cheerio = require('cheerio')

const randomCrawlerAgent = uniqueRandomArray(require('top-crawler-agents'))

const getHTML = require('../util/html-get')

const REGEX_IMG_MODIFIERS = /_(?:bigger|mini|normal|x96)\./
const ORIGINAL_IMG_SIZE = '_400x400'

const avatarUrl = str =>
  str?.replace(REGEX_IMG_MODIFIERS, `${ORIGINAL_IMG_SIZE}.`)

module.exports = PCancelable.fn(async function twitter ({ input }, onCancel) {
  const promise = getHTML(`https://twitter.com/${input}`, {
    headers: { 'user-agent': randomCrawlerAgent() },
    puppeteerOpts: {
      waitUntil: 'networkidle2',
      abortTypes: ['image', 'stylesheet', 'font']
    }
  })
  onCancel(() => promise.onCancel())
  const { html } = await promise
  const $ = cheerio.load(html)
  return avatarUrl($('meta[property="og:image"]').attr('content'))
})

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
