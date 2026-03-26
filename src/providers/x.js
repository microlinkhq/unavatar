'use strict'

const { $jsonld } = require('@metascraper/helpers')

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
    $jsonld('mainEntity.image.contentUrl')($) ||
      $('meta[property="og:image"]').attr('content')
  )

const factory = ({ createHtmlProvider }) =>
  createHtmlProvider({
    name: 'x',
    url: input => `https://x.com/${input}`,
    getter: getProfileImage
  })

factory.getProfileImage = getProfileImage

module.exports = factory
