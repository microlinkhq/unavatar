'use strict'

const { $jsonld } = require('@metascraper/helpers')

const getAvatarUrl = input => `https://www.pinterest.com/${input}/`

const getAvatar = $jsonld('mainEntity.image.contentUrl')

module.exports = ({ createHtmlProvider }) =>
  createHtmlProvider({
    name: 'pinterest',
    url: getAvatarUrl,
    getter: getAvatar
  })

module.exports.getAvatarUrl = getAvatarUrl
module.exports.getAvatar = getAvatar
