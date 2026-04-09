'use strict'

const { $jsonld } = require('@metascraper/helpers')

const getProfileUrl = input => `https://www.pinterest.com/${input}/`

const getAvatarUrl = $jsonld('mainEntity.image.contentUrl')

module.exports = ({ createHtmlProvider }) =>
  createHtmlProvider({
    name: 'pinterest',
    url: getProfileUrl,
    getter: getAvatarUrl
  })

module.exports.getAvatarUrl = getAvatarUrl
