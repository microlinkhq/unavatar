'use strict'

const { $jsonld } = require('@metascraper/helpers')

module.exports = ({ createHtmlProvider }) =>
  createHtmlProvider({
    name: 'patreon',
    url: username => `https://www.patreon.com/${username}`,
    getter: $ => $jsonld('mainEntity.image.thumbnailUrl')($)
  })
