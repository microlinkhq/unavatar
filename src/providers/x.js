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

const getProfileImage = ($, getOgImage) =>
  toHighResolution($jsonld('mainEntity.image.contentUrl')($) || getOgImage($))

module.exports = ({ createHtmlProvider, getOgImage }) =>
  createHtmlProvider({
    name: 'x',
    url: input => `https://x.com/${input}`,
    getter: $ => getProfileImage($, getOgImage)
  })

module.exports.getProfileImage = getProfileImage
