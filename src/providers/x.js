'use strict'

const uniqueRandomArray = require('unique-random-array')
const { $jsonld } = require('@metascraper/helpers')

const randomCrawlerAgent = uniqueRandomArray(
  require('top-crawler-agents').filter(agent => agent.startsWith('Slackbot'))
)

const toHighResolution = url => {
  if (url?.endsWith('_200x200.jpg')) {
    return url.replace('_200x200.jpg', '_400x400.jpg')
  }
  if (url?.endsWith('_normal.jpg')) {
    return url.replace('_normal.jpg', '_400x400.jpg')
  }
  return url
}

const getProfileImage = $ =>
  toHighResolution(
    $jsonld('mainEntity.image.contentUrl')($) || $('meta[property="og:image"]').attr('content')
  )

const factory = ({ createHtmlProvider }) =>
  createHtmlProvider({
    name: 'x',
    url: input => `https://x.com/${input}`,
    getter: getProfileImage,
    htmlOpts: () => ({ headers: { 'user-agent': randomCrawlerAgent() } })
  })

factory.getProfileImage = getProfileImage

module.exports = factory
