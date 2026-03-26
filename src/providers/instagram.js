'use strict'

const randomCrawlerAgent = require('../util/crawler-agent')

module.exports = ({ createHtmlProvider, getOgImage }) =>
  createHtmlProvider({
    name: 'instagram',
    url: input => `https://www.instagram.com/${input}`,
    getter: getOgImage,
    htmlOpts: () => ({ headers: { 'user-agent': randomCrawlerAgent() } })
  })
