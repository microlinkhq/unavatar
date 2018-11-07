'use strict'

const { isNil, chain, get } = require('lodash')
const pAny = require('p-any')
const url = require('url')
const got = require('got')

const { youtubeApiKey } = require('../constant')
const { URLSearchParams } = url

const getUrl = async (username, { slugProp }) => {
  const parts = url.parse(username).pathname.split('/')
  const slug = chain(parts)
    .filter(p => p !== '')
    .last()
    .value()

  const query = new URLSearchParams([
    ['part', 'id,snippet'],
    [slugProp, slug],
    ['key', youtubeApiKey]
  ]).toString()

  const { body } = await got(
    'https://content.googleapis.com/youtube/v3/channels',
    {
      json: true,
      query
    }
  )

  const avatarUrl = get(body, 'items[0].snippet.thumbnails.medium.url')
  if (isNil(avatarUrl)) {
    throw new Error(`YouTube avatar not detected for '${slugProp}'`)
  }
  return avatarUrl
}

module.exports = async username => {
  return pAny([
    getUrl(username, { slugProp: 'forUsername' }),
    getUrl(username, { slugProp: 'id' })
  ])
}

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
