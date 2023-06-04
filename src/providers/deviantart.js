'use strict'

const PCancelable = require('p-cancelable')
const cheerio = require('cheerio')

const getHTML = require('../util/html-get')

const REGEX_PROFILE_URL =
  /^https?:\/\/(?:www\.)?deviantart\.com\/([\w-]+)(?:\/.+)?$/

module.exports = PCancelable.fn(async function deviantart ({ input }, onCancel) {
  const promise = getHTML(`https://www.deviantart.com/${input}`)
  onCancel(() => promise.onCancel())
  const { html } = await promise
  const $ = cheerio.load(html)
  const canonUsername = $('head link[rel=canonical]')
    .attr('href')
    .replace(REGEX_PROFILE_URL, '$1')
  const els = $('img.avatar,a[data-hook=user_link][data-icon]').filter(
    (i, el) => {
      const thisUsername =
        $(el).attr('data-username') || $(el).attr('title') || ''
      return canonUsername.toLowerCase() === thisUsername.toLowerCase()
    }
  )
  return els.attr('data-icon') || els.attr('src')
})

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
