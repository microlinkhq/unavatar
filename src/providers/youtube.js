'use strict'

const { get } = require('lodash')
const pAny = require('p-any')

const Error = require('../util/error')
const got = require('../util/got')

const { YOUTUBE_API_KEY } = require('../constant')

const getAvatarUrl = async (username, bySlugProp) => {
  const { body } = await got(
    'https://content.googleapis.com/youtube/v3/channels',
    {
      searchParams: {
        part: 'id,snippet',
        [bySlugProp]: username,
        key: YOUTUBE_API_KEY
      },
      responseType: 'json'
    }
  )

  const value = get(body, 'items[0].snippet.thumbnails.medium.url')
  if (!value) {
    throw new Error({
      statusCode: 404,
      message: `Avatar for \`${bySlugProp}\` as \`${username}\` not found`
    })
  }
  return value
}

module.exports = function youtube (username) {
  return pAny([
    getAvatarUrl(username, 'forUsername'),
    getAvatarUrl(username, 'id')
  ])
}

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
