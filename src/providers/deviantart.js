'use strict'

const cheerio = require('cheerio')
const got = require('got')

const REGEX_PROFILE_URL = /^https?:\/\/(?:www\.)?deviantart\.com\/([\w-]+)(?:\/.+)?$/

module.exports = async username => {
  const { body } = await got(`https://www.deviantart.com/${username}`)
  const $ = cheerio.load(body)
  const canonUsername = $('head link[rel=canonical]')
    .attr('href')
    .replace(REGEX_PROFILE_URL, '$1')
  const els = $('img.avatar,a[data-hook=user_link][data-icon]').filter((i, el) => {
    const thisUsername = $(el).attr('data-username') || $(el).attr('title') || ''
    return canonUsername.toLowerCase() === thisUsername.toLowerCase()
  })
  return els.attr('data-icon') || els.attr('src')
}

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
