'use strict'

const uniqueRandomArray = require('unique-random-array')
const PCancelable = require('p-cancelable')
const cheerio = require('cheerio')

const randomCrawlerAgent = uniqueRandomArray(
  require('top-crawler-agents').filter(agent => agent.startsWith('Slackbot'))
)

const getHTML = require('../util/html-get')

const avatarUrl = str => {
  if (str?.endsWith('_200x200.jpg')) {
    str = str.replace('_200x200.jpg', '_400x400.jpg')
  }
  return str
}

module.exports = PCancelable.fn(async function twitter ({ input }, onCancel) {
  const promise = getHTML(`https://x.com/${input}`, {
    headers: { 'user-agent': randomCrawlerAgent() }
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
