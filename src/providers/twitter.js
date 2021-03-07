'use strict'

const got = require('got')

// https://dev.twitter.com/basics/user-profile-images-and-banners
const REGEX_IMG_MODIFIERS = /_(?:bigger|mini|normal)\./
const ORIGINAL_IMG_SIZE = '_400x400'

const getAvatarUrl = url => url.replace(REGEX_IMG_MODIFIERS, `${ORIGINAL_IMG_SIZE}.`)

module.exports = async username => {
  const { body } = await got(`https://duckduckgo.com/tw.js?user=${username}`)
  const imgURL = JSON.parse(body).profile_image
  // Use _400x400 image size
  return getAvatarUrl(imgURL)
}

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
