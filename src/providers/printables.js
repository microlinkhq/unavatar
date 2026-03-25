'use strict'

const randomCrawlerAgent = require('../util/crawler-agent')

module.exports = ({ createHtmlProvider, getOgImage }) =>
  createHtmlProvider({
    name: 'printables',
    url: input => `https://www.printables.com/${input.startsWith('@') ? input : `@${input}`}`,
    getter: $ => getOgImage($),
    htmlOpts: () => ({ headers: { 'user-agent': randomCrawlerAgent() } })
  })
