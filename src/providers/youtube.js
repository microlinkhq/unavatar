'use strict'

const { stringify } = require('querystring')
const { isNil, get } = require('lodash')
const pAny = require('p-any')
const got = require('got')

const { YOUTUBE_API_KEY } = require('../constant')

const getAvatarUrl = async (username, bySlugProp) => {
  const apiUrl = `https://content.googleapis.com/youtube/v3/channels?${stringify({
    part: 'id,snippet',
    [bySlugProp]: username,
    key: YOUTUBE_API_KEY
  })}`

  const { body } = await got(apiUrl, { responseType: 'json' })
  const avatarUrl = get(body, 'items[0].snippet.thumbnails.medium.url')

  if (isNil(avatarUrl)) {
    throw new Error(`YouTube avatar not detected for '${bySlugProp}'`)
  }

  return avatarUrl
}

module.exports = async username =>
  pAny([getAvatarUrl(username, 'forUsername'), getAvatarUrl(username, 'id')])

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
