'use strict'

const cheerio = require('cheerio')
const got = require('got')

// https://dev.twitter.com/basics/user-profile-images-and-banners
const REGEX_IMG_MODIFIERS = /_(?:bigger|mini|normal)\./
const ORIGINAL_IMG_SIZE = '_400x400'

const getAvatarUrl = url =>
  url.replace(REGEX_IMG_MODIFIERS, `${ORIGINAL_IMG_SIZE}.`)

module.exports = async username => {
  const { body } = await got(`https://mobile.twitter.com/${username}`)
  const $ = cheerio.load(body)
  const el = $('.avatar img').attr('src')
  return getAvatarUrl(el)
}

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
