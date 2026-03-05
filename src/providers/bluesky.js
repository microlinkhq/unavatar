'use strict'

const { $jsonld } = require('@metascraper/helpers')

module.exports = ({ createHtmlProvider }) =>
  createHtmlProvider({
    name: 'bluesky',
    url: input => `https://bsky.app/profile/${input}`,
    getter: $ => $jsonld('mainEntity.image')($)
  })
