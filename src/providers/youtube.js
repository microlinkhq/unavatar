'use strict'

const { chain } = require('lodash')
const request = require('request-promise')
const url = require('url')
const constant = require('../constant')

async function getChannelInfo (channelUrl) {
  const parts = url.parse(channelUrl).pathname.split('/')

  const slug = chain(parts)
    .filter(p => p !== '')
    .last()
    .value()

  const options = {
    method: 'GET',
    url: 'https://content.googleapis.com/youtube/v3/channels',
    qs: {
      part: 'id,snippet',
      key: constant.youtubeApiKey
    },
    headers: { 'cache-control': 'no-cache' },
    json: true
  }
  if (channelUrl.includes('/user')) {
    options.qs.forUsername = slug
  } else {
    options.qs.id = slug
  }

  const body = await request(options)
  if (body && body.pageInfo && body.pageInfo.totalResults > 0) {
    return body.items[0]
  }
}

module.exports = async username => {
  const youtubeChannelInfo = await getChannelInfo(username)
  return (
    youtubeChannelInfo.snippet &&
    youtubeChannelInfo.snippet.thumbnails.default.url
  )
}

module.exports.supported = {
  email: false,
  username: true,
  domain: true
}
