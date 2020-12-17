'use strict'

const got = require('got')

// https://dev.twitter.com/basics/user-profile-images-and-banners
const REGEX_IMG_MODIFIERS = /_(?:bigger|mini|normal)\./
const ORIGINAL_IMG_SIZE = '_400x400'

const getAvatarUrl = url => url.replace(REGEX_IMG_MODIFIERS, `${ORIGINAL_IMG_SIZE}.`)

module.exports = async username => {
  // Get a fresh guest token
  console.log('Requesting Twitter user', username)
  const { body: guestBody } = await got(
    `https://twitter.com/?prefetchTimestamp=${Date.now().toString()}`,
    {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36'
      }
    }
  )
  console.log('Got twitter.com response', guestBody)
  const guestToken = guestBody.match(/gt=[0-9]*/gi)[0].slice(3)
  console.log('Extracted guest token', guestToken)

  // Request api endpoint with guest token. Bearer auth is hardcoded to this value.
  const payload = { screen_name: username, withHighlightedLabel: true }
  console.log('Api request payload', payload)
  const { body: apiBody } = await got(
    `https://twitter.com/i/api/graphql/ZRnOhhXPwue_JGILb9TNug/UserByScreenName?variables=${encodeURIComponent(
      JSON.stringify(payload)
    )}`,
    {
      headers: {
        authorization:
          'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
        'x-guest-token': guestToken
      }
    }
  )
  console.log('Got api response', apiBody)
  const imgURL = JSON.parse(apiBody).data.user.legacy.profile_image_url_https
  console.log('Extracted img url', imgURL)

  // Use _400x400 image size
  return getAvatarUrl(imgURL)
}

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
